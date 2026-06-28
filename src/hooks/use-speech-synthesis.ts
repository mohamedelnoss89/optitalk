// ===== OptiTalk - TTS Hook (Mobile-friendly Audio API + Web Speech fallback) =====
// يعتمد على Audio element + /api/tts endpoint عشان يشتغل على كل المتصفحات
// Web Speech API كـ fallback بس

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

// ===== Split text into chunks <= 1024 chars for TTS API =====
function splitTextIntoChunks(text: string, maxLen = 1000): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length <= maxLen) {
      cur += s;
    } else {
      if (cur) chunks.push(cur.trim());
      cur = s;
    }
  }
  if (cur) chunks.push(cur.trim());
  return chunks;
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
  const queueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const cancelledRef = useRef(false);

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

  // ===== Play next chunk from queue =====
  const playNextChunk = useCallback(async () => {
    if (cancelledRef.current) {
      isPlayingRef.current = false;
      return;
    }
    const next = queueRef.current.shift();
    if (!next) {
      isPlayingRef.current = false;
      setSpeaking(false);
      onEndRef.current?.();
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      isPlayingRef.current = false;
      return;
    }

    try {
      // Build TTS URL
      const params = new URLSearchParams({
        text: next,
        speed: String(rate),
      });
      if (preferGender) params.set('gender', preferGender);
      const url = `/api/tts?${params.toString()}`;

      audio.src = url;
      audio.volume = 1;

      audio.onplay = () => {
        if (!cancelledRef.current) {
          onStartRef.current?.();
        }
      };

      audio.onended = () => {
        // Play next chunk
        playNextChunk();
      };

      audio.onerror = () => {
        console.warn('[OptiTalk TTS] Audio error, skipping chunk');
        playNextChunk();
      };

      // Set play promise (mobile requires play() inside user gesture or after)
      await audio.play();
    } catch (err) {
      console.warn('[OptiTalk TTS] play() failed:', err);
      // Try to play next chunk
      playNextChunk();
    }
  }, [rate, preferGender]);

  // ===== Speak: split text and queue chunks =====
  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined') return;
      if (!text.trim()) return;

      // Cancel current
      cancelledRef.current = true;
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.pause();
          audio.src = '';
        } catch {
          // ignore
        }
      }

      // Reset for new speech
      cancelledRef.current = false;
      queueRef.current = splitTextIntoChunks(text);
      isPlayingRef.current = true;
      setSpeaking(true);

      // Start playing
      playNextChunk();
    },
    [playNextChunk]
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    queueRef.current = [];
    isPlayingRef.current = false;
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.src = '';
      } catch {
        // ignore
      }
    }
    setSpeaking(false);
  }, []);

  // ===== Unlock: required for iOS Safari to allow audio playback =====
  const unlock = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Play a tiny silent audio to unlock the audio context
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
      cancelledRef.current = true;
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
