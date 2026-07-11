// ===== OptiTalk - Control Bar (ثابت دايماً باين + زرار لغة) =====
'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, Square, X, Keyboard, Send } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  isAiThinking: boolean;
  speechSupported: boolean;
  interim: string;
  speechLang: 'en' | 'ar';
  onToggleLang: () => void;
  onMicToggle: () => void;
  onMicForceRestart?: () => void;
  onStopSpeaking: () => void;
  onEndConversation: () => void;
  onSendText?: (text: string) => void;
}

export function ControlBar({
  isListening,
  isSpeaking,
  isAiThinking,
  speechSupported,
  interim,
  speechLang,
  onToggleLang,
  onMicToggle,
  onMicForceRestart,
  onStopSpeaking,
  onEndConversation,
  onSendText,
}: Props) {
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');

  // ===== long-press timer للـ force restart =====
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const handleSend = () => {
    const text = textInput.trim();
    if (!text) return;
    onSendText?.(text);
    setTextInput('');
  };

  // ===== long-press handlers لزرار الميك =====
  const handleMicMouseDown = useCallback(() => {
    if (!onMicForceRestart) return;
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      onMicForceRestart();
    }, 800); // 800ms = long press
  }, [onMicForceRestart]);

  const handleMicMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // لو الـ long press ما اتشغلش → اتعامل كـ normal click
    if (!longPressTriggeredRef.current) {
      onMicToggle();
    }
  }, [onMicToggle]);

  const handleMicTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMicMouseDown();
  }, [handleMicMouseDown]);

  const handleMicTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMicMouseUp();
  }, [handleMicMouseUp]);

  return (
    <div className="border-t border-opti-primary/15 opti-glass px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {/* Text input mode */}
      {textMode ? (
        <div className="flex items-center gap-2">
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اكتب بالعربي أو الإنجليزي..."
            autoFocus
            className="flex-1 rounded-xl opti-glass border border-opti-primary/20 bg-transparent px-4 py-2.5 text-sm text-opti-text placeholder:text-opti-text/35 focus:border-opti-primary/50 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!textInput.trim()}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
              textInput.trim()
                ? 'opti-accent-gradient text-[#0a0e1a] opti-glow-accent'
                : 'opti-glass text-opti-text/40'
            )}
            aria-label="إرسال"
          >
            <Send className="h-4 w-4 -scale-x-100" />
          </button>
          <button
            onClick={() => setTextMode(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl opti-glass text-opti-text/60"
            aria-label="رجوع للميكروفون"
          >
            <Keyboard className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* ===== صف واحد: مساحة الكلام (يسار) + زراير التحكم (يمين) ===== */}
          <div className="flex items-center gap-2">
            {/* ===== مساحة الكلام ===== */}
            <div className="flex-1 min-h-[48px] rounded-xl opti-glass-teal px-3 py-2 flex items-center gap-2">
              {(isListening || interim) ? (
                <>
                  <div className="flex gap-0.5 shrink-0">
                    <span className="opti-wave-bar h-3" style={{ animationDelay: '0ms' }} />
                    <span className="opti-wave-bar h-3" style={{ animationDelay: '100ms' }} />
                    <span className="opti-wave-bar h-3" style={{ animationDelay: '200ms' }} />
                  </div>
                  <span className="text-[12px] text-opti-text/80 truncate" dir="rtl">
                    {interim || 'استمع... اتكلم بأي لغة'}
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-opti-text/50">
                  {isAiThinking ? 'صاحبك بيفكر...' : isSpeaking ? 'اضغط عشان توقف الصوت' : 'اضغط عشان تتكلم'}
                </span>
              )}
            </div>

            {/* ===== زراير التحكم (يمين) ===== */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* زرار تبديل اللغة */}
              <button
                onClick={onToggleLang}
                className={cn(
                  'flex h-9 w-9 flex-col items-center justify-center rounded-full transition-all active:scale-95',
                  speechLang === 'ar'
                    ? 'opti-glass-teal text-opti-accent border border-opti-accent/40'
                    : 'opti-glass text-opti-text/70 border border-opti-primary/30 hover:scale-105'
                )}
                aria-label={speechLang === 'ar' ? 'تبديل للإنجليزي' : 'تبديل للعربي'}
              >
                <span className="text-[10px] font-black leading-none">
                  {speechLang === 'ar' ? 'ع' : 'EN'}
                </span>
              </button>

              {/* زرار الكتابة */}
              <button
                onClick={() => setTextMode(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full opti-glass text-opti-text/70 transition-all hover:scale-105 hover:text-opti-text active:scale-95"
                aria-label="الكتابة"
              >
                <Keyboard className="h-4 w-4" />
              </button>

              {/* الميك الكبير */}
              <button
                onClick={isSpeaking ? onStopSpeaking : undefined}
                onMouseDown={isSpeaking ? undefined : handleMicMouseDown}
                onMouseUp={isSpeaking ? undefined : handleMicMouseUp}
                onMouseLeave={isSpeaking ? undefined : () => {
                  if (longPressTimerRef.current) {
                    clearTimeout(longPressTimerRef.current);
                    longPressTimerRef.current = null;
                  }
                }}
                onTouchStart={isSpeaking ? undefined : handleMicTouchStart}
                onTouchEnd={isSpeaking ? undefined : handleMicTouchEnd}
                disabled={isAiThinking}
                title={isSpeaking ? 'إيقاف الصوت' : isListening ? 'اضغط للإيقاف' : 'اضغط للتحدث'}
                className={cn(
                  'relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 select-none',
                  isListening
                    ? 'bg-opti-error text-white opti-glow scale-110'
                    : isSpeaking
                    ? 'opti-glass-teal text-opti-accent'
                    : isAiThinking
                    ? 'opti-glass text-opti-text/40 cursor-not-allowed'
                    : 'opti-primary-gradient text-white opti-glow hover:scale-105 active:scale-95'
                )}
                aria-label={isListening ? 'إيقاف الاستماع' : 'تحدث'}
              >
                {isListening && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-opti-error"
                    animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                {isListening ? (
                  <Square className="h-5 w-5 fill-current" />
                ) : isSpeaking ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </button>

              {/* زرار إنهاء */}
              <button
                onClick={onEndConversation}
                className="flex h-9 w-9 items-center justify-center rounded-full opti-glass text-opti-error transition-all hover:scale-105 active:scale-95"
                aria-label="إنهاء المحادثة"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
