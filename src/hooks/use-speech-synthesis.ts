// ===== OptiTalk - TTS Hook (بسيط ومباشر) =====
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

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined') return;
      if (!text.trim()) return;

      const audio = audioRef.current;
      if (!audio) return;

      // أوقف أي صوت حالي
      try {
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.onloadeddata = null;
        audio.oncanplay = null;
        audio.pause();
      } catch {
        // ignore
      }

      // isSpeaking = false فوراً (الفيديو يقف)
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

      // onplay → isSpeaking = true (الصوت بدأ فعلياً)
      audio.onplay = () => {
        setSpeaking(true);
        onStartRef.current?.();
      };

      // onended → isSpeaking = false (الصوت خلص)
      audio.onended = () => {
        setSpeaking(false);
        onEndRef.current?.();
      };

      // onerror → isSpeaking = false
      audio.onerror = () => {
        setSpeaking(false);
        onEndRef.current?.();
      };

      // شغّل الصوت فوراً — المتصفح هيدمّج التحميل مع التشغيل
      audio.play().catch(() => {
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
        audio.onloadeddata = null;
        audio.oncanplay = null;
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
