// ===== OptiTalk - Chat Screen (main) =====
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Flame, Trophy, LogOut, Settings2, Volume2, Home, Plus } from 'lucide-react';
import { useStore, type ChatMessage } from '@/lib/store';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useArabicSpeech } from '@/hooks/use-arabic-speech';
import { TeacherAvatar } from './TeacherAvatar';
import { StudentCamera } from './StudentCamera';
import { MessagesList } from './MessagesList';
import { ControlBar } from './ControlBar';
import { SettingsSheet } from './SettingsSheet';
import { ACHIEVEMENTS } from '@/lib/teachers';
import { getGreeting, STAGE_INFO, type GreetingContext } from '@/lib/greetings';
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
    // ===== التقدم والمرحلة =====
    learningStage,
    stageAttempts,
    messagesCount,
    lastGreetingIndex,
    conversationId,
    // ===== الكلمات اللي اتعلمت =====
    learnedWords,
    wordsSinceReview,
    inReviewMode,
    currentTargetWord,
    inSentenceBuilderMode,
    addMessage,
    clearMessages,
    setListening,
    setSpeaking,
    setAiThinking,
    setCameraEnabled,
    setScreen,
    setShowAchievement,
    setSpeechLang,
    setConversationId,
    setLastGreetingIndex,
    setLearningStage,
    addPoints,
    bumpPerfectStreak,
    resetPerfectStreak,
    addAchievement,
    bumpStageAttempts,
    advanceStage,
    addLearnedWord,
    setInReviewMode,
    setCurrentTargetWord,
    setInSentenceBuilderMode,
  } = useStore();

  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const greetingSentRef = useRef(false);
  const convIdRef = useRef<string | null>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition - لغة الميكروفون بتتحدد حسب اختيار المستخدم (عربي/إنجليزي)
  const recognitionLang = speechLang === 'ar' ? 'ar-EG' : 'en-US';
  const recognition = useSpeechRecognition({
    lang: recognitionLang,
    onListeningChange: (isListening) => {
      // ===== مزامنة تلقائية بين الـ hook والـ store =====
      setListening(isListening);
    },
    onFinal: (transcript, confidence) => {
      setListening(false);
      void handleSendMessage(transcript, confidence);
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

  // z-ai TTS hook — بس للإنجليزي الخالص، التحكم في isSpeaking بيتم في speakText
  const synthesis = useSpeechSynthesis({
    lang: 'en-US',
    rate: 0.9,
    pitch: 1,
    preferGender: selectedTeacher?.gender,
    onStart: () => {
      // z-ai TTS بدأ → isSpeaking = true
      setSpeaking(true);
    },
    onEnd: () => {
      // z-ai TTS خلص → isSpeaking = false
      setSpeaking(false);
      setSpeakingId(null);
    },
  });

  // ===== Arabic speech hook — Web Speech API + fallback إلى /api/tts-arabic =====
  // z-ai TTS مفيهاش أصوات عربي، فبنستخدم Web Speech API للعربي والخليط
  // لو مفيش أصوات عربي في المتصفح، بنرجع لـ /api/tts-arabic (espeak-ng على السيرفر)
  const arabicSpeech = useArabicSpeech({
    rate: 0.9,
    pitch: selectedTeacher?.gender === 'female' ? 1.15 : 0.9,
    gender: selectedTeacher?.gender,
    onStart: () => {
      console.log('[ChatScreen] المدرس بدأ ينطق عربي');
      setSpeaking(true);
    },
    onEnd: () => {
      console.log('[ChatScreen] المدرس خلص نطق عربي');
      setSpeaking(false);
      setSpeakingId(null);
    },
    onError: () => {
      console.error('[ChatScreen] خطأ في النطق العربي');
      setSpeaking(false);
      setSpeakingId(null);
    },
  });

  // ===== Speak helper =====
  // كل النطق بيتم هنا باستخدام Edge TTS (نفس الصوت دايماً)
  // Edge TTS بيتحكم في كل حاجة: عربي، إنجليزي، خليط — كله بنفس الصوت
  const speakText = useCallback(
    (text: string, msgId?: string) => {
      const clean = text.replace(/\([^)]*\)/g, '').replace(/[""]/g, '').trim();
      if (!clean) return;
      if (msgId) setSpeakingId(msgId);

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // أوقف أي نطق حالي
      arabicSpeech.cancel();
      synthesis.cancel();
      window.speechSynthesis.cancel();
      setSpeaking(false);

      // ===== استخدم Edge TTS لكل حاجة (عربي، إنجليزي، خليط) =====
      // كده الصوت مبيتغيرش بين الردود
      console.log('[ChatScreen] بدء النطق:', clean.substring(0, 80));
      arabicSpeech.speak(clean);
    },
    [synthesis, arabicSpeech, setSpeaking, setSpeakingId]
  );

  // ===== Send greeting on first load =====
  // الترحيب بيتعمل بس لو مفيش رسائل محفوظة (محادثة جديدة)
  // لو فيه رسائل محفوظة، يكمل من حيث وقف بدون ترحيب جديد
  useEffect(() => {
    if (!selectedTeacher || greetingSentRef.current) return;
    // ===== لو فيه رسائل محفوظة، مفيش حاجة جديدة =====
    if (messages.length > 0) {
      greetingSentRef.current = true;
      return;
    }
    greetingSentRef.current = true;

    // ===== greeting متغير كل مرة من الـ pool الموسّع =====
    const level = user?.level || 'beginner';
    const isFriend = selectedTeacher.id.startsWith('friend-');
    const ctx: GreetingContext = {
      userName: user?.name || 'صديقي',
      teacherNameAr: selectedTeacher.nameAr || selectedTeacher.name,
      teacherName: selectedTeacher.name,
      learningStage,
      messagesCount,
      streak,
    };

    let greetingContent: string;

    if (isFriend) {
      // ===== greeting للأصدقاء (محادثة طبيعية، مش درس) =====
      const friendGreetings = [
        `أهلاً يا ${user?.name || 'صاحبي'}! أنا ${selectedTeacher.nameAr}. إزيك النهاردة؟`,
        `يا هلا يا ${user?.name || 'صاحبي'}! أنا ${selectedTeacher.nameAr}. عامل إيه؟`,
        `أهلاً وسهلاً! أنا ${selectedTeacher.nameAr}. إنت إزيك؟`,
        `هلا يا ${user?.name || 'صاحبي'}! أنا ${selectedTeacher.nameAr}. خبارك إيه؟`,
        `مرحبتين! أنا ${selectedTeacher.nameAr}. يومك عامل إيه؟`,
      ];
      greetingContent = friendGreetings[Math.floor(Math.random() * friendGreetings.length)];
      // الأصدقاء مفيش لهم targetWord
      setCurrentTargetWord(null);
    } else {
      const { content: content, index } = getGreeting(level, ctx, lastGreetingIndex);
      greetingContent = content;
      setLastGreetingIndex(index);

      // ===== استخرج الكلمة المستهدفة من الترحيب =====
      if (level === 'beginner') {
        const englishMatch = greetingContent.match(/\b(Hello|Hi|Welcome|Yes|No|Thank you|Please|Good)\b/i);
        if (englishMatch) {
          const firstWord = englishMatch[0];
          console.log('[OptiTalk] Initial target word from greeting:', firstWord);
          setCurrentTargetWord(firstWord);
        }
      }
    }

    const greeting: ChatMessage = {
      id: `greeting-${Date.now()}`,
      role: 'assistant',
      content: greetingContent,
      correction: null,
      translatedWord: null,
      createdAt: Date.now(),
    };
    addMessage(greeting);

    // Speak the greeting after a brief delay
    speakText(greeting.content, greeting.id);
  }, [selectedTeacher]);

  // ===== Cleanup speech on unmount =====
  useEffect(() => {
    return () => {
      synthesis.cancel();
      arabicSpeech.cancel();
    };
  }, []);

  // ===== Send message to API =====
  const handleSendMessage = useCallback(
    async (text: string, confidence?: number) => {
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
      // Stop any ongoing speech — سواء عربي أو إنجليزي
      synthesis.cancel();
      arabicSpeech.cancel();

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
            learningStage, // أرسل المرحلة الحالية للمدرس
            confidence: confidence ?? undefined, // أرسل نسبة الثقة في النطق
            learnedWords, // الكلمات اللي اتعلمت
            inReviewMode, // هل في وضع المراجعة
            targetWord: currentTargetWord, // الكلمة المستهدفة الحالية
            inSentenceBuilderMode, // هل في وضع بناء الجمل
            isFriend: selectedTeacher?.id.startsWith('friend-'), // هل ده صديق
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

        // ===== استخرج الكلمة المستهدفة الجديدة من رد المدرس =====
        // الـ translatedWord بصيغة: "englishWord (النطق) = الترجمة"
        // نستخرج الكلمة الإنجليزي ونحفظها كـ targetWord
        if (data.translatedWord) {
          const match = data.translatedWord.match(/^([a-zA-Z][a-zA-Z\s]*?)(?:\s*\()/);
          if (match) {
            const newTargetWord = match[1].trim();
            console.log('[OptiTalk] New target word:', newTargetWord);
            setCurrentTargetWord(newTargetWord);

            // لو المدرس علّم كلمة جديدة (confidence عالي ومفيش correction) → أضفها للكلمات اللي اتعلمت
            if (user?.level === 'beginner' && !data.correction && confidence && confidence >= 0.6 && !learnedWords.includes(newTargetWord)) {
              addLearnedWord(newTargetWord);
            }
          }
        }

        // ===== لو كنا في وضع المراجعة وخلصنا → ابدأ وضع بناء الجمل =====
        if (inReviewMode && !data.correction && confidence && confidence >= 0.6) {
          // المراجعة خلصت بنجاح → ابدأ وضع بناء الجمل
          console.log('[OptiTalk] Review done → starting sentence builder mode');
          setInReviewMode(false);
          setInSentenceBuilderMode(true);
        }
        // ===== لو كنا في وضع بناء الجمل وخلصنا → اخرج من الوضع =====
        else if (inSentenceBuilderMode && !data.correction && confidence && confidence >= 0.6) {
          console.log('[OptiTalk] Sentence builder done');
          setInSentenceBuilderMode(false);
        }

        // Speak the reply
        speakText(aiMsg.content, aiMsg.id);
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
    [user, selectedTeacher, messages, addMessage, addPoints, setAiThinking, synthesis, arabicSpeech, speakText, resetPerfectStreak, bumpPerfectStreak, speechLang, learningStage, learnedWords, inReviewMode, currentTargetWord, inSentenceBuilderMode, addLearnedWord, setInReviewMode, setCurrentTargetWord, setInSentenceBuilderMode]
  );

  // ===== Mic toggle =====
  const handleMicToggle = useCallback(() => {
    if (!recognition.supported) {
      toast.error('المتصفح مش بيدعم التعرف على الصوت. استخدم الكتابة');
      return;
    }
    // لو المدرس بيتكلم → وقف الصوت
    if (isSpeaking) {
      synthesis.cancel();
      arabicSpeech.cancel();
      return;
    }
    // لو الميك شغال → وقفه
    if (isListening) {
      recognition.stop();
      // الـ hook هيحدث isListening تلقائياً عبر onListeningChange
      return;
    }
    // ===== الميك مفصول → ابدأ =====
    // أوقف أي صوت أول
    synthesis.cancel();
    arabicSpeech.cancel();
    // ابدأ الميك — الـ hook هيحدث isListening تلقائياً
    recognition.start();
  }, [recognition, isListening, isSpeaking, synthesis, arabicSpeech]);

  // ===== Force restart للحالات العالقة =====
  // بيتنفذ لو المستخدم ضغط مطوّل على زرار الميك
  const handleMicForceRestart = useCallback(() => {
    if (!recognition.supported) return;
    toast.info('إعادة تشغيل الميكروفون...');
    recognition.forceRestart();
  }, [recognition]);

  const handleStopSpeaking = useCallback(() => {
    synthesis.cancel();
    arabicSpeech.cancel();
  }, [synthesis, arabicSpeech]);

  // ===== End conversation (يحفظ المحادثة ولا يمسحها) =====
  // المستخدم لما يضغط X، بنوقف الصوت بس بنحتفظ بالرسائل
  // عشان لما يرجع يكمل من حيث وقف
  const handleEnd = useCallback(() => {
    synthesis.cancel();
    arabicSpeech.cancel();
    recognition.stop();
    setListening(false);
    setAiThinking(false);
    setSpeakingId(null);
    // احفظ conversationId في الـ store
    if (convIdRef.current) {
      setConversationId(convIdRef.current);
    }
    toast.success('محادثتك محفوظة — تقدر ترجع في أي وقت! 🎓');
    // روح لـ welcome — المستخدم ممكن يرجع يكمل
    setScreen('welcome');
  }, [synthesis, arabicSpeech, recognition, setListening, setSpeaking, setAiThinking, setScreen, setConversationId]);

  // ===== Start new conversation (روح لشاشة اختيار المدرس) =====
  const handleNewConversation = useCallback(() => {
    synthesis.cancel();
    arabicSpeech.cancel();
    recognition.stop();
    setListening(false);
    setAiThinking(false);
    setSpeakingId(null);
    clearMessages();
    setConversationId(null);
    setCurrentTargetWord(null); // امسح الكلمة المستهدفة
    setInReviewMode(false);
    setInSentenceBuilderMode(false);
    greetingSentRef.current = false;
    convIdRef.current = null;
    // روح لشاشة اختيار المدرس
    toast.success('اختار المدرس اللي عايزه! 🎓');
    setScreen('teacher-select');
  }, [synthesis, arabicSpeech, recognition, setListening, setSpeaking, setAiThinking, clearMessages, setConversationId, setCurrentTargetWord, setInReviewMode, setInSentenceBuilderMode, setScreen]);

  // ===== Go Home (ارجع لصفحة المعلومات الأساسية - onboarding) =====
  const handleGoHome = useCallback(() => {
    synthesis.cancel();
    arabicSpeech.cancel();
    recognition.stop();
    setListening(false);
    setAiThinking(false);
    setSpeakingId(null);
    clearMessages();
    setConversationId(null);
    setCurrentTargetWord(null);
    setInReviewMode(false);
    setInSentenceBuilderMode(false);
    greetingSentRef.current = false;
    convIdRef.current = null;
    // ارجع لصفحة المعلومات الأساسية (onboarding)
    setScreen('onboarding');
  }, [synthesis, arabicSpeech, recognition, setListening, setSpeaking, setAiThinking, clearMessages, setConversationId, setCurrentTargetWord, setInReviewMode, setInSentenceBuilderMode, setScreen]);

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
        <div className="flex items-center gap-1.5">
          {/* ===== زرار محادثة جديدة ===== */}
          <button
            onClick={handleNewConversation}
            className="flex h-7 w-7 items-center justify-center rounded-lg opti-glass text-opti-accent hover:bg-opti-accent/10"
            aria-label="محادثة جديدة"
            title="محادثة جديدة"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          {/* ===== زرار الصفحة الرئيسية ===== */}
          <button
            onClick={handleGoHome}
            className="flex h-7 w-7 items-center justify-center rounded-lg opti-glass text-opti-gold hover:bg-opti-gold/10"
            aria-label="الصفحة الرئيسية"
            title="الصفحة الرئيسية"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          {/* ===== مؤشر المرحلة للمبتدئ ===== */}
          {user?.level === 'beginner' && (
            <div
              className="flex items-center gap-1 rounded-lg opti-glass-teal px-2 py-1 border border-opti-accent/30"
              title={`المرحلة ${learningStage} من 5: ${STAGE_INFO[learningStage]?.desc || ''}`}
            >
              <span className="text-[10px]">{STAGE_INFO[learningStage]?.emoji || '📚'}</span>
              <span className="text-[10px] font-bold text-opti-accent">
                {learningStage}/5
              </span>
            </div>
          )}
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
        {/* كاميرا الطالب - مصغرة */}
        <div className="relative shrink-0" style={{ height: '60px' }}>
          <StudentCamera
            enabled={cameraEnabled}
            onToggle={handleToggleCamera}
            compact={true}
          />
        </div>

        {/* المحادثة */}
        <div className="overflow-hidden px-2 flex-1 min-h-0">
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
          onMicForceRestart={handleMicForceRestart}
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
          handleNewConversation();
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
