// ===== OptiTalk - Teacher Avatar (فيديو متحرك + صورة ثابتة fallback) =====
'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import type { Teacher } from '@/lib/teachers';

interface Props {
  teacher: Teacher;
  isSpeaking: boolean;
  isThinking: boolean;
  isListening?: boolean;
}

export function TeacherAvatar({
  teacher,
  isSpeaking,
  isThinking,
  isListening = false,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ===== تحقق من وجود فيديو للمدرس/الصديق =====
  useEffect(() => {
    async function checkVideo() {
      try {
        const res = await fetch(`/videos/${teacher.id}.mp4`, { method: 'HEAD' });
        setVideoAvailable(res.ok);
      } catch {
        setVideoAvailable(false);
      }
    }
    checkVideo();
  }, [teacher.id]);

  // ===== تشغيل/إيقاف الفيديو حسب حالة الكلام =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoAvailable) return;

    if (isSpeaking) {
      // تشغيل الفيديو بشكل loop
      video.loop = true;
      video.muted = true; // الصوت من TTS مش من الفيديو
      video.play().catch(() => {});
    } else {
      // إيقاف الفيديو وتثبيت الإطار
      video.pause();
      // رجوع لبداية الفيديو (إطار الابتسامة)
      video.currentTime = 0;
    }
  }, [isSpeaking, videoAvailable]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#0a0e1a] via-[#0e1330] to-[#1a1f3a]">
      {/* ===== خلفية خفيفة ===== */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 35%, ${teacher.color}22, transparent 70%)`,
        }}
      />

      {/* ===== الشخصية (فيديو أو صورة) ===== */}
      <div className="absolute inset-0 flex items-end justify-center">
        {videoAvailable && !videoError ? (
          /* ===== فيديو متحرك ===== */
          <div className="relative h-full w-full overflow-hidden">
            <video
              ref={videoRef}
              src={`/videos/${teacher.id}.mp4`}
              className="h-full w-full object-cover select-none"
              style={{ objectPosition: 'center 20%' }}
              onError={() => setVideoError(true)}
              playsInline
              preload="auto"
              autoPlay={false}
              muted
            />

            {/* ===== gradient من تحت ===== */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/70 to-transparent pointer-events-none" />

            {/* ===== gradient خفيف من فوق ===== */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0a0e1a]/60 to-transparent pointer-events-none" />

            {/* ===== vignette ===== */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 100px 30px rgba(0,0,0,0.55)' }}
            />

            {/* ===== overlay داكن لما المدرس مش بيتكلم (يبقى ثابت) ===== */}
            {!isSpeaking && (
              <div className="absolute inset-0 bg-[#0a0e1a]/20 pointer-events-none" />
            )}
          </div>
        ) : !imgError ? (
          /* ===== صورة ثابتة (fallback) ===== */
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={teacher.imageUrl || `/teachers/${teacher.id}.png`}
              alt={teacher.name}
              className="h-full w-full object-cover select-none"
              style={{ objectPosition: 'center 20%' }}
              onError={() => setImgError(true)}
              draggable={false}
            />

            {/* ===== gradient من تحت ===== */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/70 to-transparent pointer-events-none" />

            {/* ===== gradient خفيف من فوق ===== */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0a0e1a]/60 to-transparent pointer-events-none" />

            {/* ===== vignette ===== */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 100px 30px rgba(0,0,0,0.55)' }}
            />
          </div>
        ) : (
          /* fallback - emoji */
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3"
            style={{ background: teacher.gradient }}
          >
            <div className="text-[100px] leading-none drop-shadow-lg">{teacher.avatar}</div>
            <div className="rounded-full bg-black/30 px-4 py-1.5 backdrop-blur-md">
              <span className="text-sm font-bold text-white">{teacher.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== اسم المدرس ===== */}
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10 z-20">
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: teacher.color, boxShadow: `0 0 8px ${teacher.color}` }}
        />
        <span className="text-[12px] font-bold text-white">{teacher.name}</span>
        <span className="text-[10px] text-white/50">•</span>
        <span className="text-[10px] font-medium text-white/70">{teacher.nameAr}</span>
      </div>

      {/* ===== LIVE indicator ===== */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 backdrop-blur-md border border-red-500/30 z-20">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[9px] font-black text-red-300 tracking-widest">LIVE</span>
      </div>

      {/* ===== حالة المدرس ===== */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center px-4 pointer-events-none z-20">
        <motion.div
          key={isSpeaking ? 's' : isThinking ? 't' : isListening ? 'l' : 'r'}
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="flex items-center gap-2 rounded-full bg-black/70 px-3.5 py-1.5 backdrop-blur-md border border-white/15"
        >
          {isSpeaking ? (
            <>
              <div className="flex items-end gap-[2px] h-3.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[2.5px] rounded-full"
                    style={{ background: teacher.color }}
                    animate={{ height: ['30%', '100%', '50%', '90%', '40%'] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-white">Speaking</span>
            </>
          ) : isThinking ? (
            <>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/60"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-white/75">Thinking...</span>
            </>
          ) : isListening ? (
            <>
              <motion.span
                className="h-2 w-2 rounded-full"
                style={{ background: teacher.color }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[11px] font-bold text-white">Listening</span>
            </>
          ) : (
            <span className="text-[11px] font-medium text-white/75">Ready</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
