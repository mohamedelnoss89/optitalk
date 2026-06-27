// ===== OptiTalk - Main Page =====
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { WelcomeScreen } from '@/components/optitalk/WelcomeScreen';
import { OnboardingScreen } from '@/components/optitalk/OnboardingScreen';
import { ChatScreen } from '@/components/optitalk/ChatScreen';

export default function Home() {
  const currentScreen = useStore((s) => s.currentScreen);

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
      </AnimatePresence>
    </div>
  );
}
