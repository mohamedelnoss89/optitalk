// ===== OptiTalk - Main App Page (بعد تسجيل الدخول) =====
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { WelcomeScreen } from '@/components/optitalk/WelcomeScreen';
import { OnboardingScreen } from '@/components/optitalk/OnboardingScreen';
import { ChatScreen } from '@/components/optitalk/ChatScreen';
import { TeacherSelectionScreen } from '@/components/optitalk/TeacherSelectionScreen';

export default function AppPage() {
  const router = useRouter();
  const currentScreen = useStore((s) => s.currentScreen);
  const user = useStore((s) => s.user);
  const selectedTeacher = useStore((s) => s.selectedTeacher);
  const messages = useStore((s) => s.messages);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const setScreen = useStore((s) => s.setScreen);
  const setAuthUser = useStore((s) => s.setAuthUser);

  const userNavigatedToWelcomeRef = useRef(false);
  const [authorized, setAuthorized] = useState(false);

  // لو المستخدم مش مسجل دخول → روح لـ /login
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('optitalk-store-v6');
      if (!stored) {
        router.push('/login');
        return;
      }
      const data = JSON.parse(stored);
      // Zustand persist بيخزّن الـ state في شكل {state: {...}} أو مباشرة
      const state = data?.state || data;
      if (!state?.isAuthenticated || !state?.authUser) {
        router.push('/login');
        return;
      }
      // لو الـ store مش محدّث → حدّثه
      if (!isAuthenticated && state.authUser) {
        setAuthUser(state.authUser);
      }
      setAuthorized(true);
    } catch {
      router.push('/login');
    }
  }, [router, isAuthenticated, setAuthUser]);

  // ===== التحقق عند تحميل التطبيق =====
  useEffect(() => {
    if (!authorized) return;
    const timer = setTimeout(() => {
      if (userNavigatedToWelcomeRef.current && currentScreen === 'welcome') {
        return;
      }

      if (user && selectedTeacher) {
        if (currentScreen !== 'chat' && currentScreen !== 'welcome' && currentScreen !== 'teacher-select' && currentScreen !== 'onboarding') {
          setScreen('chat');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, selectedTeacher, currentScreen, isAuthenticated, setScreen, authorized]);

  // ===== رصد لو المستخدم راح welcome يدوياً =====
  useEffect(() => {
    if (currentScreen === 'welcome' && isAuthenticated) {
      userNavigatedToWelcomeRef.current = true;
    }
    if (currentScreen !== 'welcome') {
      userNavigatedToWelcomeRef.current = false;
    }
  }, [currentScreen, isAuthenticated]);

  // ===== loading screen لحد ما نتأكد إن المستخدم مسجل =====
  if (!authorized) {
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

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-md bg-background">
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
    </div>
  );
}
