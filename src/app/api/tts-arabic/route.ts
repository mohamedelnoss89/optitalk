// ===== OptiTalk - Arabic TTS API Route (صوت واحد متسق) =====
// POST /api/tts-arabic — body: { text, gender?, speed?, pitch? }
// GET  /api/tts-arabic?text=...&gender=...&speed=...&pitch=...
// Returns: audio/mpeg binary (MP3)
//
// الاستراتيجية:
// - نص عربي خالص → Google TTS بصوت عربي (tl=ar)
// - نص إنجليزي خالص → Google TTS بصوت إنجليزي (tl=en)
// - نص مختلط → Google TTS بصوت عربي واحد (tl=ar) — الصوت العربي بينطق الكلمات الإنجليزية جواه
// - fallback → espeak-ng لو Google فشل
//
// الميزة: صوت واحد متسق للنص كله (مش صوتين مختلفين)

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ===== تنظيف النص =====
function cleanText(text: string): string {
  let out = text
    .replace(/\([^)]*\)/g, '')
    .replace(/[""«»]/g, '')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '') // إيموجي
    .replace(/\s+/g, ' ')
    .trim();
  if (out.length > 900) {
    const slice = out.slice(0, 900);
    const lastPunct = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('؟ '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('.'),
      slice.lastIndexOf('؟'),
      slice.lastIndexOf('!')
    );
    out = lastPunct > 400 ? slice.slice(0, lastPunct + 1) : slice;
  }
  return out;
}

// ===== تحديد اللغة الغالبة =====
function detectDominantLanguage(text: string): 'ar' | 'en' {
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;

  // لو فيه أي عربي → استخدم صوت عربي (بينطق الإنجليزي جواه)
  // ده يضمن صوت واحد متسق للنص المختلط
  if (arabicChars > 0) return 'ar';
  return 'en';
}

// ===== تقسيم النص الطويل لجمل (Google TTS limit ~200 chars) =====
function splitForGoogle(text: string, maxLen = 180): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  const sentences = text.match(/[^.!?؟]+[.!?؟]+|[^.!?؟]+$/g) || [text];

  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length <= maxLen) {
      current += sentence;
    } else {
      if (current) chunks.push(current.trim());
      if (sentence.length > maxLen) {
        const words = sentence.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk + ' ' + word).length <= maxLen) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          }
        }
        if (wordChunk) current = wordChunk;
        else current = '';
      } else {
        current = sentence;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// ===== Google Translate TTS =====
async function generateWithGoogleTTS(
  text: string,
  lang: 'ar' | 'en'
): Promise<Buffer | null> {
  const chunks = splitForGoogle(text);
  const mp3Parts: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;

    let attempt = 0;
    let success = false;
    while (attempt < 2 && !success) {
      attempt++;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'audio/mpeg, audio/*;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
            'Referer': 'https://translate.google.com/',
          },
        });

        if (!res.ok) {
          console.warn(`[GoogleTTS] HTTP ${res.status} for chunk: "${chunk.substring(0, 50)}"`);
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 200 * attempt));
            continue;
          }
          break;
        }

        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 100) {
          console.warn(`[GoogleTTS] Too small (${buf.length}b) for chunk: "${chunk.substring(0, 50)}"`);
          if (attempt < 2) continue;
          break;
        }

        mp3Parts.push(buf);
        success = true;
      } catch (err) {
        console.warn(`[GoogleTTS] fetch error attempt ${attempt}:`, err);
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 200 * attempt));
          continue;
        }
        break;
      }
    }

    if (!success) return null;

    // delay بسيط بين الطلبات
    await new Promise((r) => setTimeout(r, 80));
  }

  if (mp3Parts.length === 0) return null;
  if (mp3Parts.length === 1) return mp3Parts[0];

  // ادمج MP3s بـ ffmpeg
  return await concatMp3WithFfmpeg(mp3Parts);
}

async function concatMp3WithFfmpeg(mp3Buffers: Buffer[]): Promise<Buffer> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'optitalk-mp3-'));
  const outputPath = join(tmpDir, 'out.mp3');
  const concatFile = join(tmpDir, 'concat.txt');

  try {
    const fileNames: string[] = [];
    for (let i = 0; i < mp3Buffers.length; i++) {
      const fileName = `part_${i}.mp3`;
      await writeFile(join(tmpDir, fileName), mp3Buffers[i]);
      fileNames.push(fileName);
    }

    const concatContent = fileNames.map((f) => `file '${f}'`).join('\n');
    await writeFile(concatFile, concatContent);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', concatFile,
        '-c', 'copy',
        outputPath,
      ], { stdio: ['pipe', 'pipe', 'pipe'] });

      let stderr = '';
      ffmpeg.stderr.on('data', (d) => { stderr += d.toString(); });
      ffmpeg.on('error', (err) => reject(new Error(`ffmpeg failed: ${err.message}`)));
      ffmpeg.on('close', (code) => {
        if (code !== 0) reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-300)}`));
        else resolve();
      });
      ffmpeg.stdin.end();
    });

    return await readFile(outputPath);
  } finally {
    try { await rm(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

// ===== espeak-ng fallback =====
async function generateWithEspeak(
  text: string,
  lang: 'ar' | 'en',
  options: { gender?: string; speed?: number; pitch?: number }
): Promise<Buffer> {
  const { gender = 'male', speed = 150, pitch } = options;
  const tmpDir = await mkdtemp(join(tmpdir(), 'optitalk-espeak-'));
  const wavPath = join(tmpDir, 'out.wav');

  try {
    const args = ['-v', lang, '-s', String(speed)];

    if (pitch !== undefined) {
      const p = Math.min(99, Math.max(0, Math.round((pitch - 0.5) * 50)));
      args.push('-p', String(p));
    } else {
      args.push('-p', gender === 'female' ? '70' : '35');
    }

    args.push('-w', wavPath);
    args.push(text);

    await new Promise<void>((resolve, reject) => {
      const espeak = spawn('espeak-ng', args, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stderr = '';
      espeak.stderr.on('data', (d) => { stderr += d.toString(); });
      espeak.on('error', (err) => reject(new Error(`espeak-ng failed: ${err.message}`)));
      espeak.on('close', (code) => {
        if (code !== 0) reject(new Error(`espeak-ng exited ${code}: ${stderr}`));
        else resolve();
      });
      espeak.stdin.end();
    });

    await new Promise((r) => setTimeout(r, 30));
    return await readFile(wavPath);
  } finally {
    try { await rm(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

// ===== توليد الصوت (صوت مختلف حسب الجنس - جودة عالية جداً) =====
async function generateArabicTTS(
  text: string,
  options: { gender?: string; speed?: number; pitch?: number }
): Promise<{ buffer: Buffer; contentType: string }> {
  const gender = options.gender || 'male';

  console.log(`[TTS-Arabic] Text: "${text.substring(0, 80)}" | gender: ${gender}`);

  // ===== استراتيجية: Microsoft Edge TTS (أصوات مصرية طبيعية عالية الجودة) =====
  // - male → ar-EG-ShakirNeural (صوت راجل مصري طبيعي)
  // - female → ar-EG-SalmaNeural (صوت ست مصرية طبيعية)
  try {
    console.log(`[TTS-Arabic] Trying Edge TTS (gender: ${gender})`);
    const edgeMp3 = await generateWithEdgeTTS(text, gender);
    if (edgeMp3 && edgeMp3.length > 1000) {
      console.log(`[TTS-Arabic] Edge TTS success: ${edgeMp3.length} bytes (${gender})`);
      return { buffer: edgeMp3, contentType: 'audio/mpeg' };
    }
  } catch (err) {
    console.warn(`[TTS-Arabic] Edge TTS failed:`, err);
  }

  // ===== Fallback 1: Google Translate TTS =====
  const lang = detectDominantLanguage(text);
  console.warn(`[TTS-Arabic] Falling back to Google TTS (tl=${lang})`);
  const googleMp3 = await generateWithGoogleTTS(text, lang);
  if (googleMp3 && googleMp3.length > 1000) {
    if (gender === 'male') {
      // للرجالة: طبّق pitch shift بـ ffmpeg
      console.log(`[TTS-Arabic] Applying ffmpeg pitch shift for male voice`);
      const maleMp3 = await applyMalePitchShift(googleMp3);
      if (maleMp3 && maleMp3.length > 1000) {
        return { buffer: maleMp3, contentType: 'audio/mpeg' };
      }
    }
    return { buffer: googleMp3, contentType: 'audio/mpeg' };
  }

  // ===== Fallback 2: espeak-ng =====
  console.warn(`[TTS-Arabic] Falling back to espeak-ng`);
  const wav = await generateWithEspeak(text, lang, { ...options, gender });
  return { buffer: wav, contentType: 'audio/wav' };
}

// ===== Microsoft Edge TTS (أصوات مصرية طبيعية عالية الجودة) =====
async function generateWithEdgeTTS(text: string, gender: string): Promise<Buffer | null> {
  const voice = gender === 'female' ? 'ar-EG-SalmaNeural' : 'ar-EG-ShakirNeural';
  const tmpDir = await mkdtemp(join(tmpdir(), 'optitalk-edge-'));
  const outputPath = join(tmpDir, 'output.mp3');

  try {
    // edge-tts CLI command
    await new Promise<void>((resolve, reject) => {
      const edgeTts = spawn('edge-tts', [
        '--voice', voice,
        '--text', text,
        '--write-media', outputPath,
      ], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}` } });

      let stderr = '';
      edgeTts.stderr.on('data', (d) => { stderr += d.toString(); });
      edgeTts.on('error', (err) => reject(new Error(`edge-tts failed: ${err.message}`)));
      edgeTts.on('close', (code) => {
        if (code !== 0) reject(new Error(`edge-tts exited ${code}: ${stderr.slice(-300)}`));
        else resolve();
      });
      edgeTts.stdin.end();
    });

    const outputBuffer = await readFile(outputPath);
    return outputBuffer;
  } catch (err) {
    console.error('[TTS-Arabic] Edge TTS error:', err);
    return null;
  } finally {
    try { await rm(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

// ===== تطبيق pitch shift بـ ffmpeg عشان نخليه صوت راجل =====
async function applyMalePitchShift(inputBuffer: Buffer): Promise<Buffer | null> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'optitalk-pitch-'));
  const inputPath = join(tmpDir, 'input.mp3');
  const outputPath = join(tmpDir, 'output.mp3');

  try {
    await writeFile(inputPath, inputBuffer);

    // ffmpeg filter لتحويل الصوت من أنثوي لذكوري:
    // asetrate=44100*0.75 → أخفض sample rate (يخلي الصوت أعمق)
    // aresample=44100 → رجّع sample rate للطبيعي
    // atempo=1.25 → سرّع عشان نرجع السرعة الأصلية
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-i', inputPath,
        '-af', 'asetrate=44100*0.72,aresample=44100,atempo=1.28',
        '-ac', '1',           // mono
        '-ar', '22050',       // sample rate
        '-b:a', '64k',        // bitrate
        outputPath,
      ], { stdio: ['pipe', 'pipe', 'pipe'] });

      let stderr = '';
      ffmpeg.stderr.on('data', (d) => { stderr += d.toString(); });
      ffmpeg.on('error', (err) => reject(new Error(`ffmpeg failed: ${err.message}`)));
      ffmpeg.on('close', (code) => {
        if (code !== 0) reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-300)}`));
        else resolve();
      });
      ffmpeg.stdin.end();
    });

    const outputBuffer = await readFile(outputPath);
    return outputBuffer;
  } catch (err) {
    console.error('[TTS-Arabic] ffmpeg pitch shift error:', err);
    return null;
  } finally {
    try { await rm(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

// ===== Routes =====
export async function POST(req: NextRequest) {
  try {
    const { text, gender, speed = 150, pitch } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Text is empty after cleaning' }, { status: 400 });
    }

    console.log('[TTS-Arabic] POST request:', clean.substring(0, 100));

    const { buffer, contentType } = await generateArabicTTS(clean, { gender, speed, pitch });

    console.log('[TTS-Arabic] Generated:', buffer.length, 'bytes | type:', contentType);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[TTS-Arabic POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Arabic TTS failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const text = url.searchParams.get('text');
    const gender = url.searchParams.get('gender') || 'male';
    const speed = parseInt(url.searchParams.get('speed') || '150', 10);
    const pitch = url.searchParams.get('pitch') ? parseFloat(url.searchParams.get('pitch')!) : undefined;

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Text is empty after cleaning' }, { status: 400 });
    }

    const { buffer, contentType } = await generateArabicTTS(clean, { gender, speed, pitch });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[TTS-Arabic GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Arabic TTS failed' },
      { status: 500 }
    );
  }
}
