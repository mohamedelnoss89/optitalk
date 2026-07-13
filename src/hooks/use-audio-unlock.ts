// ===== Audio Unlock Hook — فتح الصوت والفيديو على الموبايل =====
// المشكلة: على الموبايل، audio.play() لازم يحصل جوه user gesture
// الحل: نستغل أي تفاعل (touch/click) عشان نفتح الصوت

'use client';

import { useEffect, useRef } from 'react';

export function useAudioUnlock() {
  const unlockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (unlockedRef.current) return;

      // 1. افتح AudioContext (مهم جداً للموبايل - Safari و Chrome)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
              console.log('[AudioUnlock] 🔓 AudioContext resumed');
            }).catch(() => {});
          }
        }
      } catch {}

      // 2. افتح أي audio element في الصفحة
      const audios = document.getElementsByTagName('audio');
      for (let i = 0; i < audios.length; i++) {
        try {
          const a = audios[i];
          a.muted = true;
          a.play().then(() => {
            a.pause();
            a.muted = false;
            a.currentTime = 0;
            console.log('[AudioUnlock] 🔓 audio unlocked');
            unlockedRef.current = true;
          }).catch(() => {});
        } catch {}
      }

      // 3. افتح أي فيديو في الصفحة
      const videos = document.getElementsByTagName('video');
      for (let i = 0; i < videos.length; i++) {
        try {
          const v = videos[i];
          v.muted = true;
          v.play().then(() => {
            v.pause();
            v.muted = false;
            v.currentTime = 0;
            console.log('[AudioUnlock] 🔓 video unlocked');
          }).catch(() => {});
        } catch {}
      }

      // 4. اعمل audio element مؤقت وافتحه (لو مفيش audio elements)
      try {
        const tempAudio = new Audio();
        tempAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        tempAudio.volume = 0;
        tempAudio.play().then(() => {
          console.log('[AudioUnlock] 🔓 temp audio unlocked');
          unlockedRef.current = true;
        }).catch(() => {});
      } catch {}
    };

    // استمع لأي تفاعل - مهم: { once: false } عشان نحاول أكثر من مرة
    document.addEventListener('touchstart', unlock, { passive: true });
    document.addEventListener('touchend', unlock, { passive: true });
    document.addEventListener('click', unlock, { passive: true });

    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('touchend', unlock);
      document.removeEventListener('click', unlock);
    };
  }, []);
}
