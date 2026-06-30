// ===== OptiTalk - Student Camera =====
'use client';

import { useEffect, useRef, useState } from 'react';
import { CameraOff, Camera as CameraIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  enabled: boolean;
  onToggle?: () => void;
  compact?: boolean;
}

export function StudentCamera({ enabled, onToggle, compact = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      if (!enabled) return;
      if (streamRef.current) return;
      setLoading(true);
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        const err = e as Error;
        setError(err.name === 'NotAllowedError' ? 'تم رفض إذن الكاميرا' : 'مشكلة في الكاميرا');
      } finally {
        setLoading(false);
      }
    }

    function stopCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    if (enabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [enabled]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070d]">
      <div className="relative h-full w-full overflow-hidden">
        {enabled ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover -scale-x-100"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]/60">
                <RefreshCw className="h-5 w-5 animate-spin text-opti-accent" />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0a0e1a]/90 p-2 text-center">
                <CameraOff className="h-6 w-6 text-opti-error" />
                <span className="text-[10px] text-opti-text/70">{error}</span>
              </div>
            )}
            {/* LIVE indicator */}
            {!error && !loading && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#0a0e1a]/70 px-1.5 py-0.5">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-opti-error"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[8px] font-bold text-opti-text">LIVE</span>
              </div>
            )}
            {/* "You" badge */}
            {!error && !loading && (
              <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-[#0a0e1a]/70 px-2 py-1 backdrop-blur-md border border-white/10">
                <span className="text-[10px] font-bold text-white">You</span>
                <span className="text-[8px] text-white/60">• طالب</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#05070d] p-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full opti-glass">
              <CameraOff className="h-8 w-8 text-opti-text/40" />
            </div>
            <div>
              <div className="text-sm font-bold text-opti-text/70">الكاميرا مطفية</div>
              <div className="mt-1 text-[10px] text-opti-text/40">فعلها عشان المدرس يشوفك</div>
            </div>
            {onToggle && (
              <button
                onClick={onToggle}
                className="flex items-center gap-1.5 rounded-full opti-primary-gradient px-4 py-2 text-[11px] font-bold text-white transition-all hover:scale-105 active:scale-95"
              >
                <CameraIcon className="h-3 w-3" />
                فعّل الكاميرا
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
