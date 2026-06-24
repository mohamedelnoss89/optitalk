"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function HeroBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-[#D4A03C]/25 cairo-card p-5"
      aria-label="بانر ترحيبي"
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(212,160,60,0.4), transparent 60%), radial-gradient(circle at 80% 80%, rgba(192,98,59,0.3), transparent 55%)",
        }}
      />
      <div className="absolute -left-6 -top-6 size-32 rounded-full bg-[#D4A03C]/10 blur-2xl" />
      <div className="relative">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#D4A03C]/15 px-2.5 py-1 text-[11px] font-medium text-[#D4A03C]">
          <Sparkles className="size-3" />
          دليلك الذكي لقلب القاهرة
        </div>
        <h2 className="text-2xl font-bold leading-tight text-[#F5F0E8]">
          اكتشف <span className="cairo-text-gold">السيدة زينب</span>
        </h2>
        <p className="mt-1.5 max-w-[90%] text-sm leading-relaxed text-[#8A8078]">
          من المشويات الأصيلة إلى الجوامع التاريخية، عشّ روح القاهرة الفاطمية.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["+80 مكان", "+12 تصنيف", "خرائط", "تقييمات"].map((t) => (
            <span
              key={t}
              className="rounded-md bg-[#0D0B09]/60 px-2 py-0.5 text-[11px] text-[#C4A882]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
