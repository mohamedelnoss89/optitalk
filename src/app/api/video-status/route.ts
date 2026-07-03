// ===== OptiTalk - Video Status API =====
// GET /api/video-status?taskId=xxx
// Returns: { status, videoUrl }

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();
    const result = await zai.async.result.query(taskId);

    const status = result.task_status || 'UNKNOWN';

    // لو الفيديو جاهز، نرجّع URL
    let videoUrl = null;
    if (status === 'SUCCESS') {
      // الـ videoUrl ممكن يكون array أو string
      const raw = result.video_result || result.video_url || result.url;
      if (Array.isArray(raw) && raw.length > 0) {
        videoUrl = raw[0].url || raw[0];
      } else if (typeof raw === 'string') {
        videoUrl = raw;
      }
      console.log('[OptiTalk Video] Task completed:', taskId, 'URL:', videoUrl);
    }

    return NextResponse.json({
      status,
      videoUrl,
      taskId,
    });
  } catch (error) {
    console.error('[OptiTalk Video] Status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    );
  }
}
