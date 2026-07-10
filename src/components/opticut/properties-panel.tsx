'use client';

import { RotateCw, FlipHorizontal, FlipVertical, Gauge, Scissors, Type, Music, Sun, Image as ImageIcon, Film, Layers, Sparkles, Copy, Volume2, VolumeX, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useProjectStore, formatTime, getClipDuration, findClipAtTime, getTotalProjectDuration } from '@/lib/project-store';
import { useState } from 'react';
import { TrimDialog } from './dialogs/trim-dialog';
import { TextDialog } from './dialogs/text-dialog';
import { AudioDialog } from './dialogs/audio-dialog';
import { FiltersDialog } from './dialogs/filters-dialog';
import { TransformDialog } from './dialogs/transform-dialog';
import { toast } from 'sonner';

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

export function PropertiesPanel() {
  const clips = useProjectStore((s) => s.clips);
  const texts = useProjectStore((s) => s.texts);
  const stickers = useProjectStore((s) => s.stickers);
  const audioTrack = useProjectStore((s) => s.audioTrack);
  const filters = useProjectStore((s) => s.filters);
  const selectedClipId = useProjectStore((s) => s.selectedClipId);
  const updateClip = useProjectStore((s) => s.updateClip);
  const setFilters = useProjectStore((s) => s.setFilters);
  const resetFilters = useProjectStore((s) => s.resetFilters);
  const splitClipAtTime = useProjectStore((s) => s.splitClipAtTime);
  const duplicateClip = useProjectStore((s) => s.duplicateClip);
  const globalTime = useProjectStore((s) => s.globalTime);
  const [openDialog, setOpenDialog] = useState<'trim' | 'text' | 'audio' | 'filters' | 'transform' | null>(null);

  const selectedClip = clips.find((c) => c.id === selectedClipId) || null;

  // ===== Split at playhead (ميزة جديدة) =====
  const handleSplitAtPlayhead = () => {
    if (!selectedClip) return;
    const info = findClipAtTime(clips, globalTime);
    if (!info || info.clip.id !== selectedClip.id) {
      toast.error('المؤشر خارج هذا المقطع');
      return;
    }
    splitClipAtTime(selectedClip.id, info.localTime);
    toast.success('تم تقسيم المقطع');
  };

  const handleDuplicate = () => {
    if (!selectedClip) return;
    duplicateClip(selectedClip.id);
    toast.success('تم نسخ المقطع');
  };

  if (!selectedClip && !audioTrack) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>اختر مقطعاً من الـ Timeline</p>
        <p className="mt-1">لعرض خصائصه هنا</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {selectedClip && (
        <>
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            {selectedClip.type === 'image' ? <ImageIcon className="w-4 h-4 text-orange-400" /> : <Film className="w-4 h-4 text-purple-400" />}
            <span className="text-xs font-medium text-white truncate">{selectedClip.name}</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide">معلومات</h3>
            <div className="space-y-1 text-xs">
              <Row label="النوع" value={selectedClip.type === 'image' ? 'صورة' : 'فيديو'} />
              <Row label="المدة" value={formatTime(getClipDuration(selectedClip))} />
              <Row label="الأبعاد" value={`${selectedClip.width}×${selectedClip.height}`} />
              {selectedClip.speed !== 1 && <Row label="السرعة" value={`${selectedClip.speed}x`} />}
              {selectedClip.rotation !== 0 && <Row label="التدوير" value={`${selectedClip.rotation}°`} />}
            </div>
          </div>

          {/* أدوات التقطيع (ميزة جديدة) */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide">أدوات التقطيع</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs" onClick={() => setOpenDialog('trim')}>
                <Scissors className="w-3 h-3 ml-1" /> تقطيع
              </Button>
              <Button size="sm" variant="outline" className="bg-red-600/20 border-red-500/40 text-red-300 hover:bg-red-600/30 text-xs" onClick={handleSplitAtPlayhead}>
                <Scissors className="w-3 h-3 ml-1" /> تقسيم عند المؤشر
              </Button>
              <Button size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs" onClick={handleDuplicate}>
                <Copy className="w-3 h-3 ml-1" /> نسخ
              </Button>
              <Button size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs" onClick={() => setOpenDialog('transform')}>
                <RotateCw className="w-3 h-3 ml-1" /> تدوير
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide">التحويل</h3>
            <div className="grid grid-cols-3 gap-1">
              <Button size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 h-8" onClick={() => updateClip(selectedClip.id, { rotation: (selectedClip.rotation + 90) % 360 })}><RotateCw className="w-3 h-3" /></Button>
              <Button size="sm" variant="outline" className={`h-8 border ${selectedClip.flipH ? 'bg-cyan-600/30 border-cyan-500' : 'bg-white/5 border-white/10'}`} onClick={() => updateClip(selectedClip.id, { flipH: !selectedClip.flipH })}><FlipHorizontal className="w-3 h-3" /></Button>
              <Button size="sm" variant="outline" className={`h-8 border ${selectedClip.flipV ? 'bg-cyan-600/30 border-cyan-500' : 'bg-white/5 border-white/10'}`} onClick={() => updateClip(selectedClip.id, { flipV: !selectedClip.flipV })}><FlipVertical className="w-3 h-3" /></Button>
            </div>

            {selectedClip.type === 'video' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[10px] text-slate-400 flex items-center gap-1"><Gauge className="w-3 h-3" /> السرعة</Label>
                  <span className="text-[10px] text-orange-400">{selectedClip.speed}x</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {SPEED_PRESETS.map((s) => (
                    <button key={s} onClick={() => updateClip(selectedClip.id, { speed: s })} className={`py-1 rounded text-[10px] ${selectedClip.speed === s ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{s}x</button>
                  ))}
                </div>
              </div>
            )}

            {selectedClip.type === 'image' && (
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-slate-400">مدة العرض</Label>
                  <span className="text-[10px] text-cyan-400">{formatTime(selectedClip.imageDuration || 5)}</span>
                </div>
                <Slider value={[selectedClip.imageDuration || 5]} min={1} max={30} step={0.5} onValueChange={(v) => updateClip(selectedClip.id, { imageDuration: v[0], startTime: 0, endTime: v[0], duration: v[0] })} />
              </div>
            )}
          </div>

          {/* Fade in/out للصور (ميزة جديدة) */}
          {selectedClip.type === 'image' && (
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide flex items-center gap-1"><ImageIcon className="w-3 h-3" /> تحكم بالصورة</h3>
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-slate-400 flex items-center gap-1"><ArrowUpFromLine className="w-3 h-3" /> ظهور تدريجي</Label>
                  <span className="text-[10px] text-teal-400">{selectedClip.fadeIn.toFixed(1)}s</span>
                </div>
                <Slider value={[selectedClip.fadeIn]} min={0} max={3} step={0.1} onValueChange={(v) => updateClip(selectedClip.id, { fadeIn: v[0] })} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-slate-400 flex items-center gap-1"><ArrowDownToLine className="w-3 h-3" /> اختفاء تدريجي</Label>
                  <span className="text-[10px] text-teal-400">{selectedClip.fadeOut.toFixed(1)}s</span>
                </div>
                <Slider value={[selectedClip.fadeOut]} min={0} max={3} step={0.1} onValueChange={(v) => updateClip(selectedClip.id, { fadeOut: v[0] })} />
              </div>
            </div>
          )}

          {/* الصوت (ميزة جديدة) */}
          {selectedClip.type === 'video' && (
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide flex items-center gap-1"><Volume2 className="w-3 h-3" /> الصوت</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className={`h-8 px-2 ${selectedClip.muted ? 'bg-red-600/20 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10'}`} onClick={() => updateClip(selectedClip.id, { muted: !selectedClip.muted })}>
                  {selectedClip.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>
                <Slider value={[selectedClip.muted ? 0 : selectedClip.volume]} min={0} max={1} step={0.01} onValueChange={(v) => updateClip(selectedClip.id, { volume: v[0], muted: v[0] === 0 })} className="flex-1" />
                <span className="text-[10px] text-teal-400 tabular-nums w-8 text-center">{Math.round((selectedClip.muted ? 0 : selectedClip.volume) * 100)}%</span>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-slate-400 flex items-center gap-1"><ArrowUpFromLine className="w-3 h-3" /> ظهور تدريجي</Label>
                  <span className="text-[10px] text-teal-400">{selectedClip.fadeIn.toFixed(1)}s</span>
                </div>
                <Slider value={[selectedClip.fadeIn]} min={0} max={3} step={0.1} onValueChange={(v) => updateClip(selectedClip.id, { fadeIn: v[0] })} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-slate-400 flex items-center gap-1"><ArrowDownToLine className="w-3 h-3" /> اختفاء تدريجي</Label>
                  <span className="text-[10px] text-teal-400">{selectedClip.fadeOut.toFixed(1)}s</span>
                </div>
                <Slider value={[selectedClip.fadeOut]} min={0} max={3} step={0.1} onValueChange={(v) => updateClip(selectedClip.id, { fadeOut: v[0] })} />
              </div>
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide flex items-center gap-1"><Sun className="w-3 h-3" /> الفلاتر</h3>
          <button onClick={resetFilters} className="text-[10px] text-slate-400 hover:text-white">إعادة تعيين</button>
        </div>
        <div>
          <div className="flex justify-between mb-1"><Label className="text-[10px] text-slate-400">السطوع</Label><span className="text-[10px] text-orange-400">{Math.round(filters.brightness * 100)}%</span></div>
          <Slider value={[filters.brightness]} min={-1} max={1} step={0.01} onValueChange={(v) => setFilters({ ...filters, brightness: v[0] })} />
        </div>
        <div>
          <div className="flex justify-between mb-1"><Label className="text-[10px] text-slate-400">التباين</Label><span className="text-[10px] text-orange-400">{filters.contrast.toFixed(2)}</span></div>
          <Slider value={[filters.contrast]} min={0} max={2} step={0.01} onValueChange={(v) => setFilters({ ...filters, contrast: v[0] })} />
        </div>
        <div>
          <div className="flex justify-between mb-1"><Label className="text-[10px] text-slate-400">التشبع</Label><span className="text-[10px] text-orange-400">{filters.saturation.toFixed(2)}</span></div>
          <Slider value={[filters.saturation]} min={0} max={3} step={0.01} onValueChange={(v) => setFilters({ ...filters, saturation: v[0] })} />
        </div>
      </div>

      {audioTrack && (
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide flex items-center gap-1"><Music className="w-3 h-3" /> الموسيقى</h3>
          <div className="space-y-1 text-xs">
            <Row label="الاسم" value={audioTrack.name} />
            <Row label="المدة" value={formatTime(audioTrack.duration)} />
            <Row label="الصوت" value={`${Math.round(audioTrack.volume * 100)}%`} />
          </div>
          <Button size="sm" variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs" onClick={() => setOpenDialog('audio')}>
            <Music className="w-3 h-3 ml-1" /> تعديل الصوت
          </Button>
        </div>
      )}

      {texts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide flex items-center gap-1"><Type className="w-3 h-3" /> النصوص ({texts.length})</h3>
          <Button size="sm" variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs" onClick={() => setOpenDialog('text')}>
            <Type className="w-3 h-3 ml-1" /> إدارة النصوص
          </Button>
        </div>
      )}

      {stickers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide flex items-center gap-1"><Sparkles className="w-3 h-3" /> الملصقات ({stickers.length})</h3>
        </div>
      )}

      <TrimDialog open={openDialog === 'trim'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <TextDialog open={openDialog === 'text'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <AudioDialog open={openDialog === 'audio'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <FiltersDialog open={openDialog === 'filters'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <TransformDialog open={openDialog === 'transform'} onOpenChange={(o) => !o && setOpenDialog(null)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500 flex-shrink-0">{label}:</span>
      <span className="text-slate-200 truncate text-left" dir="ltr">{value}</span>
    </div>
  );
}
