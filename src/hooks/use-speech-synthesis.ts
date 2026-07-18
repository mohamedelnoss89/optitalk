// ===== OptiTalk - TTS Hook (موحد — عربي + إنجليزي بصوت الشخصية) =====
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  gender?: 'male' | 'female';
  voiceIdAr?: string;  // صوت عربي خاص بالشخصية
  voiceIdEn?: string;  // صوت إنجليزي خاص بالشخصية
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

// ===== تحديد لغة النص (عربي ولا إنجليزي غالب؟) =====
function detectLang(text: string): 'ar' | 'en' {
  const arabic = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  if (arabic > latin) return 'ar';
  return 'en';
}

export function useSpeechSynthesis(
  opts: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { rate = 1.0, gender, voiceIdAr, voiceIdEn, onEnd, onStart } = opts;
  const [supported] = useState(() =>
    typeof window !== 'undefined' && typeof fetch === 'function'
  );
  const [speaking, setSpeaking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndRef = useRef(onEnd);
  const onStartRef = useRef(onStart);
  const voiceIdArRef = useRef(voiceIdAr);
  const voiceIdEnRef = useRef(voiceIdEn);
  const genderRef = useRef(gender);
  const rateRef = useRef(rate);
  // generation counter يمنع race conditions
  const generationRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    onEndRef.current = onEnd;
    onStartRef.current = onStart;
    voiceIdArRef.current = voiceIdAr;
    voiceIdEnRef.current = voiceIdEn;
    genderRef.current = gender;
    rateRef.current = rate;
  }, [onEnd, onStart, voiceIdAr, voiceIdEn, gender, rate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      try {
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.src = '';
      } catch { /* ignore */ }
      audioRef.current = null;
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined') return;
      if (!text.trim()) return;

      const audio = audioRef.current;
      if (!audio) return;

      const myGeneration = ++generationRef.current;
      cancelledRef.current = false;

      // أوقف أي صوت حالي
      try {
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.onloadeddata = null;
        audio.oncanplay = null;
        audio.pause();
        audio.src = '';
      } catch { /* ignore */ }

      setSpeaking(false);

      // تنظيف النص
      const clean = text
        .replace(/\([^)]*\)/g, '')
        .replace(/[""«»]/g, '')
        .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      // اقصر النص لو طويل (حد 900 حرف، مقسوم على جملة كاملة)
      const MAX_CHARS = 900;
      let truncated = clean;
      if (clean.length > MAX_CHARS) {
        const slice = clean.slice(0, MAX_CHARS);
        const lastPunct = Math.max(
          slice.lastIndexOf('. '),
          slice.lastIndexOf('! '),
          slice.lastIndexOf('? '),
          slice.lastIndexOf('؟ '),
          slice.lastIndexOf('.'),
          slice.lastIndexOf('!'),
          slice.lastIndexOf('?'),
          slice.lastIndexOf('؟')
        );
        truncated = lastPunct > MAX_CHARS * 0.5
          ? slice.slice(0, lastPunct + 1)
          : slice + '...';
      }

      // حدد اللغة والصوت المناسب
      const lang = detectLang(truncated);
      const voiceId = lang === 'ar' ? voiceIdArRef.current : voiceIdEnRef.current;

      const params = new URLSearchParams({ text: truncated });
      params.set('lang', lang);
      params.set('speed', String(rateRef.current));
      if (voiceId) {
        params.set('voiceId', voiceId);
      } else if (genderRef.current) {
        params.set('gender', genderRef.current);
      }

      const url = `/api/tts?${params.toString()}`;

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
          return res.blob();
        })
        .then((blob) => {
          if (myGeneration !== generationRef.current || cancelledRef.current) return;

          const blobUrl = URL.createObjectURL(blob);
          audio.src = blobUrl;
          audio.volume = 1;

          audio.onplay = () => {
            if (myGeneration !== generationRef.current || cancelledRef.current) return;
            setSpeaking(true);
            onStartRef.current?.();
          };

          audio.onended = () => {
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) return;
            setSpeaking(false);
            onEndRef.current?.();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) return;
            setSpeaking(false);
            onEndRef.current?.();
          };

          audio.play().catch((err) => {
            console.error('[TTS] play() failed:', err);
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) return;
            setSpeaking(false);
          });
        })
        .catch((err) => {
          console.error('[TTS] fetch failed:', err);
          if (myGeneration !== generationRef.current || cancelledRef.current) return;
          setSpeaking(false);
        });
    },
    []
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    generationRef.current++;

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
      } catch { /* ignore */ }
    }
    setSpeaking(false);
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
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.pause();
          audio.src = '';
        } catch { /* ignore */ }
      }
    };
  }, []);

  return { supported: true, speaking, speak, cancel, unlock };
}
