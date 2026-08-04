import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ===== الأصوات المصرية المتاحة =====
const VOICE_MALE = 'ar-EG-ShakirNeural';   // صوت راجل مصري
const VOICE_FEMALE = 'ar-EG-SalmaNeural';  // صوت ست مصرية

// ===== إعدادات صوت مخصصة لكل شخصية =====
// بنستخدم نفس الصوت المصري بس بنغيّر rate/pitch عشان نتميز بين الشخصيات
interface VoiceConfig {
  voice: string;
  rate: string;   // السرعة (مثل: '-5%', '+0%', '-10%')
  pitch: string;  // طبقة الصوت (مثل: '+0Hz', '-2Hz', '+3Hz')
}

const CHARACTER_VOICE_CONFIG: Record<string, VoiceConfig> = {
  // ===== المدرسون =====
  'mr-james':        { voice: VOICE_MALE,   rate: '-10%', pitch: '+0Hz' },   // صبور، بطيء
  'ms-sarah':        { voice: VOICE_FEMALE, rate: '+5%',  pitch: '+2Hz' },   // مرحة، حيوية
  'professor-david': { voice: VOICE_MALE,   rate: '-15%', pitch: '-3Hz' },   // أكاديمي، هادي، عميق
  'miss-emma':       { voice: VOICE_FEMALE, rate: '-5%',  pitch: '+0Hz' },   // دافية، ودودة
  'coach-mike':      { voice: VOICE_FEMALE, rate: '+10%', pitch: '+3Hz' },   // حماسية، نشيطة
  'dr-lisa':         { voice: VOICE_FEMALE, rate: '-5%',  pitch: '-2Hz' },   // احترافية، هادية

  // ===== الأصدقاء الذكور (كلهم Shakir بس بسرعات/طبقات مختلفة) =====
  'friend-alex':     { voice: VOICE_MALE,   rate: '+0%',  pitch: '+0Hz' },   // عادي
  'friend-omar':     { voice: VOICE_MALE,   rate: '-5%',  pitch: '-2Hz' },   // هادي، chill
  'friend-karim':    { voice: VOICE_MALE,   rate: '+0%',  pitch: '+2Hz' },   // مبدع، شاب
  'friend-sami':     { voice: VOICE_MALE,   rate: '+10%', pitch: '+3Hz' },   // رياضي، نشيط
  'friend-tarek':    { voice: VOICE_MALE,   rate: '-10%', pitch: '-3Hz' },   // موسيقي، chill
  'friend-yara':     { voice: VOICE_MALE,   rate: '+5%',  pitch: '+4Hz' },   // شاب، مرح
  'friend-dina':     { voice: VOICE_MALE,   rate: '+5%',  pitch: '+0Hz' },   // movie buff
  'friend-amir':     { voice: VOICE_MALE,   rate: '+0%',  pitch: '-2Hz' },   // business، هادي
  'friend-ziad':     { voice: VOICE_MALE,   rate: '+15%', pitch: '+5Hz' },   // جيمر، شغوف
  'friend-khaled':   { voice: VOICE_MALE,   rate: '-15%', pitch: '-4Hz' },   // coffee، هادي عميق

  // ===== الأصدقاء الإناث (كلهم Salma بس بسرعات/طبقات مختلفة) =====
  'friend-layla':    { voice: VOICE_FEMALE, rate: '-5%',  pitch: '+0Hz' },   // دافية
  'friend-sara':     { voice: VOICE_FEMALE, rate: '+10%', pitch: '+3Hz' },   // نشطة، حماسية
  'friend-nora':     { voice: VOICE_FEMALE, rate: '+0%',  pitch: '+1Hz' },   // طباخة، ودودة
  'friend-maya':     { voice: VOICE_FEMALE, rate: '-5%',  pitch: '+2Hz' },   // هادية، طبيعة
  'friend-hassan':   { voice: VOICE_FEMALE, rate: '+5%',  pitch: '+4Hz' },   // فضولية، شابة
  'friend-hana':     { voice: VOICE_FEMALE, rate: '-10%', pitch: '-1Hz' },   // فنانة، هادية
  'friend-farida':   { voice: VOICE_FEMALE, rate: '+5%',  pitch: '+0Hz' },   // سفر، مغامرة
  'friend-mariam':   { voice: VOICE_FEMALE, rate: '-10%', pitch: '-2Hz' },   // نباتات، هادية
};

// ===== helper: يحوّل نص لـ Buffer باستخدام ملف مؤقت =====
async function textToBuffer(text: string, voice: string, rate: string, pitch: string): Promise<Buffer> {
  const tmpDir = join(tmpdir(), 'optitalk-tts');
  await mkdir(tmpDir, { recursive: true });
  const fileId = randomUUID();
  const filePath = join(tmpDir, `${fileId}.mp3`);

  try {
    const tts = new EdgeTTS({
      voice,
      rate,
      volume: '+0%',
      pitch,
    });
    await tts.ttsPromise(text, filePath);
    const buffer = await readFile(filePath);
    return buffer;
  } finally {
    try { await unlink(filePath); } catch {}
  }
}

// ===== تحديد الصوت حسب الجنس (fallback لو مفيش characterId) =====
function getDefaultVoice(voiceId?: string): { voice: string; rate: string; pitch: string } {
  // لو voiceId مُرسل ومصرّح بيه، نستخدمه
  if (voiceId === VOICE_MALE || voiceId === VOICE_FEMALE) {
    return { voice: voiceId, rate: '-5%', pitch: '+0Hz' };
  }
  // default → صوت راجل مصري
  return { voice: VOICE_MALE, rate: '-5%', pitch: '+0Hz' };
}

// ===== تنظيف وتحضير النص العربي للنطق بالعامية المصرية =====
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

  // ===== حيلة عشان نخلي الصوت يقرأ العامية بشكل أطبيع =====
  // 1. إضافة فاصل قصير (,) بعد بعض الكلمات اللي بتقرا رسمي
  // عشان نخلي الصوت ياخد نَفَس ويقرا الكلمة اللي بعدها بشكل منفصل (أقل رسمية)

  // كلمات لازم نضيف بعدها فاصل قصير
  const wordsNeedingPause = [
    'يعني', 'بصراحة', 'طب', 'أوكي', 'تمام', 'حلو', 'كويس',
    'يا صاحبي', 'يا جميل', 'يا بطل', 'يا صاحبي',
    'قول', 'جرّب', 'سمع', 'شوف',
    'اسمع', 'بص', 'خد',
  ];

  for (const word of wordsNeedingPause) {
    // لو الكلمة موجودة وبعدها مسافة (مش فاصلة) → ضيف فاصلة بعدها
    const regex = new RegExp(`${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?![،,])`, 'g');
    out = out.replace(regex, `${word}, `);
  }

  // 2. تحويل بعض الكلمات اللي بتنقرا رسمي لصيغة عامية
  const colloquialReplacements: [RegExp, string][] = [
    [/هذا/g, 'ده'],      // هذا → ده
    [/هذه/g, 'دي'],     // هذه → دي
    [/ذلك/g, 'كده'],     // ذلك → كده
    [/هكذا/g, 'كده'],    // هكذا → كده
    [/الآن/g, 'دلوقتي'], // الآن → دلوقتي
    [/كيف/g, 'إزاي'],    // كيف → إزاي ( بس لو لوحدها )
    [/ماذا/g, 'إيه'],    // ماذا → إيه
    [/لماذا/g, 'ليه'],   // لماذا → ليه
    [/أيضاً/g, 'كمان'],  // أيضاً → كمان
    [/جداً/g, 'أوي'],    // جداً → أوي
    [/جدا/g, 'أوي'],     // جدا → أوي
    [/لكن/g, 'بس'],      // لكن → بس
    [/إلى/g, 'لـ'],      // إلى → لـ (مش دايماً صح)
  ];

  for (const [pattern, replacement] of colloquialReplacements) {
    out = out.replace(pattern, replacement);
  }

  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId: voiceIdParam, voice, characterId, gender } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Empty text' }, { status: 400 });
    }

    // اختيار إعدادات الصوت:
    // 1) الأول من CHARACTER_VOICE_CONFIG لو فيه characterId
    // 2) لو في voiceId مباشر → استخدمه مع default rate/pitch
    // 3) لو في gender → استخدم الصوت المناسب
    // 4) default → صوت راجل مصري
    let config: { voice: string; rate: string; pitch: string };

    if (characterId && CHARACTER_VOICE_CONFIG[characterId]) {
      config = CHARACTER_VOICE_CONFIG[characterId];
    } else if (voiceIdParam || voice) {
      const v = voiceIdParam || voice;
      config = getDefaultVoice(v);
    } else if (gender === 'female') {
      config = { voice: VOICE_FEMALE, rate: '-5%', pitch: '+0Hz' };
    } else {
      config = { voice: VOICE_MALE, rate: '-5%', pitch: '+0Hz' };
    }

    const audioBuffer = await textToBuffer(clean, config.voice, config.rate, config.pitch);

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
    const voiceIdParam = url.searchParams.get('voiceId');
    const voice = url.searchParams.get('voice');
    const characterId = url.searchParams.get('characterId');
    const gender = url.searchParams.get('gender');

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Empty text' }, { status: 400 });
    }

    let config: { voice: string; rate: string; pitch: string };

    if (characterId && CHARACTER_VOICE_CONFIG[characterId]) {
      config = CHARACTER_VOICE_CONFIG[characterId];
    } else if (voiceIdParam || voice) {
      const v = voiceIdParam || voice;
      config = getDefaultVoice(v);
    } else if (gender === 'female') {
      config = { voice: VOICE_FEMALE, rate: '-5%', pitch: '+0Hz' };
    } else {
      config = { voice: VOICE_MALE, rate: '-5%', pitch: '+0Hz' };
    }

    const audioBuffer = await textToBuffer(clean, config.voice, config.rate, config.pitch);

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
