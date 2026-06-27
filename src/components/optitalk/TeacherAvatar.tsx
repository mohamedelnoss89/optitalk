// ===== OptiTalk - Teacher Avatar (كبير + تفاعلي) =====
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Teacher } from '@/lib/teachers';
import { cn } from '@/lib/utils';

interface Props {
  teacher: Teacher;
  isSpeaking: boolean;
  isThinking: boolean;
  isListening?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export function TeacherAvatar({
  teacher,
  isSpeaking,
  isThinking,
  isListening = false,
  size = 'lg',
  showLabel = true,
}: Props) {
  const sizeClass =
    size === 'xl'
      ? 'h-32 w-32 text-7xl'
      : size === 'lg'
      ? 'h-28 w-28 text-6xl'
      : size === 'sm'
      ? 'h-12 w-12 text-2xl'
      : 'h-20 w-20 text-4xl';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Speaking halo rings - أكبر وأوضح */}
        <AnimatePresence>
          {isSpeaking && (
            <>
              <motion.span
                key="ring1"
                className={cn('absolute inset-0 rounded-full', 'border-2 border-opti-accent/50')}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                key="ring2"
                className={cn('absolute inset-0 rounded-full', 'border-2 border-opti-primary/40')}
                initial={{ scale: 0.95, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              />
              <motion.span
                key="ring3"
                className={cn('absolute inset-0 rounded-full', 'border border-opti-gold/30')}
                initial={{ scale: 0.95, opacity: 0.4 }}
                animate={{ scale: 2.1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Glow أكبر لما بيتكلم */}
        {isSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full blur-2xl opacity-50"
            style={{ background: teacher.gradient }}
          />
        )}

        {/* الأفاتار - أكبر + تفاعلي */}
        <motion.div
          animate={
            isSpeaking
              ? { scale: [1, 1.05, 1], y: [0, -3, 0] }
              : isThinking
              ? { scale: [1, 0.97, 1] }
              : isListening
              ? { scale: [1, 1.02, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: isSpeaking ? 0.5 : isThinking ? 1.2 : 1.5,
            repeat: isSpeaking || isThinking || isListening ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className={cn(
            'relative flex items-center justify-center rounded-full opti-shadow-lg overflow-hidden',
            sizeClass
          )}
          style={{ background: teacher.gradient }}
        >
          <motion.span
            animate={isSpeaking ? { y: [0, -2, 0, 2, 0] } : {}}
            transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
            className="drop-shadow-lg"
          >
            {teacher.avatar}
          </motion.span>

          {/* Thinking indicator overlay */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-[#0a0e1a]/75 backdrop-blur-sm"
              >
                <div className="flex gap-1">
                  <span className="opti-wave-bar h-3" style={{ animationDelay: '0ms' }} />
                  <span className="opti-wave-bar h-3" style={{ animationDelay: '120ms' }} />
                  <span className="opti-wave-bar h-3" style={{ animationDelay: '240ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Online status dot */}
        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#0a0e1a] bg-opti-success" />
      </div>

      {showLabel && (
        <div className="text-center">
          <div className="text-sm font-bold text-opti-text">{teacher.name}</div>
          <div className="text-[11px] text-opti-text/60">
            {isSpeaking
              ? '🗣️ بيتكلم...'
              : isThinking
              ? '🤔 بيفكر...'
              : isListening
              ? '👂 بيسمعك...'
              : '✅ جاهز للمحادثة'}
          </div>
        </div>
      )}
    </div>
  );
}
