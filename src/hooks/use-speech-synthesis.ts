// ===== OptiTalk - TTS Hook (تحميل الصوت الأول وبعدين تشغيل) =====
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
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

  // ===== Speak: حمّل الصوت الأول وبعدين شغّله =====
  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined') return;
      if (!text.trim()) return;

      const audio = audioRef.current;
      if (!audio) return;

      // أوقف أي صوت حالي
      try {
        audio.oncanplay = null;
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      } catch {
        // ignore
      }

      setSpeaking(false);

      // تنظيف النص
      const clean = text
        .replace(/\([^)]*\)/g, '')
        .replace(/[""«»]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      const truncated = clean.length > 1000 ? clean.slice(0, 1000) : clean;

      const params = new URLSearchParams({
        text: truncated,
        speed: String(rate),
      });
      if (preferGender) params.set('gender', preferGender);
      const url = `/api/tts?${params.toString()}`;

      audio.src = url;
      audio.volume = 1;

      // استني لحد ما الصوت يتحمّل بالكامل
      audio.oncanplay = () => {
        audio.oncanplay = null;

        // onplay → isSpeaking = true → الفيديو يبدأ
        audio.onplay = () => {
          setSpeaking(true);
          onStartRef.current?.();
        };

        // onended → isSpeaking = false → الفيديو يقف
        audio.onended = () => {
          setSpeaking(false);
          onEndRef.current?.();
        };

        audio.onerror = () => {
          setSpeaking(false);
          onEndRef.current?.();
        };

        // شغّل الصوت — isSpeaking هتبقى true بس لما الصوت يبدأ فعلاً
        audio.play().catch(() => {
          setSpeaking(false);
        });
      };

      // أثناء التحميل: isSpeaking = false → الفيديو متوقف
      audio.onerror = () => {
        setSpeaking(false);
        onEndRef.current?.();
      };

      // ابدأ تحميل الصوت
      audio.load();
    },
    [rate, preferGender]
  );

  const cancel = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.oncanplay = null;
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.src = '';
      } catch {
        // ignore
      }
    }
    setSpeaking(false);
    onEndRef.current?.();
  }, []);

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
