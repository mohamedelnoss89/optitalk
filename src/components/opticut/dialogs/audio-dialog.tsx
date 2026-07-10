'use client';

import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Music, X } from 'lucide-react';
import { useProjectStore, generateId, formatTime, AUDIO_ACCEPT, isAudioFile, type AudioTrack } from '@/lib/project-store';
import { toast } from 'sonner';

export function AudioDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioTrack = useProjectStore((s) => s.audioTrack);
  const setAudioTrack = useProjectStore((s) => s.setAudioTrack);
  const [volume, setVolume] = useState(audioTrack?.volume ?? 1);
  const [videoOffset, setVideoOffset] = useState(audioTrack?.videoOffset ?? 0);

  // sync state لو الـ audioTrack اتغير
  useEffect(() => {
    setVolume(audioTrack?.volume ?? 1);
    setVideoOffset(audioTrack?.videoOffset ?? 0);
  }, [audioTrack]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAudioFile(file)) { toast.error('الملف ليس صوتياً'); return; }
    const url = URL.createObjectURL(file);
    const duration = await getAudioDuration(file);
    setAudioTrack({ id: generateId(), file, url, name: file.name, duration, volume, videoOffset });
    toast.success(`تمت إضافة: ${file.name}`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => { setAudioTrack(null); toast.success('تمت إزالة الموسيقى'); onOpenChange(false); };
  const handleApply = () => {
    if (audioTrack) { setAudioTrack({ ...audioTrack, volume, videoOffset }); toast.success('تم تطبيق التغييرات'); }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-xl">
        <DialogHeader><DialogTitle>إضافة موسيقى</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <input ref={fileInputRef} type="file" accept={AUDIO_ACCEPT} onChange={handleFileSelect} className="hidden" />
          {!audioTrack ? (
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-8 border-2 border-dashed border-teal-500/40 rounded-xl hover:bg-teal-500/10 flex flex-col items-center gap-2">
              <Music className="w-12 h-12 text-teal-400" />
              <span className="text-sm text-slate-300">اختر ملفاً صوتياً</span>
              <span className="text-xs text-slate-500">MP3, WAV, AAC, M4A, OGG, FLAC</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                <Music className="w-8 h-8 text-teal-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{audioTrack.name}</p>
                  <p className="text-xs text-slate-400">{formatTime(audioTrack.duration)}</p>
                </div>
                <button onClick={handleRemove} className="text-red-400 hover:text-red-300"><X className="w-5 h-5" /></button>
              </div>
              <audio src={audioTrack.url} controls className="w-full" />
              <div>
                <div className="flex justify-between mb-2"><Label className="text-slate-300">مستوى الصوت</Label><span className="text-sm text-teal-400">{Math.round(volume * 100)}%</span></div>
                <Slider value={[volume]} min={0} max={1} step={0.01} onValueChange={(v) => setVolume(v[0])} />
              </div>
              <div>
                <div className="flex justify-between mb-2"><Label className="text-slate-300">وقت البداية في الفيديو</Label><span className="text-sm text-teal-400">{formatTime(videoOffset)}</span></div>
                <Slider value={[videoOffset]} min={0} max={Math.max(60, audioTrack.duration)} step={0.1} onValueChange={(v) => setVideoOffset(v[0])} />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleApply} disabled={!audioTrack}>تطبيق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
