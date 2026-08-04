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

  // ===== تحويل الكلمات الرسمية لعامية مصرية =====
  const colloquialReplacements: [RegExp, string][] = [
    [/هذا/g, 'ده'],
    [/هذه/g, 'دي'],
    [/ذلك/g, 'كده'],
    [/هكذا/g, 'كده'],
    [/الآن/g, 'دلوقتي'],
    [/كيف/g, 'إزاي'],
    [/ماذا/g, 'إيه'],
    [/لماذا/g, 'ليه'],
    [/أيضاً/g, 'كمان'],
    [/جداً/g, 'أوي'],
    [/جدا/g, 'أوي'],
    [/لكن/g, 'بس'],
    [/إلى/g, 'لـ'],
    // كلمات إضافية عشان نخلي النطق عامي أكتر
    [/تماماً/g, 'تمام'],
    [/صباح الخير/g, 'صباح الخير'],
    [/مساء الخير/g, 'مساء الخير'],
    // كلمات بتنقرا رسمي → نخليها عامية
    [/لقد/g, ''],
    [/قد/g, ''],
    [/سوف/g, 'هـ'],
    [/لم/g, 'ما'],
    [/لن/g, 'ما'],
    [/إن/g, ''],
    [/أن/g, ''],
    [/كانت/g, 'كانت'],
    [/يكون/g, 'يبقى'],
    [/تكون/g, 'تبقى'],
    // ضمائر رسمية → عامية
    [/أنا/g, 'أنا'],
    [/أنت/g, 'إنت'],
    [/أنتما/g, 'إنتو'],
    [/أنتم/g, 'إنتو'],
    // أدوات استفهام رسمية
    [/هل/g, ''],
    // كلمات عامية إضافية
    [/كثيراً/g, 'كتير'],
    [/كثير/g, 'كتير'],
    [/قليل/g, 'شوية'],
    [/سريعاً/g, 'بسرعة'],
    [/ببطء/g, 'ببطء'],
  ];

  for (const [pattern, replacement] of colloquialReplacements) {
    out = out.replace(pattern, replacement);
  }

  // إضافة فواصل بعد كلمات المحادثة
  const pauseWords = ['يعني', 'بصراحة', 'طب', 'أوكي', 'تمام', 'حلو', 'كويس', 'قول', 'جرّب', 'سمع', 'شوف', 'اسمع', 'بص', 'خد'];
  for (const word of pauseWords) {
    const regex = new RegExp(`${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?![،,])`, 'g');
    out = out.replace(regex, `${word}, `);
  }

  return out;
}

// ===== فصل النص لقطع (عربي / إنجليزي) =====
// عشان كل قطعة تتقرا بالصوت المناسب
interface TextSegment {
  text: string;
  lang: 'ar' | 'en';
}

function splitByLanguage(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // regex يفصل النص حسب: عربي + أقواس اقتباس + إنجليزي
  // 1) نص إنجليزي (حروف لاتينية + مسافات + علامات ترقيم)
  // 2) نص عربي (حروف عربية + مسافات + علامات ترقيم)

  // نقطع النص حسب الكلمات الإنجليزية
  const englishRegex = /[A-Za-z]+(?:\s+[A-Za-z]+)*/g;
  let lastIndex = 0;
  let match;

  while ((match = englishRegex.exec(text)) !== null) {
    // أضف الجزء العربي اللي قبل الجزء الإنجليزي
    if (match.index > lastIndex) {
      const arabicPart = text.slice(lastIndex, match.index).trim();
      if (arabicPart) {
        segments.push({ text: arabicPart, lang: 'ar' });
      }
    }
    // أضف الجزء الإنجليزي
    segments.push({ text: match[0], lang: 'en' });
    lastIndex = match.index + match[0].length;
  }

  // أضف آخر جزء عربي لو موجود
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
      segments.push({ text: remaining, lang: 'ar' });
    }
  }

  // لو مفيش قطع (نص عربي بس) → رجّع كل النص عربي
  if (segments.length === 0) {
    segments.push({ text, lang: 'ar' });
  }

  return segments;
}

// ===== دمج ملفات MP3 متعددة في ملف واحد =====
// ببساطة بندمج الـ buffers (MP3 frames مستقلة، بتشتغل لما تتدمج)
function concatMP3Buffers(buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers);
}

// ===== helper: يولّد الصوت من نص (مع دعم اللغات المتعددة) =====
async function generateAudio(
  cleanText: string,
  characterId: string | null,
  voiceIdParam: string | null,
  voice: string | null,
  gender: string | null,
): Promise<Buffer> {
  // اختيار إعدادات الصوت:
  let config: { voice: string; rate: string; pitch: string };
  let englishVoice = 'en-US-GuyNeural';

  if (characterId && CHARACTER_VOICE_CONFIG[characterId]) {
    config = CHARACTER_VOICE_CONFIG[characterId];
    if (characterId === 'mr-james') englishVoice = 'en-US-GuyNeural';
    else if (characterId === 'ms-sarah') englishVoice = 'en-US-AriaNeural';
    else if (characterId === 'professor-david') englishVoice = 'en-US-ChristopherNeural';
    else if (characterId === 'miss-emma') englishVoice = 'en-US-JennyNeural';
    else if (characterId === 'coach-mike') englishVoice = 'en-US-MichelleNeural';
    else if (characterId === 'dr-lisa') englishVoice = 'en-US-SaraNeural';
    else if (config.voice === VOICE_FEMALE) englishVoice = 'en-US-AriaNeural';
    else englishVoice = 'en-US-GuyNeural';
  } else if (voiceIdParam || voice) {
    const v = voiceIdParam || voice;
    config = getDefaultVoice(v || undefined);
    if (v && v.startsWith('en-')) englishVoice = v;
  } else if (gender === 'female') {
    config = { voice: VOICE_FEMALE, rate: '-5%', pitch: '+0Hz' };
    englishVoice = 'en-US-AriaNeural';
  } else {
    config = { voice: VOICE_MALE, rate: '-5%', pitch: '+0Hz' };
    englishVoice = 'en-US-GuyNeural';
  }

  // ===== فصل النص لقطع (عربي / إنجليزي) =====
  const segments = splitByLanguage(cleanText);

  // لو فيه قطعة واحدة بس → استخدم الطريقة المباشرة (أسرع)
  if (segments.length === 1) {
    const seg = segments[0];
    const voiceToUse = seg.lang === 'en' ? englishVoice : config.voice;
    return await textToBuffer(seg.text, voiceToUse, config.rate, config.pitch);
  }

  // لو فيه قطع متعددة → ولّد صوت لكل قطعة ودمجها
  const audioBuffers: Buffer[] = [];
  for (const seg of segments) {
    const voiceToUse = seg.lang === 'en' ? englishVoice : config.voice;
    try {
      const buf = await textToBuffer(seg.text, voiceToUse, config.rate, config.pitch);
      audioBuffers.push(buf);
    } catch (err) {
      console.error('[TTS] Segment failed:', seg.lang, seg.text.slice(0, 50));
      try {
        const buf = await textToBuffer(seg.text, config.voice, config.rate, config.pitch);
        audioBuffers.push(buf);
      } catch {}
    }
  }

  return concatMP3Buffers(audioBuffers);
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

    const audioBuffer = await generateAudio(clean, characterId, voiceIdParam, voice, gender);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' },
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

    const audioBuffer = await generateAudio(clean, characterId, voiceIdParam, voice, gender);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' },
    });
  } catch (err: any) {
    console.error('[TTS-Arabic GET] Error:', err?.message);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
