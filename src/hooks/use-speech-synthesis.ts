// ===== OptiTalk - TTS Hook (محسّن — إصلاح race condition + تقطيع الكلام) =====
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
  // ===== generation counter — عشان نمنع race condition =====
  // كل استدعاء لـ speak() بيعدّي الجيل الحالي. لو fetch قديم رجع، نتجاهله.
  const generationRef = useRef(0);
  // ===== علامة إلغاء — لو cancel() اتسببت، نمنع onEnd من الـ fire =====
  const cancelledRef = useRef(false);

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
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
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

      // ===== زيّد جيل الكلام الحالي — أي fetch قديم هيبقى stale =====
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
      } catch {
        // ignore
      }

      // isSpeaking = false فوراً (الفيديو يقف أثناء التحميل)
      setSpeaking(false);

      // تنظيف النص
      const clean = text
        .replace(/\([^)]*\)/g, '')
        .replace(/[""«»]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      // لا تقطع النص في منتصف جملة — قطّع عند آخر نقطة/علامة استفهام قبل الحد
      const MAX_CHARS = 950;
      let truncated = clean;
      if (clean.length > MAX_CHARS) {
        const slice = clean.slice(0, MAX_CHARS);
        // ابحث عن آخر علامة ترقيم
        const lastPunct = Math.max(
          slice.lastIndexOf('. '),
          slice.lastIndexOf('! '),
          slice.lastIndexOf('? '),
          slice.lastIndexOf('؟ '),
          slice.lastIndexOf('.'),
          slice.lastIndexOf('!'),
          slice.lastIndexOf('?')
        );
        truncated = lastPunct > MAX_CHARS * 0.5
          ? slice.slice(0, lastPunct + 1)
          : slice + '...';
      }

      const params = new URLSearchParams({
        text: truncated,
        speed: String(rate),
      });
      if (preferGender) params.set('gender', preferGender);
      const url = `/api/tts?${params.toString()}`;

      // حمّل الصوت كامل الأول (fetch → blob) وبعدين شغّله
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
          return res.blob();
        })
        .then((blob) => {
          // ===== تحقق من الجيل — لو تغيّر، يبقى هذا fetch قديم، نتجاهله =====
          if (myGeneration !== generationRef.current || cancelledRef.current) {
            return; // stale — تجاهل
          }

          const blobUrl = URL.createObjectURL(blob);
          audio.src = blobUrl;
          audio.volume = 1;

          // onplay → isSpeaking = true (الصوت بدأ فعلياً)
          audio.onplay = () => {
            if (myGeneration !== generationRef.current || cancelledRef.current) {
              return;
            }
            setSpeaking(true);
            onStartRef.current?.();
          };

          // onended → isSpeaking = false (الصوت خلص طبيعياً)
          audio.onended = () => {
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) {
              return;
            }
            setSpeaking(false);
            onEndRef.current?.();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) {
              return;
            }
            setSpeaking(false);
            onEndRef.current?.();
          };

          audio.play().catch((err) => {
            console.error('[TTS] play() failed:', err);
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) {
              return;
            }
            setSpeaking(false);
          });
        })
        .catch((err) => {
          console.error('[TTS] fetch failed:', err);
          if (myGeneration !== generationRef.current || cancelledRef.current) {
            return;
          }
          setSpeaking(false);
        });
    },
    [rate, preferGender]
  );

  const cancel = useCallback(() => {
    // ===== علم الإلغاء — منع أي callback قادم من الـ fire =====
    cancelledRef.current = true;
    generationRef.current++; // ألغي أي fetch معلّق

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
    // ملاحظة: لا نستدعي onEnd هنا — الإلغاء ليس نهاية طبيعية
    // onEnd بيتستدعى بس لما الصوت يخلص طبيعياً أو يخطئ
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
