"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Layers } from "lucide-react";
import { useStore } from "@/lib/store";
import { PLACES, getCategoryById, CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function MapScreen() {
  const { setSelectedPlace, setActiveCategory, activeCategory } = useStore();
  const [filter, setFilter] = useState<string | null>(null);

  const visible = filter
    ? PLACES.filter((p) => p.category === filter)
    : PLACES;

  // Bounding box for Sayyida Zainab area
  const minLat = 30.0120;
  const maxLat = 30.0450;
  const minLng = 31.2300;
  const maxLng = 31.2600;

  const toXY = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-[#F5F0E8]">
          خريطة <span className="cairo-text-gold">السيدة زينب</span>
        </h2>
        <span className="text-xs text-[#8A8078]">({visible.length} مكان)</span>
      </div>

      {/* category filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
            !filter ? "border-[#D4A03C] bg-[#D4A03C] text-[#0D0B09]" : "border-[#D4A03C]/20 bg-[#1A1612] text-[#8A8078]"
          )}
        >
          الكل
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
              filter === c.id ? "border-transparent text-[#F5F0E8]" : "border-[#D4A03C]/20 bg-[#1A1612] text-[#8A8078]"
            )}
            style={filter === c.id ? { backgroundColor: c.color } : undefined}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* custom map */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#D4A03C]/20"
        style={{
          background:
            "linear-gradient(135deg, #1A1612 0%, #0D0B09 50%, #1A1612 100%)",
        }}
      >
        {/* grid lines */}
        <div className="absolute inset-0 opacity-10">
          {[20, 40, 60, 80].map((n) => (
            <div key={`v${n}`} className="absolute inset-y-0 border-l border-[#D4A03C]/30" style={{ left: `${n}%` }} />
          ))}
          {[20, 40, 60, 80].map((n) => (
            <div key={`h${n}`} className="absolute inset-x-0 border-t border-[#D4A03C]/30" style={{ top: `${n}%` }} />
          ))}
        </div>

        {/* "Nile" curve decoration */}
        <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 0 30 Q 30 50 50 45 T 100 60 L 100 100 L 0 100 Z" fill="#1565C0" opacity="0.3" />
        </svg>

        {/* central label */}
        <div className="absolute left-1/2 top-3 -translate-x-1/2 text-[10px] font-bold text-[#D4A03C]/60">
          السيدة زينب • القاهرة
        </div>

        {/* markers */}
        {visible.map((p, i) => {
          const { x, y } = toXY(p.lat, p.lng);
          const cat = getCategoryById(p.category);
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.01, 0.5) }}
              onClick={() => setSelectedPlace(p)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={p.name}
            >
              <span
                className="flex size-8 items-center justify-center rounded-full text-base shadow-lg transition-transform hover:scale-125"
                style={{
                  backgroundColor: (cat?.color ?? "#D4A03C") + "ee",
                  boxShadow: `0 0 12px ${(cat?.color ?? "#D4A03C")}88`,
                }}
              >
                {p.image}
              </span>
            </motion.button>
          );
        })}

        {/* legend */}
        <div className="absolute bottom-2 right-2 rounded-lg bg-[#0D0B09]/80 p-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-[9px] text-[#8A8078]">
            <Layers className="size-3" />
            {visible.length} مكان
          </div>
        </div>
      </div>

      {/* nearby list */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-[#F5F0E8]">الأماكن القريبة</h3>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {visible.slice(0, 20).map((p) => {
            const cat = getCategoryById(p.category);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlace(p)}
                className="flex w-full items-center gap-3 rounded-xl border border-[#D4A03C]/12 bg-[#1A1612] p-2.5 text-right transition-colors hover:border-[#D4A03C]/30"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: (cat?.color ?? "#D4A03C") + "22" }}
                >
                  {p.image}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#F5F0E8]">{p.name}</span>
                  <span className="flex items-center gap-1 text-xs text-[#8A8078]">
                    <MapPin className="size-3" />
                    <span className="truncate">{p.address}</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#D4A03C]">
                  <Star className="size-3 fill-[#D4A03C]" />
                  {p.rating}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeCategory && (
        <p className="text-xs text-[#8A8078]">تصفية حسب: {getCategoryById(activeCategory)?.name}</p>
      )}
    </div>
  );
}
