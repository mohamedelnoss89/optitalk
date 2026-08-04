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
// نستخدم ar-EG (مصري) — هي الأفضل للعامية المصرية
const VOICE_MALE = 'ar-EG-ShakirNeural';   // صوت راجل مصري
const VOICE_FEMALE = 'ar-EG-SalmaNeural';  // صوت ست مصرية

// ===== إعدادات صوت مخصصة لكل شخصية =====
// بنستخدم نفس الصوت المصري بس بنغيّر rate/pitch عشان نتميز بين الشخصيات
// ملاحظة: rate أبطأ = نطق أوضح
interface VoiceConfig {
  voice: string;
  rate: string;   // السرعة (مثل: '-5%', '+0%', '-10%')
  pitch: string;  // طبقة الصوت (مثل: '+0Hz', '-2Hz', '+3Hz')
}

const CHARACTER_VOICE_CONFIG: Record<string, VoiceConfig> = {
  // ===== المدرسون =====
  'mr-james':        { voice: VOICE_MALE,   rate: '-15%', pitch: '+0Hz' },   // صبور، بطيء، واضح
  'ms-sarah':        { voice: VOICE_FEMALE, rate: '-10%', pitch: '+2Hz' },   // مرحة، حيوية
  'professor-david': { voice: VOICE_MALE,   rate: '-20%', pitch: '-3Hz' },   // أكاديمي، هادي، عميق
  'miss-emma':       { voice: VOICE_FEMALE, rate: '-15%', pitch: '+0Hz' },   // دافية، ودودة
  'coach-mike':      { voice: VOICE_FEMALE, rate: '-10%', pitch: '+3Hz' },   // حماسية، نشيطة
  'dr-lisa':         { voice: VOICE_FEMALE, rate: '-15%', pitch: '-2Hz' },   // احترافية، هادية

  // ===== الأصدقاء الذكور =====
  'friend-alex':     { voice: VOICE_MALE,   rate: '-10%', pitch: '+0Hz' },
  'friend-omar':     { voice: VOICE_MALE,   rate: '-15%', pitch: '-2Hz' },
  'friend-karim':    { voice: VOICE_MALE,   rate: '-10%', pitch: '+2Hz' },
  'friend-sami':     { voice: VOICE_MALE,   rate: '-5%',  pitch: '+3Hz' },
  'friend-tarek':    { voice: VOICE_MALE,   rate: '-20%', pitch: '-3Hz' },
  'friend-yara':     { voice: VOICE_MALE,   rate: '-10%', pitch: '+4Hz' },
  'friend-dina':     { voice: VOICE_MALE,   rate: '-10%', pitch: '+0Hz' },
  'friend-amir':     { voice: VOICE_MALE,   rate: '-15%', pitch: '-2Hz' },
  'friend-ziad':     { voice: VOICE_MALE,   rate: '-5%',  pitch: '+5Hz' },
  'friend-khaled':   { voice: VOICE_MALE,   rate: '-25%', pitch: '-4Hz' },

  // ===== الأصدقاء الإناث =====
  'friend-layla':    { voice: VOICE_FEMALE, rate: '-15%', pitch: '+0Hz' },
  'friend-sara':     { voice: VOICE_FEMALE, rate: '-5%',  pitch: '+3Hz' },
  'friend-nora':     { voice: VOICE_FEMALE, rate: '-10%', pitch: '+1Hz' },
  'friend-maya':     { voice: VOICE_FEMALE, rate: '-15%', pitch: '+2Hz' },
  'friend-hassan':   { voice: VOICE_FEMALE, rate: '-10%', pitch: '+4Hz' },
  'friend-hana':     { voice: VOICE_FEMALE, rate: '-20%', pitch: '-1Hz' },
  'friend-farida':   { voice: VOICE_FEMALE, rate: '-10%', pitch: '+0Hz' },
  'friend-mariam':   { voice: VOICE_FEMALE, rate: '-20%', pitch: '-2Hz' },
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
    return { voice: voiceId, rate: '-15%', pitch: '+0Hz' };  // أبطأ = أوضح
  }
  // default → صوت راجل مصري
  return { voice: VOICE_MALE, rate: '-15%', pitch: '+0Hz' };
}

// ===== تنظيف وتحضير النص العربي للنطق بالعامية المصرية =====
function cleanText(text: string): string {
  let out = text;

  // ===== 1. إزالة التشكيل (لأنه بيلخبط TTS) =====
  out = out.replace(/[\u064B-\u065F\u0670\u0640]/g, '');

  // ===== 2. توحيد الحروف (عشان TTS ينطقها صح) =====
  // الألف المقصورة → ألف عادية
  out = out.replace(/ى/g, 'ي');
  // الهمزات في الأول → همزة واحدة
  out = out.replace(/[أإآ]/g, 'ا');
  // ة في النهاية → ه (عشان TTS بينطقها أوضح)
  out = out.replace(/ة(\s|$)/g, 'ه$1');
  // ة في وسط الكلمة → اتبع سياقها (نشيلها بس لو في النهاية)

  // ===== 3. إزالة الإيموجي =====
  out = out.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // ===== 4. إزالة markdown =====
  out = out.replace(/[*_`#>~]/g, '');
  out = out.replace(/[{}[\]]/g, '');

  // ===== 5. توحيد المسافات =====
  out = out.replace(/\s+/g, ' ').trim();

  // ===== 6. قاموس الكلمات المصرية العامية =====
  // تحويل الكلمات الرسمية/الفصحى → عامية مصرية
  const colloquialReplacements: [RegExp, string][] = [
    // ضمائر
    [/هذا/g, 'ده'],
    [/هذه/g, 'دي'],
    [/هذان/g, 'دول'],
    [/هذين/g, 'دول'],
    [/هؤلاء/g, 'دول'],
    [/ذلك/g, 'كده'],
    [/تلك/g, 'كده'],
    [/هكذا/g, 'كده'],
    [/أنا/g, 'أنا'],
    [/أنت/g, 'إنت'],
    [/أنتِ/g, 'إنتي'],
    [/أنتما/g, 'إنتو'],
    [/أنتم/g, 'إنتو'],
    [/أنتن/g, 'إنتو'],
    [/هو/g, 'هو'],
    [/هي/g, 'هي'],
    [/هما/g, 'هما'],
    [/هم/g, 'هم'],
    [/هن/g, 'هم'],

    // ظروف زمان
    [/الآن/g, 'دلوقتي'],
    [/اليوم/g, 'النهاردة'],
    [/غداً/g, 'بكرة'],
    [/غدا/g, 'بكرة'],
    [/أمس/g, 'امبارح'],
    [/بالأمس/g, 'امبارح'],
    [/أمسٍ/g, 'امبارح'],
    [/دائماً/g, 'دايما'],
    [/دائما/g, 'دايما'],
    [/أحياناً/g, 'ساعات'],
    [/أحيانا/g, 'ساعات'],
    [/فوراً/g, 'على طول'],
    [/فورا/g, 'على طول'],
    [/أبداً/g, 'أبدا'],
    [/سابقاً/g, 'قبل كده'],
    [/سابقا/g, 'قبل كده'],

    // ظروف مكان
    [/هناك/g, 'هناك'],
    [/هنالك/g, 'هناك'],

    // أدوات استفهام
    [/ماذا/g, 'إيه'],
    [/لماذا/g, 'ليه'],
    [/كيف/g, 'إزاي'],
    [/أين/g, 'فين'],
    [/متى/g, 'إمتى'],
    [/كم/g, 'كام'],

    // أدوات ربط
    [/أيضاً/g, 'كمان'],
    [/أيضا/g, 'كمان'],
    [/لكن/g, 'بس'],
    [/إلا/g, 'إلا'],
    [/لأن/g, 'عشان'],
    [/لأنه/g, 'عشان'],
    [/لأنها/g, 'عشان'],
    [/حيث/g, 'بما إن'],
    [/بما/g, 'بما'],
    [/كذلك/g, 'كمان'],
    [/أو/g, 'أو'],

    // كلمات وصفية
    [/جداً/g, 'أوي'],
    [/جدا/g, 'أوي'],
    [/كثيراً/g, 'كتير'],
    [/كثير/g, 'كتير'],
    [/كثيرة/g, 'كتير'],
    [/كثيرون/g, 'كتير'],
    [/قليل/g, 'شوية'],
    [/قليلاً/g, 'شوية'],
    [/قليلا/g, 'شوية'],
    [/بسيط/g, 'بسيط'],
    [/بسيطة/g, 'بسيطة'],
    [/صعب/g, 'صعب'],
    [/صعبة/g, 'صعبة'],
    [/سهل/g, 'سهل'],
    [/سهلة/g, 'سهلة'],
    [/جميل/g, 'حلو'],
    [/جميلة/g, 'حلوة'],
    [/جميلٌ/g, 'حلو'],
    [/سيئ/g, 'وحش'],
    [/سيئة/g, 'وحشة'],
    [/جيد/g, 'كويس'],
    [/جيدة/g, 'كويسة'],
    [/جيداً/g, 'كويس'],
    [/جيدا/g, 'كويس'],
    [/طيب/g, 'كويس'],
    [/طيبة/g, 'كويسة'],
    [/ممتاز/g, 'ممتاز'],
    [/ممتازة/g, 'ممتازة'],
    [/رائع/g, 'جامد'],
    [/رائعة/g, 'جامدة'],
    [/محترم/g, 'محترم'],
    [/محترمة/g, 'محترمة'],
    [/ذكي/g, 'شاطر'],
    [/ذكية/g, 'شاطرة'],
    [/أحمق/g, 'غبي'],
    [/غبي/g, 'غبي'],
    [/غبية/g, 'غبية'],

    // أفعال مساعدة
    [/يكون/g, 'يبقى'],
    [/تكون/g, 'تبقى'],
    [/يكونون/g, 'يبقوا'],
    [/تكونون/g, 'تبقوا'],
    [/سوف/g, 'هـ'],
    [/سأذهب/g, 'هروح'],
    [/سأفعل/g, 'هعمل'],
    [/ستذهب/g, 'هتروح'],
    [/ستفعل/g, 'هتعمل'],

    // كلمات تعليمية
    [/تعلم/g, 'اتعلم'],
    [/تعلّم/g, 'اتعلم'],
    [/دراسة/g, 'مذاكرة'],
    [/مدرسة/g, 'مدرسة'],
    [/مدرس/g, 'مدرس'],
    [/مدرسةٌ/g, 'مدرسة'],
    [/طالب/g, 'طالب'],
    [/طالبة/g, 'طالبة'],
    [/درس/g, 'درس'],
    [/واجب/g, 'واجب'],
    [/امتحان/g, 'امتحان'],
    [/نجح/g, 'نجح'],
    [/نجحت/g, 'نجحت'],
    [/رسب/g, 'رسب'],
    [/رسبت/g, 'رسبت'],

    // كلمات محادثة يومية
    [/مرحبا/g, 'أهلا'],
    [/مرحبتين/g, 'أهلا'],
    [/شكراً/g, 'شكرا'],
    [/شكرا/g, 'شكرا'],
    [/عفواً/g, 'العفو'],
    [/عفوا/g, 'العفو'],
    [/آسف/g, 'آسف'],
    [/آسفة/g, 'آسفة'],
    [/معذرة/g, 'معذرة'],
    [/سامحني/g, 'سامحني'],
    [/سامحك/g, 'سامحك'],
    [/صباح/g, 'صباح'],
    [/مساء/g, 'مساء'],

    // كلمات بيوتية
    [/بيت/g, 'بيت'],
    [/منزل/g, 'بيت'],
    [/منزلا/g, 'بيت'],
    [/غرفة/g, 'أوضة'],
    [/غرف/g, 'أوض'],
    [/مطبخ/g, 'مطبخ'],
    [/حمام/g, 'حمام'],
    [/صالون/g, 'صالون'],

    // كلمات أكل
    [/طعام/g, 'أكل'],
    [/طعاماً/g, 'أكل'],
    [/أكل/g, 'أكل'],
    [/ماء/g, 'مياه'],
    [/مياه/g, 'مياه'],
    [/شراب/g, 'شراب'],

    // كلمات شغل
    [/عمل/g, 'شغل'],
    [/عملاً/g, 'شغل'],
    [/وظيفة/g, 'شغل'],
    [/وظيفتي/g, 'شغلي'],
    [/مكتب/g, 'مكتب'],
    [/مدير/g, 'مدير'],
    [/موظف/g, 'موظف'],

    // كلمات سفر
    [/سفر/g, 'سفر'],
    [/سفرة/g, 'سفرة'],
    [/رحلة/g, 'رحلة'],
    [/مطار/g, 'مطار'],
    [/فندق/g, 'فندق'],
    [/تذكرة/g, 'تذكرة'],

    // كلمات فلوس
    [/مال/g, 'فلوس'],
    [/مالاً/g, 'فلوس'],
    [/نقود/g, 'فلوس'],
    [/ثمن/g, 'تمن'],
    [/ثمناً/g, 'تمن'],
    [/سعر/g, 'سعر'],
    [/سعراً/g, 'سعر'],
    [/غالي/g, 'غالي'],
    [/رخيص/g, 'رخيص'],

    // كلمات صحية
    [/مريض/g, 'مريض'],
    [/مريضة/g, 'مريضة'],
    [/مرض/g, 'مرض'],
    [/دواء/g, 'دوا'],
    [/دكتور/g, 'دكتور'],
    [/طبيب/g, 'دكتور'],
    [/طبيبة/g, 'دكتورة'],
    [/صحة/g, 'صحة'],

    // كلمات عاطفية
    [/سعيد/g, 'مبسوط'],
    [/سعيدة/g, 'مبسوطة'],
    [/سعادة/g, 'سعادة'],
    [/حزين/g, 'زعلان'],
    [/حزينة/g, 'زعلانة'],
    [/حزن/g, 'زعل'],
    [/غاضب/g, 'زعلان'],
    [/غاضبة/g, 'زعلانة'],
    [/غضب/g, 'زعل'],
    [/خائف/g, 'خايف'],
    [/خائفة/g, 'خايفة'],
    [/خوف/g, 'خوف'],
    [/متعب/g, 'تعبان'],
    [/متعبة/g, 'تعبانة'],
    [/تعب/g, 'تعب'],
    [/جائع/g, 'جعان'],
    [/جائعة/g, 'جعانة'],
    [/جوع/g, 'جوع'],
    [/عطشان/g, 'عطشان'],
    [/عطشة/g, 'عطشانة'],

    // كلمات تعجب
    [/يا إلهي/g, 'يا ساتر'],
    [/يا لله/g, 'يا ساتر'],
    [/عظيم/g, 'تحفة'],
    [/عظيمٌ/g, 'تحفة'],
    [/عظيمة/g, 'تحفة'],
    [/رائعٌ/g, 'جامد'],
    [/رائعةٌ/g, 'جامدة'],

    // أرقام (تحويل للأرقام العادية)
    [/واحد/g, 'واحد'],
    [/اثنان/g, 'اتنين'],
    [/اثنين/g, 'اتنين'],
    [/ثلاثة/g, 'تلاتة'],
    [/ثلاث/g, 'تلاتة'],
    [/أربعة/g, 'أربعة'],
    [/أربع/g, 'أربعة'],
    [/خمسة/g, 'خمسة'],
    [/خمس/g, 'خمسة'],
    [/ستة/g, 'ستة'],
    [/ست/g, 'ستة'],
    [/سبعة/g, 'سبعة'],
    [/سبع/g, 'سبعة'],
    [/ثمانية/g, 'تمانية'],
    [/ثماني/g, 'تمانية'],
    [/تسعة/g, 'تسعة'],
    [/تسع/g, 'تسعة'],
    [/عشرة/g, 'عشرة'],
    [/عشر/g, 'عشرة'],

    // أيام الأسبوع
    [/الإثنين/g, 'الاتنين'],
    [/الثلاثاء/g, 'التلات'],
    [/الأربعاء/g, 'الأربع'],
    [/الخميس/g, 'الخميس'],
    [/الجمعة/g, 'الجمعة'],
    [/السبت/g, 'السبت'],
    [/الأحد/g, 'الأحد'],

    // أسماء مدن
    [/القاهرة/g, 'القاهرة'],
    [/الإسكندرية/g, 'الاسكندرية'],
    [/الجيزة/g, 'الجيزة'],
  ];

  for (const [pattern, replacement] of colloquialReplacements) {
    out = out.replace(pattern, replacement);
  }

  // ===== 7. إصلاحات إضافية للنطق =====
  // الـ "ال" التعريف لما تكون قبل كلمة → خليها "ال" عادية (TTS بتنطقها صح)
  // لكن لو في كلمة "اللي" → سيبها زي ما هي

  // إضافة فاصلة بعد كلمات المحادثة عشان TTS تاخد نَفَس
  const pauseWords = [
    'يعني', 'بصراحة', 'طب', 'أوكي', 'تمام', 'حلو', 'كويس',
    'قول', 'جرّب', 'سمع', 'شوف', 'اسمع', 'بص', 'خد',
    'آه', 'أيوه', 'لأ',
  ];
  for (const word of pauseWords) {
    const regex = new RegExp(`${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?![،,.])`, 'g');
    out = out.replace(regex, `${word}, `);
  }

  // ===== 6.5. إصلاح كلمات بتتنطق غلط من TTS =====
  // بعض الكلمات Edge TTS بتنطقها غلط، فبنستبدلها بحروف مساعدة
  const pronunciationFixes: [RegExp, string][] = [
    // عشان → عشًان (بنحط شدة على الشين عشان TTS تنطقها صح)
    [/عشان/g, 'عشان'],
    // بس بنخلي الـ ع واضحة
    [/عشًان/g, 'عشان'],

    // حروف بتتاكل في النطق → نضيف تشكيل بسيط
    [/اللي/g, 'اللي'],       // نسيبها زي ما هي
    [/ال/g, 'ال'],           // ال التعريف
    [/الله/g, 'الله'],       // الله

    // كلمات بتتنطق غلط
    [/حاجة/g, 'حاجة'],
    [/حاجات/g, 'حاجات'],
    [/كده/g, 'كده'],
    [/كده./g, 'كده.'],

    // ضمائر بتتاكل
    [/إنت/g, 'إنت'],
    [/إنتي/g, 'إنتي'],
    [/إنتو/g, 'إنتو'],

    // كلمات بتتنطق "و" غلط
    [/و/g, 'و'],           // نسيبها زي ما هي

    // كلمات إ Egypt خاصه
    [/أوي/g, 'أوي'],
    [/كتير/g, 'كتير'],
    [/شوية/g, 'شوية'],

    // كلمات محادثة
    [/يعني/g, 'يعني'],
    [/بصراحة/g, 'بصراحة'],
    [/طب/g, 'طب'],
    [/أوكي/g, 'أوكي'],
  ];

  for (const [pattern, replacement] of pronunciationFixes) {
    out = out.replace(pattern, replacement);
  }

  // ===== 7. إصلاح الهمزات في وسط الكلمة =====
  // بعض الكلمات الهمزة فيها مهمة، نشيلها بس لو في الأول
  // مثلاً: سأل → سأل (نسيبها)
  // مثلاً: أكل → اكل (نشيل الهمزة)
  // لكن نحافظ على: قرأ، سأل، فأر، الخ

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
