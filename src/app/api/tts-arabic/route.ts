import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const VOICE_MAP: Record<string, string> = {
  'mr-james': 'ar-EG-ShakirNeural',
  'professor-david': 'ar-SA-HamedNeural',
  'ms-sarah': 'ar-EG-SalmaNeural',
  'miss-emma': 'ar-LB-LaylaNeural',
  'coach-mike': 'ar-JO-SanaNeural',
  'dr-lisa': 'ar-QA-AmalNeural',
  'friend-alex': 'ar-EG-ShakirNeural',
  'friend-omar': 'ar-LY-OmarNeural',
  'friend-karim': 'ar-SY-LaithNeural',
  'friend-sami': 'ar-MA-JamalNeural',
  'friend-tarek': 'ar-BH-AliNeural',
  'friend-amir': 'ar-KW-FahedNeural',
  'friend-ziad': 'ar-IQ-BasselNeural',
  'friend-khaled': 'ar-OM-AbdullahNeural',
  'friend-hassan': 'ar-TN-HediNeural',
  'friend-layla': 'ar-EG-SalmaNeural',
  'friend-sara': 'ar-LB-LaylaNeural',
  'friend-nora': 'ar-JO-SanaNeural',
  'friend-maya': 'ar-QA-AmalNeural',
  'friend-yara': 'ar-BH-LailaNeural',
  'friend-dina': 'ar-KW-NouraNeural',
  'friend-hana': 'ar-IQ-RanaNeural',
  'friend-farida': 'ar-LY-ImanNeural',
  'friend-mariam': 'ar-MA-MounaNeural',
};

const DEFAULT_MALE = 'ar-EG-ShakirNeural';
const DEFAULT_FEMALE = 'ar-EG-SalmaNeural';

function cleanText(text: string): string {
  let out = text
    .replace(/\([^)]*\)/g, '')
    .replace(/[""«»]/g, '')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (out.length > 900) out = out.slice(0, 900);
  return out;
}

async function handle(req: NextRequest, method: 'GET' | 'POST') {
  try {
    let text = '';
    let gender: 'male' | 'female' = 'male';
    let characterId = '';
    let voiceId = '';

    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));
      text = body.text || '';
      gender = body.gender === 'female' ? 'female' : 'male';
      characterId = body.characterId || '';
      voiceId = body.voiceId || '';
    } else {
      const u = new URL(req.url);
      text = u.searchParams.get('text') || '';
      gender = u.searchParams.get('gender') === 'female' ? 'female' : 'male';
      characterId = u.searchParams.get('characterId') || '';
      voiceId = u.searchParams.get('voiceId') || '';
    }

    if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });
    const clean = cleanText(text);
    if (!clean) return NextResponse.json({ error: 'Empty' }, { status: 400 });

    // اختيار الصوت
    let voice: string;
    if (voiceId) {
      voice = voiceId;
    } else if (characterId && VOICE_MAP[characterId]) {
      voice = VOICE_MAP[characterId];
    } else {
      voice = gender === 'female' ? DEFAULT_FEMALE : DEFAULT_MALE;
    }
    console.log(`[tts] voice: ${voice} | charId: ${characterId}`);

    // استخدم node-edge-tts
    const outPath = join(tmpdir(), `tts_${Date.now()}.mp3`);
    const tts = new EdgeTTS({ voice, lang: 'ar', timeout: 15000 });
    await tts.ttsPromise(clean, outPath);

    const buf = await readFile(outPath);
    // امسح الملف المؤقت
    try { await unlink(outPath); } catch {}

    if (!buf || buf.length < 100) {
      return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
    }

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buf.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e: any) {
    console.error('[tts] error:', e?.message);
    return NextResponse.json({ error: e?.message || 'fail' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return handle(req, 'POST'); }
export async function GET(req: NextRequest) { return handle(req, 'GET'); }
