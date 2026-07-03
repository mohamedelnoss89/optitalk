// ===== OptiTalk - TTS Hook (Audio API - ملف واحد بدون chunks) =====
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

export function useSpeechSynthesis(
  opts: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { rate = 0.95, preferGender, onEnd, onStart } = opts;
  const [supported] = useState(() =>
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [speaking, setSpeaking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndRef = useRef(onEnd);
  const onStartRef = useRef(onStart);

  useEffect(() => {
    onEndRef.current = onEnd;
    onStartRef.current = onStart;
  }, [onEnd, onStart]);

  // ===== Create audio element once =====
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      try {
        audio.pause();
        audio.src = '';
      } catch {
        // ignore
      }
      audioRef.current = null;
    };
  }, []);

  // ===== Speak: نولّد كل الصوت مرة واحدة =====
  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined') return;
      if (!text.trim()) return;

      const audio = audioRef.current;
      if (!audio) return;

      // Cancel any current playback
      try {
        audio.pause();
        audio.src = '';
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.onpause = null;
      } catch {
        // ignore
      }

      // تنظيف النص
      const clean = text
        .replace(/\([^)]*\)/g, '')
        .replace(/[""«»]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      // truncate لـ 1000 حرف (حد الـ API)
      const truncated = clean.length > 1000 ? clean.slice(0, 1000) : clean;

      // بناء URL واحد للصوت كامل
      const params = new URLSearchParams({
        text: truncated,
        speed: String(rate),
      });
      if (preferGender) params.set('gender', preferGender);
      const url = `/api/tts?${params.toString()}`;

      audio.src = url;
      audio.volume = 1;

      // === isSpeaking = true بس لما الصوت يبدأ فعلاً ===
      audio.onplay = () => {
        setSpeaking(true);
        onStartRef.current?.();
      };

      // === isSpeaking = false لما الصوت يخلص ===
      audio.onended = () => {
        setSpeaking(false);
        onEndRef.current?.();
      };

      // === isSpeaking = false لو حصل error ===
      audio.onerror = () => {
        setSpeaking(false);
        onEndRef.current?.();
      };

      // مفيش onpause — ده كان بيسبب مشاكل

      // تشغيل الصوت
      audio.play().catch((err) => {
        console.warn('[OptiTalk TTS] play() failed:', err);
        setSpeaking(false);
      });
    },
    [rate, preferGender]
  );

  const cancel = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.onpause = null;
        audio.pause();
        audio.src = '';
      } catch {
        // ignore
      }
    }
    setSpeaking(false);
  }, []);

  // ===== Unlock: required for iOS Safari =====
  const unlock = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.muted = true;
      audio.play().then(() => {
        audio.pause();
        audio.muted = false;
        audio.currentTime = 0;
      }).catch(() => {
        audio.muted = false;
      });
    } catch {
      // ignore
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.pause();
          audio.src = '';
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return { supported: true, speaking, speak, cancel, unlock };
}
