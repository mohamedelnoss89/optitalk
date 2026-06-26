// ===== Al-Mashi Zustand Store =====
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Place } from "./data";

export type TabKey = "home" | "map" | "plans" | "qa" | "favorites";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export interface PlanStop {
  placeId: string;
  order: number;
  duration: number; // minutes
}

export interface DayPlan {
  id: string;
  name: string;
  date: string;
  stops: PlanStop[];
}

export interface QaItem {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  answers: { id: string; userId: string; userName: string; content: string; createdAt: string }[];
}

interface AppState {
  // navigation
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  // search & filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: string | null;
  setActiveCategory: (c: string | null) => void;
  activeMood: string | null;
  setActiveMood: (m: string | null) => void;

  // selected place
  selectedPlace: Place | null;
  setSelectedPlace: (p: Place | null) => void;

  // favorites
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // user
  currentUser: CurrentUser | null;
  setCurrentUser: (u: CurrentUser | null) => void;
  guestMode: boolean;
  setGuestMode: (g: boolean) => void;

  // place reviews (client-side cache keyed by placeId → average rating)
  placeReviews: Record<string, number>;
  setPlaceReview: (placeId: string, rating: number) => void;

  // day plans (local UI cache; persisted in DB on submit)
  dayPlans: DayPlan[];
  addDayPlan: (plan: DayPlan) => void;
  removeDayPlan: (id: string) => void;
  addStopToPlan: (planId: string, stop: PlanStop) => void;
  removeStopFromPlan: (planId: string, placeId: string) => void;
  reorderStop: (planId: string, placeId: string, direction: "up" | "down") => void;

  // ui sheets
  contactOpen: boolean;
  setContactOpen: (o: boolean) => void;
  docOpen: boolean;
  setDocOpen: (o: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: "home",
      setActiveTab: (tab) => set({ activeTab: tab }),

      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),
      activeCategory: null,
      setActiveCategory: (c) => set({ activeCategory: c }),
      activeMood: null,
      setActiveMood: (m) => set({ activeMood: m }),

      selectedPlace: null,
      setSelectedPlace: (p) => set({ selectedPlace: p }),

      favorites: [],
      toggleFavorite: (id) => {
        const cur = get().favorites;
        const exists = cur.includes(id);
        set({ favorites: exists ? cur.filter((f) => f !== id) : [...cur, id] });
      },
      isFavorite: (id) => get().favorites.includes(id),

      currentUser: null,
      setCurrentUser: (u) => set({ currentUser: u }),
      guestMode: false,
      setGuestMode: (g) => set({ guestMode: g }),

      placeReviews: {},
      setPlaceReview: (placeId, rating) =>
        set({ placeReviews: { ...get().placeReviews, [placeId]: rating } }),

      dayPlans: [],
      addDayPlan: (plan) => set({ dayPlans: [plan, ...get().dayPlans] }),
      removeDayPlan: (id) => set({ dayPlans: get().dayPlans.filter((p) => p.id !== id) }),
      addStopToPlan: (planId, stop) =>
        set({
          dayPlans: get().dayPlans.map((p) =>
            p.id === planId
              ? { ...p, stops: [...p.stops, stop].sort((a, b) => a.order - b.order) }
              : p
          ),
        }),
      removeStopFromPlan: (planId, placeId) =>
        set({
          dayPlans: get().dayPlans.map((p) =>
            p.id === planId ? { ...p, stops: p.stops.filter((s) => s.placeId !== placeId) } : p
          ),
        }),
      reorderStop: (planId, placeId, direction) => {
        const plans = get().dayPlans.map((p) => {
          if (p.id !== planId) return p;
          const stops = [...p.stops].sort((a, b) => a.order - b.order);
          const idx = stops.findIndex((s) => s.placeId === placeId);
          if (idx < 0) return p;
          const swap = direction === "up" ? idx - 1 : idx + 1;
          if (swap < 0 || swap >= stops.length) return p;
          const tmpOrder = stops[idx].order;
          stops[idx].order = stops[swap].order;
          stops[swap].order = tmpOrder;
          return { ...p, stops: stops.sort((a, b) => a.order - b.order) };
        });
        set({ dayPlans: plans });
      },

      contactOpen: false,
      setContactOpen: (o) => set({ contactOpen: o }),
      docOpen: false,
      setDocOpen: (o) => set({ docOpen: o }),
    }),
    {
      name: "al-mashi-store",
      partialize: (s) => ({
        favorites: s.favorites,
        currentUser: s.currentUser,
        guestMode: s.guestMode,
        placeReviews: s.placeReviews,
        dayPlans: s.dayPlans,
      }),
    }
  )
);
