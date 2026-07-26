// ===== OptiTalk - TTS API Route (node-edge-tts) =====
// بيشتغل على Vercel (مش محتاج Python CLI)
// POST /api/tts — body: { text, voiceId?, gender?, lang?, speed? }
// GET  /api/tts?text=...&voiceId=...&lang=...&speed=...
// Returns: audio/mpeg binary (MP3)

import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ===== الأصوات الافتراضية =====
const DEFAULT_VOICES = {
  en: { male: 'en-US-GuyNeural', female: 'en-US-AriaNeural' },
  ar: { male: 'ar-EG-ShakirNeural', female: 'ar-EG-SalmaNeural' },
} as const;

// ===== تنظيف النص =====
function cleanText(text: string): string {
  let out = text
    .replace(/\([^)]*\)/g, '')        // شيل المحتوى بين قوسين
    .replace(/[""«»]/g, '')            // شيل علامات التنصيص
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')  // شيل الإيموجي
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // شيل التشكيل العربي
    .replace(/\s+/g, ' ')
    .trim();
  // حد أقصى 900 حرف
  if (out.length > 900) {
    out = out.slice(0, 900);
  }
  return out;
}

// ===== تحديد اللغة الغالبة =====
function detectLang(text: string): 'ar' | 'en' {
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  if (arabicChars > latinChars) return 'ar';
  return 'en';
}

// ===== توليد الصوت بـ node-edge-tts (يحفظ في ملف مؤقت) =====
async function generateWithEdgeTTS(
  text: string,
  voice: string,
  speed: number = 1.0
): Promise<Buffer | null> {
  const tmpDir = join(tmpdir(), 'optitalk-tts');
  await mkdir(tmpDir, { recursive: true });
  const fileId = randomUUID();
  const outputPath = join(tmpDir, `${fileId}.mp3`);

  // نسبة السرعة لـ edge-tts (مثل "+0%", "-10%", "+20%")
  const ratePercent = Math.round((speed - 1) * 100);
  const rateArg = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

  try {
    const tts = new EdgeTTS({
      voice,
      rate: rateArg,
      volume: '+0%',
      pitch: '+0Hz',
    });
    await tts.ttsPromise(text, outputPath);
    const buffer = await readFile(outputPath);
    return buffer;
  } catch (err) {
    console.error('[TTS] Edge TTS error:', err);
    return null;
  } finally {
    try { await unlink(outputPath); } catch {}
  }
}

// ===== Fallback: Google Translate TTS =====
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
      current = sentence.length > maxLen ? sentence.slice(0, maxLen) : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function generateWithGoogleTTS(text: string, lang: 'ar' | 'en'): Promise<Buffer | null> {
  const chunks = splitForGoogle(text);
  const mp3Parts: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 100) mp3Parts.push(buf);
    } catch {
      continue;
    }
    await new Promise((r) => setTimeout(r, 80));
  }

  if (mp3Parts.length === 0) return null;
  if (mp3Parts.length === 1) return mp3Parts[0];

  // ادمج الـ buffers ببساطة (mp3 frames)
  return Buffer.concat(mp3Parts);
}

// ===== اختيار الصوت المناسب =====
function pickVoice(params: {
  voiceId?: string | null;
  gender?: string | null;
  lang: 'ar' | 'en';
}): string {
  if (params.voiceId) return params.voiceId;
  const g = params.gender === 'female' ? 'female' : 'male';
  return DEFAULT_VOICES[params.lang][g];
}

async function generateTTS(text: string, opts: {
  voiceId?: string;
  gender?: 'male' | 'female';
  lang?: 'ar' | 'en';
  speed?: number;
}): Promise<{ buffer: Buffer; contentType: string }> {
  const clean = cleanText(text);
  const lang = opts.lang || detectLang(clean);
  const voice = pickVoice({ voiceId: opts.voiceId, gender: opts.gender, lang });
  const speed = opts.speed ?? 1.0;

  // 1) جرّب Edge TTS الأول
  let buf = await generateWithEdgeTTS(clean, voice, speed);
  if (buf && buf.length > 1000) {
    return { buffer: buf, contentType: 'audio/mpeg' };
  }

  // 2) جرّب صوت افتراضي لنفس اللغة (لو الصوت المحدد فشل)
  const fallbackVoice = DEFAULT_VOICES[lang][opts.gender === 'female' ? 'female' : 'male'];
  if (fallbackVoice !== voice) {
    buf = await generateWithEdgeTTS(clean, fallbackVoice, speed);
    if (buf && buf.length > 1000) {
      return { buffer: buf, contentType: 'audio/mpeg' };
    }
  }

  // 3) Google TTS fallback
  const gbuf = await generateWithGoogleTTS(clean, lang);
  if (gbuf) return { buffer: gbuf, contentType: 'audio/mpeg' };

  throw new Error('All TTS engines failed');
}

async function handle(req: NextRequest, method: 'GET' | 'POST') {
  try {
    let text: string | null = null;
    let voiceId: string | undefined;
    let gender: 'male' | 'female' | undefined;
    let lang: 'ar' | 'en' | undefined;
    let speed = 1.0;

    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));
      text = typeof body.text === 'string' ? body.text : null;
      voiceId = body.voiceId;
      gender = body.gender;
      lang = body.lang;
      speed = typeof body.speed === 'number' ? body.speed : 1.0;
    } else {
      const url = new URL(req.url);
      text = url.searchParams.get('text');
      voiceId = url.searchParams.get('voiceId') || undefined;
      gender = (url.searchParams.get('gender') as 'male' | 'female') || undefined;
      lang = (url.searchParams.get('lang') as 'ar' | 'en') || undefined;
      speed = parseFloat(url.searchParams.get('speed') || '1.0');
    }

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Text is empty after cleaning' }, { status: 400 });
    }

    const { buffer, contentType } = await generateTTS(clean, { voiceId, gender, lang, speed });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'TTS failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) { return handle(req, 'POST'); }
export async function GET(req: NextRequest) { return handle(req, 'GET'); }
