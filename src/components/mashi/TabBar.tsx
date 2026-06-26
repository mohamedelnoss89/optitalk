"use client";

import { motion } from "framer-motion";
import { Home, MapPin, Route, MessageCircle, Heart } from "lucide-react";
import { useStore, type TabKey } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: "home", label: "الرئيسية", icon: Home },
  { key: "map", label: "الخريطة", icon: MapPin },
  { key: "plans", label: "خطط", icon: Route },
  { key: "qa", label: "سؤال", icon: MessageCircle },
  { key: "favorites", label: "المفضلة", icon: Heart },
];

export default function TabBar() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const favorites = useStore((s) => s.favorites);

  return (
    <nav
      className="sticky bottom-0 z-30 w-full border-t border-[#D4A03C]/12 bg-[#0a0e1a]/75 backdrop-blur-2xl cairo-shadow"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="التنقل السفلي"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          const showBadge = t.key === "favorites" && favorites.length > 0;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-[#D4A03C]" : "text-[#8A8078] hover:text-[#C4A882]"
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={t.label}
            >
              {isActive && (
                <motion.span
                  layoutId="active-tab-glow"
                  className="absolute -top-px h-0.5 w-10 rounded-full bg-[#D4A03C]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">
                <Icon className={cn("size-5", isActive && "drop-shadow-[0_0_8px_rgba(212,160,60,0.6)]")} />
                {showBadge && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C0623B] px-1 text-[10px] font-bold text-[#F5F0E8]">
                    {favorites.length}
                  </span>
                )}
              </span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
