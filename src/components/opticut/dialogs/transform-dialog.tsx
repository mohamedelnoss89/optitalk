'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RotateCw, FlipHorizontal, FlipVertical, Gauge } from 'lucide-react';
import { useProjectStore, formatTime } from '@/lib/project-store';

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

export function TransformDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const clips = useProjectStore((s) => s.clips);
  const updateClip = useProjectStore((s) => s.updateClip);
  const selectedClipId = useProjectStore((s) => s.selectedClipId);
  const setSelectedClipId = useProjectStore((s) => s.setSelectedClipId);

  useEffect(() => {
    if (open && clips.length > 0 && !selectedClipId) setSelectedClipId(clips[0].id);
  }, [open, clips, selectedClipId, setSelectedClipId]);

  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[0];
  if (!selectedClip) return null;

  const transformStyle = `rotate(${selectedClip.rotation}deg) scaleX(${selectedClip.flipH ? -1 : 1}) scaleY(${selectedClip.flipV ? -1 : 1})`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
        <DialogHeader><DialogTitle>تدوير وقلب وتسريع</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {clips.length > 1 && (
            <div>
              <Label className="text-slate-300">اختر المقطع</Label>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {clips.map((clip, idx) => (
                  <button key={clip.id} onClick={() => setSelectedClipId(clip.id)} className={`px-3 py-2 rounded-md text-xs whitespace-nowrap ${clip.id === selectedClip.id ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{idx + 1}. {clip.name}</button>
                ))}
              </div>
            </div>
          )}
          <div className="bg-black rounded-lg p-4 flex items-center justify-center" style={{ minHeight: '150px' }}>
            {selectedClip.type === 'image' ? (
              <img src={selectedClip.url} alt="preview" className="max-h-32 max-w-full object-contain transition-transform" style={{ transform: transformStyle }} />
            ) : (
              <video src={selectedClip.url} className="max-h-32 max-w-full object-contain transition-transform" style={{ transform: transformStyle }} muted />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => updateClip(selectedClip.id, { rotation: (selectedClip.rotation + 90) % 360 })} className="bg-slate-800 border-white/10 hover:bg-slate-700 flex flex-col items-center gap-1 py-4">
              <RotateCw className="w-5 h-5 text-cyan-400" /><span className="text-xs">تدوير ({selectedClip.rotation}°)</span>
            </Button>
            <Button variant="outline" onClick={() => updateClip(selectedClip.id, { flipH: !selectedClip.flipH })} className={`flex flex-col items-center gap-1 py-4 border ${selectedClip.flipH ? 'bg-cyan-600/20 border-cyan-500' : 'bg-slate-800 border-white/10'}`}>
              <FlipHorizontal className="w-5 h-5 text-cyan-400" /><span className="text-xs">قلب أفقي</span>
            </Button>
            <Button variant="outline" onClick={() => updateClip(selectedClip.id, { flipV: !selectedClip.flipV })} className={`flex flex-col items-center gap-1 py-4 border ${selectedClip.flipV ? 'bg-cyan-600/20 border-cyan-500' : 'bg-slate-800 border-white/10'}`}>
              <FlipVertical className="w-5 h-5 text-cyan-400" /><span className="text-xs">قلب رأسي</span>
            </Button>
          </div>
          {selectedClip.type === 'video' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-orange-400" /><Label className="text-slate-300">سرعة التشغيل</Label>
                <span className="text-sm text-orange-400 mr-auto">{selectedClip.speed}x</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {SPEED_PRESETS.map((speed) => (
                  <button key={speed} onClick={() => updateClip(selectedClip.id, { speed })} className={`px-2 py-2 rounded-md text-xs font-medium ${selectedClip.speed === speed ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{speed}x</button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">المدة بعد السرعة: {formatTime((selectedClip.endTime - selectedClip.startTime) / selectedClip.speed)}</p>
            </div>
          )}
          {selectedClip.type === 'image' && (
            <div>
              <div className="flex justify-between mb-2"><Label className="text-slate-300">مدة عرض الصورة</Label><span className="text-sm text-cyan-400">{formatTime(selectedClip.imageDuration || 5)}</span></div>
              <Slider value={[selectedClip.imageDuration || 5]} min={1} max={30} step={0.5} onValueChange={(v) => updateClip(selectedClip.id, { imageDuration: v[0], startTime: 0, endTime: v[0], duration: v[0] })} />
            </div>
          )}
        </div>
        <DialogFooter><Button onClick={() => onOpenChange(false)}>تم</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
