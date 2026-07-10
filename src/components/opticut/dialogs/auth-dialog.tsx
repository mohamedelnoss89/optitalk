'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Chrome, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('اكمل الإيميل والباسورد');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      toast.error('اكتب اسمك');
      return;
    }

    setIsLoading(true);

    try {
      // محاكاة تسجيل الدخول - في الإنتاج نربطها بقاعدة بيانات
      await new Promise((r) => setTimeout(r, 800));

      // نحفظ المستخدم في localStorage (مؤقتاً)
      const user = {
        id: email,
        email,
        name: name || email.split('@')[0],
        provider: 'credentials',
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem('opticut-user', JSON.stringify(user));

      toast.success(mode === 'login' ? 'تم تسجيل الدخول بنجاح' : 'تم إنشاء الحساب بنجاح');
      onOpenChange(false);

      // نعمل refresh للصفحة عشان يتحدث الـ header
      window.location.reload();
    } catch (error) {
      toast.error('فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // نوجه المستخدم لـ Google OAuth
    // في الإنتاج لازم نضيف GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET
    toast.info('جاري التحويل إلى Google...');

    // محاكاة Google login
    setTimeout(() => {
      const user = {
        id: 'google-user@example.com',
        email: 'google-user@example.com',
        name: 'مستخدم Google',
        provider: 'google',
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem('opticut-user', JSON.stringify(user));
      toast.success('تم تسجيل الدخول بحساب Google');
      onOpenChange(false);
      window.location.reload();
    }, 1000);

    // في الإنتاج:
    // window.location.href = '/api/auth/signin/google';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md overflow-hidden p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            {mode === 'login' ? <LogIn className="w-5 h-5 text-purple-400" aria-hidden="true" /> : <UserPlus className="w-5 h-5 text-purple-400" aria-hidden="true" />}
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-slate-100 text-black border-white"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            aria-label="تسجيل الدخول بحساب Google"
          >
            <Chrome className="w-4 h-4 ml-2" aria-hidden="true" />
            متابعة بحساب Google
          </Button>

          <div className="flex items-center gap-2" role="separator" aria-label="أو">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-slate-500">أو</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Name (signup only) */}
          {mode === 'signup' && (
            <div>
              <Label htmlFor="auth-name" className="text-slate-300 text-xs">الاسم</Label>
              <div className="relative mt-1">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <Input
                  id="auth-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك"
                  className="bg-slate-800 border-white/10 text-white pr-10"
                  required
                  aria-required="true"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <Label htmlFor="auth-email" className="text-slate-300 text-xs">الإيميل</Label>
            <div className="relative mt-1">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-slate-800 border-white/10 text-white pr-10"
                required
                aria-required="true"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="auth-password" className="text-slate-300 text-xs">كلمة المرور</Label>
            <div className="relative mt-1">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-800 border-white/10 text-white pr-10"
                required
                aria-required="true"
              />
            </div>
          </div>

          {/* زرار تسجيل الدخول - داخل الـ form مش في DialogFooter */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            aria-label={mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          >
            {isLoading ? 'جاري...' : (mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب')}
          </Button>

          <div className="text-center text-xs text-slate-400 pt-2">
            {mode === 'login' ? (
              <>
                ما عندكش حساب؟{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-purple-400 hover:text-purple-300 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
                  aria-label="إنشاء حساب جديد"
                >
                  سجّل الآن
                </button>
              </>
            ) : (
              <>
                عندك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-purple-400 hover:text-purple-300 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
                  aria-label="تسجيل الدخول"
                >
                  سجّل دخول
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
