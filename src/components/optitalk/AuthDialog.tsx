// ===== OptiTalk - Auth Dialog (تسجيل دخول / تسجيل جديد) =====
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, Mail, Phone, Lock, User as UserIcon, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'login' | 'register';
}

export function AuthDialog({ open, onClose, onSuccess, mode: initialMode = 'register' }: Props) {
  const setAuthUser = useStore((s) => s.setAuthUser);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      // امسح الـ password بس كل ما تفتح
      setPassword('');
    }
  }, [open, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        // ===== التسجيل =====
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'فشل التسجيل');
          return;
        }

        // احفظ المستخدم في الـ store
        setAuthUser(data.user);
        toast.success(`أهلاً يا ${data.user.name}! تم تسجيلك بنجاح 🎉`);
        onSuccess?.();
        handleClose();
      } else {
        // ===== تسجيل الدخول =====
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'فشل تسجيل الدخول');
          return;
        }

        // احفظ المستخدم في الـ store
        setAuthUser(data.user);
        toast.success(`أهلاً يا ${data.user.name}! تسجيل دخول ناجح 👋`);
        onSuccess?.();
        handleClose();
      }
    } catch (err) {
      console.error('[AuthDialog] Error:', err);
      toast.error('مشكلة في الاتصال. حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    onClose();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setPassword('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0e1a]/85 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#0e1330] border border-opti-primary/30 shadow-2xl overflow-hidden"
          >
            {/* ===== Header ===== */}
            <div className="relative p-6 pb-4">
              <button
                onClick={handleClose}
                className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full opti-glass text-opti-text/60 hover:text-opti-text"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl opti-primary-gradient opti-glow">
                  {mode === 'login' ? <LogIn className="h-7 w-7 text-white" /> : <UserPlus className="h-7 w-7 text-white" />}
                </div>
                <h2 className="text-xl font-black text-opti-text">
                  {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </h2>
                <p className="mt-1 text-xs text-opti-text/60">
                  {mode === 'login'
                    ? 'ادخل بياناتك عشان تكمل محادثاتك'
                    : 'سجّل عشان التطبيق يفتكر تقدمك ومحادثاتك'}
                </p>
              </div>
            </div>

            {/* ===== Form ===== */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
              {/* الاسم — بس في التسجيل */}
              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-opti-text/70 mb-1.5">الاسم</label>
                  <div className="relative">
                    <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-opti-text/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك الكامل"
                      required
                      autoFocus
                      className="w-full rounded-xl opti-glass border border-opti-primary/20 bg-transparent pr-10 pl-4 py-3 text-sm text-opti-text placeholder:text-opti-text/35 focus:border-opti-primary/50 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-[11px] font-bold text-opti-text/70 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-opti-text/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    autoFocus={mode === 'login'}
                    className="w-full rounded-xl opti-glass border border-opti-primary/20 bg-transparent pr-10 pl-4 py-3 text-sm text-opti-text placeholder:text-opti-text/35 focus:border-opti-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* رقم الهاتف — بس في التسجيل */}
              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-opti-text/70 mb-1.5">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-opti-text/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      required
                      className="w-full rounded-xl opti-glass border border-opti-primary/20 bg-transparent pr-10 pl-4 py-3 text-sm text-opti-text placeholder:text-opti-text/35 focus:border-opti-primary/50 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* كلمة السر */}
              <div>
                <label className="block text-[11px] font-bold text-opti-text/70 mb-1.5">كلمة السر</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-opti-text/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? '6 حروف على الأقل' : 'كلمة السر'}
                    required
                    minLength={mode === 'register' ? 6 : undefined}
                    className="w-full rounded-xl opti-glass border border-opti-primary/20 bg-transparent pr-10 pl-4 py-3 text-sm text-opti-text placeholder:text-opti-text/35 focus:border-opti-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* زرار الإرسال */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all',
                  loading
                    ? 'opti-glass text-opti-text/50 cursor-not-allowed'
                    : 'opti-primary-gradient text-white opti-glow hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    <span>{mode === 'login' ? 'دخول' : 'تسجيل'}</span>
                  </>
                )}
              </button>

              {/* تبديل بين تسجيل دخول وتسجيل جديد */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-xs text-opti-text/60 hover:text-opti-accent transition-colors"
                >
                  {mode === 'login' ? (
                    <>محقكش حساب؟ <span className="font-bold text-opti-accent">سجّل جديد</span></>
                  ) : (
                    <>عندك حساب؟ <span className="font-bold text-opti-accent">سجّل دخول</span></>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
