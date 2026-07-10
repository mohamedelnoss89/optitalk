// ===== OptiTalk - Welcome Screen =====
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mic, MessageCircle, ArrowLeft, RotateCcw, History, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { STAGE_INFO } from '@/lib/greetings';
import { AuthDialog } from './AuthDialog';

export function WelcomeScreen() {
  const setScreen = useStore((s) => s.setScreen);
  const user = useStore((s) => s.user);
  const selectedTeacher = useStore((s) => s.selectedTeacher);
  const messages = useStore((s) => s.messages);
  const messagesCount = useStore((s) => s.messagesCount);
  const learningStage = useStore((s) => s.learningStage);
  const clearMessages = useStore((s) => s.clearMessages);
  const authUser = useStore((s) => s.authUser);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const logout = useStore((s) => s.logout);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // ===== لو فيه user + رسائل محفوظة → اعرض "كمل المحادثة" =====
  const hasSavedConversation = user && selectedTeacher && messages.length > 0;
  const hasUser = user && selectedTeacher;

  const handleContinue = () => {
    setScreen('chat');
  };

  const handleNewConversation = () => {
    clearMessages();
    // روح لشاشة اختيار المدرس
    setScreen('teacher-select');
  };

  const handleStart = () => {
    // لو مش مسجل → افتح الـ auth dialog
    if (!isAuthenticated) {
      setAuthMode('register');
      setAuthOpen(true);
      return;
    }
    setScreen('onboarding');
  };

  const handleLogin = () => {
    setAuthMode('login');
    setAuthOpen(true);
  };

  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      logout();
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden opti-gradient px-6 py-10">
      {/* Floating blobs background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="opti-blob-1 absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 70%)' }}
        />
        <div
          className="opti-blob-2 absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00CEC9 0%, transparent 70%)' }}
        />
        <div
          className="opti-blob-1 absolute top-1/3 left-1/4 h-48 w-48 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #D4A03C 0%, transparent 70%)' }}
        />
      </div>

      {/* ===== Top auth buttons (يمين الشاشة) ===== */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 rounded-full opti-glass px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full opti-primary-gradient text-[10px] font-bold text-white">
                {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-[11px] font-bold text-opti-text">{authUser?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-full opti-glass text-opti-text/60 hover:text-opti-error transition-colors"
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 rounded-full opti-glass px-3 py-1.5 text-[11px] font-bold text-opti-text/80 hover:text-opti-text transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>دخول</span>
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthOpen(true); }}
              className="flex items-center gap-1.5 rounded-full opti-primary-gradient px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>تسجيل</span>
            </button>
          </>
        )}
      </div>

      {/* Top brand badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8 flex items-center gap-2 rounded-full opti-glass px-4 py-2"
      >
        <span className="text-xs font-semibold tracking-wide text-opti-text/80">
          من opti-group
        </span>
        <Sparkles className="h-3.5 w-3.5 text-opti-gold" />
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 mb-6"
      >
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Halo */}
          <div className="absolute inset-0 rounded-[2rem] opacity-30 blur-2xl" style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 70%)' }} />
          {/* الشعار */}
          <img
            src="/logo.png"
            alt="OptiTalk"
            className="relative h-28 w-28 rounded-[1.5rem] object-cover opti-glow"
          />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="relative z-10 text-center text-4xl font-black tracking-tight"
      >
        <span className="opti-text-gradient">OptiTalk</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-10 mt-3 max-w-xs text-center text-base font-medium leading-relaxed text-opti-text/75"
      >
        تعلّم الإنجليزية بالمحادثة الحية مع مدرسك AI الشخصي
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-10 mt-8 grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <FeaturePill
          icon={<MessageCircle className="h-4 w-4" />}
          title="محادثة فورية"
          desc="تحدث وردّ المدرس"
        />
        <FeaturePill
          icon={<Mic className="h-4 w-4" />}
          title="صوت حي"
          desc="استمع وتكلم بصوتك"
        />
        <FeaturePill
          icon={<Sparkles className="h-4 w-4" />}
          title="تصحيح فوري"
          desc="أخطاؤك تتصلح لحظياً"
        />
      </motion.div>

      {/* CTA — يتغير حسب حالة المستخدم */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="relative z-10 mt-10 w-full max-w-sm space-y-3"
      >
        {hasSavedConversation ? (
          <>
            {/* ===== مستخدم راجع بمحادثة محفوظة ===== */}
            <div className="rounded-2xl opti-glass p-4 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={`/teachers/${selectedTeacher?.id}.png`}
                  alt={selectedTeacher?.nameAr || ''}
                  className="h-12 w-12 rounded-xl object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-opti-text">
                    أهلاً يا {user?.name}! 👋
                  </div>
                  <div className="text-[11px] text-opti-text/60">
                    {selectedTeacher?.nameAr} في انتظارك
                    {user?.level === 'beginner' && (
                      <> • المرحلة {learningStage}/5 {STAGE_INFO[learningStage]?.emoji}</>
                    )}
                  </div>
                  <div className="text-[10px] text-opti-text/45 mt-0.5">
                    {messagesCount} رسالة في كل محادثاتك
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl opti-primary-gradient px-6 py-4 text-base font-bold text-white opti-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <History className="h-5 w-5" />
              <span>كمل المحادثة ({messages.length} رسالة)</span>
            </button>
            <button
              onClick={handleNewConversation}
              className="flex w-full items-center justify-center gap-2 rounded-2xl opti-glass px-6 py-3 text-sm font-bold text-opti-text/70 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>ابدأ محادثة جديدة</span>
            </button>
          </>
        ) : hasUser ? (
          <>
            {/* ===== مستخدم بدون محادثة محفوظة ===== */}
            <div className="rounded-2xl opti-glass p-4 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={`/teachers/${selectedTeacher?.id}.png`}
                  alt={selectedTeacher?.nameAr || ''}
                  className="h-12 w-12 rounded-xl object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-opti-text">
                    أهلاً يا {user?.name}! 👋
                  </div>
                  <div className="text-[11px] text-opti-text/60">
                    {selectedTeacher?.nameAr} جاهز يبدأ معاك
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl opti-primary-gradient px-6 py-4 text-base font-bold text-white opti-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>ابدأ المحادثة</span>
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
          </>
        ) : (
          <>
            {/* ===== مستخدم جديد ===== */}
            <button
              onClick={handleStart}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl opti-primary-gradient px-6 py-4 text-base font-bold text-white opti-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>ابدأ الآن</span>
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
            <p className="text-center text-xs text-opti-text/50">
              مجاني • بدون تسجيل • ابدأ خلال 30 ثانية
            </p>
          </>
        )}
      </motion.div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="relative z-10 mt-10 flex items-center gap-6 text-center"
      >
        <Stat value="6" label="مدرسين" />
        <div className="h-8 w-px bg-opti-text/15" />
        <Stat value="3" label="مستويات" />
        <div className="h-8 w-px bg-opti-text/15" />
        <Stat value="∞" label="محادثات" />
      </motion.div>

      {/* ===== Auth Dialog ===== */}
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        mode={authMode}
        onSuccess={() => {
          // بعد التسجيل/الدخول، روح للـ onboarding
          setScreen('onboarding');
        }}
      />
    </div>
  );
}

function FeaturePill({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl opti-glass p-3 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl opti-glass-teal text-opti-accent">
        {icon}
      </div>
      <div className="text-xs font-bold text-opti-text">{title}</div>
      <div className="text-[10px] leading-tight text-opti-text/55">{desc}</div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-black opti-text-gradient">{value}</div>
      <div className="text-[10px] font-medium text-opti-text/55">{label}</div>
    </div>
  );
}
