"use client";

import { motion } from "framer-motion";
import { Star, Heart, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";
import { getCategoryById, type Place } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function PlaceCard({ place, index = 0 }: { place: Place; index?: number }) {
  const { setSelectedPlace, toggleFavorite, isFavorite } = useStore();
  const cat = getCategoryById(place.category);
  const fav = isFavorite(place.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedPlace(place)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#D4A03C]/12 cairo-card cairo-shadow transition-all hover:border-[#D4A03C]/30 hover:cairo-glow"
    >
      <div
        className="relative flex h-24 items-center justify-center text-4xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${(cat?.color ?? "#D4A03C")}33, ${(cat?.color ?? "#D4A03C")}11)`,
        }}
      >
        {place.image ? (
          <img
            src={place.image}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">{place.emoji}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(place.id);
          }}
          aria-label={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          className={cn(
            "absolute left-2 top-2 flex size-7 items-center justify-center rounded-full backdrop-blur-md transition-all",
            fav ? "bg-[#C0623B] text-[#F5F0E8]" : "bg-[#0D0B09]/60 text-[#8A8078] hover:text-[#F5F0E8]"
          )}
        >
          <Heart className={cn("size-3.5", fav && "fill-current")} />
        </button>
        <span
          className="absolute bottom-2 right-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-[#F5F0E8]"
          style={{ backgroundColor: (cat?.color ?? "#D4A03C") + "cc" }}
        >
          {cat?.name}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 text-sm font-bold text-[#F5F0E8]">{place.name}</h4>
          <div className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#D4A03C]">
            <Star className="size-3 fill-[#D4A03C]" />
            {place.rating}
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-[#8A8078]">{place.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-[#8A8078]">
            <MapPin className="size-3 text-[#C0623B]" />
            <span className="truncate">{place.priceRange}</span>
          </div>
          <span className="text-[11px] text-[#8A8078]">{place.hours.split(" - ")[0]}</span>
        </div>
      </div>
    </motion.article>
  );
}
