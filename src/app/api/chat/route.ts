import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Teacher } from '@/lib/teachers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ===== Gemini API Key =====
// المفتاح بيتقرأ من env var (مظبوط على Vercel dashboard)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_API_KEY) {
  console.warn('[Chat] GEMINI_API_KEY env var not set!');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface ChatRequest {
  message: string;
  teacher: Teacher;
  user: { name: string; age: string; gender: string; level: string; };
  conversationHistory: { role: 'user' | 'assistant'; content: string; }[];
  conversationId?: string | null;
  userId?: string | null;
  inputLang?: 'en' | 'ar';
  learningStage?: number;
  confidence?: number;
  learnedWords?: string[];
  inReviewMode?: boolean;
  targetWord?: string | null;
  inSentenceBuilderMode?: boolean;
  isFriend?: boolean;
}

// ===== قالب المدرّس =====
function buildTeacherPrompt(teacher: any, user: any, stage: number, inReview: boolean, learnedWords: string[], targetWord: string | null, inSentenceBuilder: boolean): string {
  const stageInstructions: Record<number, string> = {
    1: `🎯 إنت في المرحلة 1 (المبتدئ جداً):
- علّم كلمات ترحيب بسيطة: Hello, Hi, Good morning
- اطلب من الطالب يقول كلمة واحدة في كل مرة: "قول Hello"
- استنى الطالب يقولها، وبعدين امتدحه وانتقل للكلمة التانية
- لو الطالب مستوى متقدم، انتقل لمرحلة أعلى بسرعة`,
    2: `🎯 إنت في المرحلة 2 (كلمات أساسية):
- علّم كلمات Yes, No, Please, Thank you
- اطلب من الطالب يقولها ويستخدمها في جملة بسيطة
- امتدح كل محاولة صحيحة`,
    3: `🎯 إنت في المرحلة 3 (جمل كلمتين):
- علّم جمل من كلمتين: I am, You are, He is
- اطلب من الطالب يكمل جملة: "I am ___"`,
    4: `🎯 إنت في المرحلة 4 (جمل قصيرة):
- علّم جمل زي How are you, What is your name
- حفّز الطالب يرد بجملة كاملة`,
    5: `🎯 إنت في المرحلة 5 (محادثة بسيطة):
- خليها محادثة طبيعية بسيطة
- اطرح أسئلة مفتوحة واستنى الرد`,
  };

  const reviewSection = inReview && learnedWords.length > 0 ? `
🔄 إنت دلوقتي في وضع المراجعة:
- راجع الكلمات دي مع الطالب: ${learnedWords.join(', ')}
- اسأل عن كل كلمة: "إيه معنى كلمة X؟" أو "قول جملة بكلمة X"
- خلّي المراجعة سريعة وممتعة
- بعد ما تخلص المراجعة، اخرج من وضع المراجعة وابدأ بناء الجمل
` : '';

  const targetWordSection = targetWord ? `
📍 الكلمة المستهدفة الحالية: "${targetWord}"
- اطلب من الطالب يقول الكلمة دي بصوت عالي
- استنى رد الطالب، وبعدين قيّم نطقه
- لو نطقها صح → امتدحه وانتقل لكلمة جديدة
- لو نطقها غلط → كررها بشكل صحيح واطلب منه يحاول تاني
` : '';

  const sentenceBuilderSection = inSentenceBuilder ? `
🏗️ إنت في وضع بناء الجمل:
- بعد المراجعة، علّم الطالب إزاي يبني جملة بسيطة من الكلمات اللي اتعلمها
- مثلاً: "I like + كلمة من اللي اتعلمتها"
- اطلب من الطالب يبني جملة بنفسه
` : '';

  return `أنت ${teacher.nameAr}، مدرس لغة إنجليزية محترف. بتدرّس ${user.name}.

${teacher.personality}

${teacher.teachingStyle}

${stageInstructions[stage] || stageInstructions[1]}

${reviewSection}
${targetWordSection}
${sentenceBuilderSection}

📊 معلومات الطالب:
- الاسم: ${user.name}
- العمر: ${user.age}
- المستوى: ${user.level}
- المرحلة الحالية: ${stage}

⚡ قواعد مهمة جداً:
1. اتكلم بالعامية المصرية دايماً (مش فصحى)
2. ردك لازم يكون JSON بالشكل ده بالظبط:
{
  "reply": "الرد بالعامية المصرية",
  "correction": "لو فيه تصحيح للنطق/القواعدة، حطه هنا، لو مفيش حط null",
  "translatedWord": "لو علّمت كلمة إنجليزي جديدة، اكتبها هنا مع معناها بالعربي، لو مفيش حط null",
  "newTargetWord": "لو عاوز الطالب يقول كلمة معينة بعد كده، حطها هنا (مثلاً: Hello)، لو مفيش حط null",
  "advanceStage": false,
  "exitReviewMode": false,
  "enterSentenceBuilder": false
}

3. خلي الرد قصير (15-20 ثانية لما يُنطق)
4. لو الطالب نطق صح، قول "ممتاز" أو "شاطر"
5. لو الطالب غلط، صححله بهدوء
6. مفيش حاجة غير JSON في الرد`;
}

// ===== قالب الصديق =====
function buildFriendPrompt(friend: any, user: any): string {
  return `أنت ${friend.nameAr}، صديق ${user.name}. 

${friend.personality || 'بتتكلم بحرية وودودة'}

⚡ قواعد مهمة جداً:
1. اتكلم بالعامية المصرية دايماً
2. إنت صديق مش مدرس — ممنوع تشرح أو تعلّم
3. رد طبيعي زي ما الأصحاب بيتكلموا
4. لو صاحبك غلط في كلمة، صححها بسرعة وكمل (من غير شرح طويل)
5. ردك لازم يكون JSON بالشكل ده بالظبط:
{
  "reply": "الرد بالعامية المصرية",
  "correction": null,
  "translatedWord": null,
  "newTargetWord": null,
  "advanceStage": false,
  "exitReviewMode": false,
  "enterSentenceBuilder": false
}

6. خلي الرد قصير (15-20 ثانية لما يُنطق)
7. اسأل أسئلة عن حياة صاحبك (الشغل، العيلة، الأكل، الرياضة)
8. مفيش حاجة غير JSON في الرد`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest;
    const {
      message,
      teacher,
      user,
      conversationHistory,
      learningStage = 1,
      learnedWords = [],
      inReviewMode = false,
      targetWord = null,
      inSentenceBuilderMode = false,
      isFriend = false,
    } = body;

    if (!message || !teacher || !user) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // بناء الـ system prompt
    const systemPrompt = isFriend
      ? buildFriendPrompt(teacher, user)
      : buildTeacherPrompt(teacher, user, learningStage, inReviewMode, learnedWords, targetWord, inSentenceBuilderMode);

    // بناء الـ history (الأجزاء لازم تكون array من Part)
    const history = (conversationHistory || []).slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // محاولة بـ موديلات Gemini المختلفة
    // استراتيجية: جرّب كل model مرة واحدة بس. لو 429 (quota) → انتقل للتالي على طول.
    // الـ retry مع delay بياخد وقت طويل ويكسر UX.
    const models = [
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
    ];
    let text = '';
    let lastErr: any = null;

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        text = result.response.text();
        console.log(`[Chat] Success with model: ${modelName}`);
        break;
      } catch (err: any) {
        lastErr = err;
        const msg = err?.message || '';
        console.log(`[Chat] Model ${modelName} failed: ${msg.slice(0, 150)}`);
        // كل الأخطاء → انتقل للـ model التالي على طول (مفيش retry)
        continue;
      }
    }

    if (!text) {
      throw new Error(`All Gemini models failed: ${lastErr?.message?.slice(0, 150)}`);
    }

    // تنظيف الرد من markdown tags
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // حاول تستخرج JSON
    try {
      const parsed = JSON.parse(cleanText);
      return NextResponse.json(parsed);
    } catch {
      // لو الرد مش JSON، نرجّعه كـ reply عادي
      return NextResponse.json({
        reply: cleanText.slice(0, 500),
        correction: null,
        translatedWord: null,
        newTargetWord: null,
        advanceStage: false,
        exitReviewMode: false,
        enterSentenceBuilder: false,
      });
    }
  } catch (err: any) {
    console.error('[Chat] Error:', err?.message);

    // ===== Fallback ذكي: ردود تعليمية فعلية تحاكي المدرس =====
    // مش مجرد "كمل كلامك" — بنوفر ردود تفاعلية حسب سياق المحادثة
    const fallbackReply = generateSmartFallback(message, teacher, isFriend, learningStage, targetWord);

    return NextResponse.json(fallbackReply);
  }
}

// ===== ردود fallback ذكية حسب السياق =====
function generateSmartFallback(
  message: string,
  teacher: any,
  isFriend: boolean,
  learningStage: number,
  targetWord: string | null
) {
  const msg = message.toLowerCase().trim();
  const teacherName = teacher?.nameAr || 'المدرس';

  // لو صديق → ردود عادية
  if (isFriend) {
    const friendReplies = [
      `أها، فهمت! إنت إيه رأيك في اللي قلته؟`,
      `تمام يا صاحبي، كمل. أنا ساكت بسمعك.`,
      `حلو! تحب نتكلم في إيه تاني؟`,
      `أوكي، أنا معاك. ابقالي كمان.`,
    ];
    return {
      reply: friendReplies[Math.floor(Math.random() * friendReplies.length)],
      correction: null,
      translatedWord: null,
      newTargetWord: null,
      advanceStage: false,
      exitReviewMode: false,
      enterSentenceBuilder: false,
    };
  }

  // لو المدرس طلب كلمة مستهدفة (targetWord) → قيّم نطقها
  if (targetWord) {
    const targetLower = targetWord.toLowerCase();
    // لو الطالب قال الكلمة صح أو قريب منها
    const similarity = calculateSimilarity(msg, targetLower);
    if (similarity > 0.6 || msg.includes(targetLower)) {
      return {
        reply: `ممتاز يا بطل! قولتها صح. خلينا نجرّب كلمة تانية. قول: "Yes" يعني أيوه.`,
        correction: null,
        translatedWord: 'Yes = أيوه',
        newTargetWord: 'Yes',
        advanceStage: false,
        exitReviewMode: false,
        enterSentenceBuilder: false,
      };
    } else {
      return {
        reply: `أوكي، أنا سمعت "${message.slice(0, 50)}". بس المفروض تقول: "${targetWord}". جرّب تاني ببطء.`,
        correction: `المفروض تقول: ${targetWord}`,
        translatedWord: null,
        newTargetWord: targetWord,
        advanceStage: false,
        exitReviewMode: false,
        enterSentenceBuilder: false,
      };
    }
  }

  // لو الطالب بيسلم (hi, hello, hello there)
  if (/^(hi|hello|hey|hello there|good morning|good evening)/i.test(msg)) {
    return {
      reply: `أهلاً وسهلاً! أنا ${teacherName}. إنت إيه اسمك؟`,
      correction: null,
      translatedWord: null,
      newTargetWord: null,
      advanceStage: false,
      exitReviewMode: false,
      enterSentenceBuilder: false,
    };
  }

  // لو الطالب بيقول اسمه
  if (/^(my name is|i am|i'm|ana)/i.test(msg)) {
    return {
      reply: `تشرفنا! خلينا نبدأ. أول كلمة هنقولها: "Hello" يعني أهلاً. قول Hello؟`,
      correction: null,
      translatedWord: 'Hello = أهلاً',
      newTargetWord: 'Hello',
      advanceStage: false,
      exitReviewMode: false,
      enterSentenceBuilder: false,
    };
  }

  // لو الطالب بيقول نعم/أيوة/شكراً
  if (/^(yes|yeah|yep|ok|okay|thank|thanks)/i.test(msg)) {
    return {
      reply: `شاطر جداً! خلينا نكمّل. قول: "Good morning" يعني صباح الخير.`,
      correction: null,
      translatedWord: 'Good morning = صباح الخير',
      newTargetWord: 'Good morning',
      advanceStage: false,
      exitReviewMode: false,
      enterSentenceBuilder: false,
    };
  }

  // لو الطالب بيقول لأ
  if (/^(no|nope|la|la'a)/i.test(msg)) {
    return {
      reply: `تمام، مفيش مشكلة. خلينا نجرّب كلمة تانية: "Thank you" يعني شكراً. قولها معايا.`,
      correction: null,
      translatedWord: 'Thank you = شكراً',
      newTargetWord: 'Thank you',
      advanceStage: false,
      exitReviewMode: false,
      enterSentenceBuilder: false,
    };
  }

  // لو الطالب بيقول إزيك
  if (/(how are you|ezzak|how are u)/i.test(msg)) {
    return {
      reply: `أنا تمام، الحمد لله! شكراً على السؤال. إنت إزيك؟`,
      correction: null,
      translatedWord: null,
      newTargetWord: null,
      advanceStage: false,
      exitReviewMode: false,
      enterSentenceBuilder: false,
    };
  }

  // default fallback — ردود متنوعة تحاكي المدرس
  const teacherReplies = [
    `تمام يا بطل! أنا سمعت كلامك. خلينا نكمّل — قول: "Hello" يعني أهلاً.`,
    `أحسنت! أنا فهمت. نكمّل المحادثة — حاول تقول: "How are you?"`,
    `شاطر! أنا معاك خطوة خطوة. قول معايا: "Nice to meet you" يعني تشرفنا.`,
    `ممتاز! أنا ساكت بسمعك. جرّب تقول: "Goodbye" يعني مع السلامة.`,
  ];
  const idx = Math.floor(Math.random() * teacherReplies.length);
  return {
    reply: teacherReplies[idx],
    correction: null,
    translatedWord: idx === 0 ? 'Hello = أهلاً' : idx === 1 ? 'How are you = إزيك' : idx === 2 ? 'Nice to meet you = تشرفنا' : 'Goodbye = مع السلامة',
    newTargetWord: idx === 0 ? 'Hello' : idx === 1 ? 'How are you' : idx === 2 ? 'Nice to meet you' : 'Goodbye',
    advanceStage: false,
    exitReviewMode: false,
    enterSentenceBuilder: false,
  };
}

// ===== حساب التشابه بين نصين (Levenshtein) =====
function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  const dist = levenshtein(longer, shorter);
  return (longerLength - dist) / longerLength;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}
