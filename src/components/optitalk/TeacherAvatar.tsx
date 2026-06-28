// ===== OptiTalk - Teacher Avatar (3D realistic character with parallax) =====
// صورة 3D realistic + parallax depth + lip sync overlay + eye blink
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
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
  const [blinkKey, setBlinkKey] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // ===== رمش عشوائي كل 2-4 ثانية =====
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    function scheduleBlink() {
      const delay = 2000 + Math.random() * 2000;
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

  // ===== تتبع الماوس للـ parallax 3D effect =====
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      setMousePos({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isBlinking = blinkKey % 4 === 0;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#0a0e1a] via-[#0e1330] to-[#1a1f3a]"
      style={{ perspective: '1000px' }}
    >
      {/* ===== خلفية متوهجة ===== */}
      <motion.div
        animate={{
          opacity: isSpeaking ? [0.2, 0.5, 0.2] : 0.15,
        }}
        transition={{ duration: 1.2, repeat: isSpeaking ? Infinity : 0, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 35%, ${teacher.color}55, transparent 70%)`,
        }}
      />

      {/* ===== particles خفيفة في الخلفية ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${8 + i * 12}%`,
              top: `${15 + (i % 4) * 22}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              background: teacher.color,
              filter: 'blur(1px)',
            }}
            animate={{
              opacity: [0.15, 0.7, 0.15],
              scale: [1, 1.6, 1],
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* ===== الشخصية 3D مع parallax ===== */}
      <div
        className="absolute inset-0 flex items-end justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          animate={
            isSpeaking
              ? {
                  // تنفس + حركة رأس + اهتزاز خفيف للنطق
                  y: [0, -3, 0, -2, 0],
                  rotateY: [mousePos.x * 8, mousePos.x * 8 + 1, mousePos.x * 8 - 1, mousePos.x * 8],
                  rotateX: [mousePos.y * -5, mousePos.y * -5 + 0.5, mousePos.y * -5],
                  scale: [1, 1.008, 1],
                }
              : isListening
              ? {
                  // إيماءة استماع - يميل شوية لتحت
                  rotateY: mousePos.x * 8,
                  rotateX: mousePos.y * -5 + 2,
                  y: [0, 1, 0],
                }
              : isThinking
              ? {
                  // إيماءة تفكير - يميل لجنب
                  rotateY: mousePos.x * 8 - 3,
                  rotateX: mousePos.y * -5 - 1,
                  y: [0, -1, 0],
                }
              : {
                  // تنفس طبيعي
                  rotateY: mousePos.x * 8,
                  rotateX: mousePos.y * -5,
                  y: [0, -2.5, 0],
                  scale: [1, 1.006, 1],
                }
          }
          transition={{
            duration: isSpeaking ? 1.4 : 4,
            repeat: Infinity,
            ease: 'easeInOut',
            rotateY: { duration: 0.6, ease: 'easeOut' },
            rotateX: { duration: 0.6, ease: 'easeOut' },
          }}
          className="relative h-full w-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {!imgError ? (
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={`/teachers-3d/${teacher.id}.png`}
                alt={teacher.name}
                className="h-full w-full object-cover"
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

              {/* ===== رمش العين - overlay ===== */}
              <AnimatePresence mode="wait">
                {isBlinking && (
                  <motion.div
                    key={blinkKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.85, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="absolute pointer-events-none"
                    style={{
                      top: '32%',
                      left: '18%',
                      right: '18%',
                      height: '3.5%',
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(60,40,30,0.7) 50%, transparent 100%)',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* ===== شفايف متحركة لما بيتكلم ===== */}
              {isSpeaking && (
                <motion.div
                  className="absolute pointer-events-none"
                  style={{
                    bottom: '32%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '7%',
                  }}
                  animate={{
                    scaleY: [1, 0.3, 1.4, 0.5, 1.1, 0.4, 1],
                    opacity: [0.4, 0.7, 0.4, 0.8, 0.4, 0.6, 0.4],
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
                      height: '4px',
                      background: `radial-gradient(ellipse at center, ${teacher.color}99, transparent 70%)`,
                      borderRadius: '50%',
                      filter: 'blur(2px)',
                    }}
                  />
                </motion.div>
              )}

              {/* ===== glow effect لما بيتكلم ===== */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 60% 40% at 50% 45%, ${teacher.color}25, transparent 60%)`,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* fallback - SVG cartoon */
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
        </motion.div>
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
