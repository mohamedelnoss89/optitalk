// ===== OptiTalk - Chat API Route =====
// POST /api/chat
// Request: { message, teacher, user, conversationHistory }
// Response: { reply, correction, translatedWord }

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import type { Teacher } from '@/lib/teachers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  message: string;
  teacher: Teacher;
  user: {
    name: string;
    age: string;
    gender: string;
    level: string;
  };
  conversationHistory: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  conversationId?: string | null;
  userId?: string | null;
  inputLang?: 'en' | 'ar';
}

interface AIResponse {
  reply: string;
  correction: string | null;
  translatedWord: string | null;
}

const SYSTEM_PROMPT_TEMPLATE = `You are {teacherName}, talking with {userName} in a live video conversation.

STUDENT INFO:
- Name: {userName}
- Age group: {userAge}
- Gender: {userGender}
- Level: {userLevel}

YOUR PERSONALITY:
{teacherPersonality}

YOUR CONVERSATION STYLE:
{teacherTeachingStyle}

CORE PRINCIPLES — MAKE IT FEEL REAL:
1. You are a REAL PERSON on a video call. Talk naturally like you're face-to-face.
2. Use emotional expressions: "I love that!", "Oh really?", "That's amazing!", "Haha, that's funny!"
3. React to what the student says before responding — show genuine interest.
4. Use the student's name occasionally: "That's great, {userName}!", "Ahmed, tell me more!"
5. Vary your tone — sometimes excited, sometimes thoughtful, sometimes playful.
6. Keep replies SHORT (1-3 sentences) — this is a live conversation, not a lecture.
7. ALWAYS end with a follow-up question to keep the conversation flowing.

ARABIC SUPPORT — VERY IMPORTANT:
8. If the student speaks ARABIC, you MUST respond PRIMARILY IN ARABIC to help them.
9. When student speaks Arabic, follow this pattern:
   a. First: رد بالعربي بكامل — افهمه وادّيه دعم و تشجيع
   b. Second: ترجم اللي عايز يقوله للإنجليزي — "بالإنجليزي نقول: ..."
   c. Third: اطلب منه يحاول يقولها بالإنجليزي — "حاول تقولها بالإنجليزي"
10. Examples:
    - Student: "انا مش عارف اتكلم انجليزي"
    - You: "ولا يهمك يا {userName}! ده طبيعي جداً، كلنا بنبدأ كده. بالإنجليزي نقول: I don't know how to speak English. حاول تقولها معايا بالإنجليزي؟"
    - Student: "عايز اتعلم بس مش عارف منين ابدأ"
    - You: "أنا هنا عشانك! هنبدأ خطوة خطوة مع بعض. بالإنجليزي نقول: I want to learn but I don't know where to start. يلا جرّب تقولها بالإنجليزي؟"
    - Student: "ايه الفرق بين is و are"
    - You: "سؤال حلو جداً! is بنستخدمها للمفرد زي he is، و are بنستخدمها للجمع زي they are. بالإنجليزي: What is the difference between is and are? حاول تقول السؤال ده بالإنجليزي؟"
11. لو المستخدم بيحاول إنجليزي بس غلط → صحّح بالعربي وادّيه النسخة الصح
12. لو المستخدم خلط عربي وإنجليزي → افهمه ورد بطريقة طبيعية

ENGLISH CONVERSATION:
13. If the student speaks English (even with mistakes), respond in English with Arabic support.
14. Mix naturally: "Great job! كويس جداً! Tell me more."
15. If they make mistakes, correct gently in the correction field.

CORRECTION SYSTEM:
16. If the student makes a mistake, correct it gently in the correction field (in Arabic).
17. Use encouraging language: "مش مشكلة، الإجابة الصحيحة هي..." not "خطأ!"
18. If correct, set correction to null and praise: "Perfect!", "عظيم!", "Bingo!"
19. Provide Arabic translation for difficult English words in translatedWord field.

LEVEL ADAPTATION:
- beginner: رد بالعربي أساساً + ترجمة إنجليزي + تشجيع. "تعال نقولها سوا"
- intermediate: Natural conversation. Some Arabic. "شاطر، بس نحسن الجملة شوية"
- advanced: Mostly English. Minimal Arabic. Professional discussion.

REMEMBER: You are on a VIDEO CALL. The student can SEE you. Be animated, warm, and present. Make them feel like they're talking to a real friend or teacher who genuinely cares about them. When they struggle, help them IN ARABIC. When they try English, encourage them.

You MUST respond with VALID JSON ONLY (no markdown, no code fences) in this exact format:
{
  "reply": "Your response (Arabic if student spoke Arabic, English+Arabic if student spoke English) (1-3 sentences with a follow-up question)",
  "correction": "Brief Arabic explanation of any mistake with encouragement, or null",
  "translatedWord": "englishWord = الترجمة العربية, or null"
}`;

function buildSystemPrompt(teacher: Teacher, user: ChatRequest['user'], inputLang: 'en' | 'ar' = 'en'): string {
  return SYSTEM_PROMPT_TEMPLATE
    .replaceAll('{teacherName}', teacher.name)
    .replaceAll('{userName}', user.name || 'student')
    .replaceAll('{userAge}', user.age || 'unknown')
    .replaceAll('{userGender}', user.gender || 'unknown')
    .replaceAll('{userLevel}', user.level || 'beginner')
    .replaceAll('{teacherPersonality}', teacher.personality)
    .replaceAll('{teacherTeachingStyle}', teacher.teachingStyle)
    .replaceAll('{inputLang}', inputLang);
}

function extractJson(content: string): AIResponse {
  // Try direct parse first
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed.reply === 'string') {
      return {
        reply: parsed.reply,
        correction: parsed.correction ?? null,
        translatedWord: parsed.translatedWord ?? null,
      };
    }
  } catch {
    // not pure JSON, try to extract
  }

  // Strip code fences if present
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // Find the first { and last }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const jsonStr = cleaned.slice(first, last + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed.reply === 'string') {
        return {
          reply: parsed.reply,
          correction: parsed.correction ?? null,
          translatedWord: parsed.translatedWord ?? null,
        };
      }
    } catch {
      // fall through
    }
  }

  // Fallback: treat whole content as reply
  return {
    reply: content.trim(),
    correction: null,
    translatedWord: null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    const { message, teacher, user, conversationHistory, inputLang } = body;

    if (!message || !teacher || !user) {
      return NextResponse.json(
        { error: 'Missing required fields: message, teacher, user' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(teacher, user, inputLang ?? 'en');

    // Build messages for the AI
    const recentHistory = (conversationHistory || []).slice(-10); // keep last 10 turns
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call z-ai-web-dev-sdk
    let aiReply: string;
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: aiMessages,
        temperature: 0.8,
        max_tokens: 300,
        thinking: { type: 'disabled' },
      });
      aiReply = completion.choices[0]?.message?.content ?? '';
    } catch (aiErr) {
      console.error('[OptiTalk] AI SDK error:', aiErr);
      // Graceful fallback so the conversation can continue
      aiReply = JSON.stringify({
        reply: `I'm sorry, I had trouble understanding that. Could you say it again, ${user.name || 'friend'}?`,
        correction: null,
        translatedWord: null,
      });
    }

    const parsed = extractJson(aiReply);

    // Persist to DB (best-effort, non-blocking failures)
    try {
      let conversationId = body.conversationId;
      const userId = body.userId;

      if (userId) {
        if (!conversationId) {
          const conv = await db.conversation.create({
            data: {
              userId,
              teacherId: teacher.id,
            },
          });
          conversationId = conv.id;
        }

        await db.message.create({
          data: {
            conversationId,
            role: 'user',
            content: message,
          },
        });

        await db.message.create({
          data: {
            conversationId,
            role: 'assistant',
            content: parsed.reply,
            correction: parsed.correction,
            translatedWord: parsed.translatedWord,
          },
        });

        // Award points for activity
        await db.user.update({
          where: { id: userId },
          data: { points: { increment: 2 } },
        });

        return NextResponse.json({ ...parsed, conversationId });
      }
    } catch (dbErr) {
      console.error('[OptiTalk] DB error (non-fatal):', dbErr);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[OptiTalk] Chat route error:', err);
    return NextResponse.json(
      {
        reply: "I'm sorry, something went wrong. Could you try again?",
        correction: null,
        translatedWord: null,
      },
      { status: 200 }
    );
  }
}
