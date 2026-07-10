"use client";

import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { getPlacesByCategory, getCategoryById } from "@/lib/data";
import PlaceCard from "./PlaceCard";

export default function CategoryScreen() {
  const { activeCategory, setActiveCategory } = useStore();
  if (!activeCategory) return null;
  const cat = getCategoryById(activeCategory);
  if (!cat) return null;
  const places = getPlacesByCategory(activeCategory);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className="flex items-center gap-1.5 text-sm text-[#8A8078] hover:text-[#F5F0E8]"
          aria-label="رجوع"
        >
          <ArrowRight className="size-4" />
          رجوع
        </button>
        <button
          onClick={() => setActiveCategory(null)}
          className="flex size-7 items-center justify-center rounded-full bg-[#141925] text-[#8A8078]"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>
      </div>

      <div
        className="overflow-hidden rounded-2xl border p-4"
        style={{ borderColor: cat.color + "40", background: `linear-gradient(135deg, ${cat.color}22, transparent)` }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex size-12 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: cat.color + "33" }}
          >
            {cat.emoji}
          </span>
          <div>
            <h2 className="text-xl font-bold text-[#F5F0E8]">{cat.name}</h2>
            <p className="text-xs text-[#8A8078]">{cat.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {places.map((p, i) => (
          <PlaceCard key={p.id} place={p} index={i} />
        ))}
      </div>
      {places.length === 0 && (
        <p className="py-10 text-center text-sm text-[#8A8078]">لا توجد أماكن في هذا التصنيف بعد.</p>
      )}
    </motion.section>
  );
}
