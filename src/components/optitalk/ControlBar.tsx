// ===== OptiTalk - Control Bar (ثابت دايماً باين + زرار لغة) =====
'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, Square, X, Keyboard, Send, Languages } from 'lucide-react';
import { useState } from 'react';
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
  onStopSpeaking,
  onEndConversation,
  onSendText,
}: Props) {
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');

  const handleSend = () => {
    const text = textInput.trim();
    if (!text) return;
    onSendText?.(text);
    setTextInput('');
  };

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
          {/* Interim transcript display */}
          {(isListening || interim) && (
            <div className="mb-2 rounded-xl opti-glass-teal px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <span className="opti-wave-bar h-3" style={{ animationDelay: '0ms' }} />
                  <span className="opti-wave-bar h-3" style={{ animationDelay: '100ms' }} />
                  <span className="opti-wave-bar h-3" style={{ animationDelay: '200ms' }} />
                </div>
                <span className="text-[11px] text-opti-text/70" dir="rtl">
                  {interim || 'استمع... اتكلم بأي لغة (عربي أو إنجليزي)'}
                </span>
              </div>
            </div>
          )}

          {/* Buttons row - دايماً باين */}
          <div className="flex items-center justify-center gap-3">
            {/* End conversation */}
            <button
              onClick={onEndConversation}
              className="flex h-11 w-11 items-center justify-center rounded-full opti-glass text-opti-error transition-all hover:scale-105 active:scale-95"
              aria-label="إنهاء المحادثة"
            >
              <X className="h-5 w-5" />
            </button>

            {/* مكان فارغ بدل زرار اللغة - التطبيق يكتشف اللغة تلقائياً */}

            {/* Main mic / stop button - كبير وواضح دايماً */}
            <button
              onClick={isSpeaking ? onStopSpeaking : onMicToggle}
              disabled={isAiThinking}
              className={cn(
                'relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300',
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
                <Mic className="h-7 w-7" />
              )}
            </button>

            {/* Toggle text mode */}
            <button
              onClick={() => setTextMode(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full opti-glass text-opti-text/70 transition-all hover:scale-105 hover:text-opti-text active:scale-95"
              aria-label="الكتابة"
            >
              <Keyboard className="h-5 w-5" />
            </button>

            {/* Toggle camera */}
            <div className="flex h-11 w-11 items-center justify-center">
              {/* مكان فارغ عشان نظم المسافة - ممكن يحت كاميرا بعدين */}
            </div>
          </div>

          {/* Status hint */}
          <div className="mt-2 text-center text-[11px] font-medium text-opti-text/50">
            {isAiThinking
              ? 'المدرس بيفكر...'
              : isSpeaking
              ? 'اضغط لإيقاف الصوت'
              : isListening
              ? 'بتتكلم... اضغط للإيقاف'
              : 'اضغط على الميكروفون وتكلم (عربي أو إنجليزي)'}
          </div>
        </>
      )}
    </div>
  );
}
