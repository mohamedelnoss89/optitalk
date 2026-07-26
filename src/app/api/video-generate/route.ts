// ===== OptiTalk - Video Generation API (DISABLED on Vercel) =====
// z-ai SDK مش بيشتغل على Vercel، فالفيديو الجينيريت معطل مؤقتاً
// الفيديوهات الثابتة بتشتغل من public/teachers/ و public/friends/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  return NextResponse.json({
    error: 'Video generation disabled on Vercel. Using static videos.',
    taskId: null,
    status: 'DISABLED',
  }, { status: 200 });
}
