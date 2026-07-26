import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ===== helper: يحوّل نص لـ Buffer باستخدام ملف مؤقت =====
async function textToBuffer(text: string, voice: string): Promise<Buffer> {
  const tmpDir = join(tmpdir(), 'optitalk-tts');
  await mkdir(tmpDir, { recursive: true });
  const fileId = randomUUID();
  const filePath = join(tmpDir, `${fileId}.mp3`);

  try {
    const tts = new EdgeTTS({
      voice,
      rate: '-5%',
      volume: '+0%',
      pitch: '+0Hz',
    });
    await tts.ttsPromise(text, filePath);
    const buffer = await readFile(filePath);
    return buffer;
  } finally {
    try { await unlink(filePath); } catch {}
  }
}

// ===== خريطة الأصوات لكل شخصية (مدرسين + أصدقاء) =====
// 24+ صوت من 15 دولة عربية — تنوع لهجات
const VOICE_MAP: Record<string, string> = {
  // ===== المدرسون =====
  'mr-james': 'ar-EG-ShakirNeural',          // مصر - راجل
  'professor-david': 'ar-SA-HamedNeural',    // السعودية - راجل
  'ms-sarah': 'ar-EG-SalmaNeural',           // مصر - ست
  'miss-emma': 'ar-LB-LaylaNeural',          // لبنان - ست (مس غالية)
  'coach-mike': 'ar-JO-SanaNeural',          // الأردن - ست (مس بسنت)
  'dr-lisa': 'ar-QA-AmalNeural',             // قطر - ست (مس سجدة)
  // ===== الأصدقاء الذكور =====
  'friend-alex': 'ar-EG-ShakirNeural',       // مصر
  'friend-omar': 'ar-LY-OmarNeural',         // ليبيا
  'friend-karim': 'ar-SY-LaithNeural',       // سوريا
  'friend-sami': 'ar-MA-JamalNeural',        // المغرب
  'friend-tarek': 'ar-BH-AliNeural',         // البحرين
  'friend-amir': 'ar-KW-FahedNeural',        // الكويت
  'friend-ziad': 'ar-IQ-BasselNeural',       // العراق
  'friend-khaled': 'ar-OM-AbdullahNeural',   // عمان
  'friend-hassan': 'ar-TN-HediNeural',       // تونس
  'friend-mohamed': 'ar-YE-SalehNeural',     // اليمن
  'friend-ashraf': 'ar-DZ-AminNeural',       // الجزائر
  // ===== الأصدقاء الإناث =====
  'friend-layla': 'ar-EG-SalmaNeural',       // مصر
  'friend-sara': 'ar-LB-LaylaNeural',        // لبنان
  'friend-nora': 'ar-JO-SanaNeural',         // الأردن
  'friend-maya': 'ar-QA-AmalNeural',         // قطر
  'friend-yara': 'ar-BH-LailaNeural',        // البحرين
  'friend-dina': 'ar-KW-NouraNeural',        // الكويت
  'friend-hana': 'ar-IQ-RanaNeural',         // العراق
  'friend-farida': 'ar-LY-ImanNeural',       // ليبيا
  'friend-mariam': 'ar-MA-MounaNeural',      // المغرب
};

const DEFAULT_VOICE = 'ar-EG-ShakirNeural';

// ===== تنظيف النص العربي من التشكيل والعلامات =====
function cleanText(text: string): string {
  let out = text;
  // إزالة التشكيل
  out = out.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  // إزالة الإيموجي
  out = out.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  // إزالة markdown
  out = out.replace(/[*_`#>~]/g, '');
  // إزالة أقواس JSON
  out = out.replace(/[{}[\]]/g, '');
  // مسافات متعددة → مسافة واحدة
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, characterId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Empty text' }, { status: 400 });
    }

    // اختيار الصوت
    const voiceId = VOICE_MAP[characterId] || voice || DEFAULT_VOICE;

    // توليد الصوت بـ Edge TTS (عبر ملف مؤقت)
    const audioBuffer = await textToBuffer(clean, voiceId);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('[TTS-Arabic] Error:', err?.message);
    return NextResponse.json({ error: 'TTS failed: ' + (err?.message || 'unknown') }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const text = url.searchParams.get('text');
    const voice = url.searchParams.get('voice');
    const characterId = url.searchParams.get('characterId');

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Empty text' }, { status: 400 });
    }

    const voiceId = VOICE_MAP[characterId || ''] || voice || DEFAULT_VOICE;

    const audioBuffer = await textToBuffer(clean, voiceId);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('[TTS-Arabic GET] Error:', err?.message);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
