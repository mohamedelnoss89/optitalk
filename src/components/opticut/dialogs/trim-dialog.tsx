'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useProjectStore, formatTime } from '@/lib/project-store';
import { toast } from 'sonner';

export function TrimDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const clips = useProjectStore((s) => s.clips);
  const updateClip = useProjectStore((s) => s.updateClip);
  const selectedClipId = useProjectStore((s) => s.selectedClipId);
  const setSelectedClipId = useProjectStore((s) => s.setSelectedClipId);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    if (open && clips.length > 0) {
      const clip = clips.find((c) => c.id === selectedClipId) || clips[0];
      setSelectedClipId(clip.id);
      setStartTime(clip.startTime);
      setEndTime(clip.endTime);
    }
  }, [open, clips, selectedClipId, setSelectedClipId]);

  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[0];
  if (!selectedClip) return null;

  const handleApply = () => {
    if (endTime - startTime < 0.5) { toast.error('المدة قصيرة جداً'); return; }
    updateClip(selectedClip.id, { startTime, endTime });
    toast.success('تم تطبيق التقطيع');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
        <DialogHeader><DialogTitle>تقطيع الفيديو</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {clips.length > 1 && (
            <div>
              <Label className="text-slate-300">اختر المقطع</Label>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {clips.map((clip, idx) => (
                  <button key={clip.id} onClick={() => { setSelectedClipId(clip.id); setStartTime(clip.startTime); setEndTime(clip.endTime); }}
                    className={`px-3 py-2 rounded-md text-xs whitespace-nowrap ${clip.id === selectedClip.id ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {idx + 1}. {clip.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
            <video src={selectedClip.url} className="w-24 h-16 object-cover rounded" muted />
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{selectedClip.name}</p>
              <p className="text-xs text-slate-400">المدة: {formatTime(selectedClip.duration)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2"><Label className="text-slate-300">البداية</Label><span className="text-sm text-purple-400">{formatTime(startTime)}</span></div>
            <Slider value={[startTime]} min={0} max={selectedClip.duration} step={0.1} onValueChange={(v) => { setStartTime(v[0]); if (v[0] >= endTime) setEndTime(v[0] + 0.5); }} />
          </div>
          <div>
            <div className="flex justify-between mb-2"><Label className="text-slate-300">النهاية</Label><span className="text-sm text-pink-400">{formatTime(endTime)}</span></div>
            <Slider value={[endTime]} min={startTime + 0.1} max={selectedClip.duration} step={0.1} onValueChange={(v) => setEndTime(v[0])} />
          </div>
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-3 flex justify-between">
            <span className="text-sm text-slate-300">المدة بعد التقطيع</span>
            <span className="text-lg font-bold text-purple-400">{formatTime(endTime - startTime)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { setStartTime(0); setEndTime(selectedClip.duration); }}>إعادة تعيين</Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleApply}>تطبيق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
