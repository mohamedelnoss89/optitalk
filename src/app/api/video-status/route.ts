// ===== OptiTalk - Video Status API (DISABLED on Vercel) =====

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'DISABLED',
    videoUrl: null,
    message: 'Video generation disabled on Vercel.',
  }, { status: 200 });
}
