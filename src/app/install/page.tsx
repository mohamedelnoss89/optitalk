// ===== OptiTalk - App Install Page =====
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallPage() {
  const router = useRouter();
  const [device, setDevice] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
  const [isStandalone, setIsStandalone] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // ===== helper: اظهر toast واخفيه بعد 3 ثواني =====
  const showToastMsg = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // ===== اكتشف نوع الجهاز =====
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);

    if (isIOS) setDevice('ios');
    else if (isAndroid) setDevice('android');
    else setDevice('desktop');
  }, []);

  // ===== لو التطبيق مفتوح كـ standalone (PWA) → اكمل للتطبيق =====
  useEffect(() => {
    if (isStandalone) {
      router.push('/');
    }
  }, [isStandalone, router]);

  // ===== Android: خزّن beforeinstallprompt event عشان نستخدمه لما المستخدم يدوس زرار التحميل =====
  useEffect(() => {
    if (device !== 'android') return;

    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [device]);

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a0e1a] text-white px-6 py-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00CEC9 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 left-1/4 h-48 w-48 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #D4A03C 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div
              className="absolute inset-0 rounded-[2rem] opacity-30 blur-2xl"
              style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 70%)' }}
            />
            <img
              src="/logo.png"
              alt="OptiTalk"
              className="relative h-24 w-24 rounded-[1.5rem] object-cover"
            />
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span
              style={{
                background: 'linear-gradient(to right, #6C5CE7, #00CEC9, #D4A03C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              OptiTalk
            </span>
          </h1>
          <p className="text-base text-white/70 font-medium">
            تعلّم الإنجليزية بالمحادثة الحية
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur p-6 space-y-4 border border-white/10">
          <div className="text-5xl">📱</div>
          <h2 className="text-2xl font-bold">نزّل التطبيق على جهازك</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            عشان تجيب أحسن تجربة، نزّل OptiTalk كتطبيق على جهازك. هتقدر تفتحه بسرعة من غير متصفح.
          </p>

          {device === 'ios' && (
            <div className="space-y-3 text-right">
              <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
                <p className="text-sm font-bold text-blue-300 mb-2">📱 iPhone / iPad:</p>
                <ol className="text-xs text-white/80 space-y-2 list-decimal list-inside">
                  <li>
                    دوس على زرار المشاركة{' '}
                    <span className="inline-block px-2 py-0.5 bg-white/10 rounded text-blue-300">📤</span>
                  </li>
                  <li>
                    اختار "Add to Home Screen"{' '}
                    <span className="inline-block px-2 py-0.5 bg-white/10 rounded text-blue-300">➕</span>
                  </li>
                  <li>دوس "Add" — التطبيق هيظهر على الشاشة الرئيسية</li>
                </ol>
              </div>
            </div>
          )}

          {device === 'android' && (
            <div className="space-y-3 text-right">
              <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/20">
                <p className="text-sm font-bold text-green-300 mb-2">📱 Android:</p>
                <ol className="text-xs text-white/80 space-y-2 list-decimal list-inside">
                  <li>دوس على زرار القائمة (⋮) في المتصفح</li>
                  <li>اختار "Add to Home screen" أو "Install app"</li>
                  <li>دوس "Install" — التطبيق هيظهر على شاشة جهازك</li>
                </ol>
              </div>
              <button
                id="android-install-btn"
                style={{ display: 'none' }}
                className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                📲 نزّل التطبيق دلوقتي
              </button>
            </div>
          )}

          {device === 'desktop' && (
            <div className="space-y-3 text-right">
              <div className="rounded-xl bg-purple-500/10 p-4 border border-purple-500/20">
                <p className="text-sm font-bold text-purple-300 mb-2">💻 Desktop:</p>
                <ol className="text-xs text-white/80 space-y-2 list-decimal list-inside">
                  <li>دوس على أيقونة التثبيت 📲 في شريط العنوان</li>
                  <li>أو دوس على قائمة المتصفح (⋮) → "Install OptiTalk"</li>
                  <li>دوس "Install" — التطبيق هيفتح في نافذة منفصلة</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* ===== زرارين التحميل ===== */}
        <div className="space-y-3">
          {/* زرار تحميل التطبيق (PWA) */}
          <button
            id="install-pwa-btn"
            onClick={() => {
              // للأندرويد: حاول تفعّل beforeinstallprompt
              const evt = (window as any).deferredPrompt;
              if (evt) {
                evt.prompt();
                evt.userChoice.then(() => {
                  setTimeout(() => router.push('/'), 1000);
                });
              } else {
                // iOS / Desktop: اعرض التعليمات
                const instructions = document.getElementById('install-instructions');
                if (instructions) {
                  instructions.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                showToastMsg('اتبع التعليمات بالظبط تحت 👇');
              }
            }}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="text-xl">📲</span>
            <span>تحميل التطبيق</span>
          </button>

          {/* زرار تحميل APK — بينزّل ملف APK مباشرة للموبايلات الضعيفة */}
          <a
            href="/optitalk.apk"
            download="OptiTalk.apk"
            className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-xl">🤖</span>
            <span>تحميل APK (Android)</span>
          </a>

          <p className="text-xs text-white/40 text-center pt-1">
            📲 للموبايلات الضعيفة — حمّل APK وثبّته يدوياً
          </p>
        </div>

        {/* ===== التعليمات ===== */}
        <div id="install-instructions" className="space-y-3">
          {device === 'ios' && (
            <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
              <p className="text-sm font-bold text-blue-300 mb-2">📱 iPhone / iPad:</p>
              <ol className="text-xs text-white/80 space-y-2 list-decimal list-inside">
                <li>
                  دوس على زرار المشاركة{' '}
                  <span className="inline-block px-2 py-0.5 bg-white/10 rounded text-blue-300">📤</span>
                </li>
                <li>
                  اختار "Add to Home Screen"{' '}
                  <span className="inline-block px-2 py-0.5 bg-white/10 rounded text-blue-300">➕</span>
                </li>
                <li>دوس "Add" — التطبيق هيظهر على الشاشة الرئيسية</li>
              </ol>
            </div>
          )}

          {device === 'android' && (
            <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/20">
              <p className="text-sm font-bold text-green-300 mb-2">📱 Android:</p>
              <ol className="text-xs text-white/80 space-y-2 list-decimal list-inside">
                <li>دوس على زرار القائمة (⋮) في المتصفح</li>
                <li>اختار "Add to Home screen" أو "Install app"</li>
                <li>دوس "Install" — التطبيق هيظهر على شاشة جهازك</li>
              </ol>
            </div>
          )}

          {device === 'desktop' && (
            <div className="rounded-xl bg-purple-500/10 p-4 border border-purple-500/20">
              <p className="text-sm font-bold text-purple-300 mb-2">💻 Desktop:</p>
              <ol className="text-xs text-white/80 space-y-2 list-decimal list-inside">
                <li>دوس على أيقونة التثبيت 📲 في شريط العنوان</li>
                <li>أو دوس على قائمة المتصفح (⋮) → "Install OptiTalk"</li>
                <li>دوس "Install" — التطبيق هيفتح في نافذة منفصلة</li>
              </ol>
            </div>
          )}
        </div>

        {/* ===== المميزات ===== */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-2xl mb-1">🎓</div>
            <div className="text-xs font-bold">6 مدرسين</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-xs font-bold">18 صديق</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-2xl mb-1">🎤</div>
            <div className="text-xs font-bold">محادثة صوتية</div>
          </div>
        </div>

        {/* ===== Toast بسيط ===== */}
        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-black/80 backdrop-blur px-5 py-3 text-sm text-white border border-white/10 shadow-2xl">
            {showToast}
          </div>
        )}

        <div className="text-center text-xs text-white/40 pt-4">من opti-group</div>
      </div>
    </div>
  );
}
