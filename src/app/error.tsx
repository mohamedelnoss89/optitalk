'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('[OptiTalk Error Boundary]', error);
  }, [error]);

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a0e1a] text-white px-6 py-10">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl mb-4">😵</div>
        <h2 className="text-2xl font-bold text-white">
          في مشكلة بسيطة
        </h2>
        <p className="text-sm text-white/70 leading-relaxed">
          حصل خطأ أثناء تحميل الصفحة. حاول تاني.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => {
              // امسح cache
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              }
            }}
            className="w-full rounded-2xl bg-white/10 px-6 py-3 text-base font-medium text-white/80 transition-all hover:bg-white/20"
          >
            امسح cache وابدأ من جديد
          </button>
        </div>
        {error?.message && (
          <details className="text-xs text-white/40 mt-4 text-left">
            <summary className="cursor-pointer">تفاصيل الخطأ</summary>
            <pre className="mt-2 p-2 bg-black/30 rounded text-[10px] overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
