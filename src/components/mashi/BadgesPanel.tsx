"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { BADGES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function BadgesPanel() {
  const { favorites, dayPlans, currentUser } = useStore();
  const [earned, setEarned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = currentUser ? `/api/badges?userId=${currentUser.id}` : "/api/badges";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setEarned(d.earned ?? []))
      .finally(() => setLoading(false));
  }, [currentUser, favorites.length, dayPlans.length]);

  // client-side logic to also unlock based on local state
  const localEarned = new Set(earned);
  if (favorites.length >= 3) localEarned.add("local");
  if (dayPlans.length >= 1) localEarned.add("planner");

  const isEarned = (id: string) => localEarned.has(id) || earned.includes(id);

  return (
    <section aria-labelledby="badges-title">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h3 id="badges-title" className="flex items-center gap-1.5 text-base font-bold text-[#F5F0E8]">
          <Award className="size-4 text-[#D4A03C]" />
          أوسمتي
        </h3>
        <span className="text-xs text-[#8A8078]">
          {loading ? "..." : `${earned.length} / ${BADGES.length}`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {BADGES.map((b, i) => {
          const unlocked = isEarned(b.id);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center",
                unlocked
                  ? "border-[#D4A03C]/40 bg-[#D4A03C]/10 cairo-glow"
                  : "border-[#D4A03C]/10 bg-[#1A1612]/60 opacity-60"
              )}
            >
              <span className="relative flex size-12 items-center justify-center text-3xl">
                {unlocked ? b.icon : <Lock className="size-5 text-[#8A8078]" />}
                {unlocked && (
                  <span className="absolute -right-1 -top-1 size-3 rounded-full bg-[#D4A03C] shadow-[0_0_8px_#D4A03C]" />
                )}
              </span>
              <span className="text-xs font-bold text-[#F5F0E8]">{b.name}</span>
              <span className="text-[10px] leading-tight text-[#8A8078]">{b.description}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
