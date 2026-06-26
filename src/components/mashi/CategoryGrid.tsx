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
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
              className="group relative overflow-hidden rounded-xl border border-[#D4A03C]/12 bg-[#1A1612] cairo-shadow text-right transition-all hover:border-[#D4A03C]/35 hover:cairo-glow"
              aria-label={c.name}
            >
              {/* صورة التصنيف */}
              <div className="relative h-20 overflow-hidden">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${c.color}55, ${c.color}22)`,
                    }}
                  />
                )}
                {/* overlay داكن */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B09] via-[#0D0B09]/50 to-transparent" />
                {/* شريط لون التصنيف */}
                <div
                  className="absolute top-0 inset-x-0 h-1"
                  style={{ backgroundColor: c.color }}
                />
                {/* emoji */}
                <span className="absolute top-2 right-2 text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {c.emoji}
                </span>
              </div>

              {/* الاسم + العدد */}
              <div className="p-2.5">
                <h4 className="text-sm font-bold text-[#F5F0E8] line-clamp-1">{c.name}</h4>
                <p className="text-[11px] text-[#8A8078]">{count} مكان</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
