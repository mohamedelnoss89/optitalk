// ===== OptiTalk - Teacher Avatar =====
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Teacher } from '@/lib/teachers';
import { cn } from '@/lib/utils';

interface Props {
  teacher: Teacher;
  isSpeaking: boolean;
  isThinking: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TeacherAvatar({
  teacher,
  isSpeaking,
  isThinking,
  size = 'md',
  showLabel = true,
}: Props) {
  const sizeClass =
    size === 'lg'
      ? 'h-28 w-28 text-6xl'
      : size === 'sm'
      ? 'h-12 w-12 text-2xl'
      : 'h-20 w-20 text-4xl';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Speaking halo rings */}
        <AnimatePresence>
          {isSpeaking && (
            <>
              <motion.span
                key="ring1"
                className={cn('absolute inset-0 rounded-full', 'border-2 border-opti-accent/60')}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                key="ring2"
                className={cn('absolute inset-0 rounded-full', 'border-2 border-opti-primary/50')}
                initial={{ scale: 0.95, opacity: 0.7 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Glow */}
        {isSpeaking && (
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-50"
            style={{ background: teacher.gradient }}
          />
        )}

        {/* Avatar */}
        <motion.div
          animate={
            isSpeaking
              ? { scale: [1, 1.04, 1] }
              : isThinking
              ? { scale: [1, 0.97, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: isSpeaking ? 0.6 : 1.2,
            repeat: isSpeaking || isThinking ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className={cn(
            'relative flex items-center justify-center rounded-full opti-shadow-lg',
            sizeClass
          )}
          style={{ background: teacher.gradient }}
        >
          <span className="drop-shadow-md">{teacher.avatar}</span>

          {/* Thinking indicator overlay */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-[#0a0e1a]/70 backdrop-blur-sm"
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
        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0a0e1a] bg-opti-success" />
      </div>

      {showLabel && (
        <div className="text-center">
          <div className="text-xs font-bold text-opti-text">{teacher.name}</div>
          <div className="text-[10px] text-opti-text/55">
            {isSpeaking
              ? 'بيتكلم...'
              : isThinking
              ? 'بيفكر...'
              : 'جاهز للمحادثة'}
          </div>
        </div>
      )}
    </div>
  );
}
