'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useProjectStore, type FilterSettings } from '@/lib/project-store';
import { toast } from 'sonner';

const PRESETS = [
  { name: 'بدون', filters: { brightness: 0, contrast: 1, saturation: 1 } },
  { name: 'ساطع', filters: { brightness: 0.2, contrast: 1.1, saturation: 1.2 } },
  { name: 'داكن', filters: { brightness: -0.2, contrast: 1.1, saturation: 0.9 } },
  { name: 'دافئ', filters: { brightness: 0.1, contrast: 1, saturation: 1.3 } },
  { name: 'بارد', filters: { brightness: 0.05, contrast: 1, saturation: 0.8 } },
  { name: 'أبيض وأسود', filters: { brightness: 0, contrast: 1.2, saturation: 0 } },
  { name: 'فينتاج', filters: { brightness: -0.1, contrast: 0.9, saturation: 0.7 } },
  { name: 'حيوي', filters: { brightness: 0.1, contrast: 1.3, saturation: 1.5 } },
];

export function FiltersDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const filters = useProjectStore((s) => s.filters);
  const setFilters = useProjectStore((s) => s.setFilters);
  const resetFilters = useProjectStore((s) => s.resetFilters);
  const clips = useProjectStore((s) => s.clips);
  const [local, setLocal] = useState<FilterSettings>(filters);

  useEffect(() => { setLocal(filters); }, [filters, open]);
  const currentClip = clips[0];

  const handleApply = () => { setFilters(local); toast.success('تم تطبيق الفلاتر'); onOpenChange(false); };
  const handleReset = () => { resetFilters(); setLocal({ brightness: 0, contrast: 1, saturation: 1 }); };
  const handlePreset = (preset: typeof PRESETS[0]) => setLocal(preset.filters);
  const filterStyle = `brightness(${1 + local.brightness}) contrast(${local.contrast}) saturate(${local.saturation})`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
        <DialogHeader><DialogTitle>الفلاتر</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {currentClip && (
            <div className="bg-black rounded-lg overflow-hidden">
              <video src={currentClip.url} className="w-full max-h-48 object-contain" style={{ filter: filterStyle }} muted autoPlay loop />
            </div>
          )}
          <div>
            <Label className="text-slate-300">فلاتر جاهزة</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PRESETS.map((preset) => (
                <button key={preset.name} onClick={() => handlePreset(preset)} className="px-3 py-2 rounded-md text-xs bg-slate-800 hover:bg-slate-700 text-slate-300">{preset.name}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2"><Label className="text-slate-300">السطوع</Label><span className="text-sm text-orange-400">{Math.round(local.brightness * 100)}%</span></div>
            <Slider value={[local.brightness]} min={-1} max={1} step={0.01} onValueChange={(v) => setLocal({ ...local, brightness: v[0] })} />
          </div>
          <div>
            <div className="flex justify-between mb-2"><Label className="text-slate-300">التباين</Label><span className="text-sm text-orange-400">{local.contrast.toFixed(2)}</span></div>
            <Slider value={[local.contrast]} min={0} max={2} step={0.01} onValueChange={(v) => setLocal({ ...local, contrast: v[0] })} />
          </div>
          <div>
            <div className="flex justify-between mb-2"><Label className="text-slate-300">التشبع</Label><span className="text-sm text-orange-400">{local.saturation.toFixed(2)}</span></div>
            <Slider value={[local.saturation]} min={0} max={3} step={0.01} onValueChange={(v) => setLocal({ ...local, saturation: v[0] })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleReset}>إعادة تعيين</Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleApply}>تطبيق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
