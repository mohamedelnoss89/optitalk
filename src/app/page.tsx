"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Info, Mail, LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import TabBar from "@/components/mashi/TabBar";
import WelcomeScreen from "@/components/mashi/WelcomeScreen";
import HomeScreen from "@/components/mashi/HomeScreen";
import MapScreen from "@/components/mashi/MapScreen";
import DayPlanBuilder from "@/components/mashi/DayPlanBuilder";
import QAPanel from "@/components/mashi/QAPanel";
import FavoritesScreen from "@/components/mashi/FavoritesScreen";
import PlaceDetail from "@/components/mashi/PlaceDetail";
import ContactPanel from "@/components/mashi/ContactPanel";
import ProjectDocPanel from "@/components/mashi/ProjectDocPanel";
import BadgesPanel from "@/components/mashi/BadgesPanel";
import { cn } from "@/lib/utils";

export default function Home() {
  const {
    activeTab,
    currentUser,
    guestMode,
    setCurrentUser,
    setGuestMode,
    setContactOpen,
    setDocOpen,
    favorites,
  } = useStore();

  const [userMenu, setUserMenu] = useState(false);

  const isLoggedIn = !!currentUser || guestMode;

  const logout = () => {
    setCurrentUser(null);
    setGuestMode(false);
    setUserMenu(false);
    toast.success("تم تسجيل الخروج");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background cairo-bg-image">
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b border-[#D4A03C]/12 bg-[#0D0B09]/85 backdrop-blur-2xl cairo-shadow"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            onClick={() => useStore.setState({ activeTab: "home", activeCategory: null, searchQuery: "" })}
            className="flex items-center gap-2"
            aria-label="الماشي فى السيدة زينب"
          >
            <img
              src="/hero-image.jpg"
              alt="الماشي"
              className="size-9 rounded-lg object-cover border border-[#D4A03C]/30"
            />
            <div className="flex flex-col items-start leading-tight text-right">
              <span className="text-sm font-extrabold cairo-text-gold">ع الماشى</span>
              <span className="text-[10px] font-medium text-[#C4A882] text-center w-full">فى</span>
              <span className="text-xs font-bold text-[#F5F0E8]">السيده زينب</span>
              <span className="text-[8px] text-[#8A8078] mt-0.5">مقدم من opti-group</span>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDocOpen(true)}
              className="flex size-9 items-center justify-center rounded-full text-[#8A8078] hover:bg-[#1A1612] hover:text-[#F5F0E8]"
              aria-label="عن المشروع"
            >
              <Info className="size-4" />
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="flex size-9 items-center justify-center rounded-full text-[#8A8078] hover:bg-[#1A1612] hover:text-[#F5F0E8]"
              aria-label="تواصل معنا"
            >
              <Mail className="size-4" />
            </button>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex size-9 items-center justify-center rounded-full bg-[#D4A03C]/15 text-[#D4A03C]"
                  aria-label="حسابي"
                >
                  <UserIcon className="size-4" />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        className="absolute left-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-[#D4A03C]/20 bg-[#1A1612] shadow-2xl"
                      >
                        <div className="border-b border-[#D4A03C]/10 p-3">
                          <p className="text-xs font-bold text-[#F5F0E8]">
                            {currentUser?.name ?? "ضيف"}
                          </p>
                          {currentUser && (
                            <p className="truncate text-[10px] text-[#8A8078]" dir="ltr">
                              {currentUser.email}
                            </p>
                          )}
                          {!currentUser && guestMode && (
                            <p className="text-[10px] text-[#8A8078]">وضع الضيف</p>
                          )}
                        </div>
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-right text-xs text-[#C62828] hover:bg-[#2A2520]"
                        >
                          <LogOut className="size-3.5" />
                          تسجيل الخروج
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-md flex-1 pb-24">
        <AnimatePresence mode="wait">
          {!isLoggedIn && activeTab === "home" ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WelcomeScreen />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "home" && <HomeScreen />}
              {activeTab === "map" && <MapScreen />}
              {activeTab === "plans" && (
                <>
                  <DayPlanBuilder />
                  <div className="px-4 pb-4">
                    <BadgesPanel />
                  </div>
                </>
              )}
              {activeTab === "qa" && <QAPanel />}
              {activeTab === "favorites" && <FavoritesScreen />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sheets */}
      <PlaceDetail />
      <ContactPanel />
      <ProjectDocPanel />

      {/* Tab bar */}
      {isLoggedIn && <TabBar />}

      {/* floating badge count badge */}
      {!isLoggedIn && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#D4A03C]/10 px-3 py-1 text-[10px] text-[#8A8078]">
          {favorites.length} في المفضلة
        </div>
      )}
    </div>
  );
}
