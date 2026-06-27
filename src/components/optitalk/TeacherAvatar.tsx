// ===== OptiTalk - Teacher Avatar (صورة إنسان حقيقي + تفاعلي) =====
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
      ? 'h-36 w-36'
      : size === 'lg'
      ? 'h-28 w-28'
      : size === 'sm'
      ? 'h-12 w-12'
      : 'h-20 w-20';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Speaking halo rings */}
        <AnimatePresence>
          {isSpeaking && (
            <>
              <motion.span
                key="ring1"
                className={cn('absolute inset-0 rounded-full', 'border-2 border-opti-accent/50')}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                key="ring2"
                className={cn('absolute inset-0 rounded-full', 'border-2 border-opti-primary/40')}
                initial={{ scale: 0.95, opacity: 0.6 }}
                animate={{ scale: 1.7, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              />
              <motion.span
                key="ring3"
                className={cn('absolute inset-0 rounded-full', 'border border-opti-gold/30')}
                initial={{ scale: 0.95, opacity: 0.4 }}
                animate={{ scale: 2.0, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Glow لما بيتكلم */}
        {isSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full blur-2xl opacity-50"
            style={{ background: teacher.gradient }}
          />
        )}

        {/* الأفاتار - صورة إنسان حقيقي */}
        <motion.div
          animate={
            isSpeaking
              ? { scale: [1, 1.04, 1] }
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
            'relative overflow-hidden rounded-full opti-shadow-lg ring-2',
            sizeClass
          )}
          style={{
            background: teacher.gradient,
            // ring color يعتمد على حالة المدرس
            boxShadow: isSpeaking
              ? `0 0 20px ${teacher.color}88`
              : isThinking
              ? `0 0 15px ${teacher.color}44`
              : `0 0 10px ${teacher.color}22`,
          }}
        >
          {/* صورة المدرس الحقيقية */}
          <img
            src={teacher.imageUrl}
            alt={teacher.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              // fallback للـ emoji لو الصورة مش متاحة
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.style.display = 'flex';
                parent.style.alignItems = 'center';
                parent.style.justifyContent = 'center';
                parent.style.fontSize = size === 'xl' ? '4rem' : '2rem';
                parent.textContent = teacher.avatar;
              }
            }}
          />

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
