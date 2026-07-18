// ===== useArabicSpeech — hook مبسط للموبايل =====
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseArabicSpeechOptions {
  rate?: number;
  pitch?: number;
  gender?: 'male' | 'female';
  characterId?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export function useArabicSpeech(opts: UseArabicSpeechOptions = {}) {
  const { rate = 0.9, pitch, gender, characterId, onStart, onEnd, onError } = opts;
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
    onErrorRef.current = onError;
  }, [onStart, onEnd, onError]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // اعمل audio element في الـ DOM
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

    // AudioContext unlock
    const unlock = () => {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          if (ctx.state === 'suspended') ctx.resume();
        }
      } catch {}
      // شغل audio صامت
      if (audio) {
        audio.muted = true;
        audio.play().then(() => {
          audio.pause();
          audio.muted = false;
          audio.currentTime = 0;
        }).catch(() => {
          audio.muted = false;
        });
      }
    };

    document.addEventListener('touchstart', unlock, { passive: true });
    document.addEventListener('click', unlock, { passive: true });

    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
      if (audio) {
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    if (!text.trim()) return;

    const audio = audioRef.current;
    if (!audio) return;

    // أوقف أي صوت حالي
    audio.pause();
    audio.src = '';

    const params = new URLSearchParams({ text });
    if (gender) params.set('gender', gender);
    if (characterId) params.set('characterId', characterId);
    params.set('speed', String(Math.round(175 * rate)));
    if (pitch !== undefined) params.set('pitch', String(pitch));

    const url = `/api/tts-arabic?${params.toString()}`;
    console.log('[ArabicSpeech] Fetching:', url.substring(0, 80));

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        audio.src = blobUrl;
        audio.volume = 1;

        audio.onplay = () => {
          setSpeaking(true);
          onStartRef.current?.();
        };

        audio.onended = () => {
          URL.revokeObjectURL(blobUrl);
          setSpeaking(false);
          onEndRef.current?.();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          setSpeaking(false);
          onErrorRef.current?.();
          onEndRef.current?.();
        };

        // شغل الصوت
        audio.play().catch(err => {
          console.error('[ArabicSpeech] play() failed:', err);
          // retry بعد 300ms
          setTimeout(() => {
            audio.play().catch(() => {
              setSpeaking(false);
              onErrorRef.current?.();
              onEndRef.current?.();
            });
          }, 300);
        });
      })
      .catch(err => {
        console.error('[ArabicSpeech] fetch failed:', err);
        setSpeaking(false);
        onErrorRef.current?.();
        onEndRef.current?.();
      });
  }, [rate, pitch, gender, characterId]);

  const cancel = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setSpeaking(false);
    onEndRef.current?.();
  }, []);

  return { supported: true, speaking, speak, cancel };
}
