"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { MOODS, PLACES } from "@/lib/data";

export default function MoodDiscovery() {
  const { setActiveMood, setActiveTab, setActiveCategory } = useStore();

  const pickMood = (moodId: string, categories: string[]) => {
    setActiveMood(moodId);
    if (categories.length === 1) {
      setActiveCategory(categories[0]);
    } else {
      // multi-category: filter via tags using first category
      setActiveCategory(categories[0]);
    }
    setActiveTab("home");
  };

  return (
    <section aria-labelledby="mood-title">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h3 id="mood-title" className="text-base font-bold text-[#F5F0E8]">
          اكتشف حسب <span className="cairo-text-gold">مودك</span>
        </h3>
        <span className="text-xs text-[#8A8078]">{PLACES.length}+ مكان</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MOODS.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => pickMood(m.id, m.categories)}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-[#D4A03C]/15 bg-[#1A1612] p-3 transition-colors hover:border-[#D4A03C]/40"
            style={{ boxShadow: `inset 0 0 0 0 ${m.color}` }}
          >
            <span
              className="flex size-11 items-center justify-center rounded-full text-xl"
              style={{ backgroundColor: m.color + "22", boxShadow: `0 0 16px ${m.color}33` }}
            >
              {m.emoji}
            </span>
            <span className="text-xs font-medium text-[#F5F0E8]">{m.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
