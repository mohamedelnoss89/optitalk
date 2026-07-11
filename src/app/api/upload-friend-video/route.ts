// ===== OptiTalk - Upload Friend Video API =====
// POST /api/upload-friend-video
// Body: FormData with file and friendId
// Saves to public/videos/{friendId}.mp4 (both standalone and source)

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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
    
    // ===== احفظ في كل المسارات الممكنة =====
    const paths = [
      join(process.cwd(), 'public', 'videos'),           // standalone
      '/home/z/my-project/repos/optitalk/public/videos',  // source
    ];

    for (const dir of paths) {
      try {
        if (!existsSync(dir)) {
          await mkdir(dir, { recursive: true });
        }
        const filePath = join(dir, `${friendId}.mp4`);
        await writeFile(filePath, buffer);
        console.log(`[Upload] Saved to: ${filePath} (${buffer.length} bytes)`);
      } catch (err) {
        console.warn(`[Upload] Could not save to ${dir}:`, err);
      }
    }

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
