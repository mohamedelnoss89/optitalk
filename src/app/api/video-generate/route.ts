// ===== OptiTalk - Video Generation API =====
// POST /api/video-generate
// Body: { text, imageUrl, teacherId }
// Returns: { taskId, status }

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

export async function POST(req: NextRequest) {
  try {
    const { text, imageUrl, teacherId, msgId } = await req.json();

    if (!text || !imageUrl) {
      return NextResponse.json(
        { error: 'text and imageUrl are required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // بناء prompt يحوي النص اللي المدرس هيقوله
    const prompt = `The person in the image is speaking directly to the camera, saying: "${text}". Their lips move naturally with the words, they blink their eyes naturally, and have a warm friendly expression. They look directly at the viewer.`;

    // توليد الفيديو
    const result = await zai.video.generations.create({
      image_url: imageUrl,
      prompt: prompt,
      quality: 'speed', // أسرع
      duration: 5,
      with_audio: true, // توليد صوت مع الفيديو
    });

    const taskId = result.id || result.request_id;

    if (!taskId) {
      throw new Error('No task ID returned');
    }

    console.log('[OptiTalk Video] Task created:', taskId);

    // حفظ في DB عشان نعمل poll بعدين
    try {
      await db.videoTask.create({
        data: {
          taskId,
          teacherId: teacherId || 'unknown',
          msgId: msgId || '',
          text: text.substring(0, 500),
          status: 'PROCESSING',
        },
      });
    } catch (dbErr) {
      // لو الجدول مش موجود، نتجاهل
      console.log('[OptiTalk Video] DB save skipped');
    }

    return NextResponse.json({
      taskId,
      status: result.task_status || 'PROCESSING',
    });
  } catch (error) {
    console.error('[OptiTalk Video] Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Video generation failed' },
      { status: 500 }
    );
  }
}
