'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Film, Music, Image as ImageIcon, FileVideo } from 'lucide-react';
import { SUPPORTED_VIDEO_FORMATS, SUPPORTED_AUDIO_FORMATS, SUPPORTED_IMAGE_FORMATS } from '@/lib/project-store';

export function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>الصيغ المدعومة</DialogTitle></DialogHeader>
        <div className="space-y-5 py-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center"><Film className="w-5 h-5 text-purple-400" /></div>
              <div><h3 className="font-semibold">صيغ الفيديو</h3><p className="text-xs text-slate-400">للمقاطع والفيديوهات</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_VIDEO_FORMATS.map((ext) => (<span key={ext} className="px-3 py-1 rounded-md bg-purple-600/10 border border-purple-500/30 text-purple-300 text-xs font-mono">{ext}</span>))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center"><Music className="w-5 h-5 text-teal-400" /></div>
              <div><h3 className="font-semibold">صيغ الصوت</h3><p className="text-xs text-slate-400">للموسيقى</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_AUDIO_FORMATS.map((ext) => (<span key={ext} className="px-3 py-1 rounded-md bg-teal-600/10 border border-teal-500/30 text-teal-300 text-xs font-mono">{ext}</span>))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-orange-400" /></div>
              <div><h3 className="font-semibold">صيغ الصور</h3><p className="text-xs text-slate-400">كشرائح في الفيديو</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_IMAGE_FORMATS.map((ext) => (<span key={ext} className="px-3 py-1 rounded-md bg-orange-600/10 border border-orange-500/30 text-orange-300 text-xs font-mono">{ext}</span>))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center"><FileVideo className="w-5 h-5 text-green-400" /></div>
              <div><h3 className="font-semibold">صيغة التصدير</h3><p className="text-xs text-slate-400">الناتج النهائي</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-md bg-green-600/10 border border-green-500/30 text-green-300 text-xs font-mono">.webm</span>
            </div>
          </div>
        </div>
        <DialogFooter><Button onClick={() => onOpenChange(false)}>تم</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
