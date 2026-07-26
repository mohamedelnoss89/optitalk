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

    // اختيار الموديل — gemini-2.0-flash هو الوحيد المتاح على المفتاح ده
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

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
    // رسالة fallback بالعامية المصرية
    const fallbackReplies = [
      'أها، فهمت. كمل كلامك.',
      'تمام، أنا معاك. حاول تاني.',
      'سمعتك، بس في مشكلة مؤقتة. كرر اللي قلته.',
      'خد وقتك، أنا ساكت بسمعك.',
    ];
    const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return NextResponse.json({
      reply,
      correction: null,
      translatedWord: null,
      newTargetWord: null,
      advanceStage: false,
      exitReviewMode: false,
      enterSentenceBuilder: false,
    });
  }
}
