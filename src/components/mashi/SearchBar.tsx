"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { searchPlaces, getCategoryById } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const { searchQuery, setSearchQuery, setSelectedPlace, setActiveCategory } = useStore();
  const [focused, setFocused] = useState(false);
  const results = searchQuery ? searchPlaces(searchQuery).slice(0, 6) : [];

  return (
    <div className="relative z-20">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-[#D4A03C]/20 bg-[#1A1612] px-3 py-2.5 transition-all",
          focused && "border-[#D4A03C]/50 cairo-glow"
        )}
      >
        <Search className="size-4 shrink-0 text-[#D4A03C]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="ابحث عن مطعم، مسجد، مكان..."
          className="w-full bg-transparent text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:outline-none"
          aria-label="بحث"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="مسح البحث"
            className="shrink-0 text-[#8A8078] hover:text-[#F5F0E8]"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-[#D4A03C]/20 bg-[#1A1612] shadow-2xl"
          >
            <ul className="max-h-80 overflow-y-auto">
              {results.map((p) => {
                const cat = getCategoryById(p.category);
                return (
                  <li key={p.id}>
                    <button
                      onMouseDown={() => {
                        setSelectedPlace(p);
                        setSearchQuery("");
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-right hover:bg-[#2A2520]"
                    >
                      <span
                        className="flex size-9 items-center justify-center rounded-lg text-lg"
                        style={{ backgroundColor: (cat?.color ?? "#D4A03C") + "22" }}
                      >
                        {p.image}
                      </span>
                      <span className="flex-1 overflow-hidden">
                        <span className="block truncate text-sm font-semibold text-[#F5F0E8]">{p.name}</span>
                        <span className="block truncate text-xs text-[#8A8078]">{cat?.name}</span>
                      </span>
                      <span className="text-xs font-bold text-[#D4A03C]">★ {p.rating}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
