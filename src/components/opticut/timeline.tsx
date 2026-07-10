'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Film, Music, Type, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useProjectStore, formatTime, getClipDuration, getTotalProjectDuration, type VideoClip } from '@/lib/project-store';
import { toast } from 'sonner';

type DragMode =
  | { type: 'none' }
  | { type: 'move-clip'; clipId: string; startGlobalTime: number; startClipStart: number; startMouseX: number }
  | { type: 'resize-clip-left'; clipId: string; originalStartTime: number; originalEndTime: number; startMouseX: number }
  | { type: 'resize-clip-right'; clipId: string; originalStartTime: number; originalEndTime: number; originalImageDuration?: number; startMouseX: number }
  | { type: 'scrub'; startMouseX: number; startGlobalTime: number };

export function Timeline() {
  const clips = useProjectStore((s) => s.clips);
  const texts = useProjectStore((s) => s.texts);
  const stickers = useProjectStore((s) => s.stickers);
  const audioTrack = useProjectStore((s) => s.audioTrack);
  const removeClip = useProjectStore((s) => s.removeClip);
  const removeText = useProjectStore((s) => s.removeText);
  const selectedClipId = useProjectStore((s) => s.selectedClipId);
  const setSelectedClipId = useProjectStore((s) => s.setSelectedClipId);
  const globalTime = useProjectStore((s) => s.globalTime);
  const setGlobalTime = useProjectStore((s) => s.setGlobalTime);
  const setIsPlaying = useProjectStore((s) => s.setIsPlaying);
  const updateClip = useProjectStore((s) => s.updateClip);
  const moveClip = useProjectStore((s) => s.moveClip);
  const addFromMediaBin = useProjectStore((s) => s.addFromMediaBin);

  const tracksRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<DragMode>({ type: 'none' });
  const [hoverClipId, setHoverClipId] = useState<string | null>(null);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(40);

  const totalDuration = getTotalProjectDuration(clips);

  // Auto-adjust pixelsPerSecond based on container width vs total duration
  useEffect(() => {
    if (!tracksRef.current) return;
    const containerWidth = tracksRef.current.clientWidth - 60; // minus icon column
    if (totalDuration > 0 && containerWidth > 0) {
      const minPps = 10;
      const maxPps = 100;
      const fitPps = containerWidth / totalDuration;
      setPixelsPerSecond(Math.max(minPps, Math.min(maxPps, fitPps)));
    }
  }, [totalDuration]);

  const timelineWidth = Math.max(800, totalDuration * pixelsPerSecond);
  const playheadX = globalTime * pixelsPerSecond;

  // Helper: convert mouse X to global time - دايماً RTL (الوقت 0 على اليمين)
  const mouseToTime = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!tracksRef.current) return 0;
    const rect = tracksRef.current.getBoundingClientRect();
    // RTL: الوقت 0 على اليمين، يزيد لليسار
    const clickX = rect.right - e.clientX;
    return Math.max(0, Math.min(totalDuration, (clickX / rect.width) * totalDuration));
  }, [totalDuration]);

  // Helper: convert delta mouse X to delta time
  const deltaToTime = useCallback((deltaX: number) => {
    return deltaX / pixelsPerSecond;
  }, [pixelsPerSecond]);

  // ===== Mouse move handler (during drag) =====
  useEffect(() => {
    if (dragMode.type === 'none') return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      if (dragMode.type === 'scrub') {
        const deltaTime = deltaToTime(e.clientX - dragMode.startMouseX);
        // RTL: سحب لليمين = نقص الوقت، سحب لليسار = زيادة الوقت
        const newTime = dragMode.startGlobalTime - deltaTime;
        setGlobalTime(Math.max(0, Math.min(totalDuration, newTime)));
        return;
      }

      if (dragMode.type === 'move-clip') {
        const deltaTime = deltaToTime(e.clientX - dragMode.startMouseX);
        // RTL: سحب لليمين = نقص، سحب لليسار = زيادة
        const adjustedDelta = -deltaTime;
        // Calculate new clip start time
        const newClipStart = Math.max(0, dragMode.startClipStart + adjustedDelta);
        // Find new index based on newClipStart
        const clipsState = useProjectStore.getState().clips;
        const clipIdx = clipsState.findIndex((c) => c.id === dragMode.clipId);
        if (clipIdx < 0) return;

        // Calculate cumulative durations to find target index
        let cumulative = 0;
        let targetIdx = 0;
        for (let i = 0; i < clipsState.length; i++) {
          if (i === clipIdx) continue;
          const c = clipsState[i];
          const dur = getClipDuration(c);
          if (newClipStart < cumulative + dur / 2) {
            targetIdx = i > clipIdx ? i - 1 : i;
            break;
          }
          cumulative += dur;
          targetIdx = i;
        }
        // Apply the move (if target is different)
        const finalTargetIdx = Math.max(0, Math.min(clipsState.length - 1, targetIdx));
        if (finalTargetIdx !== clipIdx) {
          moveClip(clipIdx, finalTargetIdx);
        }
        // Update globalTime to follow the clip
        setGlobalTime(newClipStart + 0.5);
        return;
      }

      if (dragMode.type === 'resize-clip-left') {
        const deltaTime = deltaToTime(e.clientX - dragMode.startMouseX);
        // RTL: سحب لليمين = نقص
        const adjustedDelta = -deltaTime;
        const clip = useProjectStore.getState().clips.find((c) => c.id === dragMode.clipId);
        if (!clip) return;

        // For videos: change startTime (within source)
        if (clip.type === 'video') {
          const newStartTime = Math.max(0, Math.min(dragMode.originalEndTime - 0.5, dragMode.originalStartTime + adjustedDelta * clip.speed));
          updateClip(clip.id, { startTime: newStartTime });
        }
      }

      if (dragMode.type === 'resize-clip-right') {
        const deltaTime = deltaToTime(e.clientX - dragMode.startMouseX);
        // RTL: سحب لليمين = نقص
        const adjustedDelta = -deltaTime;
        const clip = useProjectStore.getState().clips.find((c) => c.id === dragMode.clipId);
        if (!clip) return;

        if (clip.type === 'video') {
          const newEndTime = Math.max(dragMode.originalStartTime + 0.5, Math.min(clip.duration, dragMode.originalEndTime + adjustedDelta * clip.speed));
          updateClip(clip.id, { endTime: newEndTime });
        } else if (clip.type === 'image') {
          const newDur = Math.max(0.5, (dragMode.originalImageDuration || 5) + adjustedDelta);
          updateClip(clip.id, { imageDuration: newDur, startTime: 0, endTime: newDur, duration: newDur });
        }
      }
    };

    const handleMouseUp = () => {
      setDragMode({ type: 'none' });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragMode, totalDuration, setGlobalTime, updateClip, deltaToTime]);

  if (clips.length === 0) return null;

  // ===== Click on empty track area (scrub to position) =====
  const handleTrackMouseDown = (e: React.MouseEvent) => {
    // Only scrub if clicking on empty area (not on a clip)
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.trackBg === 'true') {
      e.preventDefault();
      setIsPlaying(false);
      const newTime = mouseToTime(e);
      setGlobalTime(newTime);
      setDragMode({
        type: 'scrub',
        startMouseX: e.clientX,
        startGlobalTime: newTime,
      });
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
  };

  // ===== Playhead drag =====
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    setDragMode({
      type: 'scrub',
      startMouseX: e.clientX,
      startGlobalTime: globalTime,
    });
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  // ===== Clip click + drag =====
  const handleClipMouseDown = (e: React.MouseEvent, clip: VideoClip, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setIsPlaying(false);

    // Calculate clip's start in global time
    let clipStart = 0;
    for (let i = 0; i < idx; i++) clipStart += getClipDuration(clips[i]);
    setGlobalTime(clipStart + 0.01);

    // Start drag for moving clip
    setDragMode({
      type: 'move-clip',
      clipId: clip.id,
      startGlobalTime: clipStart,
      startClipStart: clipStart,
      startMouseX: e.clientX,
    });
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  // ===== Resize handles =====
  const handleResizeLeftMouseDown = (e: React.MouseEvent, clip: VideoClip) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setDragMode({
      type: 'resize-clip-left',
      clipId: clip.id,
      originalStartTime: clip.startTime,
      originalEndTime: clip.endTime,
      startMouseX: e.clientX,
    });
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeRightMouseDown = (e: React.MouseEvent, clip: VideoClip) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setDragMode({
      type: 'resize-clip-right',
      clipId: clip.id,
      originalStartTime: clip.startTime,
      originalEndTime: clip.endTime,
      originalImageDuration: clip.imageDuration,
      startMouseX: e.clientX,
    });
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-300">المخطط الزمني</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="tabular-nums">المدة: {formatTime(totalDuration)}</span>
          <span className="text-slate-600">•</span>
          <span className="tabular-nums">{pixelsPerSecond.toFixed(0)}px/s</span>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto flex-1" ref={tracksRef as any}>
        <div style={{ width: `${timelineWidth}px`, minWidth: '100%' }} className="relative">
          {/* Time ruler */}
          <div className="flex items-end h-5 mb-1 border-b border-white/10 relative">
            {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => {
              const time = i * 5;
              if (time > totalDuration) return null;
              return (
                <div key={i} className="absolute text-[10px] text-slate-500" style={{ right: `${time * pixelsPerSecond}px`, transform: 'translateX(50%)' }}>
                  <span className="tabular-nums">{formatTime(time)}</span>
                  <div className="w-px h-2 bg-slate-700 mx-auto mt-0.5" />
                </div>
              );
            })}
          </div>

          {/* Playhead - now draggable */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 cursor-ew-resize group"
            style={{ right: `${playheadX}px` }}
            onMouseDown={handlePlayheadMouseDown}
          >
            <div className="absolute -top-1 w-4 h-4 bg-red-500 rounded-full shadow-lg group-hover:bg-red-400 transition-colors" style={{ right: '-8px' }} />
            <div className="absolute -top-1 w-4 h-4 bg-red-500/30 rounded-full animate-ping" style={{ right: '-8px' }} />
          </div>

          <div className="space-y-2 relative">
            {/* Video/Image track - now with mousedown for scrubbing */}
            <div className="flex items-center gap-2">
              <div className="w-10 flex items-center justify-center text-purple-400 flex-shrink-0"><Film className="w-4 h-4" /></div>
              <div
                className="flex-1 relative cursor-text"
                style={{ height: '70px' }}
                data-track-bg="true"
                onMouseDown={handleTrackMouseDown}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const clipId = e.dataTransfer.getData('text/plain');
                  if (clipId) {
                    addFromMediaBin(clipId);
                    const clip = useProjectStore.getState().clips.find((c) => c.id === clipId);
                    toast.success(clip ? `تمت إضافة: ${clip.name}` : 'تمت الإضافة للـ timeline');
                  }
                }}
              >
                {clips.map((clip, idx) => {
                  const clipDuration = getClipDuration(clip);
                  const Icon = clip.type === 'image' ? ImageIcon : Film;
                  const isSelected = selectedClipId === clip.id;
                  const isHovered = hoverClipId === clip.id;
                  let clipStart = 0;
                  for (let i = 0; i < idx; i++) clipStart += getClipDuration(clips[i]);
                  const clipRight = clipStart * pixelsPerSecond;
                  const clipWidth = Math.max(40, clipDuration * pixelsPerSecond);
                  const thumbSource = clip.type === 'image' ? clip.url : null;
                  const videoFrames = clip.thumbnails || [];
                  const frameWidth = 50;
                  const framesToShow = videoFrames.length > 0 ? Math.max(1, Math.floor(clipWidth / frameWidth)) : 0;
                  const displayedFrames = framesToShow > 0 && videoFrames.length > 0
                    ? Array.from({ length: Math.min(framesToShow, videoFrames.length) }).map((_, i) => videoFrames[Math.floor((i / framesToShow) * videoFrames.length)])
                    : videoFrames.slice(0, 1);
                  const bgClass = clip.type === 'image' ? 'bg-orange-600/30 border-orange-500/40' : 'bg-purple-600/30 border-purple-500/40';
                  const borderClass = isSelected ? 'border-2 border-cyan-400' : 'border border-white/10';
                  const textClass = clip.type === 'image' ? 'text-orange-300' : 'text-purple-300';

                  return (
                    <div
                      key={clip.id}
                      className={`group absolute top-0 ${bgClass} ${borderClass} rounded-md hover:opacity-95 transition-opacity overflow-hidden cursor-grab active:cursor-grabbing`}
                      style={{ right: `${clipRight}px`, width: `${clipWidth}px`, height: '70px' }}
                      onMouseDown={(e) => handleClipMouseDown(e, clip, idx)}
                      onMouseEnter={() => setHoverClipId(clip.id)}
                      onMouseLeave={() => setHoverClipId(null)}
                    >
                      {/* Frames / Thumbnail display */}
                      {displayedFrames.length > 0 ? (
                        <div className="absolute inset-0 flex pointer-events-none">
                          {displayedFrames.map((frame, i) => (
                            <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / displayedFrames.length}%`, backgroundImage: `url(${frame})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          ))}
                        </div>
                      ) : thumbSource ? (
                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${thumbSource})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ) : null}

                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                      {/* Top label */}
                      <div className="absolute top-0 right-0 left-0 px-1.5 py-0.5 flex items-center gap-1 bg-black/50 pointer-events-none">
                        <Icon className={`w-2.5 h-2.5 ${textClass} flex-shrink-0`} />
                        <span className="text-[10px] text-white truncate flex-1">{clip.name}</span>
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-0 right-0 left-0 px-1.5 py-0.5 bg-black/50 flex items-center justify-between pointer-events-none">
                        <span className={`text-[9px] ${textClass} tabular-nums`}>{formatTime(clipDuration)}</span>
                        <div className="flex items-center gap-1">
                          {clip.speed !== 1 && <span className="text-[9px] text-orange-300 bg-orange-500/20 px-1 rounded">{clip.speed}x</span>}
                          {(clip.rotation !== 0 || clip.flipH || clip.flipV) && <span className="text-[9px] text-cyan-300">⟳</span>}
                        </div>
                      </div>

                      {/* Left resize handle - للفيديو فقط (الصور مفيهاش source time) */}
                      {clip.type === 'video' && (isSelected || isHovered) && (
                        <div
                          className="absolute top-0 bottom-0 left-0 w-2 bg-cyan-500/50 hover:bg-cyan-400 cursor-ew-resize z-10 flex items-center justify-center"
                          onMouseDown={(e) => handleResizeLeftMouseDown(e, clip)}
                        >
                          <div className="w-0.5 h-4 bg-white/60" />
                        </div>
                      )}

                      {/* Right resize handle - للفيديو والصور */}
                      {(isSelected || isHovered) && (
                        <div
                          className="absolute top-0 bottom-0 right-0 w-2 bg-cyan-500/50 hover:bg-cyan-400 cursor-ew-resize z-10 flex items-center justify-center"
                          onMouseDown={(e) => handleResizeRightMouseDown(e, clip)}
                        >
                          <div className="w-0.5 h-4 bg-white/60" />
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-500 rounded p-0.5 z-10"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audio track - also resizable */}
            {audioTrack && (
              <div className="flex items-center gap-2">
                <div className="w-10 flex items-center justify-center text-teal-400 flex-shrink-0"><Music className="w-4 h-4" /></div>
                <div className="flex-1 relative" style={{ height: '40px' }} data-track-bg="true" onMouseDown={handleTrackMouseDown}>
                  <div
                    className="absolute top-0 bg-teal-600/30 border border-teal-500/40 rounded-md p-2 flex items-center justify-between cursor-grab hover:bg-teal-600/40"
                    style={{ right: 0, width: `${Math.min(timelineWidth, audioTrack.duration * pixelsPerSecond)}px`, height: '40px' }}
                  >
                    <span className="text-xs text-white truncate">{audioTrack.name}</span>
                    <span className="text-[10px] text-teal-300 tabular-nums">{formatTime(audioTrack.duration)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Text track */}
            {texts.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-10 flex items-center justify-center text-yellow-400 flex-shrink-0"><Type className="w-4 h-4" /></div>
                <div className="flex-1 relative" style={{ height: '30px' }} data-track-bg="true" onMouseDown={handleTrackMouseDown}>
                  {texts.map((text) => (
                    <div key={text.id} className="group absolute top-0 bg-yellow-600/30 border border-yellow-500/40 rounded-md p-1.5 cursor-grab hover:bg-yellow-600/40" style={{ right: `${text.startTime * pixelsPerSecond}px`, width: `${Math.max(60, (text.endTime - text.startTime) * pixelsPerSecond)}px`, height: '30px' }}>
                      <div className="text-xs text-white truncate">{text.text}</div>
                      <button onClick={(e) => { e.stopPropagation(); removeText(text.id); }} className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-500 rounded p-0.5">
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stickers track */}
            {stickers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-10 flex items-center justify-center text-pink-400 flex-shrink-0"><Sparkles className="w-4 h-4" /></div>
                <div className="flex-1 relative" style={{ height: '30px' }} data-track-bg="true" onMouseDown={handleTrackMouseDown}>
                  {stickers.map((s) => (
                    <div key={s.id} className="group absolute top-0 bg-pink-600/30 border border-pink-500/40 rounded-md p-1.5 flex items-center cursor-grab hover:bg-pink-600/40" style={{ right: `${s.startTime * pixelsPerSecond}px`, width: `${Math.max(40, (s.endTime - s.startTime) * pixelsPerSecond)}px`, height: '30px' }}>
                      <span className="text-base">{s.emoji}</span>
                      <button onClick={(e) => { e.stopPropagation(); useProjectStore.getState().removeSticker(s.id); }} className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-500 rounded p-0.5">
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 mt-2">
        💡 اسحب المقطع لتغيير موضعه • اسحب المؤشر الأحمر للتنقل • اسحب حواف المقطع (cyan) لتغيير طوله
      </p>
    </div>
  );
}
