'use client';

import { useRef } from 'react';
import { Upload, Scissors, Type, Music, Sun, Download, Camera, RotateCw, FlipHorizontal, FlipVertical, Gauge, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useProjectStore,
  generateId,
  type VideoClip,
  VIDEO_ACCEPT,
  isVideoFile,
  isImageFile,
} from '@/lib/project-store';
import { TrimDialog } from './dialogs/trim-dialog';
import { TextDialog } from './dialogs/text-dialog';
import { AudioDialog } from './dialogs/audio-dialog';
import { FiltersDialog } from './dialogs/filters-dialog';
import { ExportDialog } from './dialogs/export-dialog';
import { TransformDialog } from './dialogs/transform-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addClip = useProjectStore((s) => s.addClip);
  const clips = useProjectStore((s) => s.clips);
  const [openDialog, setOpenDialog] = useState<
    'trim' | 'text' | 'audio' | 'filters' | 'export' | 'transform' | null
  >(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (isVideoFile(file)) {
        try {
          const url = URL.createObjectURL(file);
          const videoInfo = await getVideoInfo(file);
          const clip: VideoClip = {
            id: generateId(),
            type: 'video',
            file,
            url,
            name: file.name,
            duration: videoInfo.duration,
            startTime: 0,
            endTime: videoInfo.duration,
            width: videoInfo.width,
            height: videoInfo.height,
            rotation: 0,
            flipH: false,
            flipV: false,
            speed: 1,
          };
          addClip(clip);
          toast.success(`تمت إضافة: ${file.name}`);
        } catch (err) {
          toast.error(`فشل تحميل ${file.name} - صيغة غير مدعومة من المتصفح`);
        }
      } else if (isImageFile(file)) {
        const url = URL.createObjectURL(file);
        const imgInfo = await getImageInfo(file);
        const clip: VideoClip = {
          id: generateId(),
          type: 'image',
          file,
          url,
          name: file.name,
          duration: 5,
          startTime: 0,
          endTime: 5,
          width: imgInfo.width,
          height: imgInfo.height,
          rotation: 0,
          flipH: false,
          flipV: false,
          speed: 1,
          imageDuration: 5,
        };
        addClip(clip);
        toast.success(`تمت إضافة صورة: ${file.name}`);
      } else {
        toast.error(`${file.name} ليس صيغة مدعومة`);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleToolClick = (tool: 'trim' | 'text' | 'audio' | 'filters' | 'export' | 'transform') => {
    if (tool !== 'text' && tool !== 'audio' && tool !== 'filters' && tool !== 'export' && clips.length === 0) {
      toast.error('أضف فيديو أو صورة أولاً');
      return;
    }
    if (tool === 'trim' && clips.length === 0) {
      toast.error('أضف فيديو أو صورة أولاً');
      return;
    }
    if (tool === 'export' && clips.length === 0) {
      toast.error('أضف فيديو أو صورة أولاً');
      return;
    }
    setOpenDialog(tool);
  };

  const tools = [
    {
      id: 'add' as const,
      label: 'إضافة',
      icon: Upload,
      color: 'text-purple-400',
      onClick: () => fileInputRef.current?.click(),
    },
    {
      id: 'trim' as const,
      label: 'تقطيع',
      icon: Scissors,
      color: 'text-pink-400',
      onClick: () => handleToolClick('trim'),
    },
    {
      id: 'transform' as const,
      label: 'تدوير/قلب',
      icon: RotateCw,
      color: 'text-cyan-400',
      onClick: () => handleToolClick('transform'),
    },
    {
      id: 'text' as const,
      label: 'نص',
      icon: Type,
      color: 'text-yellow-400',
      onClick: () => handleToolClick('text'),
    },
    {
      id: 'audio' as const,
      label: 'موسيقى',
      icon: Music,
      color: 'text-teal-400',
      onClick: () => handleToolClick('audio'),
    },
    {
      id: 'filters' as const,
      label: 'فلاتر',
      icon: Sun,
      color: 'text-orange-400',
      onClick: () => handleToolClick('filters'),
    },
    {
      id: 'export' as const,
      label: 'تصدير',
      icon: Download,
      color: 'text-green-400',
      onClick: () => handleToolClick('export'),
    },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={`${VIDEO_ACCEPT},image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.avif`}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-2 border border-white/5 overflow-x-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              variant="ghost"
              onClick={tool.onClick}
              className="flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-white/5"
            >
              <Icon className={`w-5 h-5 ${tool.color}`} />
              <span className="text-[10px] text-slate-300">{tool.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Dialogs */}
      <TrimDialog open={openDialog === 'trim'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <TextDialog open={openDialog === 'text'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <AudioDialog open={openDialog === 'audio'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <FiltersDialog open={openDialog === 'filters'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <ExportDialog open={openDialog === 'export'} onOpenChange={(o) => !o && setOpenDialog(null)} />
      <TransformDialog open={openDialog === 'transform'} onOpenChange={(o) => !o && setOpenDialog(null)} />
    </>
  );
}

// ============ Helper functions ============
function getVideoInfo(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const info = {
        duration: video.duration || 0,
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
      };
      URL.revokeObjectURL(video.src);
      resolve(info);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    video.src = URL.createObjectURL(file);
  });
}

function getImageInfo(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 1920, height: 1080 });
    img.src = URL.createObjectURL(file);
  });
}
