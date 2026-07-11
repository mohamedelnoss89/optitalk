// ===== Audio Unlock Hook — فتح الصوت على الموبايل =====
// على الموبايل، audio.play() لازم يحصل جوه user gesture
// بنستغل أي تفاعل (touch/click) عشان نفتح الصوت

'use client';

import { useEffect } from 'react';

export function useAudioUnlock() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unlocked = false;

    const unlock = () => {
      if (unlocked) return;

      // 1. افتح أي audio element موجود في الصفحة
      const existingAudio = document.getElementById('optitalk-tts-audio') as HTMLAudioElement | null;
      if (existingAudio) {
        try {
          existingAudio.muted = true;
          existingAudio.play().then(() => {
            existingAudio.pause();
            existingAudio.muted = false;
            existingAudio.currentTime = 0;
            console.log('[AudioUnlock] 🔓 existing audio unlocked');
            unlocked = true;
          }).catch(() => {});
        } catch {}
      }

      // 2. افتح Audio Context (مهم جداً للموبايل)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
              console.log('[AudioUnlock] 🔓 AudioContext resumed');
              unlocked = true;
            }).catch(() => {});
          } else {
            unlocked = true;
          }
        }
      } catch {}

      // 3. شغل فيديو صامت (للفيديو)
      try {
        const videos = document.getElementsByTagName('video');
        for (let i = 0; i < videos.length; i++) {
          const v = videos[i];
          v.muted = true;
          v.play().then(() => {
            v.pause();
            v.muted = false;
            v.currentTime = 0;
            console.log('[AudioUnlock] 🔓 video unlocked');
          }).catch(() => {});
        }
      } catch {}
    };

    // استمع لأي تفاعل
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
