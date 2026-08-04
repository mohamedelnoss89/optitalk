// ===== OptiTalk - Main App Page (بعد تسجيل الدخول) =====
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
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

  const userNavigatedToWelcomeRef = useRef(false);

  // لو المستخدم مش مسجل دخول → روح لـ /login
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('optitalk-store-v6');
      if (stored) {
        const data = JSON.parse(stored);
        if (!data?.state?.isAuthenticated || !data?.state?.authUser) {
          router.push('/login');
          return;
        }
      } else {
        router.push('/login');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }
  }, [router]);

  // ===== التحقق عند تحميل التطبيق =====
  useEffect(() => {
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
  }, [user, selectedTeacher, currentScreen, isAuthenticated, setScreen]);

  // ===== رصد لو المستخدم راح welcome يدوياً =====
  useEffect(() => {
    if (currentScreen === 'welcome' && isAuthenticated) {
      userNavigatedToWelcomeRef.current = true;
    }
    if (currentScreen !== 'welcome') {
      userNavigatedToWelcomeRef.current = false;
    }
  }, [currentScreen, isAuthenticated]);

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
