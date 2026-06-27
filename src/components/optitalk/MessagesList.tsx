// ===== OptiTalk - Messages List =====
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Languages, Volume2 } from 'lucide-react';
import type { ChatMessage } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Props {
  messages: ChatMessage[];
  isThinking: boolean;
  onReplay?: (msg: ChatMessage) => void;
  speakingId?: string | null;
}

export function MessagesList({ messages, isThinking, onReplay, speakingId }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isThinking]);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto px-3 py-3">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            onReplay={onReplay}
            isSpeaking={speakingId === m.id}
          />
        ))}
      </AnimatePresence>

      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 self-start rounded-2xl opti-glass px-3 py-2"
        >
          <span className="text-[10px] text-opti-text/60">المدرس بيكتب</span>
          <div className="flex gap-1">
            <span className="opti-wave-bar h-3" style={{ animationDelay: '0ms' }} />
            <span className="opti-wave-bar h-3" style={{ animationDelay: '150ms' }} />
            <span className="opti-wave-bar h-3" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      )}

      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({
  msg,
  onReplay,
  isSpeaking,
}: {
  msg: ChatMessage;
  onReplay?: (m: ChatMessage) => void;
  isSpeaking: boolean;
}) {
  const isUser = msg.role === 'user';
  const hasCorrection = !!msg.correction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}
    >
      <div
        className={cn(
          'group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-md',
          isUser
            ? 'rounded-br-md opti-primary-gradient text-white'
            : hasCorrection
            ? 'rounded-bl-md opti-glass-teal text-opti-text border border-opti-success/30'
            : 'rounded-bl-md opti-glass text-opti-text'
        )}
      >
        {/* Speaker label */}
        <div
          className={cn(
            'mb-0.5 text-[9px] font-bold uppercase tracking-wide',
            isUser ? 'text-white/70' : 'text-opti-text/45'
          )}
        >
          {isUser ? 'You' : 'Teacher'}
        </div>

        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

        {/* Replay button for teacher messages */}
        {!isUser && onReplay && (
          <button
            onClick={() => onReplay(msg)}
            className={cn(
              'mt-1.5 flex items-center gap-1 rounded-full bg-[#0a0e1a]/30 px-2 py-0.5 text-[9px] font-semibold text-opti-text/80 transition-all hover:bg-[#0a0e1a]/50',
              isSpeaking && 'text-opti-accent'
            )}
          >
            <Volume2 className={cn('h-2.5 w-2.5', isSpeaking && 'animate-pulse')} />
            {isSpeaking ? 'بيتكلم...' : 'استمع تاني'}
          </button>
        )}
      </div>

      {/* Correction banner */}
      {!isUser && hasCorrection && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-[85%] overflow-hidden rounded-xl border border-opti-gold/30 bg-opti-gold/10 px-3 py-2"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-opti-gold" />
            <div className="min-w-0">
              <div className="text-[9px] font-bold text-opti-gold">تصحيح المدرس</div>
              <p className="text-[11px] leading-relaxed text-opti-text/85" dir="rtl">
                {msg.correction}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Translated word */}
      {!isUser && msg.translatedWord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-[85%] flex items-center gap-1.5 rounded-lg bg-opti-primary/10 px-2 py-1"
        >
          <Languages className="h-3 w-3 shrink-0 text-opti-primary" />
          <span className="text-[10px] text-opti-text/75" dir="rtl">{msg.translatedWord}</span>
        </motion.div>
      )}

      {/* User "correct" indicator */}
      {isUser && !hasCorrection && (
        <div className="flex items-center gap-1 text-opti-success">
          <Check className="h-3 w-3" strokeWidth={3} />
          <span className="text-[9px] font-semibold">صح! ✓</span>
        </div>
      )}
    </motion.div>
  );
}
