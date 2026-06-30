// ===== OptiTalk - Teacher Avatar (3D realistic - صورة ثابتة + حركة على الوش) =====
// الصورة ثابتة تماماً - الرمش والبؤ overlays على وش الشخصية بالظبط
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Teacher } from '@/lib/teachers';

interface Props {
  teacher: Teacher;
  isSpeaking: boolean;
  isThinking: boolean;
  isListening?: boolean;
}

// موضع العين والبؤ لكل مدرس (بناءً على الصورة المولّدة)
// النسب بالمقارنة بصندوق الصورة
interface FaceFeatures {
  // منطقة العين (يسار الصورة = يمين المشاهد)
  leftEye: { x: number; y: number; w: number; h: number };
  rightEye: { x: number; y: number; w: number; h: number };
  mouth: { x: number; y: number; w: number; h: number };
}

const FACE_FEATURES: Record<string, FaceFeatures> = {
  'mr-james': {
    leftEye:  { x: 38, y: 30, w: 10, h: 4 },
    rightEye: { x: 52, y: 30, w: 10, h: 4 },
    mouth:    { x: 41, y: 42, w: 18, h: 5 },
  },
  'ms-sarah': {
    leftEye:  { x: 38, y: 31, w: 10, h: 4 },
    rightEye: { x: 52, y: 31, w: 10, h: 4 },
    mouth:    { x: 42, y: 43, w: 16, h: 5 },
  },
  'professor-david': {
    leftEye:  { x: 38, y: 30, w: 10, h: 4 },
    rightEye: { x: 52, y: 30, w: 10, h: 4 },
    mouth:    { x: 42, y: 44, w: 16, h: 5 },
  },
  'miss-emma': {
    leftEye:  { x: 38, y: 31, w: 10, h: 4 },
    rightEye: { x: 52, y: 31, w: 10, h: 4 },
    mouth:    { x: 42, y: 43, w: 16, h: 5 },
  },
  'coach-mike': {
    leftEye:  { x: 38, y: 30, w: 10, h: 4 },
    rightEye: { x: 52, y: 30, w: 10, h: 4 },
    mouth:    { x: 42, y: 43, w: 16, h: 5 },
  },
  'dr-lisa': {
    leftEye:  { x: 38, y: 31, w: 10, h: 4 },
    rightEye: { x: 52, y: 31, w: 10, h: 4 },
    mouth:    { x: 42, y: 43, w: 16, h: 5 },
  },
};

export function TeacherAvatar({
  teacher,
  isSpeaking,
  isThinking,
  isListening = false,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const [blinkKey, setBlinkKey] = useState(0);

  const features = FACE_FEATURES[teacher.id] || FACE_FEATURES['mr-james'];

  // ===== رمش عشوائي كل 2.5-4 ثانية =====
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    function scheduleBlink() {
      const delay = 2500 + Math.random() * 1500;
      timer = setTimeout(() => {
        if (!active) return;
        setBlinkKey((k) => k + 1);
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#0a0e1a] via-[#0e1330] to-[#1a1f3a]">
      {/* ===== خلفية متوهجة (ثابتة) ===== */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 35%, ${teacher.color}33, transparent 70%)`,
          opacity: isSpeaking ? 0.4 : 0.15,
          transition: 'opacity 0.6s',
        }}
      />

      {/* ===== particles خفيفة في الخلفية (ثابتة الحركة) ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: 2 + (i % 2),
              height: 2 + (i % 2),
              background: teacher.color,
              filter: 'blur(1px)',
            }}
            animate={{
              opacity: [0.15, 0.6, 0.15],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 3 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* ===== الصورة - ثابتة تماماً ===== */}
      <div className="absolute inset-0 flex items-end justify-center">
        {!imgError ? (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={`/teachers-3d/${teacher.id}.png`}
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

            {/* ===== رمش العين - overlay على وش الشخصية ===== */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`blink-${blinkKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: blinkKey > 0 ? [0, 1, 0] : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="absolute pointer-events-none"
                style={{
                  left: `${features.leftEye.x}%`,
                  top: `${features.leftEye.y}%`,
                  width: `${features.leftEye.w}%`,
                  height: `${features.leftEye.h}%`,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(60,40,30,0.85) 50%, transparent 100%)',
                  borderRadius: '50%',
                }}
              />
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={`blink-r-${blinkKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: blinkKey > 0 ? [0, 1, 0] : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="absolute pointer-events-none"
                style={{
                  left: `${features.rightEye.x}%`,
                  top: `${features.rightEye.y}%`,
                  width: `${features.rightEye.w}%`,
                  height: `${features.rightEye.h}%`,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(60,40,30,0.85) 50%, transparent 100%)',
                  borderRadius: '50%',
                }}
              />
            </AnimatePresence>

            {/* ===== البؤ - بيتحرك لما بيتكلم (overlay واضح) ===== */}
            {isSpeaking && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: `${features.mouth.x}%`,
                  top: `${features.mouth.y}%`,
                  width: `${features.mouth.w}%`,
                  height: `${features.mouth.h * 2}%`,
                }}
                animate={{
                  scaleY: [1, 0.2, 1.8, 0.3, 1.4, 0.4, 1.2, 0.5, 1],
                  opacity: [0.7, 1, 0.7, 1, 0.7, 0.9, 0.7, 0.9, 0.7],
                }}
                transition={{
                  duration: 0.55,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(ellipse at center, ${teacher.color} 0%, ${teacher.color}99 40%, transparent 80%)`,
                    borderRadius: '50%',
                    filter: 'blur(0.5px)',
                  }}
                />
              </motion.div>
            )}

            {/* ===== glow خفيف لما بيتكلم ===== */}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 55% 35% at 50% 40%, ${teacher.color}25, transparent 60%)`,
                }}
              />
            )}
          </div>
        ) : (
          /* fallback */
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
