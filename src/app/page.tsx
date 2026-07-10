// ===== OptiTalk - Main Page =====
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
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

  // ===== التحقق عند تحميل التطبيق =====
  useEffect(() => {
    const timer = setTimeout(() => {
      // ===== الحالات =====
      // 1. مش مسجل → welcome (يفضل there)
      // 2. مسجل + فيه user + teacher → chat
      // 3. مسجل + فيه user بس مفيش teacher → onboarding
      // 4. مسجل + مفيش user → onboarding
      if (!isAuthenticated) {
        if (currentScreen !== 'welcome') {
          setScreen('welcome');
        }
        return;
      }

      // مسجل
      if (user && selectedTeacher) {
        if (currentScreen !== 'chat' && currentScreen !== 'welcome' && currentScreen !== 'teacher-select') {
          setScreen('chat');
        }
      } else if (currentScreen === 'welcome') {
        // لو مسجل بس لسه على welcome، سيبه يختار بنفسه
        // مش نروح onboarding تلقائياً عشان يقدر يشوف الـ welcome
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, selectedTeacher, currentScreen, isAuthenticated, setScreen]);

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
            key="chat"
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
