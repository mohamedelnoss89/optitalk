// ===== OptiTalk - Speech Recognition Hook (بسيط للموبايل) =====
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string;
  onFinal?: (transcript: string, confidence: number) => void;
  onInterim?: (transcript: string) => void;
  onError?: (error: string) => void;
  onListeningChange?: (listening: boolean) => void;
  initialTimeoutMs?: number;
  silenceTimeoutMs?: number;
}

interface UseSpeechRecognitionReturn {
  supported: boolean;
  listening: boolean;
  interim: string;
  start: () => void;
  stop: () => void;
  forceRestart: () => void;
}

export function useSpeechRecognition(
  opts: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'en-US',
    onFinal,
    onInterim,
    onError,
    onListeningChange,
    initialTimeoutMs = 20000,
    silenceTimeoutMs = 3000,
  } = opts;

  const [supported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  });
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  const recognitionRef = useRef<any>(null);
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  const onErrorRef = useRef(onError);
  const onListeningChangeRef = useRef(onListeningChange);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedRef = useRef('');
  const lastInterimRef = useRef('');
  const confidenceRef = useRef<number[]>([]);
  const finalSentRef = useRef(false);
  const userStoppedRef = useRef(false);
  const userWantsRef = useRef(false);

  useEffect(() => {
    onFinalRef.current = onFinal;
    onInterimRef.current = onInterim;
    onErrorRef.current = onError;
    onListeningChangeRef.current = onListeningChange;
  }, [onFinal, onInterim, onError, onListeningChange]);

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (initialTimerRef.current) { clearTimeout(initialTimerRef.current); initialTimerRef.current = null; }
  }, []);

  const updateState = useCallback((state: boolean) => {
    setListening(state);
    onListeningChangeRef.current?.(state);
  }, []);

  const flushText = useCallback(() => {
    clearTimers();
    if (finalSentRef.current) return;
    const fullText = (accumulatedRef.current + ' ' + lastInterimRef.current).trim();
    const conf = confidenceRef.current;
    const avgConf = conf.length > 0 ? conf.reduce((a, b) => a + b, 0) / conf.length : 0.5;
    if (fullText) {
      finalSentRef.current = true;
      onFinalRef.current?.(fullText, avgConf);
    }
  }, [clearTimers]);

  const start = useCallback(() => {
    if (!supported) return;
    if (typeof window === 'undefined') return;

    // امسح recognition قديم
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.abort();
      } catch {}
    }

    // أنشئ recognition جديد
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Reset state
    accumulatedRef.current = '';
    lastInterimRef.current = '';
    confidenceRef.current = [];
    finalSentRef.current = false;
    userStoppedRef.current = false;
    userWantsRef.current = true;

    recognition.onstart = () => {
      console.log('[SpeechRecognition] 🎤 Started');
      updateState(true);
      setInterim('');
      // initial timer
      clearTimers();
      initialTimerRef.current = setTimeout(() => {
        if (!finalSentRef.current && userWantsRef.current) {
          console.log('[SpeechRecognition] No speech timeout');
          try { recognition.stop(); } catch {}
        }
      }, initialTimeoutMs);
    };

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        const confidence = result[0]?.confidence ?? 0;

        if (result.isFinal) {
          finalText += transcript;
          if (confidence > 0) confidenceRef.current.push(confidence);
        } else {
          interimText += transcript;
        }
      }

      // أوقف initial timer
      if (initialTimerRef.current) {
        clearTimeout(initialTimerRef.current);
        initialTimerRef.current = null;
      }

      if (finalText.trim()) {
        accumulatedRef.current = (accumulatedRef.current + ' ' + finalText).trim();
      }

      if (interimText !== lastInterimRef.current) {
        lastInterimRef.current = interimText;
        const display = (accumulatedRef.current + ' ' + interimText).trim();
        setInterim(display);
        onInterimRef.current?.(display);
      }

      // Reset silence timer
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        console.log('[SpeechRecognition] Silence timeout');
        flushText();
        userWantsRef.current = false;
        try { recognition.stop(); } catch {}
      }, silenceTimeoutMs);
    };

    recognition.onerror = (e: any) => {
      console.warn('[SpeechRecognition] ❌ Error:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        userWantsRef.current = false;
        onErrorRef.current?.(e.error);
        updateState(false);
      }
    };

    recognition.onend = () => {
      console.log('[SpeechRecognition] 🛑 Ended');
      clearTimers();
      if (userStoppedRef.current || finalSentRef.current || !userWantsRef.current) {
        updateState(false);
        setInterim('');
        return;
      }
      // Auto-restart
      if (userWantsRef.current && !finalSentRef.current) {
        console.log('[SpeechRecognition] 🔄 Auto-restart');
        setTimeout(() => {
          if (userWantsRef.current && !finalSentRef.current) {
            try { recognition.start(); } catch {}
          }
        }, 200);
      } else {
        updateState(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.warn('[SpeechRecognition] Start failed:', err);
      // retry
      setTimeout(() => {
        try { recognition.start(); } catch {}
      }, 300);
    }
  }, [supported, lang, initialTimeoutMs, silenceTimeoutMs, clearTimers, updateState, flushText]);

  const stop = useCallback(() => {
    userStoppedRef.current = true;
    userWantsRef.current = false;
    clearTimers();

    if (!finalSentRef.current) {
      flushText();
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    updateState(false);
    setInterim('');
  }, [clearTimers, flushText, updateState]);

  const forceRestart = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    userStoppedRef.current = false;
    finalSentRef.current = false;
    accumulatedRef.current = '';
    lastInterimRef.current = '';
    confidenceRef.current = [];
    userWantsRef.current = true;
    setTimeout(() => start(), 300);
  }, [start]);

  useEffect(() => {
    return () => {
      clearTimers();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onstart = null;
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [clearTimers]);

  return { supported, listening, interim, start, stop, forceRestart };
}
