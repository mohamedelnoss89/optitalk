// ===== OptiTalk - Login/Register Page (Email + Password + Google) =====
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, User as UserIcon, Loader2, LogIn, UserPlus, Eye, EyeOff, Phone } from 'lucide-react';

// Google Client ID (من env vars)
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // لو المستخدم مسجل دخول قبل كده → روح للتطبيق
  useEffect(() => {
    try {
      const stored = localStorage.getItem('optitalk-store-v6');
      if (stored) {
        const data = JSON.parse(stored);
        if (data?.state?.isAuthenticated === true && data?.state?.authUser) {
          router.push('/');
        }
      }
    } catch {}
  }, [router]);

  // ===== تحميل Google Identity Services =====
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!GOOGLE_CLIENT_ID) {
      console.warn('[Google] NEXT_PUBLIC_GOOGLE_CLIENT_ID not set — Google button will not render');
      return;
    }

    // لو Google script مش محمّل → حمّله
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogle();
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
        console.log('[Google] Sign-In initialized');
      } catch (err) {
        console.error('[Google] Init error:', err);
      }
    }
  }, []);

  // ===== Callback من Google =====
  const handleGoogleCallback = async (response: any) => {
    try {
      setGoogleLoading(true);
      toast.info('جاري تسجيل الدخول بـ Google...');

      const credential = response.credential;
      if (!credential) {
        toast.error('فشل تسجيل الدخول بـ Google');
        return;
      }

      // ابعت الـ token للسيرفر
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'فشل تسجيل الدخول بـ Google');
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
      setGoogleLoading(false);
    }
  };

  // ===== زرار تسجيل الدخول بـ Google =====
  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.info('جوجل مش متاح دلوقتي — استخدم الإيميل والباسوورد');
      return;
    }

    if (!(window as any).google) {
      toast.error('Google لسه بيحمّل. حاول تاني بعد ثانية');
      return;
    }

    try {
      // اعرض نافذة اختيار حساب Google
      (window as any).google.accounts.id.prompt();
    } catch (err) {
      console.error('[Google] prompt error:', err);
      toast.error('فشل فتح نافذة Google. حاول تاني');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email, password }
          : { name, email, phone, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'في مشكلة حصلت');
        setLoading(false);
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

      toast.success(mode === 'login' ? `أهلاً ${data.name}! 👋` : `تم التسجيل بنجاح! 🎉`);

      // روح للتطبيق
      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err: any) {
      console.error('[Auth] Error:', err);
      toast.error('مشكلة في الاتصال. حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a0e1a] text-white px-6 py-10 overflow-hidden">
      {/* ===== الخلفية المتحركة ===== */}
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

      {/* ===== المحتوى ===== */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* ===== الشعار ===== */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div
              className="absolute inset-0 rounded-[2rem] opacity-30 blur-2xl"
              style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 70%)' }}
            />
            <img
              src="/logo.png"
              alt="OptiTalk"
              className="relative h-20 w-20 rounded-[1.5rem] object-cover"
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
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
          <p className="text-sm text-white/60">
            {mode === 'login' ? 'سجّل دخولك للمتابعة' : 'اعمل حساب جديد وابدأ التعلم'}
          </p>
        </div>

        {/* ===== التبويبات ===== */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <LogIn className="h-4 w-4" />
            تسجيل دخول
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            حساب جديد
          </button>
        </div>

        {/* ===== النموذج ===== */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70">الاسم</label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكامل"
                  required
                  minLength={2}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                dir="ltr"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  required
                  minLength={8}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70">كلمة السر</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري المعالجة...
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="h-5 w-5" />
                تسجيل الدخول
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                إنشاء حساب
              </>
            )}
          </button>
        </form>

        {/* ===== فاصل "أو" ===== */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-white/40 font-medium">أو</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* ===== زرار Google Sign-In ===== */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-base font-bold text-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              جاري تسجيل الدخول...
            </>
          ) : (
            <>
              <GoogleIcon />
              المتابعة بحساب Google
            </>
          )}
        </button>

        {/* التبديل بين login/register */}
        <div className="text-center text-sm text-white/50">
          {mode === 'login' ? (
            <>
              مش عندك حساب؟{' '}
              <button
                onClick={() => setMode('register')}
                className="text-indigo-400 hover:text-indigo-300 font-bold"
              >
                اعمل حساب جديد
              </button>
            </>
          ) : (
            <>
              عندك حساب؟{' '}
              <button
                onClick={() => setMode('login')}
                className="text-indigo-400 hover:text-indigo-300 font-bold"
              >
                سجّل دخول
              </button>
            </>
          )}
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
