// ===== OptiTalk - TTS API Route =====
// POST /api/tts — body: { text, voice?, speed?, gender? }
// GET  /api/tts?text=...&voice=...&gender=...&speed=...
// Returns: audio/wav binary

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Voice mapping based on gender
// jam = English gentleman (male, clear)
// tongtong = warm (female, clear and warm)
// xiaochen = calm professional (male, deeper)
// luodo = expressive (female, more dynamic)
const VOICE_MAP: Record<string, string> = {
  male: 'jam',
  female: 'tongtong',
};

function cleanText(text: string): string {
  let out = text
    .replace(/\([^)]*\)/g, '')
    .replace(/[""«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (out.length > 1024) out = out.slice(0, 1024);
  return out;
}

async function generateTTS(text: string, voice?: string, gender?: string, speed: number = 0.95) {
  const selectedVoice = voice || (gender ? VOICE_MAP[gender] : null) || 'jam';

  const zai = await ZAI.create();
  const response = await zai.audio.tts.create({
    input: text,
    voice: selectedVoice,
    speed: Math.min(2.0, Math.max(0.5, speed)),
    response_format: 'wav',
    stream: false,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(new Uint8Array(arrayBuffer));
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed = 0.95, gender } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Text is empty after cleaning' }, { status: 400 });
    }

    const buffer = await generateTTS(clean, voice, gender, speed);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[OptiTalk TTS POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'TTS failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const text = url.searchParams.get('text');
    const voice = url.searchParams.get('voice') || undefined;
    const gender = url.searchParams.get('gender') || undefined;
    const speed = parseFloat(url.searchParams.get('speed') || '0.95');

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const clean = cleanText(text);
    if (!clean) {
      return NextResponse.json({ error: 'Text is empty after cleaning' }, { status: 400 });
    }

    const buffer = await generateTTS(clean, voice, gender, speed);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[OptiTalk TTS GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'TTS failed' },
      { status: 500 }
    );
  }
}
