// ===== OptiTalk - Upload Friend Video API =====
// POST /api/upload-friend-video
// Body: FormData with file and friendId
// Saves to public/videos/{friendId}.mp4

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const friendId = formData.get('friendId') as string;

    if (!file || !friendId) {
      return NextResponse.json(
        { error: 'file and friendId are required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const videosDir = join(process.cwd(), 'public', 'videos');
    
    // تأكد إن المجلد موجود
    try {
      await mkdir(videosDir, { recursive: true });
    } catch {
      // already exists
    }

    const filePath = join(videosDir, `${friendId}.mp4`);
    await writeFile(filePath, buffer);

    console.log(`[Upload] Saved: ${friendId}.mp4 (${buffer.length} bytes)`);

    return NextResponse.json({
      success: true,
      friendId,
      size: buffer.length,
      path: `/videos/${friendId}.mp4`,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
