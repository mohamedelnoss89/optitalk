"use client";

import { motion } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { PLACES, getCategoryById } from "@/lib/data";
import { Star, MapPin } from "lucide-react";

export default function FavoritesScreen() {
  const { favorites, setSelectedPlace, toggleFavorite, setActiveCategory } = useStore();
  const favPlaces = PLACES.filter((p) => favorites.includes(p.id));

  return (
    <div className="space-y-4 px-4 py-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-[#F5F0E8]">
        <Heart className="size-5 fill-[#C0623B] text-[#C0623B]" />
        المفضلة ({favPlaces.length})
      </h2>

      {favPlaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D4A03C]/20 p-10 text-center">
          <Heart className="mx-auto mb-3 size-10 text-[#8A8078]" />
          <p className="text-sm font-semibold text-[#F5F0E8]">لا توجد أماكن مفضلة</p>
          <p className="mt-1 text-xs text-[#8A8078]">اضغط على القلب في أي مكان لإضافته هنا.</p>
          <button
            onClick={() => setActiveCategory(null)}
            className="mt-4 rounded-full bg-[#D4A03C] px-4 py-2 text-xs font-bold text-[#0a0e1a]"
          >
            استكشف الأماكن
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {favPlaces.map((p, i) => {
            const cat = getCategoryById(p.category);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="flex items-center gap-3 rounded-2xl border border-[#D4A03C]/15 cairo-card p-2.5"
              >
                <button
                  onClick={() => setSelectedPlace(p)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-right"
                >
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: (cat?.color ?? "#D4A03C") + "22" }}
                  >
                    {p.image}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#F5F0E8]">{p.name}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-[11px] text-[#8A8078]">
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-[#D4A03C] text-[#D4A03C]" />
                        {p.rating}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="size-3 text-[#C0623B]" />
                        <span className="truncate">{p.address}</span>
                      </span>
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => toggleFavorite(p.id)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#C0623B]/15 text-[#C0623B]"
                  aria-label="إزالة من المفضلة"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
