'use client';

import { useRef } from 'react';
import { Upload, Film, Music, Trash2, Image as ImageIcon, Sparkles, Sun, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useProjectStore, generateId, type VideoClip, type AudioTrack, type Transition, type TransitionType,
  VIDEO_ACCEPT, AUDIO_ACCEPT, isVideoFile, isAudioFile, isImageFile,
  EFFECT_PRESETS, TEXT_TEMPLATES, STICKERS, getClipDuration,
} from '@/lib/project-store';
import { generateVideoThumbnails } from '@/lib/thumbnails';
import { toast } from 'sonner';

interface MediaLibraryProps {
  activeTab: 'media' | 'effects' | 'transitions' | 'text' | 'stickers';
}

export function MediaLibrary({ activeTab }: MediaLibraryProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const clips = useProjectStore((s) => s.clips);
  const mediaBin = useProjectStore((s) => s.mediaBin);
  const addToMediaBin = useProjectStore((s) => s.addToMediaBin);
  const removeFromMediaBin = useProjectStore((s) => s.removeFromMediaBin);
  const addFromMediaBin = useProjectStore((s) => s.addFromMediaBin);
  const audioTrack = useProjectStore((s) => s.audioTrack);
  const setAudioTrack = useProjectStore((s) => s.setAudioTrack);
  const setSelectedClipId = useProjectStore((s) => s.setSelectedClipId);
  const setGlobalTime = useProjectStore((s) => s.setGlobalTime);
  const removeClip = useProjectStore((s) => s.removeClip);
  const setFilters = useProjectStore((s) => s.setFilters);
  const selectedClipId = useProjectStore((s) => s.selectedClipId);
  const addText = useProjectStore((s) => s.addText);
  const addSticker = useProjectStore((s) => s.addSticker);
  const addTransition = useProjectStore((s) => s.addTransition);
  const transitions = useProjectStore((s) => s.transitions);

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      if (isVideoFile(file)) {
        try {
          const url = URL.createObjectURL(file);
          const videoInfo = await getVideoInfo(file);
          const clipId = generateId();
          const clip: VideoClip = {
            id: clipId, type: 'video', file, url, name: file.name,
            duration: videoInfo.duration, startTime: 0, endTime: videoInfo.duration,
            width: videoInfo.width, height: videoInfo.height,
            rotation: 0, flipH: false, flipV: false, speed: 1, thumbnails: [], volume: 1, muted: false, fadeIn: 0, fadeOut: 0,
          };
          addToMediaBin(clip);
          toast.success(`تم تحميل: ${file.name} - اسحبه للـ timeline`);
          generateVideoThumbnails(url, 6, videoInfo.duration).then((thumbs) => {
            if (thumbs.length > 0) {
              const state = useProjectStore.getState();
              const binItem = state.mediaBin.find((c) => c.id === clipId);
              if (binItem) {
                removeFromMediaBin(clipId);
                addToMediaBin({ ...binItem, thumbnails: thumbs.map((t) => t.dataUrl), thumbnail: thumbs[0].dataUrl });
              }
            }
          });
        } catch { toast.error(`فشل تحميل ${file.name}`); }
      } else { toast.error(`${file.name} ليس صيغة مدعومة`); }
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // دالة منفصلة لإضافة الصور
  const addImageFile = async (file: File) => {
    if (!isImageFile(file)) {
      toast.error(`${file.name} ليس صورة`);
      return;
    }
    const url = URL.createObjectURL(file);
    const imgInfo = await getImageInfo(file);
    const clipId = generateId();
    addToMediaBin({
      id: clipId, type: 'image', file, url, name: file.name,
      duration: 5, startTime: 0, endTime: 5,
      width: imgInfo.width, height: imgInfo.height,
      rotation: 0, flipH: false, flipV: false, speed: 1,
      imageDuration: 5, volume: 1, muted: false, fadeIn: 0, fadeOut: 0,
    });
    toast.success(`تم تحميل صورة: ${file.name} - اسحبها للـ timeline`);
  };

  // handler منفصل لاختيار الصور
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      await addImageFile(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAudioFile(file)) { toast.error('الملف ليس صوتياً'); return; }
    const url = URL.createObjectURL(file);
    const duration = await getAudioDuration(file);
    setAudioTrack({ id: generateId(), file, url, name: file.name, duration, volume: 1, videoOffset: 0 });
    toast.success(`تمت إضافة موسيقى: ${file.name}`);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleClipClick = (clip: VideoClip, idx: number) => {
    setSelectedClipId(clip.id);
    let start = 0;
    for (let i = 0; i < idx; i++) start += getClipDuration(clips[i]);
    setGlobalTime(start + 0.01);
  };

  const handleApplyEffect = (presetId: string) => {
    const preset = EFFECT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setFilters({ brightness: preset.brightness, contrast: preset.contrast, saturation: preset.saturation });
    toast.success(`تم تطبيق فلتر: ${preset.name}`);
  };

  const handleAddTextTemplate = (templateId: string) => {
    const template = TEXT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const total = clips.reduce((sum, c) => sum + getClipDuration(c), 0);
    addText({ id: generateId(), text: template.text, startTime: 0, endTime: Math.min(5, total || 10), x: 0.5, y: template.y, fontSize: template.fontSize, color: template.color, bold: template.bold, italic: template.italic });
    toast.success(`تمت إضافة: ${template.name}`);
  };

  const handleAddSticker = (emoji: string, name: string) => {
    const total = clips.reduce((sum, c) => sum + getClipDuration(c), 0);
    addSticker({ id: generateId(), emoji, startTime: 0, endTime: Math.min(3, total || 5), x: 0.5, y: 0.5, size: 64 });
    toast.success(`تمت إضافة: ${name}`);
  };

  const handleAddTransition = (type: TransitionType, name: string) => {
    if (clips.length < 2) { toast.error('تحتاج مقطعين على الأقل'); return; }
    let selectedIndex = 0;
    if (selectedClipId) { selectedIndex = clips.findIndex((c) => c.id === selectedClipId); if (selectedIndex < 0) selectedIndex = 0; }
    if (selectedIndex >= clips.length - 1) { toast.error('لا يوجد مقطع تالٍ'); return; }
    const existing = transitions.find((t) => t.afterClipIndex === selectedIndex);
    if (existing) { useProjectStore.getState().updateTransition(existing.id, { type }); toast.success(`تم تحديث الانتقال إلى: ${name}`); return; }
    addTransition({ id: generateId(), type, duration: 0.5, afterClipIndex: selectedIndex });
    toast.success(`تمت إضافة انتقال: ${name}`);
  };

  if (activeTab === 'media') {
    return (
      <div className="p-3 space-y-3">
        <input ref={videoInputRef} type="file" accept={VIDEO_ACCEPT} multiple onChange={handleVideoSelect} className="hidden" />
        <input ref={imageInputRef} type="file" accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.avif" multiple onChange={handleImageSelect} className="hidden" />
        <input ref={audioInputRef} type="file" accept={AUDIO_ACCEPT} onChange={handleAudioSelect} className="hidden" />
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30 flex flex-col items-center gap-1 py-3" onClick={() => videoInputRef.current?.click()}>
            <Film className="w-4 h-4" />
            <span className="text-[10px]">فيديو</span>
          </Button>
          <Button variant="outline" size="sm" className="bg-orange-600/20 border-orange-500/40 text-orange-300 hover:bg-orange-600/30 flex flex-col items-center gap-1 py-3" onClick={() => imageInputRef.current?.click()}>
            <ImageIcon className="w-4 h-4" />
            <span className="text-[10px]">صورة</span>
          </Button>
          <Button variant="outline" size="sm" className="bg-teal-600/20 border-teal-500/40 text-teal-300 hover:bg-teal-600/30 flex flex-col items-center gap-1 py-3" onClick={() => audioInputRef.current?.click()}>
            <Music className="w-4 h-4" />
            <span className="text-[10px]">موسيقى</span>
          </Button>
        </div>

        {/* ===== Media Bin - الملفات المستوردة (اسحبها للـ timeline) ===== */}
        {mediaBin.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1 font-medium">📁 الملفات (اسحب للـ timeline)</p>
            <div className="space-y-1">
              {mediaBin.map((clip) => {
                const Icon = clip.type === 'image' ? ImageIcon : Film;
                return (
                  <div
                    key={clip.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', clip.id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onDoubleClick={() => {
                      addFromMediaBin(clip.id);
                      toast.success(`تمت إضافة: ${clip.name} للـ timeline`);
                    }}
                    className="group flex items-center gap-2 p-2 rounded-md cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors border border-white/5 hover:border-purple-500/30"
                    title="اسحب للـ timeline أو اضغط مرتين للإضافة"
                  >
                    <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {clip.thumbnail ? <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" /> : clip.type === 'image' ? <img src={clip.url} alt="" className="w-full h-full object-cover" /> : <Icon className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{clip.name}</p>
                      <p className="text-[10px] text-slate-500">{clip.type === 'image' ? 'صورة' : 'فيديو'}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromMediaBin(clip.id); }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== Timeline Clips - المقاطع اللي في الـ timeline ===== */}
        {clips.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1 font-medium">🎬 في الـ timeline</p>
            <div className="space-y-1">
              {clips.map((clip, idx) => {
                const Icon = clip.type === 'image' ? ImageIcon : Film;
                const isSelected = selectedClipId === clip.id;
                return (
                  <div key={clip.id} onClick={() => handleClipClick(clip, idx)} className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-purple-600/20 ring-1 ring-purple-500/40' : 'hover:bg-white/5'}`}>
                    <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {clip.thumbnail ? <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" /> : clip.type === 'image' ? <img src={clip.url} alt="" className="w-full h-full object-cover" /> : <Icon className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{clip.name}</p>
                      <p className="text-[10px] text-slate-500">{clip.type === 'image' ? 'صورة' : 'فيديو'}{clip.thumbnails && clip.thumbnails.length > 0 && ` • ${clip.thumbnails.length} frames`}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio */}
        {audioTrack && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1 font-medium">🎵 الموسيقى</p>
            <div className="flex items-center gap-2 p-2 rounded-md bg-teal-600/10 hover:bg-teal-600/20 cursor-pointer">
              <div className="w-10 h-10 rounded bg-teal-600/20 flex items-center justify-center flex-shrink-0"><Music className="w-4 h-4 text-teal-400" /></div>
              <div className="flex-1 min-w-0"><p className="text-xs text-white truncate">{audioTrack.name}</p><p className="text-[10px] text-slate-500">صوت</p></div>
              <button onClick={() => setAudioTrack(null)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {mediaBin.length === 0 && clips.length === 0 && !audioTrack && (
          <div className="text-center py-8 text-slate-500 text-xs">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>لا توجد ملفات بعد</p>
            <p className="mt-1">اضغط على الأزرار بالأعلى</p>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'transitions') {
    return (
      <div className="p-3">
        <p className="text-xs text-slate-400 mb-2">انتقالات بين المقاطع</p>
        <p className="text-[10px] text-slate-500 mb-3">اختر مقطعاً من الـ Timeline أولاً، ثم اضغط لإضافة انتقال</p>
        <div className="grid grid-cols-2 gap-2">
          {TRANSITIONS_LIST.map((trans) => (
            <button key={trans.id} onClick={() => handleAddTransition(trans.id as TransitionType, trans.name)} className="aspect-square rounded-md border border-white/10 bg-white/5 hover:bg-purple-600/20 hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center gap-1 p-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-[10px] text-slate-300">{trans.name}</span>
            </button>
          ))}
        </div>
        {transitions.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] text-slate-500 mb-2">الانتقالات المضافة ({transitions.length})</p>
            <div className="space-y-1">
              {transitions.map((t) => {
                const trans = TRANSITIONS_LIST.find((x) => x.id === t.type);
                return (
                  <div key={t.id} className="flex items-center justify-between bg-white/5 rounded p-1.5">
                    <span className="text-[10px] text-slate-300">{trans?.name} (بعد مقطع {t.afterClipIndex + 1})</span>
                    <button onClick={() => useProjectStore.getState().removeTransition(t.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'effects') {
    return (
      <div className="p-3">
        <p className="text-xs text-slate-400 mb-2">فلاتر جاهزة</p>
        <p className="text-[10px] text-slate-500 mb-3">اضغط على فلتر لتطبيقه فوراً</p>
        <div className="grid grid-cols-2 gap-2">
          {EFFECT_PRESETS.map((filter) => (
            <button key={filter.id} onClick={() => handleApplyEffect(filter.id)} className="aspect-square rounded-md border border-white/10 hover:border-orange-500/50 transition-colors flex flex-col items-center justify-center gap-1 p-2 relative overflow-hidden"
              style={{ background: filter.cssFilter === 'none' ? 'linear-gradient(135deg, #4a5568, #2d3748)' : filter.cssFilter === 'grayscale(1)' ? 'linear-gradient(135deg, #e2e8f0, #1a202c)' : 'linear-gradient(135deg, #d4a574, #8b5a3c)', filter: filter.cssFilter === 'none' ? 'none' : filter.cssFilter }}>
              <span className="text-[10px] text-white font-medium drop-shadow-lg">{filter.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'text') {
    return (
      <div className="p-3">
        <p className="text-xs text-slate-400 mb-2">قوالب نصوص</p>
        <p className="text-[10px] text-slate-500 mb-3">اضغط على قالب لإضافته</p>
        <div className="space-y-2">
          {TEXT_TEMPLATES.map((tpl) => (
            <button key={tpl.id} onClick={() => handleAddTextTemplate(tpl.id)} className="w-full p-3 rounded-md border border-white/10 bg-black/40 hover:bg-white/5 hover:border-yellow-500/50 transition-colors text-center"
              style={{ fontSize: `${Math.min(tpl.fontSize / 2, 24)}px`, fontWeight: tpl.bold ? 'bold' : 'normal', fontStyle: tpl.italic ? 'italic' : 'normal', color: tpl.color }}>
              {tpl.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'stickers') {
    return (
      <div className="p-3">
        <p className="text-xs text-slate-400 mb-2">ملصقات وعناصر</p>
        <p className="text-[10px] text-slate-500 mb-3">اضغط على ملصق لإضافته</p>
        <div className="grid grid-cols-4 gap-2">
          {STICKERS.map((s) => (
            <button key={s.id} onClick={() => handleAddSticker(s.emoji, s.name)} className="aspect-square rounded-md border border-white/10 bg-white/5 hover:bg-pink-600/20 hover:border-pink-500/50 transition-colors flex items-center justify-center text-2xl">
              {s.emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

const TRANSITIONS_LIST = [
  { id: 'fade', name: 'Fade' }, { id: 'slide', name: 'Slide' }, { id: 'zoom', name: 'Zoom' },
  { id: 'wipe', name: 'Wipe' }, { id: 'dissolve', name: 'Dissolve' }, { id: 'push', name: 'Push' },
];

function getVideoInfo(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => { resolve({ duration: video.duration || 0, width: video.videoWidth || 1920, height: video.videoHeight || 1080 }); URL.revokeObjectURL(video.src); };
    video.onerror = () => { URL.revokeObjectURL(video.src); reject(new Error('Failed')); };
    video.src = URL.createObjectURL(file);
  });
}
function getImageInfo(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(img.src); };
    img.onerror = () => resolve({ width: 1920, height: 1080 });
    img.src = URL.createObjectURL(file);
  });
}
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => { resolve(audio.duration || 0); URL.revokeObjectURL(audio.src); };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(file);
  });
}
