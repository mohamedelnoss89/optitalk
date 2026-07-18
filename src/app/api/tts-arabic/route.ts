// ===== OptiTalk - Arabic TTS API Route (توافقي — يعيد التوجيه لنفس محرك Edge TTS الموحد) =====
// هذا المسار باقي عشان backward compatibility مع أي كود قديم يستدعيه.
// بيستخدم نفس محرك Edge TTS الموحد في /api/tts.

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// أصوات عربية (مصرية) من Edge TTS
const AR_MALE = 'ar-EG-ShakirNeural';
const AR_FEMALE = 'ar-EG-SalmaNeural';

function cleanText(text: string): string {
  let out = text
    .replace(/\([^)]*\)/g, '')
    .replace(/[""«»]/g, '')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (out.length > 900) {
    const slice = out.slice(0, 900);
    const lastPunct = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('؟ '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
      slice.lastIndexOf('.'),
      slice.lastIndexOf('؟'),
      slice.lastIndexOf('!'),
      slice.lastIndexOf('?')
    );
    out = lastPunct > 400 ? slice.slice(0, lastPunct + 1) : slice;
  }
  return out;
}

async function generateEdgeTTS(text: string, voice: string, rate: number): Promise<Buffer | null> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'optitalk-ar-'));
  const outputPath = join(tmpDir, 'out.mp3');
  const processed = text.replace(/[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]/g, '').replace(/\s+/g, ' ').trim();
  const ratePercent = Math.round((rate - 1) * 100);
  const rateArg = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('edge-tts', [
        '--voice', voice,
        '--text', processed,
        '--rate', rateArg,
        '--write-media', outputPath,
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}` },
      });
      let stderr = '';
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('error', reject);
      proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`edge-tts ${code}: ${stderr.slice(-200)}`)));
      proc.stdin.end();
    });
    return await readFile(outputPath);
  } catch (e) {
    console.error('[tts-arabic] edge-tts failed:', e);
    return null;
  } finally {
    try { await rm(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function generateGoogleTTS(text: string): Promise<Buffer | null> {
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=ar&client=tw-ob`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch { return null; }
}

async function handle(req: NextRequest, method: 'GET' | 'POST') {
  try {
    let text = '';
    let gender: 'male' | 'female' = 'male';
    let speedWPM = 160;

    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));
      text = typeof body.text === 'string' ? body.text : '';
      gender = body.gender === 'female' ? 'female' : 'male';
      speedWPM = typeof body.speed === 'number' ? body.speed : 160;
    } else {
      const u = new URL(req.url);
      text = u.searchParams.get('text') || '';
      gender = u.searchParams.get('gender') === 'female' ? 'female' : 'male';
      speedWPM = parseInt(u.searchParams.get('speed') || '160', 10);
    }

    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    const clean = cleanText(text);
    if (!clean) return NextResponse.json({ error: 'Empty text' }, { status: 400 });

    const voice = gender === 'female' ? AR_FEMALE : AR_MALE;
    // speedWPM 160 → rate ~1.0; 200 → ~1.25
    const rate = Math.min(1.5, Math.max(0.6, speedWPM / 160));

    let buf = await generateEdgeTTS(clean, voice, rate);
    if (!buf || buf.length < 500) buf = await generateGoogleTTS(clean);
    if (!buf) return NextResponse.json({ error: 'TTS failed' }, { status: 500 });

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buf.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'fail' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return handle(req, 'POST'); }
export async function GET(req: NextRequest) { return handle(req, 'GET'); }
