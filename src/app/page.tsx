// ===== OptiTalk - Main Page =====
'use client';

import { useEffect } from 'react';

export default function Home() {
  // ===== المنطق البسيط جداً =====
  // أي حد يفتح optitalk.vercel.app → روح على صفحة التنزيل (/install)
  // مفيش شروط، مفيش exceptions، حتى لو مسجل دخول
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.location.href = '/install';
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
