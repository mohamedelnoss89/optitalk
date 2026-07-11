// ===== Audio Unlock Hook — فتح الصوت على الموبايل =====
// المستخدم بيتفاعل مع الشاشة (touch/click) قبل ما يدخل المحادثة
// فبنستغل أي تفاعل عشان نفتح الصوت

'use client';

import { useEffect } from 'react';

export function useAudioUnlock() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unlocked = false;

    const unlock = () => {
      if (unlocked) return;
      unlocked = true;

      try {
        // شغل صوت صامت لجزء من الثانية
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        audio.volume = 0;
        audio.play().then(() => {
          console.log('[AudioUnlock] 🔓 تم فتح الصوت');
          audio.pause();
        }).catch(() => {
          // مش مشكلة - هنجرب تاني
          unlocked = false;
        });
      } catch {
        // ignore
      }

      // شغل فيديو صامت برضه
      try {
        const video = document.createElement('video');
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.play().then(() => {
          video.pause();
          console.log('[AudioUnlock] 🔓 تم فتح الفيديو');
        }).catch(() => {});
      } catch {
        // ignore
      }
    };

    // استمع لأي تفاعل
    document.addEventListener('touchstart', unlock, { once: false });
    document.addEventListener('click', unlock, { once: false });

    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
  }, []);
}
