'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Camera, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime, useProjectStore, getClipDuration, findClipAtTime, getTotalProjectDuration } from '@/lib/project-store';
import { toast } from 'sonner';

export function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const clips = useProjectStore((s) => s.clips);
  const texts = useProjectStore((s) => s.texts);
  const stickers = useProjectStore((s) => s.stickers);
  const filters = useProjectStore((s) => s.filters);
  const audioTrack = useProjectStore((s) => s.audioTrack);
  const selectedClipId = useProjectStore((s) => s.selectedClipId);
  const setSelectedClipId = useProjectStore((s) => s.setSelectedClipId);
  const globalTime = useProjectStore((s) => s.globalTime);
  const setGlobalTime = useProjectStore((s) => s.setGlobalTime);
  const isPlaying = useProjectStore((s) => s.isPlaying);
  const setIsPlaying = useProjectStore((s) => s.setIsPlaying);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const totalDuration = getTotalProjectDuration(clips);
  const currentInfo = findClipAtTime(clips, globalTime);
  const currentClip = currentInfo?.clip;
  const currentClipIndex = currentInfo?.index ?? 0;

  useEffect(() => {
    if (!currentClip) return;
    if (currentClip.type === 'video') {
      const video = videoRef.current;
      if (!video) return;
      if (video.src !== currentClip.url) video.src = currentClip.url;
      const targetVideoTime = currentClip.startTime + currentInfo!.localTime * currentClip.speed;
      if (Math.abs(video.currentTime - targetVideoTime) > 0.3) video.currentTime = targetVideoTime;
      if (video.playbackRate !== currentClip.speed) video.playbackRate = currentClip.speed;
    }
  }, [currentClip, currentInfo, globalTime]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; }
      return;
    }
    lastFrameTimeRef.current = performance.now();
    const tick = (now: number) => {
      const delta = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      const st = useProjectStore.getState();
      const newTime = st.globalTime + delta;
      const total = getTotalProjectDuration(st.clips);
      if (newTime >= total) { setGlobalTime(total); setIsPlaying(false); return; }
      setGlobalTime(newTime);
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    animationFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isPlaying, setGlobalTime, setIsPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClip || currentClip.type !== 'video') return;
    if (isPlaying) video.play().catch(() => {});
    else video.pause();
  }, [isPlaying, currentClip]);

  // Apply per-clip volume/muted to the video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClip || currentClip.type !== 'video') return;
    // Use the clip's volume/muted settings (with global mute override)
    const effectiveVolume = isMuted || currentClip.muted ? 0 : currentClip.volume * volume;
    video.volume = effectiveVolume;
    video.muted = isMuted || currentClip.muted;
  }, [volume, isMuted, currentClip]);

  // ===== تشغيل الموسيقى في المعاينة =====
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioTrack) return;
    audio.volume = isMuted ? 0 : audioTrack.volume * volume;
    audio.muted = isMuted;
  }, [volume, isMuted, audioTrack]);

  // تحكم في تشغيل/إيقاف الموسيقى
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioTrack) return;

    if (isPlaying) {
      // احسب الموضع الصحيح للموسيقى
      const musicStart = audioTrack.videoOffset;
      const musicPosition = globalTime - musicStart;
      if (musicPosition >= 0 && musicPosition < audioTrack.duration) {
        if (Math.abs(audio.currentTime - musicPosition) > 0.5) {
          audio.currentTime = musicPosition;
        }
        audio.play().catch(() => {});
      } else if (musicPosition < 0) {
        // الموسيقى لسه ما بدأتش
        audio.pause();
        audio.currentTime = 0;
      } else {
        // الموسيقى خلصت
        audio.pause();
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, globalTime, audioTrack]);

  const togglePlay = () => {
    if (globalTime >= totalDuration) setGlobalTime(0);
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => { setIsPlaying(false); setGlobalTime(value[0]); };
  const handleVolume = (value: number[]) => { setVolume(value[0]); setIsMuted(value[0] === 0); };
  const toggleMute = () => setIsMuted(!isMuted);

  const fullscreen = () => {
    const elem = videoRef.current || imgRef.current;
    if (elem?.requestFullscreen) elem.requestFullscreen();
  };

  const skipBackward = () => { setIsPlaying(false); setGlobalTime(Math.max(0, globalTime - 5)); };
  const skipForward = () => { setIsPlaying(false); setGlobalTime(Math.min(totalDuration, globalTime + 5)); };

  const takeSnapshot = () => {
    if (!currentClip) return;
    const canvas = document.createElement('canvas');
    canvas.width = currentClip.width;
    canvas.height = currentClip.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((currentClip.rotation * Math.PI) / 180);
    ctx.scale(currentClip.flipH ? -1 : 1, currentClip.flipV ? -1 : 1);
    if (currentClip.type === 'video') {
      const video = videoRef.current;
      if (!video || video.readyState < 2) { toast.error('انتظر تحميل الفيديو'); return; }
      ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    } else {
      const img = imgRef.current;
      if (!img) { toast.error('انتظر تحميل الصورة'); return; }
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    }
    ctx.restore();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `snapshot-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('تم حفظ الصورة');
    }, 'image/png');
  };

  const visibleTexts = texts.filter((t) => globalTime >= t.startTime && globalTime <= t.endTime);
  const visibleStickers = stickers.filter((s) => globalTime >= s.startTime && globalTime <= s.endTime);

  if (!currentClip) {
    return (
      <div className="aspect-video bg-black/40 rounded-xl flex items-center justify-center border border-white/10">
        <p className="text-slate-500">لا يوجد فيديو لمعاينته</p>
      </div>
    );
  }

  const transformStyle = { transform: `rotate(${currentClip.rotation}deg) scaleX(${currentClip.flipH ? -1 : 1}) scaleY(${currentClip.flipV ? -1 : 1})` };
  const filterStyle = `brightness(${1 + filters.brightness}) contrast(${filters.contrast}) saturate(${filters.saturation})`;

  return (
    <div className="space-y-3">
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
        {currentClip.type === 'video' ? (
          <video ref={videoRef} src={currentClip.url} className="w-full h-full object-contain" style={{ ...transformStyle, filter: filterStyle }} onClick={togglePlay} playsInline />
        ) : (
          <img ref={imgRef} src={currentClip.url} alt="معاينة الصورة" className="w-full h-full object-contain" style={{ ...transformStyle, filter: filterStyle }} onClick={togglePlay} />
        )}

        {/* Audio element للموسيقى الخلفية (مخفي) */}
        {audioTrack && (
          <audio ref={audioRef} src={audioTrack.url} preload="auto" className="hidden" />
        )}

        {visibleTexts.map((text) => (
          <div key={text.id} className="absolute pointer-events-none" style={{ left: `${text.x * 100}%`, top: `${text.y * 100}%`, transform: 'translate(-50%, -50%)', fontSize: `${text.fontSize}px`, color: text.color, fontWeight: text.bold ? 'bold' : 'normal', fontStyle: text.italic ? 'italic' : 'normal', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
            {text.text}
          </div>
        ))}

        {visibleStickers.map((s) => (
          <div key={s.id} className="absolute pointer-events-none" style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, transform: 'translate(-50%, -50%)', fontSize: `${s.size}px` }}>
            {s.emoji}
          </div>
        ))}

        {!isPlaying && (
          <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-8 h-8 text-black ml-1" fill="black" />
            </div>
          </button>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <Button size="icon" variant="ghost" onClick={fullscreen} className="bg-black/40 hover:bg-black/60 text-white"><Maximize2 className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={takeSnapshot} className="bg-black/40 hover:bg-black/60 text-white" title="التقاط صورة"><Camera className="w-4 h-4" /></Button>
        </div>

        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-sm">
          مقطع {currentClipIndex + 1} / {clips.length}
          {currentClip.speed !== 1 && <span className="ml-2 text-orange-300">{currentClip.speed}x</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 px-2">
        <Button size="icon" variant="ghost" onClick={skipBackward} className="text-white hover:bg-white/10" title="ترجع 5 ثواني"><SkipBack className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/10">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={skipForward} className="text-white hover:bg-white/10" title="تقديم 5 ثواني"><SkipForward className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/10">
          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolume} className="w-20" />
        <span className="text-sm text-slate-400 tabular-nums">{formatTime(globalTime)} / {formatTime(totalDuration)}</span>
        <Slider value={[globalTime]} max={totalDuration || 100} step={0.01} onValueChange={handleSeek} className="flex-1" />
      </div>
    </div>
  );
}
