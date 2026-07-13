// ===== useArabicSpeech — hook مخصص للنطق العربي =====
// الاستراتيجية:
// 1. جرّب Web Speech API لو فيه أصوات عربية متاحة في المتصفح
// 2. لو مفيش، استخدم /api/tts-arabic (espeak-ng على السيرفر)

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseArabicSpeechOptions {
  rate?: number;
  pitch?: number;
  gender?: 'male' | 'female';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

interface UseArabicSpeechReturn {
  supported: boolean;
  hasArabicVoice: boolean;
  speak: (text: string) => void;
  cancel: () => void;
}

// ===== cache الأصوات على مستوى الـ module =====
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;
let arabicVoiceCount = -1; // -1 = لم يُفحص بعد

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      cachedVoices = existing;
      voicesLoaded = true;
      resolve(existing);
      return;
    }

    let resolved = false;
    const handler = () => {
      if (resolved) return;
      resolved = true;
      const voices = window.speechSynthesis.getVoices();
      cachedVoices = voices;
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(voices);
    };

    window.speechSynthesis.addEventListener('voiceschanged', handler);

    // fallback polling
    let attempts = 0;
    const interval = setInterval(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 || attempts >= 20) {
        clearInterval(interval);
        if (!resolved) {
          resolved = true;
          cachedVoices = voices;
          voicesLoaded = true;
          window.speechSynthesis.removeEventListener('voiceschanged', handler);
          resolve(voices);
        }
      }
      attempts++;
    }, 100);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        const voices = window.speechSynthesis.getVoices();
        cachedVoices = voices;
        voicesLoaded = true;
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve(voices);
      }
    }, 2000);
  });
}

function pickArabicVoice(
  voices: SpeechSynthesisVoice[],
  gender: 'male' | 'female' | undefined
): SpeechSynthesisVoice | null {
  const arabicVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ar'));
  if (arabicVoices.length === 0) return null;

  const femaleNames = ['amira', 'salma', 'laila', 'layla', 'hoda', 'mona', 'zeina', 'rana', 'female', 'woman'];
  const maleNames = ['tarik', 'tariq', 'maged', 'naayf', 'hamid', 'khaled', 'ahmed', 'male', 'man'];
  const preferredNames = gender === 'female' ? femaleNames : maleNames;

  for (const name of preferredNames) {
    const match = arabicVoices.find((v) => v.name.toLowerCase().includes(name));
    if (match) return match;
  }

  return arabicVoices[0];
}

export function useArabicSpeech(
  opts: UseArabicSpeechOptions = {}
): UseArabicSpeechReturn {
  const { rate = 0.9, pitch, gender, onStart, onEnd, onError } = opts;
  const [supported] = useState(() =>
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [hasArabicVoice, setHasArabicVoice] = useState(false);

  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const generationRef = useRef(0);

  useEffect(() => {
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
    onErrorRef.current = onError;
  }, [onStart, onEnd, onError]);

  // أضف عنصر audio في الـ DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let audio = document.getElementById('optitalk-tts-audio') as HTMLAudioElement | null;
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'optitalk-tts-audio';
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.style.display = 'none';
      document.body.appendChild(audio);
    }
    audioRef.current = audio;

    return () => {
      try {
        if (audio) {
          audio.onplay = null;
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
        }
      } catch {}
    };
  }, []);

  // تحقق من أصوات العربي عند mount
  useEffect(() => {
    if (!supported) return;

    loadVoices().then((voices) => {
      const arabicVoices = voices.filter((v) =>
        v.lang.toLowerCase().startsWith('ar')
      );
      arabicVoiceCount = arabicVoices.length;
      setHasArabicVoice(arabicVoices.length > 0);
      console.log('[ArabicSpeech] أصوات عربي في المتصفح:', arabicVoices.length);
      if (arabicVoices.length > 0) {
        console.log('[ArabicSpeech] الأصوات:', arabicVoices.map(v => `${v.name} (${v.lang})`).join(', '));
      } else {
        console.log('[ArabicSpeech] لا توجد أصوات عربي → سيتم استخدام /api/tts-arabic (espeak-ng)');
      }
    });
  }, [supported]);

  // ===== الطريقة 1: Web Speech API (لو فيه أصوات عربي) =====
  const speakWithBrowser = useCallback(
    (text: string, myGeneration: number) => {
      const voices = voicesLoaded ? cachedVoices : window.speechSynthesis.getVoices();
      const selectedVoice = pickArabicVoice(voices, gender);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-EG';
      utterance.rate = rate;
      utterance.volume = 1;
      if (pitch !== undefined) utterance.pitch = pitch;
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onstart = () => {
        if (myGeneration !== generationRef.current || cancelledRef.current) return;
        console.log('[ArabicSpeech][Browser] بدأ النطق');
        onStartRef.current?.();

        // keep-alive لمنع تعليق Chrome بعد 15 ثانية
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        keepAliveRef.current = setInterval(() => {
          if (myGeneration !== generationRef.current || cancelledRef.current) {
            if (keepAliveRef.current) {
              clearInterval(keepAliveRef.current);
              keepAliveRef.current = null;
            }
            return;
          }
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
      };

      utterance.onend = () => {
        if (keepAliveRef.current) {
          clearInterval(keepAliveRef.current);
          keepAliveRef.current = null;
        }
        if (myGeneration !== generationRef.current || cancelledRef.current) return;
        console.log('[ArabicSpeech][Browser] انتهى النطق');
        onEndRef.current?.();
      };

      utterance.onerror = (e) => {
        if (keepAliveRef.current) {
          clearInterval(keepAliveRef.current);
          keepAliveRef.current = null;
        }
        if (myGeneration !== generationRef.current || cancelledRef.current) return;
        console.error('[ArabicSpeech][Browser] خطأ:', e.error);
        // fallback للسيرفر
        console.log('[ArabicSpeech] محاولة استخدام /api/tts-arabic بدلاً من ذلك');
        speakWithServer(text, myGeneration);
      };

      // Chrome bug: delay بسيط بعد cancel
      setTimeout(() => {
        if (myGeneration !== generationRef.current || cancelledRef.current) return;
        window.speechSynthesis.speak(utterance);
      }, 80);
    },
    [rate, pitch, gender]
  );

  // ===== الطريقة 2: /api/tts-arabic (espeak-ng على السيرفر) =====
  const speakWithServer = useCallback(
    (text: string, myGeneration: number) => {
      const audio = audioRef.current;
      if (!audio) {
        onErrorRef.current?.();
        onEndRef.current?.();
        return;
      }

      // نظّف النص (مثل API route)
      const clean = text
        .replace(/\([^)]*\)/g, '')
        .replace(/[""«»]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean) return;

      // ابنِ URL
      const params = new URLSearchParams({ text: clean });
      if (gender) params.set('gender', gender);
      // rate في الـ hook (0.5-2.0) → espeak-ng speed (90-250)
      // rate=1.0 → 175 (default), rate=0.9 → ~157
      const espeakSpeed = Math.round(175 * rate);
      params.set('speed', String(espeakSpeed));
      if (pitch !== undefined) params.set('pitch', String(pitch));

      const url = `/api/tts-arabic?${params.toString()}`;
      console.log('[ArabicSpeech][Server] طلب TTS من السيرفر');

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
        .then((blob) => {
          if (myGeneration !== generationRef.current || cancelledRef.current) return;

          const blobUrl = URL.createObjectURL(blob);
          audio.src = blobUrl;
          audio.volume = 1;

          audio.onplay = () => {
            if (myGeneration !== generationRef.current || cancelledRef.current) return;
            console.log('[ArabicSpeech][Server] بدأ النطق');
            onStartRef.current?.();
          };

          audio.onended = () => {
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) return;
            console.log('[ArabicSpeech][Server] انتهى النطق');
            onEndRef.current?.();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) return;
            console.error('[ArabicSpeech][Server] خطأ في تشغيل الصوت');
            onErrorRef.current?.();
            onEndRef.current?.();
          };

          audio.play().catch((err) => {
            console.error('[ArabicSpeech][Server] play() failed:', err);
            URL.revokeObjectURL(blobUrl);
            if (myGeneration !== generationRef.current || cancelledRef.current) return;
            onErrorRef.current?.();
            onEndRef.current?.();
          });
        })
        .catch((err) => {
          console.error('[ArabicSpeech][Server] fetch failed:', err);
          if (myGeneration !== generationRef.current || cancelledRef.current) return;
          onErrorRef.current?.();
          onEndRef.current?.();
        });
    },
    [rate, pitch, gender]
  );

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text.trim()) return;

      const myGeneration = ++generationRef.current;
      cancelledRef.current = false;

      // أوقف أي كلام حالي (الطريقتين)
      window.speechSynthesis.cancel();
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.onplay = null;
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          audio.src = '';
        } catch {
          // ignore
        }
      }
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }

      // اختار الطريقة المناسبة
      if (arabicVoiceCount > 0) {
        // عندنا أصوات عربي في المتصفح → استخدم Web Speech API
        speakWithBrowser(text, myGeneration);
      } else {
        // مفيش أصوات عربي → استخدم /api/tts-arabic
        speakWithServer(text, myGeneration);
      }
    },
    [supported, speakWithBrowser, speakWithServer]
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    generationRef.current++;
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    if (supported) {
      window.speechSynthesis.cancel();
    }
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.src = '';
      } catch {
        // ignore
      }
    }
  }, [supported]);

  return { supported, hasArabicVoice, speak, cancel };
}
