// ===== OptiTalk - Main Page =====
'use client';

import { useEffect } from 'react';

export default function Home() {
  // ===== المنطق =====
  // - لو التطبيق مفتوح كـ PWA (standalone) + مسجل → روح لـ /app
  // - لو التطبيق مفتوح كـ PWA (standalone) + مش مسجل → روح لـ /login
  // - أي حالة تانية (متصفح عادي) → روح لـ /install (صفحة التنزيل)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // هل التطبيق مفتوح كـ PWA (standalone)؟
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      // لو الـ URL فيه query param ?app=true (للتجربة في المتصفح)
      new URLSearchParams(window.location.search).get('app') === 'true';

    // اقرأ حالة المستخدم من localStorage
    let isAuthenticated = false;
    try {
      const stored = localStorage.getItem('optitalk-store-v6');
      if (stored) {
        const parsed = JSON.parse(stored);
        isAuthenticated = parsed?.state?.isAuthenticated === true && !!parsed?.state?.authUser;
      }
    } catch {}

    if (isStandalone) {
      // التطبيق مفتوح كـ PWA
      if (isAuthenticated) {
        // مسجل → افتح التطبيق على طول
        window.location.href = '/app';
      } else {
        // مش مسجل → روح لتسجيل الدخول
        window.location.href = '/login';
      }
    } else {
      // متصفح عادي → روح لصفحة التنزيل
      window.location.href = '/install';
    }
  }, []);

  // ===== loading screen لحد ما الـ redirect يحصل =====
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a0e1a] text-white">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div
          className="absolute inset-0 rounded-[2rem] opacity-30 blur-2xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 70%)' }}
        />
        <img
          src="/logo.png"
          alt="OptiTalk"
          className="relative h-24 w-24 rounded-[1.5rem] object-cover"
        />
      </div>
      <div className="mt-6 text-white/60 text-sm">جاري التحميل...</div>
    </div>
  );
}
