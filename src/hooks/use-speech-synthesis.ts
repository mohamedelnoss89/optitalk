// ===== OptiTalk - Text-to-Speech Hook =====
// Web Speech Synthesis API wrapper — speaks English text in teacher's voice
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
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  preferGender?: 'male' | 'female'
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  // Filter by language first
  const langVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase())
  );
  const pool = langVoices.length ? langVoices : voices;

  // Heuristic: try to find a voice matching the preferred gender by name
  const femaleHints = ['female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'serena', 'zira', 'susan', 'allison', 'ava', 'sally'];
  const maleHints = ['male', 'daniel', 'alex', 'fred', 'tom', 'david', 'george', 'mark', 'oliver', 'aaron'];

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

  // Prefer Google / natural voices
  const preferred = pool.find((v) =>
    v.name.toLowerCase().includes('google') ||
    v.name.toLowerCase().includes('natural') ||
    v.name.toLowerCase().includes('enhanced')
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

  useEffect(() => {
    onEndRef.current = onEnd;
    onStartRef.current = onStart;
  }, [onEnd, onStart]);

  useEffect(() => {
    if (!supported) {
      return;
    }

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      try {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    };
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!text.trim()) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

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
      };
      utterance.onend = () => {
        setSpeaking(false);
        onEndRef.current?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        onEndRef.current?.();
      };

      // Slight delay to ensure cancel completes
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          setSpeaking(false);
        }
      }, 50);
    },
    [lang, rate, pitch, volume, preferGender]
  );

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, speaking, speak, cancel };
}
