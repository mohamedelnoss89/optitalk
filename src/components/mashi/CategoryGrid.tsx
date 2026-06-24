"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { CATEGORIES, getPlacesByCategory } from "@/lib/data";

export default function CategoryGrid() {
  const setActiveCategory = useStore((s) => s.setActiveCategory);

  return (
    <section aria-labelledby="cat-title">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h3 id="cat-title" className="text-base font-bold text-[#F5F0E8]">
          التصنيفات
        </h3>
        <span className="text-xs text-[#8A8078]">{CATEGORIES.length} تصنيف</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {CATEGORIES.map((c, i) => {
          const count = getPlacesByCategory(c.id).length;
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveCategory(c.id)}
              className="group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-[#D4A03C]/12 bg-[#1A1612] p-3 text-center transition-all hover:border-[#D4A03C]/40"
              aria-label={c.name}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: c.color }}
              />
              <span
                className="flex size-10 items-center justify-center rounded-full text-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: c.color + "22" }}
              >
                {c.emoji}
              </span>
              <span className="text-xs font-semibold text-[#F5F0E8]">{c.name}</span>
              <span className="text-[10px] text-[#8A8078]">{count} مكان</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
