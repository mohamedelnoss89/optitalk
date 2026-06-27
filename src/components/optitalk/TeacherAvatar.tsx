// ===== OptiTalk - Teacher Avatar (اجتماع Zoom - المدرس بيتكلم ويتحرك) =====
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
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

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* خلفية متوهجة */}
      <motion.div
        animate={{
          opacity: isSpeaking ? [0.2, 0.4, 0.2] : 0.1,
        }}
        transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${teacher.color}33, transparent 70%)`,
        }}
      />

      {/* المدرس - يملأ 35% من الشاشة (زي Zoom) */}
      <div className="relative flex h-full w-full items-center justify-center">
        <motion.div
          animate={
            isSpeaking
              ? {
                  scale: [1, 1.02, 1],
                  y: [0, -3, 0],
                  rotate: [0, -0.5, 0, 0.5, 0],
                }
              : isThinking
              ? { scale: [1, 0.99, 1] }
              : isListening
              ? { scale: [1, 1.01, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: isSpeaking ? 0.5 : 2,
            repeat: isSpeaking || isThinking || isListening ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className="relative"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '320px',
          }}
        >
          {/* الصورة الكبيرة - المدرس واقف */}
          {!imgError ? (
            <div className="relative h-full w-full overflow-hidden rounded-2xl" style={{ boxShadow: isSpeaking ? `0 0 30px ${teacher.color}55` : '0 4px 20px rgba(0,0,0,0.3)' }}>
              <img
                src={teacher.imageUrl}
                alt={teacher.name}
                className="h-full w-full object-cover"
                style={{ objectPosition: 'center 20%' }}
                onError={() => setImgError(true)}
              />

              {/* overlay متدرج من تحت */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent" />

              {/* overlay متدرج من فوق */}
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0a0e1a]/60 to-transparent" />

              {/* الشفايف المتحركة لما بيتكلم */}
              {isSpeaking && (
                <motion.div
                  className="absolute"
                  style={{
                    bottom: '30%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                  animate={{ scaleY: [1, 0.2, 1, 0.4, 1, 0.3, 1] }}
                  transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '8px',
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: '50%',
                    }}
                  />
                </motion.div>
              )}

              {/* اسم المدرس فوق على الشمال */}
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-[#0a0e1a]/80 px-3 py-1 backdrop-blur-md">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: teacher.color }}
                />
                <span className="text-[11px] font-bold text-opti-text">{teacher.name}</span>
              </div>

              {/* ONLINE badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-opti-success/20 px-2 py-0.5 backdrop-blur-md">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-opti-success"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[8px] font-bold text-opti-success">LIVE</span>
              </div>

              {/* حالة المدرس تحت */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center">
                <motion.div
                  key={isSpeaking ? 's' : isThinking ? 't' : isListening ? 'l' : 'r'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-full bg-[#0a0e1a]/80 px-3 py-1 backdrop-blur-md"
                >
                  {isSpeaking ? (
                    <>
                      <div className="flex gap-0.5">
                        <span className="opti-wave-bar h-2.5" style={{ animationDelay: '0ms' }} />
                        <span className="opti-wave-bar h-2.5" style={{ animationDelay: '80ms' }} />
                        <span className="opti-wave-bar h-2.5" style={{ animationDelay: '160ms' }} />
                      </div>
                      <span className="text-[10px] font-bold text-opti-accent">بيتكلم</span>
                    </>
                  ) : isThinking ? (
                    <span className="text-[10px] font-medium text-opti-text/60">🤔 بيفكر</span>
                  ) : isListening ? (
                    <span className="text-[10px] font-bold text-opti-accent">👂 بيسمعك</span>
                  ) : (
                    <span className="text-[10px] font-medium text-opti-text/50">✅ جاهز</span>
                  )}
                </motion.div>
              </div>

              {/* Thinking overlay */}
              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]/50 backdrop-blur-sm"
                  >
                    <div className="flex gap-1.5">
                      <span className="opti-wave-bar h-4" style={{ animationDelay: '0ms' }} />
                      <span className="opti-wave-bar h-4" style={{ animationDelay: '150ms' }} />
                      <span className="opti-wave-bar h-4" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* fallback - emoji كبير */
            <div
              className="flex h-full w-full items-center justify-center rounded-2xl text-8xl"
              style={{ background: teacher.gradient }}
            >
              {teacher.avatar}
            </div>
          )}

          {/* halo rings لما بيتكلم */}
          <AnimatePresence>
            {isSpeaking && (
              <>
                <motion.span
                  className="absolute inset-0 rounded-2xl border-2"
                  style={{ borderColor: teacher.color + '30' }}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.08, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
