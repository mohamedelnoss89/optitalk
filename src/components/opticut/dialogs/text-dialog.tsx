'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useProjectStore, generateId, formatTime, type TextOverlay } from '@/lib/project-store';
import { toast } from 'sonner';

const COLORS = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0099ff', '#ffff00', '#ff00ff', '#ff9900'];

export function TextDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const addText = useProjectStore((s) => s.addText);
  const texts = useProjectStore((s) => s.texts);
  const removeText = useProjectStore((s) => s.removeText);
  const totalDuration = useProjectStore((s) => s.getTotalDuration)();

  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [x, setX] = useState(0.5);
  const [y, setY] = useState(0.5);
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState('#ffffff');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  const handleApply = () => {
    if (!text.trim()) { toast.error('اكتب نصاً'); return; }
    if (endTime <= startTime) { toast.error('وقت النهاية لازم بعد البداية'); return; }
    addText({ id: generateId(), text: text.trim(), startTime, endTime, x, y, fontSize, color, bold, italic });
    toast.success('تمت إضافة النص');
    onOpenChange(false);
    setText(''); setStartTime(0); setEndTime(5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>إضافة نص</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {texts.length > 0 && (
            <div>
              <Label className="text-slate-300">النصوص المضافة ({texts.length})</Label>
              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                {texts.map((t) => (
                  <div key={t.id} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                    <span className="text-xs text-slate-300 truncate flex-1">{t.text}</span>
                    <span className="text-[10px] text-slate-500 mx-2">{formatTime(t.startTime)} - {formatTime(t.endTime)}</span>
                    <button onClick={() => removeText(t.id)} className="text-red-400 hover:text-red-300 text-xs">حذف</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <Label className="text-slate-300">النص</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب النص هنا..." className="mt-2 bg-slate-800 border-white/10" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300">بداية (ثانية)</Label>
              <Input type="number" value={startTime} onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)} min={0} max={totalDuration} step={0.1} className="mt-2 bg-slate-800 border-white/10" />
            </div>
            <div>
              <Label className="text-slate-300">نهاية (ثانية)</Label>
              <Input type="number" value={endTime} onChange={(e) => setEndTime(parseFloat(e.target.value) || 5)} min={0} max={totalDuration} step={0.1} className="mt-2 bg-slate-800 border-white/10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between"><Label className="text-slate-300">X (أفقي)</Label><span className="text-xs text-slate-400">{Math.round(x * 100)}%</span></div>
              <Slider value={[x]} min={0} max={1} step={0.01} onValueChange={(v) => setX(v[0])} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between"><Label className="text-slate-300">Y (رأسي)</Label><span className="text-xs text-slate-400">{Math.round(y * 100)}%</span></div>
              <Slider value={[y]} min={0} max={1} step={0.01} onValueChange={(v) => setY(v[0])} className="mt-2" />
            </div>
          </div>
          <div>
            <div className="flex justify-between"><Label className="text-slate-300">حجم الخط</Label><span className="text-xs text-slate-400">{fontSize}px</span></div>
            <Slider value={[fontSize]} min={12} max={100} step={1} onValueChange={(v) => setFontSize(v[0])} className="mt-2" />
          </div>
          <div>
            <Label className="text-slate-300">اللون</Label>
            <div className="flex gap-2 mt-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-purple-500 scale-110' : 'border-white/20'} transition-transform`} style={{ backgroundColor: c }} />
              ))}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setBold(!bold)} className={`px-4 py-2 rounded-md text-sm font-bold ${bold ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>B</button>
            <button onClick={() => setItalic(!italic)} className={`px-4 py-2 rounded-md text-sm italic ${italic ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>I</button>
          </div>
          <div className="bg-black rounded-lg p-4 text-center">
            <span style={{ fontSize: `${fontSize}px`, color, fontWeight: bold ? 'bold' : 'normal', fontStyle: italic ? 'italic' : 'normal', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{text || 'معاينة النص'}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleApply}>إضافة</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
