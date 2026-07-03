// ===== OptiTalk - Chat Screen (main) =====
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Flame, Trophy, LogOut, Settings2, Volume2 } from 'lucide-react';
import { useStore, type ChatMessage } from '@/lib/store';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { TeacherAvatar } from './TeacherAvatar';
import { StudentCamera } from './StudentCamera';
import { MessagesList } from './MessagesList';
import { ControlBar } from './ControlBar';
import { SettingsSheet } from './SettingsSheet';
import { ACHIEVEMENTS } from '@/lib/teachers';
import { cn } from '@/lib/utils';

export function ChatScreen() {
  const {
    user,
    selectedTeacher,
    messages,
    isListening,
    isSpeaking,
    isAiThinking,
    cameraEnabled,
    points,
    streak,
    achievements,
    showAchievement,
    speechLang,
    addMessage,
    clearMessages,
    setListening,
    setSpeaking,
    setAiThinking,
    setCameraEnabled,
    setScreen,
    setShowAchievement,
    setSpeechLang,
    addPoints,
    bumpPerfectStreak,
    resetPerfectStreak,
    addAchievement,
  } = useStore();

  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const greetingSentRef = useRef(false);
  const convIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition - يدعم العربية والإنجليزية
  const recognitionLang = speechLang === 'ar' ? 'ar-EG' : 'en-US';
  const recognition = useSpeechRecognition({
    lang: recognitionLang,
    onFinal: (transcript) => {
      setListening(false);
      void handleSendMessage(transcript);
    },
    onError: (err) => {
      setListening(false);
      if (err === 'not-allowed') {
        toast.error('محتاجين إذن الميكروفون عشان تتكلم');
      } else if (err !== 'no-speech' && err !== 'aborted') {
        toast.error(`مشكلة في الاستماع: ${err}`);
      }
    },
  });

  // Speech synthesis — isSpeaking بيتتحكم فيه بس من audio events
  const synthesis = useSpeechSynthesis({
    lang: 'en-US',
    rate: 0.9,
    pitch: 1,
    preferGender: selectedTeacher?.gender,
    onStart: () => {
      // audio.onplay fire → set speaking
      setSpeaking(true);
    },
    onEnd: () => {
      // audio.onended fire → set not speaking
      setSpeaking(false);
      setSpeakingId(null);
    },
  });

  // ===== Speak helper =====
  const speakText = useCallback(
    (text: string, msgId?: string) => {
      if (!synthesis.supported) return;
      // Strip parenthetical Arabic translations from spoken text
      const clean = text.replace(/\([^)]*\)/g, '').replace(/[""]/g, '').trim();
      if (clean) {
        if (msgId) setSpeakingId(msgId);
        synthesis.speak(clean);
      }
    },
    [synthesis]
  );

  // ===== Send greeting on first load =====
  useEffect(() => {
    if (!selectedTeacher || greetingSentRef.current) return;
    greetingSentRef.current = true;

    const greeting: ChatMessage = {
      id: `greeting-${Date.now()}`,
      role: 'assistant',
      content: selectedTeacher.greeting,
      correction: null,
      translatedWord: null,
      createdAt: Date.now(),
    };
    addMessage(greeting);
    // Speak the greeting after a brief delay
    setTimeout(() => speakText(greeting.content, greeting.id), 400);
  }, [selectedTeacher]);

  // ===== Cleanup speech on unmount =====
  useEffect(() => {
    return () => {
      synthesis.cancel();
    };
  }, []);

  // ===== Send message to API =====
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!user || !selectedTeacher || !text.trim()) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        correction: null,
        translatedWord: null,
        createdAt: Date.now(),
      };
      addMessage(userMsg);
      addPoints(1);
      setAiThinking(true);
      // Stop any ongoing speech when user starts talking
      synthesis.cancel();
      setSpeaking(false);
      setSpeakingId(null);

      try {
        const history = messages
          .filter((m) => m.id !== `greeting-${m.createdAt}`) // exclude greeting from API history? keep it actually
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            teacher: selectedTeacher,
            user,
            conversationHistory: history,
            conversationId: convIdRef.current,
            inputLang: speechLang,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.conversationId) {
          convIdRef.current = data.conversationId;
        }

        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || "I'm sorry, could you say that again?",
          correction: data.correction ?? null,
          translatedWord: data.translatedWord ?? null,
          createdAt: Date.now() + 1,
        };
        addMessage(aiMsg);
        addPoints(2);

        // Track perfect streak for achievements
        if (data.correction) {
          resetPerfectStreak();
        } else {
          bumpPerfectStreak();
        }

        // Speak the reply
        setTimeout(() => speakText(aiMsg.content, aiMsg.id), 150);
      } catch (err) {
        console.error('[OptiTalk] Chat error:', err);
        toast.error('مشكلة في الاتصال بالمدرس. حاول تاني');
        const errMsg: ChatMessage = {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: "I'm sorry, I had trouble hearing you. Could you say that again?",
          correction: null,
          translatedWord: null,
          createdAt: Date.now() + 1,
        };
        addMessage(errMsg);
      } finally {
        setAiThinking(false);
      }
    },
    [user, selectedTeacher, messages, addMessage, addPoints, setAiThinking, synthesis, speakText, resetPerfectStreak, bumpPerfectStreak, speechLang]
  );

  // ===== Mic toggle =====
  const handleMicToggle = useCallback(() => {
    if (!recognition.supported) {
      toast.error('المتصفح مش بيدعم التعرف على الصوت. استخدم الكتابة');
      return;
    }
    if (isSpeaking) {
      synthesis.cancel();
      setSpeaking(false);
      setSpeakingId(null);
      return;
    }
    if (isListening) {
      recognition.stop();
      setListening(false);
    } else {
      synthesis.cancel();
      setSpeaking(false);
      setSpeakingId(null);
      setListening(true);
      recognition.start();
    }
  }, [recognition, isListening, isSpeaking, synthesis, setListening, setSpeaking]);

  const handleStopSpeaking = useCallback(() => {
    synthesis.cancel();
    setSpeaking(false);
    setSpeakingId(null);
  }, [synthesis, setSpeaking]);

  // ===== End conversation =====
  const handleEnd = useCallback(() => {
    synthesis.cancel();
    recognition.stop();
    setListening(false);
    setSpeaking(false);
    setAiThinking(false);
    setSpeakingId(null);
    toast.success('انتهت المحادثة. شكراً لك! 🎓');
    setScreen('welcome');
    setTimeout(() => {
      clearMessages();
      greetingSentRef.current = false;
      convIdRef.current = null;
    }, 300);
  }, [synthesis, recognition, setListening, setSpeaking, setAiThinking, setScreen, clearMessages]);

  // ===== Replay a message =====
  const handleReplay = useCallback(
    (msg: ChatMessage) => {
      speakText(msg.content, msg.id);
    },
    [speakText]
  );

  // ===== Toggle camera =====
  const handleToggleCamera = useCallback(() => {
    setCameraEnabled(!cameraEnabled);
  }, [cameraEnabled, setCameraEnabled]);

  if (!selectedTeacher || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center opti-gradient">
        <button
          onClick={() => setScreen('onboarding')}
          className="rounded-xl opti-primary-gradient px-6 py-3 font-bold text-white"
        >
          ابدأ الإعداد
        </button>
      </div>
    );
  }

  const currentAchievement = showAchievement
    ? ACHIEVEMENTS.find((a) => a.id === showAchievement)
    : null;

  return (
    <div className="relative flex h-[100dvh] flex-col opti-gradient overflow-hidden">
      {/* ===== Header (صغير فوق) ===== */}
      <header className="z-20 flex items-center justify-between px-3 py-1.5 pt-[max(0.4rem,env(safe-area-inset-top))]">
        <button
          onClick={handleEnd}
          className="flex h-7 w-7 items-center justify-center rounded-lg opti-glass text-opti-text/60 hover:text-opti-error"
          aria-label="إنهاء"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2">
          <StatPill icon={<Flame className="h-3 w-3" />} value={streak} color="text-opti-error" />
          <StatPill icon={<Trophy className="h-3 w-3" />} value={points} color="text-opti-gold" />
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex h-7 w-7 items-center justify-center rounded-lg opti-glass text-opti-text/60 hover:text-opti-text"
          aria-label="الإعدادات"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* ===== المدرس - 35% من الشاشة ===== */}
      <section className="relative z-10 shrink-0" style={{ height: '35%', flexShrink: 0 }}>
        <TeacherAvatar
          teacher={selectedTeacher}
          isSpeaking={isSpeaking}
          isThinking={isAiThinking}
          isListening={isListening}
        />
      </section>

      {/* ===== الطالب + المحادثة + التحكم - 65% ===== */}
      <section className="relative z-10 flex flex-col overflow-hidden" style={{ height: '65%', flexShrink: 0 }}>
        {/* كاميرا الطالب */}
        <div className="relative flex-1 min-h-0">
          <StudentCamera
            enabled={cameraEnabled}
            onToggle={handleToggleCamera}
            compact={false}
          />
        </div>

        {/* المحادثة */}
        <div className="overflow-hidden px-2 shrink-0" style={{ height: '90px' }}>
          <MessagesList
            messages={messages}
            isThinking={isAiThinking}
            onReplay={handleReplay}
            speakingId={speakingId}
          />
        </div>

        {/* زرار التحكم */}
        <ControlBar
          isListening={isListening}
          isSpeaking={isSpeaking}
          isAiThinking={isAiThinking}
          speechSupported={recognition.supported}
          interim={recognition.interim}
          speechLang={speechLang}
          onToggleLang={() => setSpeechLang(speechLang === 'ar' ? 'en' : 'ar')}
          onMicToggle={handleMicToggle}
          onStopSpeaking={handleStopSpeaking}
          onEndConversation={handleEnd}
          onSendText={(text) => void handleSendMessage(text)}
        />
      </section>

      {/* ===== Settings sheet ===== */}
      <SettingsSheet
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onReset={() => {
          setShowSettings(false);
          handleEnd();
        }}
      />

      {/* ===== Achievement popup ===== */}
      <AnimatePresence>
        {currentAchievement && (
          <AchievementPopup
            key={currentAchievement.id}
            achievement={currentAchievement}
            onClose={() => setShowAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatPill({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg opti-glass px-2 py-1">
      <span className={color}>{icon}</span>
      <span className="text-xs font-black text-opti-text">{value}</span>
    </div>
  );
}

function MiniStat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-xl opti-glass p-3 text-center">
      <div className={cn('text-xl font-black', color)}>{value}</div>
      <div className="text-[9px] text-opti-text/55">{label}</div>
    </div>
  );
}

function AchievementPopup({
  achievement,
  onClose,
}: {
  achievement: { id: string; name: string; description: string; icon: string; points: number };
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e1a]/80 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.3, opacity: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className="opti-bounce-in relative flex flex-col items-center gap-3 rounded-3xl opti-glass-teal border border-opti-gold/40 p-6 text-center opti-glow-gold"
      >
        {/* Confetti emojis */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {['🎉', '⭐', '✨', '🏆', '💫'].map((e, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              {e}
            </motion.span>
          ))}
        </div>

        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full opti-gold-gradient opti-glow-gold text-4xl">
            {achievement.icon}
          </div>
        </div>
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-widest text-opti-gold">
            إنجاز جديد!
          </div>
          <div className="mt-1 text-lg font-black text-opti-text">{achievement.name}</div>
          <div className="mt-1 text-xs text-opti-text/70">{achievement.description}</div>
          {achievement.points > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full opti-glass px-3 py-1 text-xs font-bold text-opti-gold">
              <Volume2 className="h-3 w-3" />
              +{achievement.points} نقطة
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="relative mt-2 rounded-xl opti-gold-gradient px-6 py-2 text-sm font-bold text-[#0a0e1a]"
        >
          حلو! يلا نكمّل
        </button>
      </motion.div>
    </motion.div>
  );
}
