// ===== OptiTalk - Main Page =====
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { WelcomeScreen } from '@/components/optitalk/WelcomeScreen';
import { OnboardingScreen } from '@/components/optitalk/OnboardingScreen';
import { ChatScreen } from '@/components/optitalk/ChatScreen';
import { TeacherSelectionScreen } from '@/components/optitalk/TeacherSelectionScreen';

export default function Home() {
  const currentScreen = useStore((s) => s.currentScreen);
  const user = useStore((s) => s.user);
  const selectedTeacher = useStore((s) => s.selectedTeacher);
  const messages = useStore((s) => s.messages);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const setScreen = useStore((s) => s.setScreen);

  // ===== flag عشان نمنع الـ redirect التلقائي بعد ما المستخدم يروح لـ welcome يدوياً =====
  const userNavigatedToWelcomeRef = useRef(false);

  // ===== المنطق البسيط =====
  // أي حد يفتح optitalk.vercel.app → يروح على صفحة التنزيل (/install)
  // لو المستخدم مسجل دخول → يفتح التطبيق على طول
  const [showApp, setShowApp] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // اقرأ حالة المستخدم من localStorage
    const stored = localStorage.getItem('optitalk-store-v6');
    let isAuthenticated = false;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        isAuthenticated = parsed?.state?.isAuthenticated === true && !!parsed?.state?.authUser;
      } catch {}
    }

    if (isAuthenticated) {
      // لو مسجل → افتح التطبيق على طول
      setShowApp(true);
    } else {
      // غير كده → روح لصفحة التنزيل
      setRedirect('/install');
    }
  }, []);

  // نفّذ الـ redirect
  useEffect(() => {
    if (redirect) {
      window.location.href = redirect;
    }
  }, [redirect]);

  // ===== التحقق عند تحميل التطبيق =====
  useEffect(() => {
    if (!showApp) return;
    const timer = setTimeout(() => {
      // ===== الحالات =====
      // ===== تسجيل الدخول معطل مؤقتاً =====
      // لو المستخدم راح welcome يدوياً (عبر زرار الصفحة الرئيسية) → سيبه هناك
      if (userNavigatedToWelcomeRef.current && currentScreen === 'welcome') {
        return;
      }

      // لو فيه user + teacher → روح للـ chat
      if (user && selectedTeacher) {
        if (currentScreen !== 'chat' && currentScreen !== 'welcome' && currentScreen !== 'teacher-select' && currentScreen !== 'onboarding') {
          setScreen('chat');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, selectedTeacher, currentScreen, isAuthenticated, setScreen, showApp]);

  // ===== رصد لو المستخدم راح welcome يدوياً =====
  useEffect(() => {
    if (currentScreen === 'welcome' && isAuthenticated) {
      userNavigatedToWelcomeRef.current = true;
    }
    // لما يخرج من welcome، نسمح بالـ redirect تاني
    if (currentScreen !== 'welcome') {
      userNavigatedToWelcomeRef.current = false;
    }
  }, [currentScreen, isAuthenticated]);

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-md bg-background">
      {!showApp ? (
        // ===== loading screen لحد ما نحدد نعرض التطبيق ولا نعمل redirect =====
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
      ) : (
        <AnimatePresence mode="wait">
          {currentScreen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen />
          </motion.div>
        )}

        {currentScreen === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <OnboardingScreen />
          </motion.div>
        )}

        {currentScreen === 'chat' && (
          <motion.div
            key={`chat-${selectedTeacher?.id || 'no-teacher'}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <ChatScreen />
          </motion.div>
        )}

        {currentScreen === 'teacher-select' && (
          <motion.div
            key="teacher-select"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <TeacherSelectionScreen />
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </div>
  );
}
