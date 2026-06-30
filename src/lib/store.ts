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

export type Screen = 'welcome' | 'onboarding' | 'chat';

interface AppState {
  // Onboarding
  user: OptiUser | null;
  selectedTeacher: Teacher | null;

  // Chat
  messages: ChatMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  isAiThinking: boolean;
  conversationId: string | null;

  // Progress
  points: number;
  streak: number;
  achievements: string[];
  lastActiveDate: string | null;
  messagesCount: number;
  perfectStreak: number; // consecutive messages without corrections

  // UI
  currentScreen: Screen;
  cameraEnabled: boolean;
  micEnabled: boolean;
  showAchievement: string | null;
  // لغة التعرف على الصوت: 'en' (إنجليزي افتراضي) أو 'ar' (عربي)
  speechLang: 'en' | 'ar';
  // إعدادات إضافية
  audioRate: number;
  autoSpeak: boolean;
  showCorrections: boolean;
  showTranslations: boolean;

  // Actions: Onboarding
  setUser: (u: OptiUser) => void;
  setTeacher: (t: Teacher | null) => void;

  // Actions: Chat
  addMessage: (m: ChatMessage) => void;
  clearMessages: () => void;
  setConversationId: (id: string | null) => void;
  setListening: (v: boolean) => void;
  setSpeaking: (v: boolean) => void;
  setAiThinking: (v: boolean) => void;

  // Actions: Progress
  addPoints: (n: number) => void;
  bumpStreak: () => void;
  addAchievement: (id: string) => void;
  bumpMessagesCount: () => void;
  bumpPerfectStreak: () => void;
  resetPerfectStreak: () => void;
  setShowAchievement: (id: string | null) => void;

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
      // Onboarding
      user: null,
      selectedTeacher: null,

      // Chat
      messages: [],
      isListening: false,
      isSpeaking: false,
      isAiThinking: false,
      conversationId: null,

      // Progress
      points: 0,
      streak: 0,
      achievements: [],
      lastActiveDate: null,
      messagesCount: 0,
      perfectStreak: 0,

      // UI
      currentScreen: 'welcome',
      cameraEnabled: false,
      micEnabled: false,
      showAchievement: null,
      speechLang: 'en',
      audioRate: 0.95,
      autoSpeak: true,
      showCorrections: true,
      showTranslations: true,

      // Actions: Onboarding
      setUser: (u) => set({ user: u }),
      setTeacher: (t) => set({ selectedTeacher: t }),

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
          user: null,
          selectedTeacher: null,
          messages: [],
          conversationId: null,
          isListening: false,
          isSpeaking: false,
          isAiThinking: false,
          points: 0,
          streak: 0,
          achievements: [],
          lastActiveDate: null,
          messagesCount: 0,
          perfectStreak: 0,
          currentScreen: 'welcome',
          cameraEnabled: false,
          micEnabled: false,
          showAchievement: null,
          speechLang: 'en',
        }),
    }),
    {
      name: 'optitalk-store-v3',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        selectedTeacher: s.selectedTeacher,
        points: s.points,
        streak: s.streak,
        achievements: s.achievements,
        lastActiveDate: s.lastActiveDate,
        messagesCount: s.messagesCount,
        currentScreen: s.currentScreen,
        speechLang: s.speechLang,
      }),
    }
  )
);
