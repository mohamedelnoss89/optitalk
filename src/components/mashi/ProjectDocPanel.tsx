"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, MapPin, Sparkles, Users, Award } from "lucide-react";
import { useStore } from "@/lib/store";

export default function ProjectDocPanel() {
  const { docOpen, setDocOpen } = useStore();

  return (
    <Sheet open={docOpen} onOpenChange={setDocOpen}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88vh] w-full max-w-md rounded-t-3xl border-t-2 border-[#D4A03C]/30 bg-[#0D0B09] p-0"
      >
        <SheetHeader className="border-b border-[#D4A03C]/10 p-5 pb-3">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-[#F5F0E8]">
            <BookOpen className="size-5 text-[#D4A03C]" />
            عن المشروع
          </SheetTitle>
          <SheetDescription className="sr-only">وصف مشروع الماشي</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[70vh]">
          <div className="space-y-5 p-5 text-sm leading-relaxed text-[#C4A882]">
            <section>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-base font-bold text-[#F5F0E8]">
                <Sparkles className="size-4 text-[#D4A03C]" />
                ما هو «الماشي»؟
              </h3>
              <p>
                «الماشي» دليلك الذكي لاكتشاف منطقة السيدة زينب بالقاهرة. يجمع التطبيق أكثر من 80 مكاناً
                موثقاً في 12 تصنيفاً، من المشويات الأصيلة إلى الجوامع التاريخية والخدمات اليومية.
              </p>
            </section>

            <section>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-base font-bold text-[#F5F0E8]">
                <MapPin className="size-4 text-[#D4A03C]" />
                لماذا السيدة زينب؟
              </h3>
              <p>
                منطقة السيدة زينب من أعرق أحياء القاهرة الفاطمية، تجمع بين الأصالة الشعبية والعبق
                التاريخي. هنا تجد قهوة بلبع وحلوانيات عبد الرحمن ومسجد السيدة زينب وكشري أبو طارق.
              </p>
            </section>

            <section>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-base font-bold text-[#F5F0E8]">
                <Users className="size-4 text-[#D4A03C]" />
                المميزات
              </h3>
              <ul className="list-disc space-y-1 pr-5">
                <li>بحث فوري واقتراحات ذكية</li>
                <li>تصفية حسب 12 تصنيفاً ملوّناً</li>
                <li>اكتشاف حسب المود (جعان، قهوة، نزهة...)</li>
                <li>خريطة مخصصة بكل الأماكن</li>
                <li>خطط يومية بمحطات قابلة للترتيب</li>
                <li>تقييمات ومجتمع أسئلة وأجوبة</li>
                <li>أوسمة ومكافآت نقاط</li>
                <li>مفضلة محفوظة على جهازك</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-base font-bold text-[#F5F0E8]">
                <Award className="size-4 text-[#D4A03C]" />
                التقنيات
              </h3>
              <p>
                مبني بـ Next.js 16 و TypeScript و Tailwind CSS و shadcn/ui، مع Prisma (SQLite) لتخزين
                البيانات، و Zustand للحالة، و Framer Motion للانتقالات.
              </p>
            </section>

            <section className="rounded-xl border border-[#D4A03C]/15 bg-[#1A1612] p-3">
              <p className="text-xs text-[#8A8078]">
                <strong className="text-[#D4A03C]">ملاحظة:</strong> التطبيق يحتاج اتصالاً بالإنترنت
                لجلب التقييمات والخطط من الخادم. المفضلة والوضع الحالي محفوظة محلياً على جهازك.
              </p>
            </section>

            <p className="pt-2 text-center text-[11px] text-[#8A8078]">
              صُمّم بحب لروح القاهرة • 2025
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
