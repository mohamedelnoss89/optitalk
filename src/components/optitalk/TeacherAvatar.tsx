// ===== OptiTalk - Teacher Avatar (كبير + يملأ الشاشة + وجه متحرك بـ CSS) =====
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // تحديد لون الخلفية حسب الحالة
  const bgGlow = isSpeaking
    ? teacher.color
    : isThinking
    ? '#8A8078'
    : isListening
    ? '#00CEC9'
    : teacher.color;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* خلفية متوهجة كبيرة */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : 1,
          opacity: isSpeaking ? [0.3, 0.5, 0.3] : 0.15,
        }}
        transition={{
          duration: 0.6,
          repeat: isSpeaking ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${bgGlow}44, transparent 60%)`,
        }}
      />

      {/* halo rings لما بيتكلم */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            <motion.span
              className="absolute top-[20%] h-48 w-48 rounded-full border-2"
              style={{ borderColor: teacher.color + '40' }}
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute top-[20%] h-48 w-48 rounded-full border-2"
              style={{ borderColor: teacher.color + '30' }}
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* الوجه الكبير - يملأ النص العلوي */}
      <motion.div
        animate={
          isSpeaking
            ? { scale: [1, 1.03, 1], y: [0, -2, 0] }
            : isThinking
            ? { scale: [1, 0.98, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: isSpeaking ? 0.4 : 1.5,
          repeat: isSpeaking || isThinking ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="relative z-10"
      >
        {/* إطار الصورة - كبير وبيملأ المساحة */}
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            width: '200px',
            height: '200px',
            boxShadow: isSpeaking
              ? `0 0 40px ${teacher.color}66, 0 0 80px ${teacher.color}33`
              : `0 8px 32px rgba(0,0,0,0.4)`,
            border: `3px solid ${teacher.color}40`,
          }}
        >
          {/* الصورة الحقيقية */}
          {!imgError ? (
            <img
              src={teacher.imageUrl}
              alt={teacher.name}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            /* fallback - emoji كبير على gradient */
            <div
              className="flex h-full w-full items-center justify-center text-8xl"
              style={{ background: teacher.gradient }}
            >
              {teacher.avatar}
            </div>
          )}

          {/* overlay متدرج من تحت */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/50 to-transparent" />

          {/* الشفايف المتحركة لما بيتكلم - overlay على الصورة */}
          {isSpeaking && mounted && (
            <motion.div
              className="absolute bottom-[35%] left-1/2 -translate-x-1/2"
              animate={{ scaleY: [1, 0.3, 1, 0.5, 1] }}
              transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '30px',
                height: '12px',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '50%',
              }}
            />
          )}

          {/* Thinking overlay */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]/70 backdrop-blur-sm"
              >
                <div className="flex gap-1.5">
                  <span className="opti-wave-bar h-4" style={{ animationDelay: '0ms' }} />
                  <span className="opti-wave-bar h-4" style={{ animationDelay: '150ms' }} />
                  <span className="opti-wave-bar h-4" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Online dot */}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#0a0e1a]/80 px-2 py-0.5">
            <motion.span
              className="h-2 w-2 rounded-full bg-opti-success"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[9px] font-bold text-opti-success">ONLINE</span>
          </div>
        </div>
      </motion.div>

      {/* اسم المدرس وحالته تحت الصورة */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mt-4 text-center"
      >
        <div className="text-lg font-black text-opti-text">{teacher.name}</div>
        <motion.div
          key={isSpeaking ? 'speaking' : isThinking ? 'thinking' : isListening ? 'listening' : 'ready'}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-1.5 mt-1"
        >
          {isSpeaking ? (
            <>
              {/* Wave bars متحركة */}
              <div className="flex gap-0.5">
                <span className="opti-wave-bar h-3" style={{ animationDelay: '0ms' }} />
                <span className="opti-wave-bar h-3" style={{ animationDelay: '80ms' }} />
                <span className="opti-wave-bar h-3" style={{ animationDelay: '160ms' }} />
                <span className="opti-wave-bar h-3" style={{ animationDelay: '240ms' }} />
              </div>
              <span className="text-xs font-bold text-opti-accent">بيتكلم...</span>
            </>
          ) : isThinking ? (
            <span className="text-xs font-medium text-opti-text/60">🤔 بيفكر...</span>
          ) : isListening ? (
            <span className="text-xs font-bold text-opti-accent">👂 بيسمعك...</span>
          ) : (
            <span className="text-xs font-medium text-opti-text/50">✅ جاهز للمحادثة</span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
