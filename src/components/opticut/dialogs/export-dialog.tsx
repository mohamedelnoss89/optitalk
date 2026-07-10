'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useProjectStore, formatTime, getClipDuration, getTotalProjectDuration, type VideoClip } from '@/lib/project-store';
import { toast } from 'sonner';
import { Download, CheckCircle2 } from 'lucide-react';

const QUALITIES = {
  '480p': { width: 854, height: 480, label: '480p' },
  '720p': { width: 1280, height: 720, label: '720p' },
  '1080p': { width: 1920, height: 1080, label: '1080p' },
};

export function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const clips = useProjectStore((s) => s.clips);
  const texts = useProjectStore((s) => s.texts);
  const stickers = useProjectStore((s) => s.stickers);
  const audioTrack = useProjectStore((s) => s.audioTrack);
  const filters = useProjectStore((s) => s.filters);
  const projectName = useProjectStore((s) => s.projectName);

  const [quality, setQuality] = useState<keyof typeof QUALITIES>('720p');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [exportedSize, setExportedSize] = useState('');

  const totalDuration = getTotalProjectDuration(clips);

  const handleExport = async () => {
    if (clips.length === 0) { toast.error('لا توجد مقاطع'); return; }
    setIsExporting(true);
    setProgress(0);
    setExportedUrl(null);
    try {
      const result = await renderVideo({ clips, texts, stickers, audioTrack, filters, width: QUALITIES[quality].width, height: QUALITIES[quality].height, onProgress: setProgress });
      setExportedUrl(result.url);
      setExportedSize(formatFileSize(result.size));
      toast.success('تم التصدير بنجاح!');
    } catch (e) {
      console.error(e);
      toast.error('فشل التصدير: ' + (e as Error).message);
    } finally { setIsExporting(false); }
  };

  const handleDownload = () => {
    if (!exportedUrl) return;
    const a = document.createElement('a');
    a.href = exportedUrl;
    a.download = `${projectName || 'opticut'}-${quality}.webm`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleClose = () => {
    if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    setExportedUrl(null); setProgress(0); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isExporting && handleClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-xl">
        <DialogHeader><DialogTitle>تصدير الفيديو</DialogTitle></DialogHeader>
        {isExporting ? (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-slate-300 mb-2">جاري التصدير...</p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-500 mt-2">{Math.round(progress)}%</p>
            </div>
          </div>
        ) : exportedUrl ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-16 h-16 text-green-400" />
              <p className="text-lg font-semibold">تم التصدير بنجاح!</p>
              <p className="text-xs text-slate-400">الحجم: {exportedSize}</p>
            </div>
            <video src={exportedUrl} controls className="w-full rounded-lg" />
            <Button onClick={handleDownload} className="w-full"><Download className="w-4 h-4 ml-2" /> تحميل الفيديو</Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300 mb-2 block">الجودة</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(QUALITIES) as Array<keyof typeof QUALITIES>).map((q) => (
                  <button key={q} onClick={() => setQuality(q)} className={`px-4 py-3 rounded-lg text-sm font-medium ${quality === q ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{QUALITIES[q].label}</button>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-slate-400">مقاطع</span><span>{clips.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">نصوص</span><span>{texts.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">ملصقات</span><span>{stickers.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">موسيقى</span><span>{audioTrack ? '✓' : 'لا'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">المدة</span><span>{formatTime(totalDuration)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">الصيغة</span><span>WebM</span></div>
            </div>
          </div>
        )}
        {!isExporting && !exportedUrl && (
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleExport}>تصدير</Button>
          </DialogFooter>
        )}
        {!isExporting && exportedUrl && (
          <DialogFooter><Button variant="ghost" onClick={handleClose}>إغلاق</Button></DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

async function renderVideo({ clips, texts, stickers, audioTrack, filters, width, height, onProgress }: {
  clips: VideoClip[];
  texts: ReturnType<typeof useProjectStore.getState>['texts'];
  stickers: ReturnType<typeof useProjectStore.getState>['stickers'];
  audioTrack: ReturnType<typeof useProjectStore.getState>['audioTrack'];
  filters: ReturnType<typeof useProjectStore.getState>['filters'];
  width: number; height: number;
  onProgress: (p: number) => void;
}): Promise<{ url: string; size: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(30);

  // ===== إعداد الصوت (audio track + per-clip audio) =====
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  const audioElements: HTMLAudioElement[] = [];
  const mediaElementSources: MediaElementAudioSourceNode[] = [];

  if (audioTrack || clips.some((c) => c.type === 'video' && !c.muted)) {
    audioCtx = new AudioContext();
    audioDest = audioCtx.createMediaStreamDestination();
    audioDest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  }

  // ===== تحميل كل المقاطع مسبقاً (preload) =====
  type LoadedClip = {
    clip: VideoClip;
    video?: HTMLVideoElement;
    img?: HTMLImageElement;
    duration: number;
  };
  const loadedClips: LoadedClip[] = [];

  for (const clip of clips) {
    const clipDur = getClipDuration(clip);
    if (clip.type === 'video') {
      const video = document.createElement('video');
      video.src = clip.url;
      video.muted = true; // mute locally - الصوت بيتسجل عبر AudioContext
      video.playsInline = true;
      video.playbackRate = clip.speed;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error(`فشل تحميل: ${clip.name}`));
      });
      // وصّل الصوت لو مش mute
      if (!clip.muted && audioCtx && audioDest) {
        try {
          const source = audioCtx.createMediaElementSource(video);
          const gain = audioCtx.createGain();
          gain.gain.value = clip.volume;
          source.connect(gain);
          gain.connect(audioDest);
          mediaElementSources.push(source);
        } catch {}
      }
      loadedClips.push({ clip, video, duration: clipDur });
      audioElements.push(video);
    } else {
      // image
      const img = new Image();
      img.src = clip.url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`فشل تحميل: ${clip.name}`));
      });
      loadedClips.push({ clip, img, duration: clipDur });
    }
  }

  // إعداد الموسيقى
  let musicAudio: HTMLAudioElement | null = null;
  if (audioTrack && audioCtx && audioDest) {
    musicAudio = document.createElement('audio');
    musicAudio.src = audioTrack.url;
    musicAudio.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      musicAudio!.onloadedmetadata = () => resolve();
      musicAudio!.onerror = () => reject(new Error('فشل تحميل الموسيقى'));
    });
    try {
      const source = audioCtx.createMediaElementSource(musicAudio);
      const gain = audioCtx.createGain();
      gain.gain.value = audioTrack.volume;
      source.connect(gain);
      gain.connect(audioDest);
      mediaElementSources.push(source);
    } catch {}
    audioElements.push(musicAudio);
  }

  // ===== بدء التسجيل =====
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm;codecs=vp8,opus';
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const totalDuration = getTotalProjectDuration(clips);
  const filterString = `brightness(${1 + filters.brightness}) contrast(${filters.contrast}) saturate(${filters.saturation})`;

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      // cleanup
      loadedClips.forEach((lc) => {
        if (lc.video) { lc.video.pause(); lc.video.src = ''; }
      });
      audioElements.forEach((a) => { a.pause(); a.src = ''; });
      if (musicAudio) { musicAudio.pause(); musicAudio.src = ''; }
      if (audioCtx) audioCtx.close();
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunks, { type: 'video/webm' });
      onProgress(100);
      resolve({ url: URL.createObjectURL(blob), size: blob.size });
    };
    recorder.onerror = (e) => reject(e);
    recorder.start();

    let currentLoadedIdx = 0;
    const startTime = performance.now();

    // شغّل أول مقطع
    const startClip = (idx: number) => {
      const lc = loadedClips[idx];
      if (!lc) return;
      if (lc.video) {
        lc.video.currentTime = lc.clip.startTime;
        lc.video.playbackRate = lc.clip.speed;
        lc.video.play().catch(() => {});
      }
      if (musicAudio && idx === 0) {
        // شغّل الموسيقى بعد الـ videoOffset
        setTimeout(() => musicAudio?.play().catch(() => {}), (audioTrack?.videoOffset || 0) * 1000);
      }
    };

    // التحقق من الانتقال للمقطع التالي
    const checkClipEnd = () => {
      const lc = loadedClips[currentLoadedIdx];
      if (!lc) return;
      const elapsed = (performance.now() - startTime) / 1000;
      // احسب وقت بداية المقطع الحالي
      let clipStart = 0;
      for (let i = 0; i < currentLoadedIdx; i++) clipStart += loadedClips[i].duration;
      const clipElapsed = elapsed - clipStart;
      if (clipElapsed >= lc.duration) {
        // انتقل للمقطع التالي
        if (lc.video) lc.video.pause();
        currentLoadedIdx++;
        if (currentLoadedIdx >= loadedClips.length) {
          // خلصنا - وقف التسجيل بعد ثانية
          setTimeout(() => recorder.stop(), 200);
          return;
        }
        startClip(currentLoadedIdx);
      }
    };

    const draw = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed >= totalDuration) {
        setTimeout(() => recorder.stop(), 200);
        return;
      }

      // تحقق من الانتقال
      checkClipEnd();

      const lc = loadedClips[currentLoadedIdx];
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      if (lc) {
        ctx.save();
        ctx.filter = filterString;
        // تطبيق التحويلات (rotation/flip)
        ctx.translate(width / 2, height / 2);
        ctx.rotate((lc.clip.rotation * Math.PI) / 180);
        ctx.scale(lc.clip.flipH ? -1 : 1, lc.clip.flipV ? -1 : 1);

        const source = lc.video || lc.img;
        if (source) {
          const sw = lc.video ? lc.video.videoWidth : lc.img!.naturalWidth;
          const sh = lc.video ? lc.video.videoHeight : lc.img!.naturalHeight;
          if (sw > 0 && sh > 0) {
            const vAspect = sw / sh;
            const cAspect = width / height;
            let dw, dh;
            if (vAspect > cAspect) { dw = width; dh = width / vAspect; }
            else { dh = height; dw = height * vAspect; }
            ctx.drawImage(source, -dw / 2, -dh / 2, dw, dh);
          }
        }
        ctx.restore();
        ctx.filter = 'none';

        // ===== Fade in/out =====
        let clipStart = 0;
        for (let i = 0; i < currentLoadedIdx; i++) clipStart += loadedClips[i].duration;
        const clipElapsed = elapsed - clipStart;
        if (lc.clip.fadeIn > 0 && clipElapsed < lc.clip.fadeIn) {
          ctx.fillStyle = `rgba(0,0,0,${1 - clipElapsed / lc.clip.fadeIn})`;
          ctx.fillRect(0, 0, width, height);
        }
        if (lc.clip.fadeOut > 0 && clipElapsed > lc.duration - lc.clip.fadeOut) {
          const fadeProgress = (clipElapsed - (lc.duration - lc.clip.fadeOut)) / lc.clip.fadeOut;
          ctx.fillStyle = `rgba(0,0,0,${Math.min(1, fadeProgress)})`;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // ===== النصوص =====
      for (const text of texts) {
        if (elapsed >= text.startTime && elapsed <= text.endTime) {
          const fontSize = (text.fontSize / 1080) * height;
          ctx.font = `${text.bold ? 'bold ' : ''}${text.italic ? 'italic ' : ''}${fontSize}px sans-serif`;
          ctx.fillStyle = text.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
          ctx.fillText(text.text, text.x * width, text.y * height);
          ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        }
      }

      // ===== الملصقات =====
      for (const s of stickers) {
        if (elapsed >= s.startTime && elapsed <= s.endTime) {
          ctx.font = `${(s.size / 1080) * height}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(s.emoji, s.x * width, s.y * height);
        }
      }

      onProgress(Math.min(99, (elapsed / totalDuration) * 100));
      requestAnimationFrame(draw);
    };

    startClip(0);
    draw();
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
