"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import SearchBar from "./SearchBar";
import HeroBanner from "./HeroBanner";
import MoodDiscovery from "./MoodDiscovery";
import FeaturedSpot from "./FeaturedSpot";
import CategoryGrid from "./CategoryGrid";
import PlaceCard from "./PlaceCard";
import CategoryScreen from "./CategoryScreen";
import { PLACES, searchPlaces } from "@/lib/data";

export default function HomeScreen() {
  const { activeCategory, searchQuery } = useStore();

  // base list: filtered by search or top-rated
  const list = searchQuery
    ? searchPlaces(searchQuery)
    : [...PLACES].sort((a, b) => b.rating - a.rating).slice(0, 12);

  return (
    <div className="space-y-6 px-4 py-5">
      <SearchBar />

      <AnimatePresence mode="wait">
        {activeCategory ? (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CategoryScreen />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <HeroBanner />
            <MoodDiscovery />
            <FeaturedSpot />
            <CategoryGrid />

            <section aria-labelledby="list-title">
              <div className="mb-2.5 flex items-baseline justify-between">
                <h3 id="list-title" className="text-base font-bold text-[#F5F0E8]">
                  {searchQuery ? `نتائج البحث (${list.length})` : "الأعلى تقييماً"}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {list.map((p, i) => (
                  <PlaceCard key={p.id} place={p} index={i} />
                ))}
              </div>
              {list.length === 0 && (
                <p className="py-10 text-center text-sm text-[#8A8078]">
                  لا توجد نتائج. جرّب كلمة أخرى.
                </p>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
