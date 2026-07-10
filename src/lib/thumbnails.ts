'use client';

export interface ThumbnailResult {
  time: number;
  dataUrl: string;
}

export async function generateVideoThumbnails(videoUrl: string, count: number = 6, duration?: number): Promise<ThumbnailResult[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.crossOrigin = 'anonymous';

    const results: ThumbnailResult[] = [];
    let videoDuration = duration || 0;
    let currentIndex = 0;
    let times: number[] = [];

    const cleanup = () => {
      // مش بنعمل revoke للـ URL لأنه بتاع المقطع نفسه (مش ملكنا)
      // بنمسح بس الـ video element من الـ DOM
      video.remove();
    };

    video.onloadedmetadata = () => {
      videoDuration = videoDuration || video.duration;
      if (!videoDuration || !isFinite(videoDuration)) {
        cleanup();
        resolve([]);
        return;
      }
      const startTime = videoDuration * 0.05;
      const endTime = videoDuration * 0.95;
      const step = (endTime - startTime) / Math.max(count - 1, 1);
      times = Array.from({ length: count }, (_, i) => startTime + step * i);
      processNext();
    };

    const processNext = () => {
      if (currentIndex >= times.length) {
        cleanup();
        resolve(results);
        return;
      }
      video.currentTime = Math.min(times[currentIndex], videoDuration - 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 160;
      const aspect = video.videoHeight / video.videoWidth || 0.5625;
      canvas.width = targetWidth;
      canvas.height = targetWidth * aspect;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          results.push({ time: video.currentTime, dataUrl });
        } catch {}
      }
      currentIndex++;
      setTimeout(processNext, 50);
    };

    video.onerror = () => { cleanup(); resolve([]); };
    video.src = videoUrl;
  });
}
