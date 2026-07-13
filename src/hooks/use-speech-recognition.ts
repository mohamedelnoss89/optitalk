// ===== OptiTalk - Speech Recognition Hook (محسّن — ميك يسمع كويس) =====
// Web Speech API wrapper يدعم العربي والإنجليزي
//
// إصلاحات:
// 1. معالجة InvalidStateError — تحقق من الحالة قبل start
// 2. تأخير أكبر بين abort و start (300ms بدل 150ms)
// 3. retry logic أفضل للـ auto-restart
// 4. إعدادات محسّنة للعربية

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onnomatch: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

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
    initialTimeoutMs = 20000, // 20 ثانية عشان المستخدم ياخد وقته
    silenceTimeoutMs = 3000,  // 3 ثواني بعد آخر كلمة (أطول شوية)
  } = opts;

  const [supported] = useState(() => getSpeechRecognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  const onErrorRef = useRef(onError);
  const onListeningChangeRef = useRef(onListeningChange);
  const initialTimeoutMsRef = useRef(initialTimeoutMs);
  const silenceTimeoutMsRef = useRef(silenceTimeoutMs);

  useEffect(() => {
    onFinalRef.current = onFinal;
    onInterimRef.current = onInterim;
    onErrorRef.current = onError;
    onListeningChangeRef.current = onListeningChange;
    initialTimeoutMsRef.current = initialTimeoutMs;
    silenceTimeoutMsRef.current = silenceTimeoutMs;
  }, [onFinal, onInterim, onError, onListeningChange, initialTimeoutMs, silenceTimeoutMs]);

  // ===== إدارة الحالة الداخلية =====
  const userStoppedRef = useRef(false);
  const accumulatedFinalRef = useRef('');
  const lastInterimRef = useRef('');
  const accumulatedConfidenceRef = useRef<number[]>([]);
  const initialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartAttemptsRef = useRef(0);
  const isRestartingRef = useRef(false);
  const finalSentRef = useRef(false);
  const isActuallyRunningRef = useRef(false);
  const userWantsListeningRef = useRef(false);
  const hasStartedTalkingRef = useRef(false);
  // ===== flag عشان نمنع تكرار start =====
  const startInProgressRef = useRef(false);

  const updateListeningState = useCallback((newState: boolean) => {
    setListening(newState);
    onListeningChangeRef.current?.(newState);
  }, []);

  const clearAllTimers = useCallback(() => {
    if (initialTimerRef.current) {
      clearTimeout(initialTimerRef.current);
      initialTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // ===== دالة safe start — تتعامل مع InvalidStateError =====
  const safeStart = useCallback((recognition: SpeechRecognitionLike, delay: number = 0): Promise<boolean> => {
    return new Promise((resolve) => {
      const doStart = () => {
        // تحقق إن الميك مش شغال فعلاً
        if (isActuallyRunningRef.current) {
          console.warn('[SpeechRecognition] Already running — aborting first');
          try {
            recognition.abort();
          } catch {
            // ignore
          }
          isActuallyRunningRef.current = false;
          // استنى أكتر قبل ما تبدأ
          setTimeout(() => {
            try {
              recognition.start();
              resolve(true);
            } catch (err) {
              console.warn('[SpeechRecognition] Start after abort failed:', err);
              resolve(false);
            }
          }, 300);
          return;
        }

        try {
          recognition.start();
          resolve(true);
        } catch (err) {
          // InvalidStateError — الميك شغال فعلاً
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('already started') || errMsg.includes('InvalidStateError')) {
            console.warn('[SpeechRecognition] Already started — setting flag');
            isActuallyRunningRef.current = true;
            resolve(true);
          } else {
            console.warn('[SpeechRecognition] Start failed:', err);
            resolve(false);
          }
        }
      };

      if (delay > 0) {
        setTimeout(doStart, delay);
      } else {
        doStart();
      }
    });
  }, []);

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      return;
    }

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3; // خد بدائل أكتر عشان نلاقي أحسن نتيجة

    const startInitialTimer = () => {
      clearAllTimers();
      console.log(`[SpeechRecognition] 🎤 Waiting for speech (${initialTimeoutMsRef.current / 1000}s)...`);
      initialTimerRef.current = setTimeout(() => {
        if (!hasStartedTalkingRef.current && !finalSentRef.current && userWantsListeningRef.current) {
          console.log('[SpeechRecognition] No speech detected — stopping');
          userWantsListeningRef.current = false;
          try {
            recognition.stop();
          } catch {
            // ignore
          }
        }
      }, initialTimeoutMsRef.current);
    };

    const startSilenceTimer = () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        console.log('[SpeechRecognition] Silence detected — sending text');
        flushFinalText();
      }, silenceTimeoutMsRef.current);
    };

    const flushFinalText = () => {
      clearAllTimers();
      if (finalSentRef.current) return;

      const fullText = (accumulatedFinalRef.current + ' ' + lastInterimRef.current).trim();
      const confidences = accumulatedConfidenceRef.current;
      const avgConfidence = confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0.5;

      if (fullText) {
        finalSentRef.current = true;
        console.log(`[SpeechRecognition] ✅ Sending: "${fullText.substring(0, 100)}" (confidence: ${(avgConfidence * 100).toFixed(0)}%)`);
        onFinalRef.current?.(fullText, avgConfidence);
      }
      userWantsListeningRef.current = false;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };

    recognition.onstart = () => {
      console.log('[SpeechRecognition] 🎤 Started');
      isActuallyRunningRef.current = true;
      isRestartingRef.current = false;
      restartAttemptsRef.current = 0;
      hasStartedTalkingRef.current = false;
      startInProgressRef.current = false;

      if (userWantsListeningRef.current) {
        updateListeningState(true);
      }
      setInterim('');
      lastInterimRef.current = '';
      accumulatedFinalRef.current = '';
      accumulatedConfidenceRef.current = [];
      finalSentRef.current = false;

      startInitialTimer();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let newFinalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // خد أحسن نتيجة
        const bestAlt = result[0];
        const transcript = bestAlt?.transcript ?? '';
        const confidence = bestAlt?.confidence ?? 0;
        if (result.isFinal) {
          newFinalText += transcript;
          if (confidence > 0) {
            accumulatedConfidenceRef.current.push(confidence);
            console.log(`[SpeechRecognition] 📊 Final: "${transcript.substring(0, 50)}" (confidence: ${(confidence * 100).toFixed(0)}%)`);
          }
        } else {
          interimText += transcript;
        }
      }

      if (!hasStartedTalkingRef.current && (newFinalText.trim() || interimText.trim())) {
        hasStartedTalkingRef.current = true;
        console.log('[SpeechRecognition] 🗣️ User started talking');
        if (initialTimerRef.current) {
          clearTimeout(initialTimerRef.current);
          initialTimerRef.current = null;
        }
      }

      if (newFinalText.trim()) {
        accumulatedFinalRef.current = (accumulatedFinalRef.current + ' ' + newFinalText).trim();
        console.log('[SpeechRecognition] 📝 Accumulated:', accumulatedFinalRef.current.substring(0, 100));
      }

      if (interimText !== lastInterimRef.current) {
        lastInterimRef.current = interimText;
        const displayText = (accumulatedFinalRef.current + ' ' + interimText).trim();
        setInterim(displayText);
        onInterimRef.current?.(displayText);
      }

      if (newFinalText.trim() || interimText) {
        startSilenceTimer();
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.warn('[SpeechRecognition] ❌ Error:', e.error);

      if (e.error === 'no-speech') {
        // no-speech طبيعي — سيبه
      } else if (e.error === 'aborted') {
        // aborted — مش خطأ حقيقي
      } else if (e.error === 'network') {
        console.log('[SpeechRecognition] Network error, will restart');
      } else if (e.error === 'audio-capture') {
        onErrorRef.current?.(e.error);
        updateListeningState(false);
      } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        userWantsListeningRef.current = false;
        onErrorRef.current?.(e.error);
        updateListeningState(false);
      } else {
        onErrorRef.current?.(e.error);
      }
    };

    recognition.onend = () => {
      console.log('[SpeechRecognition] 🛑 Ended');
      clearAllTimers();
      isActuallyRunningRef.current = false;
      startInProgressRef.current = false;

      if (userStoppedRef.current || finalSentRef.current || !userWantsListeningRef.current) {
        console.log('[SpeechRecognition] No restart needed');
        isRestartingRef.current = false;
        userStoppedRef.current = false;
        updateListeningState(false);
        setInterim('');
        return;
      }

      // auto-restart
      if (restartAttemptsRef.current < 5 && !isRestartingRef.current) {
        restartAttemptsRef.current++;
        isRestartingRef.current = true;
        console.log(`[SpeechRecognition] 🔄 Auto-restart ${restartAttemptsRef.current}/5`);

        setTimeout(async () => {
          if (!userWantsListeningRef.current || finalSentRef.current) {
            isRestartingRef.current = false;
            updateListeningState(false);
            return;
          }
          const success = await safeStart(recognition, 0);
          if (!success) {
            // جرّب تاني بعد delay أطول
            setTimeout(async () => {
              if (userWantsListeningRef.current && !finalSentRef.current) {
                const success2 = await safeStart(recognition, 0);
                if (!success2) {
                  isRestartingRef.current = false;
                  updateListeningState(false);
                }
              } else {
                isRestartingRef.current = false;
                updateListeningState(false);
              }
            }, 500);
          }
        }, 300);
      } else {
        console.log('[SpeechRecognition] Max restart attempts reached');
        isRestartingRef.current = false;
        updateListeningState(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearAllTimers();
      userWantsListeningRef.current = false;
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.onstart = null;
        recognition.abort();
      } catch {
        // ignore
      }
    };
  }, [lang, updateListeningState, clearAllTimers, safeStart]);

  const start = useCallback(async () => {
    // أنشئ recognition جديد كل مرة
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    if (startInProgressRef.current) {
      console.log('[SpeechRecognition] Start already in progress — skipping');
      return;
    }

    // لو فيه recognition قديم، امسحه
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    // أنشئ recognition جديد
    const r = new Ctor();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 3;

    // ربط الأحداث
    r.onstart = () => {
      console.log('[SpeechRecognition] 🎤 Started');
      isActuallyRunningRef.current = true;
      isRestartingRef.current = false;
      restartAttemptsRef.current = 0;
      hasStartedTalkingRef.current = false;
      startInProgressRef.current = false;
      if (userWantsListeningRef.current) {
        updateListeningState(true);
      }
      setInterim('');
      lastInterimRef.current = '';
      accumulatedFinalRef.current = '';
      accumulatedConfidenceRef.current = [];
      finalSentRef.current = false;
      startInitialTimer();
    };

    r.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let newFinalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const bestAlt = result[0];
        const transcript = bestAlt?.transcript ?? '';
        const confidence = bestAlt?.confidence ?? 0;
        if (result.isFinal) {
          newFinalText += transcript;
          if (confidence > 0) {
            accumulatedConfidenceRef.current.push(confidence);
          }
        } else {
          interimText += transcript;
        }
      }
      if (!hasStartedTalkingRef.current && (newFinalText.trim() || interimText.trim())) {
        hasStartedTalkingRef.current = true;
        if (initialTimerRef.current) {
          clearTimeout(initialTimerRef.current);
          initialTimerRef.current = null;
        }
      }
      if (newFinalText.trim()) {
        accumulatedFinalRef.current = (accumulatedFinalRef.current + ' ' + newFinalText).trim();
      }
      if (interimText !== lastInterimRef.current) {
        lastInterimRef.current = interimText;
        const displayText = (accumulatedFinalRef.current + ' ' + interimText).trim();
        setInterim(displayText);
        onInterimRef.current?.(displayText);
      }
      if (newFinalText.trim() || interimText) {
        startSilenceTimer();
      }
    };

    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.warn('[SpeechRecognition] ❌ Error:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        userWantsListeningRef.current = false;
        onErrorRef.current?.(e.error);
        updateListeningState(false);
      }
    };

    r.onend = () => {
      console.log('[SpeechRecognition] 🛑 Ended');
      clearAllTimers();
      isActuallyRunningRef.current = false;
      startInProgressRef.current = false;
      if (userStoppedRef.current || finalSentRef.current || !userWantsListeningRef.current) {
        isRestartingRef.current = false;
        userStoppedRef.current = false;
        updateListeningState(false);
        setInterim('');
        return;
      }
      if (restartAttemptsRef.current < 5 && !isRestartingRef.current) {
        restartAttemptsRef.current++;
        isRestartingRef.current = true;
        setTimeout(() => {
          if (!userWantsListeningRef.current || finalSentRef.current) {
            isRestartingRef.current = false;
            updateListeningState(false);
            return;
          }
          try {
            r.start();
          } catch {
            isRestartingRef.current = false;
            updateListeningState(false);
          }
        }, 300);
      } else {
        isRestartingRef.current = false;
        updateListeningState(false);
      }
    };

    recognitionRef.current = r;

    startInProgressRef.current = true;
    userWantsListeningRef.current = true;
    userStoppedRef.current = false;
    accumulatedFinalRef.current = '';
    lastInterimRef.current = '';
    accumulatedConfidenceRef.current = [];
    finalSentRef.current = false;
    restartAttemptsRef.current = 0;
    isRestartingRef.current = false;
    hasStartedTalkingRef.current = false;

    console.log('[SpeechRecognition] Starting mic...');
    const success = await safeStart(r, 0);
    if (!success) {
      console.warn('[SpeechRecognition] Initial start failed — retrying in 500ms');
      setTimeout(async () => {
        const success2 = await safeStart(r, 0);
        if (!success2) {
          startInProgressRef.current = false;
          updateListeningState(false);
        }
      }, 500);
    }
  }, [updateListeningState, safeStart]);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;

    userStoppedRef.current = true;
    userWantsListeningRef.current = false;
    clearAllTimers();

    if (!finalSentRef.current) {
      const fullText = (accumulatedFinalRef.current + ' ' + lastInterimRef.current).trim();
      const confidences = accumulatedConfidenceRef.current;
      const avgConfidence = confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0.5;
      if (fullText) {
        finalSentRef.current = true;
        console.log(`[SpeechRecognition] ✅ User stopped — sending: "${fullText.substring(0, 100)}" (confidence: ${(avgConfidence * 100).toFixed(0)}%)`);
        onFinalRef.current?.(fullText, avgConfidence);
      }
    }

    try {
      r.stop();
    } catch {
      // ignore
    }
    updateListeningState(false);
    setInterim('');
  }, [updateListeningState, clearAllTimers]);

  const forceRestart = useCallback(async () => {
    const r = recognitionRef.current;
    if (!r) return;

    console.log('[SpeechRecognition] 🔄 Force restart');
    clearAllTimers();

    try {
      r.abort();
    } catch {
      // ignore
    }

    isActuallyRunningRef.current = false;
    userStoppedRef.current = false;
    finalSentRef.current = false;
    accumulatedFinalRef.current = '';
    lastInterimRef.current = '';
    accumulatedConfidenceRef.current = [];
    restartAttemptsRef.current = 0;
    isRestartingRef.current = false;
    hasStartedTalkingRef.current = false;
    userWantsListeningRef.current = true;
    startInProgressRef.current = true;

    // استنى أكتر قبل ما تبدأ
    setTimeout(async () => {
      const success = await safeStart(r, 0);
      if (!success) {
        setTimeout(async () => {
          const success2 = await safeStart(r, 0);
          if (!success2) {
            startInProgressRef.current = false;
            updateListeningState(false);
          }
        }, 500);
      }
    }, 400);
  }, [updateListeningState, clearAllTimers, safeStart]);

  return { supported, listening, interim, start, stop, forceRestart };
}
