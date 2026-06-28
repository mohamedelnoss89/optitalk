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

const SYSTEM_PROMPT_TEMPLATE = `You are {teacherName}, an English teacher helping an Arabic-speaking student learn English through live conversation.

STUDENT INFO:
- Name: {userName}
- Age group: {userAge}
- Gender: {userGender}
- Level: {userLevel}

YOUR PERSONALITY:
{teacherPersonality}

YOUR TEACHING STYLE:
{teacherTeachingStyle}

LEVEL GUIDELINES:
- beginner: Use very simple words (A1-A2). Short sentences. Present tense mostly.
- intermediate: Everyday vocabulary (B1-B2). Mix of tenses. Idioms occasionally.
- advanced: Rich vocabulary (C1-C2). Complex sentences. Idioms and phrasal verbs.

STRICT RULES:
1. If the student makes a grammar, spelling, or word-choice mistake, briefly CORRECT it and explain in Arabic (the correction field).
2. If the student's English is correct, set correction to null and continue naturally.
3. Keep your reply SHORT (1-3 sentences) for conversational flow — this is a chat, not a lecture.
4. If you use a word the student might not know, provide its Arabic translation in the translatedWord field (format: "englishWord = الكلمةالعربية").
5. Be encouraging, positive, and warm — match your personality.
6. ALWAYS ask a follow-up question to keep the conversation going.
7. Stay in character as {teacherName} at all times.
8. Do NOT use markdown formatting in the reply field — plain text only.
9. Never break character. Never mention you are an AI.

BILINGUAL SUPPORT - VERY IMPORTANT:
10. If the student speaks in ARABIC, you MUST understand what they said and respond appropriately.
11. When a student speaks Arabic, first acknowledge what they said, then encourage them to try saying it in English.
12. Example: Student says "انا عايز اتعلم انجليزي" → You reply: "Great! You said you want to learn English. Let's practice! Try saying: 'I want to learn English.' Can you repeat that?"
13. If the student mixes Arabic and English, respond to the meaning and gently encourage more English.
14. Always provide Arabic translation for difficult English words in the translatedWord field.
15. The student's speech recognition language is set to: {inputLang}. If it is "ar", the student is likely speaking Arabic and the transcript may contain Arabic text or transliterated Arabic - try your best to understand. If it is "en", the student is attempting English and may have pronunciation/grammar mistakes.

You MUST respond with VALID JSON ONLY (no markdown, no code fences) in this exact format:
{
  "reply": "Your English response to the student (1-3 sentences with a follow-up question)",
  "correction": "Brief Arabic explanation of any mistake, or null if the student was correct",
  "translatedWord": "englishWord = الترجمة العربية, or null if no difficult word was used"
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
