"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import { PLACES, getCategoryById, CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function MapScreen() {
  const { setSelectedPlace } = useStore();
  const [filter, setFilter] = useState<string | null>(null);

  const visible = filter
    ? PLACES.filter((p) => p.category === filter)
    : PLACES;

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
            !filter ? "border-[#D4A03C] bg-[#D4A03C] text-[#0a0e1a]" : "border-[#D4A03C]/20 bg-[#141925] text-[#8A8078]"
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
              filter === c.id ? "border-transparent text-[#F5F0E8]" : "border-[#D4A03C]/20 bg-[#141925] text-[#8A8078]"
            )}
            style={filter === c.id ? { backgroundColor: c.color } : undefined}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Google Maps iframe بكل الأماكن */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D4A03C]/20 cairo-shadow">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13821.765!2d31.2456!3d30.0314!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sar!2seg!4v1700000000000"
          className="w-full h-80"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="خريطة السيدة زينب"
        />
        <div className="absolute top-2 right-2 rounded-lg bg-[#0a0e1a]/85 px-3 py-1.5 backdrop-blur-md">
          <span className="text-xs font-bold text-[#D4A03C]">السيدة زينب • القاهرة</span>
        </div>
      </div>

      {/* nearby list */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-[#F5F0E8]">الأماكن</h3>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {visible.map((p, i) => {
            const cat = getCategoryById(p.category);
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                onClick={() => setSelectedPlace(p)}
                className="flex w-full items-center gap-3 rounded-xl border border-[#D4A03C]/12 bg-[#141925] p-2.5 text-right transition-colors hover:border-[#D4A03C]/30"
              >
                {/* صورة المكان */}
                <div className="size-10 shrink-0 overflow-hidden rounded-lg">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div
                      className="flex w-full h-full items-center justify-center text-lg"
                      style={{ backgroundColor: (cat?.color ?? "#D4A03C") + "22" }}
                    >
                      {p.emoji}
                    </div>
                  )}
                </div>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#F5F0E8]">{p.name}</span>
                  <span className="flex items-center gap-1 text-xs text-[#8A8078]">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{p.address}</span>
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-1">
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-[#F5F0E8]"
                    style={{ backgroundColor: (cat?.color ?? "#D4A03C") + "cc" }}
                  >
                    {cat?.name}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-[#D4A03C]">
                    <Star className="size-3 fill-[#D4A03C]" />
                    {p.rating}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* لينك لفتح Google Maps كامل */}
      <a
        href="https://www.google.com/maps/search/?api=1&query=السيدة+زينب+القاهرة"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border border-[#D4A03C]/30 bg-[#141925] py-2.5 text-sm font-bold text-[#D4A03C]"
      >
        <ExternalLink className="size-4" />
        افتح على Google Maps
      </a>
    </div>
  );
}
