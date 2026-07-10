// ===== OptiTalk - Zustand Store =====
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Teacher, Level } from './teachers';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  correction?: string | null;
  translatedWord?: string | null;
  createdAt: number;
}

export interface OptiUser {
  name: string;
  age: string; // age group value
  gender: 'male' | 'female';
  level: Level;
}

export type Screen = 'welcome' | 'onboarding' | 'chat' | 'teacher-select';

// ===== المستخدم المسجل (auth) =====
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

interface AppState {
  // ===== Auth (تسجيل الدخول) =====
  authUser: AuthUser | null;
  isAuthenticated: boolean;

  // Onboarding
  user: OptiUser | null;
  selectedTeacher: Teacher | null;

  // Chat
  messages: ChatMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  isAiThinking: boolean;
  conversationId: string | null;
  // آخر رسالة ترحيب اتبعتت — عشان متكررناش نفس الترحيب
  lastGreetingIndex: number;

  // Progress
  points: number;
  streak: number;
  achievements: string[];
  lastActiveDate: string | null;
  messagesCount: number;
  perfectStreak: number; // consecutive messages without corrections
  // ===== مرحلة التعلم للمبتدئ (1-5) =====
  // 1: كلمات ترحيب (Hello) | 2: كلمات أساسية (Yes/No) | 3: جمل كلمتين
  // 4: جمل قصيرة (How are you) | 5: محادثة بسيطة
  learningStage: number;
  // عدد المرات اللي الطالب اتدرب فيها على المرحلة الحالية
  stageAttempts: number;
  // ===== الكلمات اللي الطالب اتعلمها (للمراجعة كل 8 كلمات) =====
  learnedWords: string[];
  // عدّاد الكلمات من آخر مراجعة (لما يوصل 8 → نعمل مراجعة)
  wordsSinceReview: number;
  // هل المدرس في وضع المراجعة دلوقتي؟
  inReviewMode: boolean;
  // ===== الكلمة المستهدفة الحالية (اللي المدرس طلب من الطالب يقولها) =====
  currentTargetWord: string | null;
  // ===== هل المدرس في وضع بناء الجمل؟ (بعد المراجعة) =====
  inSentenceBuilderMode: boolean;

  // UI
  currentScreen: Screen;
  cameraEnabled: boolean;
  micEnabled: boolean;
  showAchievement: string | null;
  speechLang: 'en' | 'ar';
  audioRate: number;
  autoSpeak: boolean;
  showCorrections: boolean;
  showTranslations: boolean;

  // Actions: Onboarding
  setUser: (u: OptiUser) => void;
  setTeacher: (t: Teacher | null) => void;

  // Actions: Auth
  setAuthUser: (u: AuthUser | null) => void;
  logout: () => void;

  // Actions: Chat
  addMessage: (m: ChatMessage) => void;
  clearMessages: () => void;
  setConversationId: (id: string | null) => void;
  setListening: (v: boolean) => void;
  setSpeaking: (v: boolean) => void;
  setAiThinking: (v: boolean) => void;
  setLastGreetingIndex: (i: number) => void;

  // Actions: Progress
  addPoints: (n: number) => void;
  bumpStreak: () => void;
  addAchievement: (id: string) => void;
  bumpMessagesCount: () => void;
  bumpPerfectStreak: () => void;
  resetPerfectStreak: () => void;
  setShowAchievement: (id: string | null) => void;
  bumpStageAttempts: () => void;
  advanceStage: () => void;
  setLearningStage: (stage: number) => void;
  addLearnedWord: (word: string) => void;
  setWordsSinceReview: (count: number) => void;
  setInReviewMode: (inReview: boolean) => void;
  clearLearnedWords: () => void;
  setCurrentTargetWord: (word: string | null) => void;
  setInSentenceBuilderMode: (inBuilder: boolean) => void;

  // Actions: UI
  setScreen: (s: Screen) => void;
  setCameraEnabled: (v: boolean) => void;
  setMicEnabled: (v: boolean) => void;
  setSpeechLang: (l: 'en' | 'ar') => void;
  setAudioRate: (r: number) => void;
  setAutoSpeak: (v: boolean) => void;
  setShowCorrections: (v: boolean) => void;
  setShowTranslations: (v: boolean) => void;

  // Reset
  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ===== Auth =====
      authUser: null,
      isAuthenticated: false,

      // Onboarding
      user: null,
      selectedTeacher: null,

      // Chat
      messages: [],
      isListening: false,
      isSpeaking: false,
      isAiThinking: false,
      conversationId: null,
      lastGreetingIndex: -1,

      // Progress
      points: 0,
      streak: 0,
      achievements: [],
      lastActiveDate: null,
      messagesCount: 0,
      perfectStreak: 0,
      learningStage: 1, // ابدأ من المرحلة 1
      stageAttempts: 0,
      learnedWords: [],
      wordsSinceReview: 0,
      inReviewMode: false,
      currentTargetWord: null,
      inSentenceBuilderMode: false,

      // UI
      currentScreen: 'welcome',
      cameraEnabled: false,
      micEnabled: false,
      showAchievement: null,
      speechLang: 'ar',
      audioRate: 0.95,
      autoSpeak: true,
      showCorrections: true,
      showTranslations: true,

      // Actions: Onboarding
      setUser: (u) => set({ user: u }),
      setTeacher: (t) => set({ selectedTeacher: t }),

      // Actions: Auth
      setAuthUser: (u) => set({ authUser: u, isAuthenticated: !!u }),
      logout: () => set({
        authUser: null,
        isAuthenticated: false,
        user: null,
        selectedTeacher: null,
        messages: [],
        conversationId: null,
        currentScreen: 'welcome',
      }),

      // Actions: Chat
      addMessage: (m) => {
        set((s) => ({ messages: [...s.messages, m] }));
        if (m.role === 'user') {
          get().bumpMessagesCount();
        }
      },
      clearMessages: () => set({ messages: [], conversationId: null }),
      setConversationId: (id) => set({ conversationId: id }),
      setListening: (v) => set({ isListening: v }),
      setSpeaking: (v) => set({ isSpeaking: v }),
      setAiThinking: (v) => set({ isAiThinking: v }),
      setLastGreetingIndex: (i) => set({ lastGreetingIndex: i }),

      // Actions: Progress
      addPoints: (n) => set((s) => ({ points: s.points + n })),
      bumpStreak: () => {
        const today = new Date().toISOString().slice(0, 10);
        const last = get().lastActiveDate;
        if (last === today) return; // already counted today
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = last === yesterday ? get().streak + 1 : 1;
        set({ streak: newStreak, lastActiveDate: today });
      },
      addAchievement: (id) => {
        if (get().achievements.includes(id)) return;
        set((s) => ({ achievements: [...s.achievements, id], showAchievement: id }));
      },
      bumpMessagesCount: () => {
        const newCount = get().messagesCount + 1;
        set({ messagesCount: newCount });
        // Auto-award message-based achievements
        const { addAchievement, addPoints } = get();
        if (newCount === 1) {
          addAchievement('first-conversation');
          addPoints(10);
        }
        if (newCount === 10) {
          addAchievement('ten-messages');
          addPoints(20);
        }
        if (newCount === 50) {
          addAchievement('fifty-messages');
          addPoints(50);
        }
      },
      bumpPerfectStreak: () => {
        const newStreak = get().perfectStreak + 1;
        set({ perfectStreak: newStreak });
        if (newStreak === 5) {
          const { addAchievement, addPoints } = get();
          addAchievement('perfect-grammar');
          addPoints(25);
        }
      },
      resetPerfectStreak: () => set({ perfectStreak: 0 }),
      setShowAchievement: (id) => set({ showAchievement: id }),
      bumpStageAttempts: () => set((s) => ({ stageAttempts: s.stageAttempts + 1 })),
      // تقدّم للمرحلة التالية (حد أقصى 5)
      advanceStage: () => {
        const current = get().learningStage;
        if (current < 5) {
          set({ learningStage: current + 1, stageAttempts: 0 });
          console.log(`[OptiTalk] Advanced to stage ${current + 1}`);
        }
      },
      setLearningStage: (stage) => set({ learningStage: Math.min(5, Math.max(1, stage)), stageAttempts: 0 }),
      // ===== إضافة كلمة جديدة للكلمات اللي اتعلمت =====
      addLearnedWord: (word) => set((s) => {
        const cleanWord = word.trim();
        if (!cleanWord || s.learnedWords.includes(cleanWord)) return s;
        const newLearnedWords = [...s.learnedWords, cleanWord];
        const newWordsSinceReview = s.wordsSinceReview + 1;
        // لو وصلنا 8 كلمات → فعّل وضع المراجعة
        const shouldReview = newWordsSinceReview >= 8;
        return {
          learnedWords: newLearnedWords,
          wordsSinceReview: shouldReview ? 0 : newWordsSinceReview,
          inReviewMode: shouldReview,
        };
      }),
      setWordsSinceReview: (count) => set({ wordsSinceReview: count }),
      setInReviewMode: (inReview) => set({ inReviewMode: inReview }),
      clearLearnedWords: () => set({ learnedWords: [], wordsSinceReview: 0, inReviewMode: false, inSentenceBuilderMode: false }),
      setCurrentTargetWord: (word) => set({ currentTargetWord: word }),
      setInSentenceBuilderMode: (inBuilder) => set({ inSentenceBuilderMode: inBuilder }),

      // Actions: UI
      setScreen: (s) => set({ currentScreen: s }),
      setCameraEnabled: (v) => set({ cameraEnabled: v }),
      setMicEnabled: (v) => set({ micEnabled: v }),
      setSpeechLang: (l) => set({ speechLang: l }),
      setAudioRate: (r) => set({ audioRate: Math.min(2.0, Math.max(0.5, r)) }),
      setAutoSpeak: (v) => set({ autoSpeak: v }),
      setShowCorrections: (v) => set({ showCorrections: v }),
      setShowTranslations: (v) => set({ showTranslations: v }),

      // Reset
      resetAll: () =>
        set({
          authUser: null,
          isAuthenticated: false,
          user: null,
          selectedTeacher: null,
          messages: [],
          conversationId: null,
          lastGreetingIndex: -1,
          isListening: false,
          isSpeaking: false,
          isAiThinking: false,
          points: 0,
          streak: 0,
          achievements: [],
          lastActiveDate: null,
          messagesCount: 0,
          perfectStreak: 0,
          learningStage: 1,
          stageAttempts: 0,
          learnedWords: [],
          wordsSinceReview: 0,
          inReviewMode: false,
          currentTargetWord: null,
          inSentenceBuilderMode: false,
          currentScreen: 'welcome',
          cameraEnabled: false,
          micEnabled: false,
          showAchievement: null,
          speechLang: 'ar',
        }),
    }),
    {
      name: 'optitalk-store-v6',
      version: 6,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        // ===== حفظ بيانات تسجيل الدخول =====
        authUser: s.authUser,
        isAuthenticated: s.isAuthenticated,
        user: s.user,
        selectedTeacher: s.selectedTeacher,
        // ===== حفظ المحادثات عشان يكمل من حيث وقف =====
        messages: s.messages,
        conversationId: s.conversationId,
        lastGreetingIndex: s.lastGreetingIndex,
        // ===== حفظ التقدم =====
        points: s.points,
        streak: s.streak,
        achievements: s.achievements,
        lastActiveDate: s.lastActiveDate,
        messagesCount: s.messagesCount,
        learningStage: s.learningStage,
        stageAttempts: s.stageAttempts,
        learnedWords: s.learnedWords,
        wordsSinceReview: s.wordsSinceReview,
        inReviewMode: s.inReviewMode,
        currentTargetWord: s.currentTargetWord,
        inSentenceBuilderMode: s.inSentenceBuilderMode,
        currentScreen: s.currentScreen,
        speechLang: s.speechLang,
      }),
    }
  )
);
