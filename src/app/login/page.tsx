// ===== OptiTalk - Login Page (Google Sign-In) =====
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Google Client ID (مؤقت — لازم يحط الـ ID الحقيقي في env)
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // لو المستخدم مسجل دخول قبل كده → روح للتطبيق
  useEffect(() => {
    try {
      const stored = localStorage.getItem('optitalk-store-v6');
      if (stored) {
        const data = JSON.parse(stored);
        if (data?.state?.isAuthenticated && data?.state?.authUser) {
          router.push('/');
          return;
        }
      }
    } catch {}
  }, [router]);

  // تحميل Google Identity Services
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!GOOGLE_CLIENT_ID) {
      console.warn('[Google] NEXT_PUBLIC_GOOGLE_CLIENT_ID not set');
      return;
    }

    // لو Google script مش محمّل → حمّله
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogle();
      };
      document.head.appendChild(script);
    } else {
      initializeGoogle();
    }

    function initializeGoogle() {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            locale: 'ar',
            width: 320,
          }
        );

        setGoogleReady(true);
        console.log('[Google] Sign-In initialized');
      } catch (err) {
        console.error('[Google] Init error:', err);
      }
    }
  }, []);

  // ===== Callback من Google =====
  const handleGoogleCallback = async (response: any) => {
    try {
      setLoading(true);
      toast.info('جاري تسجيل الدخول...');

      // الـ response.credential هو JWT token من Google
      const credential = response.credential;
      if (!credential) {
        toast.error('فشل تسجيل الدخول بـ Google');
        return;
      }

      // ابعت الـ token للسيرفر عشان يتحقق منه ويعمل/يجيب المستخدم
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'فشل تسجيل الدخول');
        return;
      }

      // خزّن المستخدم في localStorage
      try {
        const stored = localStorage.getItem('optitalk-store-v6');
        const parsed = stored ? JSON.parse(stored) : { state: {} };
        parsed.state = parsed.state || {};
        parsed.state.authUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
        };
        parsed.state.isAuthenticated = true;
        localStorage.setItem('optitalk-store-v6', JSON.stringify(parsed));
      } catch {}

      toast.success(`أهلاً ${data.name}! 👋`);
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) {
      console.error('[Google Auth] Error:', err);
      toast.error('مشكلة في الاتصال. حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  // ===== تسجيل دخول كـ Guest (تجربة بدون حساب) =====
  const handleGuest = () => {
    try {
      const stored = localStorage.getItem('optitalk-store-v6');
      const parsed = stored ? JSON.parse(stored) : { state: {} };
      parsed.state = parsed.state || {};
      parsed.state.authUser = {
        id: 'guest-' + Date.now(),
        name: 'زائر',
        email: null,
        phone: null,
      };
      parsed.state.isAuthenticated = true;
      localStorage.setItem('optitalk-store-v6', JSON.stringify(parsed));

      toast.success('تجربة كزائر — ابدأ الاستكشاف! 🚀');
      setTimeout(() => router.push('/'), 500);
    } catch {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a0e1a] text-white px-6 py-10 overflow-hidden">
      {/* ===== الخلفية المتحركة ===== */}
      <div className="pointer-none absolute inset-0 overflow-hidden">
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

      {/* ===== المحتوى ===== */}
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* ===== الشعار ===== */}
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
          <p className="text-base text-white/70 font-medium text-center max-w-xs">
            تعلّم الإنجليزية بالمحادثة الحية مع مدرسك AI الشخصي
          </p>
        </div>

        {/* ===== صندوق تسجيل الدخول ===== */}
        <div className="rounded-3xl bg-white/5 backdrop-blur p-8 space-y-6 border border-white/10 shadow-2xl">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">مرحباً 👋</h2>
            <p className="text-sm text-white/60">سجّل دخولك عشان تبدأ التعلم</p>
          </div>

          {/* ===== زرار Google Sign-In ===== */}
          <div className="space-y-3">
            {!GOOGLE_CLIENT_ID ? (
              // لو مفيش Google Client ID → اظهر زرار fallback
              <button
                onClick={() => {
                  toast.info('جوجل مش متاح دلوقتي — استخدم زرار التجربة');
                }}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-base font-bold text-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <GoogleIcon />
                المتابعة بحساب Google
              </button>
            ) : (
              <div className="flex justify-center">
                <div id="google-signin-btn"></div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري المعالجة...
              </div>
            )}
          </div>

          {/* فاصل */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/40">أو</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* ===== زرار التجربة كزائر ===== */}
          <button
            onClick={handleGuest}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            تجربة كزائر (بدون تسجيل)
          </button>
        </div>

        {/* ===== المميزات ===== */}
        <div className="grid grid-cols-3 gap-3">
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

        {/* ===== Footer ===== */}
        <div className="text-center text-xs text-white/40">
          بتسجيل الدخول إنت توافق على شروط الاستخدام وسياسة الخصوصية
        </div>
      </div>
    </div>
  );
}

// ===== أيقونة Google =====
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
