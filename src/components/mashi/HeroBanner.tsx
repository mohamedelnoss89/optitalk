"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Moon, MapPin } from "lucide-react";
import { PLACES } from "@/lib/data";

// ===== صور الأماكن السياحية (نهاراً) =====
const DAY_PLACES = PLACES.filter((p) => p.category === "gawame3" && p.image);
// ===== صور القهاوى (ليلاً) =====
const NIGHT_PLACES = PLACES.filter((p) => p.category === "qahwa" && p.image);

// ===== نصايح نهارية =====
const DAY_TIPS = [
  "ابدأ يومك بزيارة مسجد السيدة زينب وادعُ عند الضريح",
  "زور مسجد السلطان حسن، تحفة العمارة المملوكية في القاهرة",
  "متحف الفن الإسلامى بيفتح الصبح - أنصحك تروح بدري",
  "سبيل أم عباس من التحف المعمارية اللي ماتقدرش تفوتها",
  "مسجد ابن طولون أقدم مساجد القاهرة - اتمشى في فنائه",
  "بيت الأمة سعد زغلول - تعرف على تاريخ مصر الحديث",
  "باب زويلة من بوابات القاهرة الفاطمية التاريخية",
  "مسجد الرفاعى فيه مقامات ملوك مصر - زوره النهارده",
];

// ===== نصايح ليلية =====
const NIGHT_TIPS = [
  "قهوة بلبع من أعرق قهاوي السيدة زينب - جرّبها بالليل",
  "اجلس على قهوة السرايا واتفرج على ميدان السيدة زينب",
  "قهوة تفاحة مكان مثالي لسهرية هادية مع أصحابك",
  "كافيه لوكس - قهوتك وانت بتتمشى في الشارع",
  "قهوة لؤلؤة الجماميز من القهاوي اللي بتعرف الليل",
  "قهوة اليل واخرة - الاسم بيقول كل حاجة",
  "قهوة المحروسة مكان مناسب لقعدة ليلية مريحة",
  "قهوة البيت الكبير - حسّ بدفء القهاوي البلدي",
];

const ROTATION_INTERVAL = 20000; // 20 ثانية للتجربة (تقدر تغيرها لـ 1200000 = 20 دقيقة)

export default function HeroBanner() {
  const [isNight, setIsNight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // تحديد نهار/ليل
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsNight(hour >= 18 || hour < 6);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000); // كل دقيقة
    return () => clearInterval(interval);
  }, []);

  // تدوير الصور
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const places = isNight ? NIGHT_PLACES : DAY_PLACES;
  const tips = isNight ? NIGHT_TIPS : DAY_TIPS;
  const place = places[currentIndex % places.length] || places[0];
  const tip = tips[currentIndex % tips.length];

  if (!place) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-[#D4A03C]/25 cairo-card cairo-shadow-lg"
      aria-label="بانر ترحيبي"
    >
      {/* الصورة المتغيرة */}
      <div className="relative h-44 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${place.id}-${currentIndex}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            {/* overlay حسب الوقت */}
            <div
              className="absolute inset-0"
              style={{
                background: isNight
                  ? "linear-gradient(180deg, rgba(10, 14, 26, 0.6) 0%, rgba(10, 14, 26, 0.92) 100%)"
                  : "linear-gradient(180deg, rgba(13, 11, 9, 0.4) 0%, rgba(13, 11, 9, 0.9) 100%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* شارة نهار/ليل */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-[#0a0e1a]/80 px-2.5 py-1 backdrop-blur-md">
          {isNight ? (
            <>
              <Moon className="size-3 text-[#6C5CE7]" />
              <span className="text-[10px] font-medium text-[#C4A882]">المساء</span>
            </>
          ) : (
            <>
              <Sun className="size-3 text-[#D4A03C]" />
              <span className="text-[10px] font-medium text-[#C4A882]">النهار</span>
            </>
          )}
        </div>

        {/* اسم المكان */}
        <div className="absolute bottom-3 right-3 left-3">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="size-3 text-[#D4A03C]" />
            <span className="text-[10px] font-medium text-[#D4A03C]">دليلك الذكي لقلب القاهرة</span>
          </div>
          <h2 className="text-xl font-bold text-[#F5F0E8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {place.name}
          </h2>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="size-3 text-[#C4A882]" />
            <span className="text-[11px] text-[#C4A882] truncate">{place.address}</span>
          </div>
        </div>
      </div>

      {/* النصيحة */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tip}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-2"
          >
            <span className="text-lg shrink-0">{isNight ? "🌙" : "☀️"}</span>
            <p className="text-sm leading-relaxed text-[#C4A882]">{tip}</p>
          </motion.div>
        </AnimatePresence>

        {/* إحصائيات */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["+80 مكان", "+12 تصنيف", "خرائط", "تقييمات"].map((t) => (
            <span
              key={t}
              className="rounded-md bg-[#0a0e1a]/60 px-2 py-0.5 text-[10px] text-[#8A8078]"
            >
              {t}
            </span>
          ))}
        </div>

        {/* مؤشر التدوير */}
        <div className="mt-2 flex justify-center gap-1">
          {places.slice(0, 5).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === currentIndex % 5 ? "w-4 bg-[#D4A03C]" : "w-1 bg-[#D4A03C]/20"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
