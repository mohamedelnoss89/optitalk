// ===== OptiTalk - Teacher Avatar (Zoom-style - real person video frame) =====
// المدرس بيملأ 35% من الشاشة بالعرض زي اجتماع زوم
// أنيميشن طبيعي: تنفس + حركة رأس + رمش + شفايف لما بيتكلم
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import type { Teacher } from '@/lib/teachers';
import { cn } from '@/lib/utils';

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
  const [blinkKey, setBlinkKey] = useState(0);

  // ===== رمش عشوائي كل 3-5 ثواني =====
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;

    function scheduleBlink() {
      const delay = 2500 + Math.random() * 2500; // 2.5s - 5s
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
    <div className="relative h-full w-full overflow-hidden bg-[#05070d]">
      {/* ===== خلفية متوهجة لما بيتكلم ===== */}
      <motion.div
        animate={{
          opacity: isSpeaking ? [0.15, 0.35, 0.15] : 0.08,
        }}
        transition={{ duration: 1.2, repeat: isSpeaking ? Infinity : 0, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 35%, ${teacher.color}40, transparent 70%)`,
        }}
      />

      {/* ===== الإطار الرئيسي - ملء العرض بالكامل ===== */}
      <div className="absolute inset-0">
        {!imgError ? (
          <div className="relative h-full w-full overflow-hidden">
            {/* ===== الصورة - ملء الإطار بالكامل ===== */}
            <motion.div
              animate={
                isSpeaking
                  ? {
                      // تنفس + حركة رأس خفيفة لما بيتكلم
                      scale: [1, 1.012, 1.005, 1.015, 1],
                      y: [0, -1.5, 0.5, -1, 0],
                      rotate: [0, -0.3, 0.2, -0.2, 0],
                    }
                  : isListening
                  ? {
                      // إيماءة استماع
                      scale: [1, 1.008, 1],
                      y: [0, 0.5, 0],
                      rotate: [0, 0.5, 0],
                    }
                  : isThinking
                  ? {
                      // حركة بسيطة لما بيفكر
                      scale: [1, 0.998, 1],
                      rotate: [0, -0.2, 0],
                    }
                  : {
                      // تنفس طبيعي في الراحة
                      scale: [1, 1.006, 1],
                      y: [0, -0.8, 0],
                    }
              }
              transition={{
                duration: isSpeaking ? 1.6 : isListening ? 2 : 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0"
            >
              <img
                src={teacher.imageUrl}
                alt={teacher.name}
                className="h-full w-full object-cover"
                style={{ objectPosition: 'center 25%' }}
                onError={() => setImgError(true)}
                loading="eager"
                draggable={false}
              />

              {/* ===== رمش - overlay بيغطي منطقة العين ===== */}
              <BlinkOverlay blinkKey={blinkKey} />

              {/* ===== شفايف متحركة لما بيتكلم ===== */}
              {isSpeaking && <LipSyncOverlay color={teacher.color} />}
            </motion.div>

            {/* ===== gradient من تحت عشان الاسم وباقي النص يبان واضح ===== */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05070d] via-[#05070d]/85 to-transparent pointer-events-none" />

            {/* ===== gradient خفيف من فوق ===== */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#05070d]/80 to-transparent pointer-events-none" />

            {/* ===== vignette على الأطراف (زي زوم) ===== */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 80px 20px rgba(0,0,0,0.55)',
              }}
            />

            {/* ===== اسم المدرس + نقطة ملونة (زي زوم) ===== */}
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: teacher.color, boxShadow: `0 0 8px ${teacher.color}` }}
              />
              <span className="text-[12px] font-bold text-white tracking-wide">
                {teacher.name}
              </span>
              <span className="text-[10px] text-white/50">•</span>
              <span className="text-[10px] font-medium text-white/70">{teacher.nameAr}</span>
            </div>

            {/* ===== LIVE indicator ===== */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 backdrop-blur-md border border-red-500/30">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[9px] font-black text-red-300 tracking-widest">LIVE</span>
            </div>

            {/* ===== حالة المدرس في النص ===== */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center px-4 pointer-events-none">
              <motion.div
                key={isSpeaking ? 's' : isThinking ? 't' : isListening ? 'l' : 'r'}
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3.5 py-1.5 backdrop-blur-md border',
                  isSpeaking
                    ? 'bg-black/60 border-opti-accent/40'
                    : 'bg-black/60 border-white/10'
                )}
              >
                {isSpeaking ? (
                  <>
                    {/* موجات صوت متحركة */}
                    <div className="flex items-end gap-[2px] h-3.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.span
                          key={i}
                          className="w-[2.5px] rounded-full"
                          style={{ background: teacher.color }}
                          animate={{
                            height: ['30%', '100%', '50%', '90%', '40%'],
                          }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            delay: i * 0.08,
                            ease: 'easeInOut',
                          }}
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
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-white/70">Thinking...</span>
                  </>
                ) : isListening ? (
                  <>
                    <motion.span
                      className="h-2 w-2 rounded-full"
                      style={{ background: teacher.color }}
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <span className="text-[11px] font-bold text-white">Listening to you</span>
                  </>
                ) : (
                  <span className="text-[11px] font-medium text-white/70">Ready</span>
                )}
              </motion.div>
            </div>

            {/* ===== Thinking overlay ===== */}
            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none"
                >
                  <div className="flex items-center gap-3 rounded-2xl bg-black/60 px-5 py-3 backdrop-blur-md border border-white/10">
                    <div className="flex items-end gap-[3px] h-5">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span
                          key={i}
                          className="w-[3px] rounded-full"
                          style={{ background: teacher.color }}
                          animate={{
                            height: ['30%', '100%', '40%', '90%', '30%'],
                          }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[12px] font-medium text-white">Teacher is thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ===== fallback لو الصورة مفيش ===== */
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

      {/* ===== halo ring لما بيتكلم ===== */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 0 2px ${teacher.color}40`,
            }}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== Blink overlay - بيغطي منطقة العين لمدة 150ms =====
function BlinkOverlay({ blinkKey }: { blinkKey: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={blinkKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        className="absolute pointer-events-none"
        style={{
          // منطقة العين - شريط أفقي رفيع
          top: '32%',
          left: '20%',
          right: '20%',
          height: '4%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 50%, transparent 100%)',
          borderRadius: '50%',
        }}
      />
    </AnimatePresence>
  );
}

// ===== Lip sync overlay - حركة شفايف طبيعية لما بيتكلم =====
function LipSyncOverlay({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        // منطقة الفم
        bottom: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '8%',
        height: '3%',
      }}
      animate={{
        scaleY: [1, 0.3, 1.2, 0.4, 1, 0.5, 1.1, 0.6, 1],
        opacity: [0.3, 0.6, 0.3, 0.7, 0.3, 0.5, 0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center, ${color}80, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(2px)',
        }}
      />
    </motion.div>
  );
}
