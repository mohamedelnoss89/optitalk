"use client";

import { motion } from "framer-motion";
import { Star, MapPin, TrendingUp } from "lucide-react";
import { PLACES } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function FeaturedSpot() {
  const setSelectedPlace = useStore((s) => s.setSelectedPlace);
  // pick the highest rated place (deterministic)
  const featured = [...PLACES].sort((a, b) => b.rating - a.rating)[0];

  return (
    <section aria-labelledby="featured-title">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h3 id="featured-title" className="flex items-center gap-1.5 text-base font-bold text-[#F5F0E8]">
          <TrendingUp className="size-4 text-[#D4A03C]" />
          مميز اليوم
        </h3>
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedPlace(featured)}
        className="relative w-full overflow-hidden rounded-2xl border border-[#D4A03C]/25 cairo-card cairo-shadow-lg p-0 text-right"
      >
        <div
          className="relative flex h-32 items-center justify-center text-6xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(212,160,60,0.25), rgba(192,98,59,0.25))",
          }}
        >
          {featured.image ? (
            <img
              src={featured.image}
              alt={featured.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{featured.emoji}</span>
          )}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#0a0e1a]/80 px-2 py-0.5 text-xs font-bold text-[#D4A03C]">
            <Star className="size-3 fill-[#D4A03C]" />
            {featured.rating}
          </div>
          <div className="absolute left-3 top-3 rounded-full bg-[#D4A03C] px-2 py-0.5 text-[10px] font-bold text-[#0a0e1a]">
            الأعلى تقييماً
          </div>
        </div>
        <div className="p-4">
          <h4 className="text-lg font-bold text-[#F5F0E8]">{featured.name}</h4>
          <p className="mt-1 line-clamp-2 text-sm text-[#8A8078]">{featured.description}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-[#8A8078]">
            <MapPin className="size-3 text-[#C0623B]" />
            <span className="truncate">{featured.address}</span>
          </div>
        </div>
      </motion.button>
    </section>
  );
}
