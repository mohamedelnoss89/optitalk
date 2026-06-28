// ===== OptiTalk - Text-to-Speech Hook (Mobile-friendly) =====
// متوافق مع iOS Safari و Android Chrome
// - بـ unlock speechSynthesis بعد أول user interaction
// - بيستخدم pause/resume hack عشان iOS ميبطلّش الكلام
// - بيحمي من interrupted errors

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  preferGender?: 'male' | 'female';
  onEnd?: () => void;
  onStart?: () => void;
}

interface UseSpeechSynthesisReturn {
  supported: boolean;
  speaking: boolean;
  speak: (text: string) => void;
  cancel: () => void;
  unlock: () => void;
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  preferGender?: 'male' | 'female'
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const langVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase())
  );
  const pool = langVoices.length ? langVoices : voices;

  // iOS voices keywords
  const femaleHints = ['female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'serena', 'zira', 'susan', 'allison', 'ava', 'sally', 'fiona', 'veena', 'amelie', 'anna', 'ellen', 'kyoko', 'yuna', 'tina'];
  const maleHints = ['male', 'daniel', 'alex', 'fred', 'tom', 'david', 'george', 'mark', 'oliver', 'aaron', 'arthur', 'gordon', 'james', 'rishi', 'diego', 'jorge', 'juan'];

  if (preferGender === 'female') {
    const f = pool.find((v) =>
      femaleHints.some((h) => v.name.toLowerCase().includes(h))
    );
    if (f) return f;
  }
  if (preferGender === 'male') {
    const m = pool.find((v) =>
      maleHints.some((h) => v.name.toLowerCase().includes(h))
    );
    if (m) return m;
  }

  // Prefer Google / natural / enhanced voices
  const preferred = pool.find((v) =>
    v.name.toLowerCase().includes('google') ||
    v.name.toLowerCase().includes('natural') ||
    v.name.toLowerCase().includes('enhanced') ||
    v.name.toLowerCase().includes('premium')
  );
  return preferred || pool[0];
}

export function useSpeechSynthesis(
  opts: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { lang = 'en-US', rate = 0.9, pitch = 1, volume = 1, preferGender, onEnd, onStart } = opts;
  const [supported] = useState(() =>
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [speaking, setSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const onEndRef = useRef(onEnd);
  const onStartRef = useRef(onStart);
  const unlockedRef = useRef(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    onEndRef.current = onEnd;
    onStartRef.current = onStart;
  }, [onEnd, onStart]);

  // ===== Load voices (iOS fire async) =====
  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // iOS needs a kick after delay
    const t = setTimeout(loadVoices, 250);
    const t2 = setTimeout(loadVoices, 1000);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      try {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    };
  }, [supported]);

  // ===== Unlock: call inside user gesture to enable speech on iOS =====
  const unlock = useCallback(() => {
    if (!supported || unlockedRef.current) return;
    try {
      // iOS requires a real utterance attempt inside the gesture
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      u.rate = 1;
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
      unlockedRef.current = true;
    } catch {
      // ignore
    }
  }, [supported]);

  // ===== Keep-alive: iOS pauses speech after ~10s, this resumes it =====
  const startKeepAlive = useCallback(() => {
    if (keepAliveRef.current) return;
    keepAliveRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        if (keepAliveRef.current) {
          clearInterval(keepAliveRef.current);
          keepAliveRef.current = null;
        }
        return;
      }
      // iOS hack: pause + resume keeps it alive
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }, 8000);
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!text.trim()) return;

      // Cancel any ongoing speech
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      const voice = pickVoice(voicesRef.current, lang, preferGender);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        setSpeaking(true);
        onStartRef.current?.();
        startKeepAlive();
      };
      utterance.onend = () => {
        setSpeaking(false);
        stopKeepAlive();
        onEndRef.current?.();
      };
      utterance.onerror = (e) => {
        console.warn('[OptiTalk] TTS error:', (e as SpeechSynthesisErrorEvent).error);
        setSpeaking(false);
        stopKeepAlive();
        // don't call onEnd — let fallback timer handle it
      };

      currentUtteranceRef.current = utterance;

      // CRITICAL: iOS Safari requires speak() to be called synchronously
      // in the same call stack as the user gesture. No setTimeout.
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[OptiTalk] speak() failed:', err);
        setSpeaking(false);
      }
    },
    [lang, rate, pitch, volume, preferGender, startKeepAlive, stopKeepAlive]
  );

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    stopKeepAlive();
    setSpeaking(false);
  }, [stopKeepAlive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopKeepAlive();
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    };
  }, [stopKeepAlive]);

  return { supported, speaking, speak, cancel, unlock };
}
