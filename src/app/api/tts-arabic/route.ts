// ===== OptiTalk - Arabic TTS API Route (أصوات مختلفة لكل شخصية) =====
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ===== خريطة الأصوات — كل شخصية ليها صوت مختلف =====
// ملاحظة: تم تصحيح جنس الأصدقاء (friend-yara=يحيى ذكر، friend-hassan=حسنة أنثى، friend-dina=نديم ذكر)
const VOICE_MAP: Record<string, string> = {
  // === المدرسين الرجالة ===
  'mr-james': 'ar-EG-ShakirNeural',        // مستر جيمس — مصري
  'professor-david': 'ar-SA-HamedNeural',   // بروفيسور ديفيد — سعودي

  // === المدرسات الستات ===
  'ms-sarah': 'ar-EG-SalmaNeural',          // مس سارة — مصرية
  'miss-emma': 'ar-LB-LaylaNeural',         // مس غالية — لبنانية
  'coach-mike': 'ar-JO-SanaNeural',         // مس بسنت — أردنية
  'dr-lisa': 'ar-QA-AmalNeural',            // مس سجدة — قطرية

  // === الأصدقاء الرجالة (10) ===
  'friend-alex': 'ar-EG-ShakirNeural',      // أليكس — مصري
  'friend-omar': 'ar-LY-OmarNeural',        // عمر — ليبي
  'friend-karim': 'ar-SY-LaithNeural',      // كريم — سوري
  'friend-sami': 'ar-MA-JamalNeural',       // سامي — مغربي
  'friend-tarek': 'ar-BH-AliNeural',        // طارق — بحريني
  'friend-amir': 'ar-KW-FahedNeural',       // أمير — كويتي
  'friend-ziad': 'ar-IQ-BasselNeural',      // زياد — عراقي
  'friend-khaled': 'ar-OM-AbdullahNeural',  // خالد — عماني
  'friend-yara': 'ar-TN-HediNeural',        // يحيى — تونسي (كان اسمه Yara بالغلط في الصورة)
  'friend-dina': 'ar-YE-SalehNeural',       // نديم — يمني (كان اسمه Dina بالغلط في الصورة)

  // === الأصدقاء الستات (8) ===
  'friend-layla': 'ar-EG-SalmaNeural',      // ليلى — مصرية
  'friend-sara': 'ar-LB-LaylaNeural',       // سارة — لبنانية
  'friend-nora': 'ar-JO-SanaNeural',        // نورا — أردنية
  'friend-maya': 'ar-QA-AmalNeural',        // مايا — قطرية
  'friend-hassan': 'ar-BH-LailaNeural',     // حسنة — بحرينية (كان اسمها Hassan بالغلط في الصورة)
  'friend-hana': 'ar-IQ-RanaNeural',        // هنا — عراقية
  'friend-farida': 'ar-LY-ImanNeural',      // فريدة — ليبية
  'friend-mariam': 'ar-MA-MounaNeural',     // مريم — مغربية
};

// أصوات افتراضية
const DEFAULT_MALE = 'ar-EG-ShakirNeural';
const DEFAULT_FEMALE = 'ar-EG-SalmaNeural';

function cleanText(text: string): string {
  let out = text
    .replace(/\([^)]*\)/g, '')
    .replace(/[""«»]/g, '')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (out.length > 900) {
    const slice = out.slice(0, 900);
    const lastPunct = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('؟ '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
      slice.lastIndexOf('.'),
      slice.lastIndexOf('؟'),
      slice.lastIndexOf('!'),
      slice.lastIndexOf('?')
    );
    out = lastPunct > 400 ? slice.slice(0, lastPunct + 1) : slice;
  }
  return out;
}

async function generateEdgeTTS(text: string, voice: string, rate: number): Promise<Buffer | null> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'optitalk-ar-'));
  const outputPath = join(tmpDir, 'out.mp3');
  const processed = text.replace(/[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]/g, '').replace(/\s+/g, ' ').trim();
  const ratePercent = Math.round((rate - 1) * 100);
  const rateArg = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('edge-tts', [
        '--voice', voice,
        '--text', processed,
        '--rate', rateArg,
        '--write-media', outputPath,
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}` },
      });
      let stderr = '';
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('error', reject);
      proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`edge-tts ${code}: ${stderr.slice(-200)}`)));
      proc.stdin.end();
    });
    return await readFile(outputPath);
  } catch (e) {
    console.error('[tts-arabic] edge-tts failed:', e);
    return null;
  } finally {
    try { await rm(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function generateGoogleTTS(text: string): Promise<Buffer | null> {
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=ar&client=tw-ob`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch { return null; }
}

async function handle(req: NextRequest, method: 'GET' | 'POST') {
  try {
    let text = '';
    let gender: 'male' | 'female' = 'male';
    let speedWPM = 160;
    let characterId = '';
    let voiceId = '';

    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));
      text = typeof body.text === 'string' ? body.text : '';
      gender = body.gender === 'female' ? 'female' : 'male';
      speedWPM = typeof body.speed === 'number' ? body.speed : 160;
      characterId = typeof body.characterId === 'string' ? body.characterId : '';
      voiceId = typeof body.voiceId === 'string' ? body.voiceId : '';
    } else {
      const u = new URL(req.url);
      text = u.searchParams.get('text') || '';
      gender = u.searchParams.get('gender') === 'female' ? 'female' : 'male';
      speedWPM = parseInt(u.searchParams.get('speed') || '160', 10);
      characterId = u.searchParams.get('characterId') || '';
      voiceId = u.searchParams.get('voiceId') || '';
    }

    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    const clean = cleanText(text);
    if (!clean) return NextResponse.json({ error: 'Empty text' }, { status: 400 });

    // ===== اختيار الصوت حسب الشخصية =====
    let voice: string;
    if (voiceId) {
      // لو فيه voiceId محدد مباشرة
      voice = voiceId;
      console.log(`[tts-arabic] Direct voiceId: ${voice}`);
    } else if (characterId && VOICE_MAP[characterId]) {
      voice = VOICE_MAP[characterId];
      console.log(`[tts-arabic] Voice for ${characterId}: ${voice}`);
    } else {
      voice = gender === 'female' ? DEFAULT_FEMALE : DEFAULT_MALE;
      console.log(`[tts-arabic] Default voice (${gender}): ${voice}`);
    }

    const rate = Math.min(1.5, Math.max(0.6, speedWPM / 160));

    let buf = await generateEdgeTTS(clean, voice, rate);
    if (!buf || buf.length < 500) buf = await generateGoogleTTS(clean);
    if (!buf) return NextResponse.json({ error: 'TTS failed' }, { status: 500 });

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buf.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'fail' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return handle(req, 'POST'); }
export async function GET(req: NextRequest) { return handle(req, 'GET'); }
