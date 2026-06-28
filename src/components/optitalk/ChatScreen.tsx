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

  // Speech synthesis — pick voice matching teacher gender
  // متوافق مع الموبايل: بـ unlock على أول user interaction
  const synthesis = useSpeechSynthesis({
    lang: 'en-US',
    rate: 0.9,
    pitch: 1,
    preferGender: selectedTeacher?.gender,
    onStart: () => {
      setSpeaking(true);
    },
    onEnd: () => {
      setSpeaking(false);
      setSpeakingId(null);
    },
  });

  // ===== Unlock speech on first user interaction (iOS Safari) =====
  useEffect(() => {
    if (!synthesis.supported) return;
    const unlock = () => {
      synthesis.unlock();
      // Remove listeners after first unlock
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [synthesis]);

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
    // Speak the greeting — try immediately, with retries for mobile
    // (mobile browsers may block speech until user has interacted with the page)
    const trySpeak = (attempt: number) => {
      speakText(greeting.content, greeting.id);
      // Fallback visual: keep "Speaking" state for the estimated duration
      const wordCount = greeting.content.split(/\s+/).length;
      const estimatedDuration = Math.max(3000, wordCount * 350);
      setSpeaking(true);
      setSpeakingId(greeting.id);
      setTimeout(() => {
        if (useStore.getState().isSpeaking) {
          setSpeaking(false);
          setSpeakingId(null);
        }
      }, estimatedDuration);
    };

    // First attempt after short delay
    setTimeout(() => trySpeak(1), 400);
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

        // Speak the reply - visually mark as speaking even if audio fails
        setTimeout(() => {
          speakText(aiMsg.content, aiMsg.id);
          // Fallback: force speaking state for at least the duration of the message
          // (in case speechSynthesis is not supported or blocked by browser)
          const wordCount = aiMsg.content.split(/\s+/).length;
          const estimatedDuration = Math.max(2000, wordCount * 350); // ~350ms per word
          setSpeaking(true);
          setSpeakingId(aiMsg.id);
          // Clear after estimated duration if still speaking (handles no-audio case)
          setTimeout(() => {
            if (useStore.getState().isSpeaking) {
              setSpeaking(false);
              setSpeakingId(null);
            }
          }, estimatedDuration);
        }, 150);
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
    // Unlock speech synthesis on this user gesture (mobile fix)
    synthesis.unlock();

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
      // Unlock speech on this user gesture (mobile fix)
      synthesis.unlock();
      speakText(msg.content, msg.id);
      // Fallback visual: keep "Speaking" state for the estimated duration
      const wordCount = msg.content.split(/\s+/).length;
      const estimatedDuration = Math.max(2000, wordCount * 350);
      setSpeaking(true);
      setSpeakingId(msg.id);
      setTimeout(() => {
        if (useStore.getState().isSpeaking) {
          setSpeaking(false);
          setSpeakingId(null);
        }
      }, estimatedDuration);
    },
    [speakText, setSpeaking, setSpeakingId, synthesis]
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

      {/* ===== المدرس - فوق (50% من الشاشة) ===== */}
      <section className="relative z-10" style={{ height: '50%' }}>
        <TeacherAvatar
          teacher={selectedTeacher}
          isSpeaking={isSpeaking}
          isThinking={isAiThinking}
          isListening={isListening}
        />
      </section>

      {/* ===== الطالب - تحت (50% من الشاشة) ===== */}
      <section className="relative z-10 flex-1 overflow-hidden">
        <StudentCamera
          enabled={cameraEnabled}
          onToggle={handleToggleCamera}
          compact={false}
        />

        {/* ===== آخر رسالة - overlay فوق كاميرا الطالب ===== */}
        {messages.length > 0 && (
          <div className="pointer-events-none absolute top-2 left-2 right-2 z-20">
            <LastMessageBubble
              message={messages[messages.length - 1]}
              isThinking={isAiThinking}
              speakingId={speakingId}
              onReplay={handleReplay}
            />
          </div>
        )}

        {/* ===== التحكم - overlaid تحت في آخر الشاشة ===== */}
        <div className="absolute bottom-0 inset-x-0 z-30">
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
        </div>
      </section>

      {/* ===== Settings sheet ===== */}
      <AnimatePresence>
        {showSettings && (
          <SettingsSheet
            onClose={() => setShowSettings(false)}
            onReset={() => {
              setShowSettings(false);
              handleEnd();
            }}
            cameraEnabled={cameraEnabled}
            onToggleCamera={handleToggleCamera}
            points={points}
            streak={streak}
            achievements={achievements}
            teacherName={selectedTeacher.nameAr}
          />
        )}
      </AnimatePresence>

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

// ===== آخر رسالة - overlay فوق كاميرا الطالب =====
function LastMessageBubble({
  message,
  isThinking,
  speakingId,
  onReplay,
}: {
  message: ChatMessage;
  isThinking: boolean;
  speakingId: string | null;
  onReplay: (m: ChatMessage) => void;
}) {
  const isUser = message.role === 'user';
  const isSpeaking = speakingId === message.id;

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="pointer-events-auto mx-auto max-w-[90%]"
    >
      <div
        className={cn(
          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-lg backdrop-blur-md',
          isUser
            ? 'rounded-br-md opti-primary-gradient text-white'
            : 'rounded-bl-md bg-black/70 text-white border border-white/15'
        )}
      >
        <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wide opacity-70">
          {isUser ? 'You' : 'Teacher'}
          {isThinking && !isUser && ' • typing...'}
        </div>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* تصحيح */}
        {!isUser && message.correction && (
          <div className="mt-1.5 rounded-lg bg-opti-gold/15 border border-opti-gold/30 px-2 py-1.5">
            <div className="text-[9px] font-bold text-opti-gold">تصحيح</div>
            <p className="text-[11px] text-opti-text/90" dir="rtl">{message.correction}</p>
          </div>
        )}

        {/* ترجمة */}
        {!isUser && message.translatedWord && (
          <div className="mt-1 text-[10px] text-white/70" dir="rtl">
            🌐 {message.translatedWord}
          </div>
        )}

        {/* زرار استمع تاني */}
        {!isUser && (
          <button
            onClick={() => onReplay(message)}
            className={cn(
              'mt-1.5 flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold transition-all hover:bg-white/20',
              isSpeaking && 'text-opti-accent'
            )}
          >
            <Volume2 className={cn('h-2.5 w-2.5', isSpeaking && 'animate-pulse')} />
            {isSpeaking ? 'speaking...' : 'replay'}
          </button>
        )}
      </div>
    </motion.div>
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

function SettingsSheet({
  onClose,
  onReset,
  cameraEnabled,
  onToggleCamera,
  points,
  streak,
  achievements,
  teacherName,
}: {
  onClose: () => void;
  onReset: () => void;
  cameraEnabled: boolean;
  onToggleCamera: () => void;
  points: number;
  streak: number;
  achievements: string[];
  teacherName: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0a0e1a]/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl opti-glass border-t border-opti-primary/20 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-opti-text/20" />

        <h3 className="mb-4 text-lg font-black text-opti-text">الإعدادات</h3>

        {/* Stats summary */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <MiniStat value={points} label="نقطة" color="text-opti-gold" />
          <MiniStat value={streak} label="streak" color="text-opti-error" />
          <MiniStat value={achievements.length} label="إنجاز" color="text-opti-accent" />
        </div>

        {/* Camera toggle */}
        <button
          onClick={onToggleCamera}
          className={cn(
            'mb-2 flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all',
            cameraEnabled ? 'opti-glass-teal' : 'opti-glass'
          )}
        >
          <span className="text-sm font-semibold text-opti-text">الكاميرا</span>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-bold',
              cameraEnabled ? 'bg-opti-accent text-[#0a0e1a]' : 'bg-opti-text/15 text-opti-text/60'
            )}
          >
            {cameraEnabled ? 'تعمل' : 'مطفية'}
          </span>
        </button>

        {/* Achievements preview */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-bold text-opti-text/70">الإنجازات</div>
          <div className="grid grid-cols-4 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const earned = achievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl p-2 text-center',
                    earned ? 'opti-glass-teal' : 'opti-glass opacity-40 grayscale'
                  )}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-[8px] leading-tight text-opti-text/70">{a.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* End session */}
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-opti-error/15 px-4 py-3 text-sm font-bold text-opti-error transition-all hover:bg-opti-error/25"
        >
          <LogOut className="h-4 w-4" />
          إنهاء المحادثة والعودة
        </button>

        <div className="mt-3 text-center text-[10px] text-opti-text/40">
          المدرس: {teacherName} • OptiTalk من opti-group
        </div>
      </motion.div>
    </motion.div>
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
