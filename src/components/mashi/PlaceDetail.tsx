"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Star, MapPin, Phone, Clock, Heart, CalendarPlus, Flag, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { getCategoryById } from "@/lib/data";
import { cn } from "@/lib/utils";
import ReviewSystem from "./ReviewSystem";

export default function PlaceDetail() {
  const {
    selectedPlace,
    setSelectedPlace,
    toggleFavorite,
    isFavorite,
    currentUser,
    dayPlans,
    addStopToPlan,
    addDayPlan,
  } = useStore();
  const [reporting, setReporting] = useState(false);

  const open = !!selectedPlace;
  if (!selectedPlace) return null;
  const place = selectedPlace;
  const cat = getCategoryById(place.category);
  const fav = isFavorite(place.id);

  const addToPlan = () => {
    let planId = dayPlans[0]?.id;
    if (!planId) {
      planId = `plan_${Date.now()}`;
      addDayPlan({
        id: planId,
        name: "خطتي الأولى",
        date: new Date().toISOString().slice(0, 10),
        stops: [],
      });
    }
    addStopToPlan(planId, { placeId: place.id, order: (dayPlans[0]?.stops.length ?? 0) + 1, duration: 60 });
    toast.success("تمت الإضافة لخطة اليوم");
  };

  const report = async () => {
    setReporting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id ?? null,
          placeId: place.id,
          reason: "بلاغ من المستخدم",
          description: `بلاغ على ${place.name}`,
        }),
      });
      if (!res.ok) throw new Error("فشل");
      toast.success("تم استلام بلاغك، شكراً لك");
    } catch {
      toast.error("تعذر إرسال البلاغ");
    } finally {
      setReporting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && setSelectedPlace(null)}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t-2 border-[#D4A03C]/30 bg-[#0D0B09] p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{place.name}</SheetTitle>
          <SheetDescription>{place.description}</SheetDescription>
        </SheetHeader>

        {/* hero */}
        <div
          className="relative flex h-40 items-center justify-center text-7xl"
          style={{
            background: `linear-gradient(135deg, ${(cat?.color ?? "#D4A03C")}55, ${(cat?.color ?? "#D4A03C")}22)`,
          }}
        >
          <span className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">{place.image}</span>
          <button
            onClick={() => toggleFavorite(place.id)}
            aria-label={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            className={cn(
              "absolute left-3 top-3 flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
              fav ? "bg-[#C0623B] text-[#F5F0E8]" : "bg-[#0D0B09]/60 text-[#F5F0E8]"
            )}
          >
            <Heart className={cn("size-4", fav && "fill-current")} />
          </button>
          <span
            className="absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold text-[#F5F0E8]"
            style={{ backgroundColor: (cat?.color ?? "#D4A03C") + "dd" }}
          >
            {cat?.emoji} {cat?.name}
          </span>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-[#F5F0E8]">{place.name}</h2>
              <div className="flex items-center gap-1 rounded-full bg-[#D4A03C]/15 px-2 py-1 text-sm font-bold text-[#D4A03C]">
                <Star className="size-3.5 fill-[#D4A03C]" />
                {place.rating}
              </div>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[#8A8078]">{place.description}</p>
          </div>

          {/* tags */}
          {place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-[#D4A03C]/15 bg-[#1A1612] px-2 py-0.5 text-[11px] text-[#C4A882]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* info rows */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 rounded-lg bg-[#1A1612] p-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#C0623B]" />
              <span className="text-xs text-[#F5F0E8]">{place.address}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[#1A1612] p-2.5">
              <Phone className="size-4 shrink-0 text-[#C0623B]" />
              <span className="text-xs text-[#F5F0E8]" dir="ltr">{place.phone}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[#1A1612] p-2.5">
              <Clock className="size-4 shrink-0 text-[#C0623B]" />
              <span className="text-xs text-[#F5F0E8]">{place.hours}</span>
            </div>
          </div>

          {/* actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={addToPlan}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#D4A03C] py-2.5 text-sm font-bold text-[#0D0B09]"
            >
              <CalendarPlus className="size-4" />
              أضف للخطة
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D4A03C]/30 bg-[#1A1612] py-2.5 text-sm font-bold text-[#F5F0E8]"
            >
              <Navigation className="size-4" />
              الاتجاهات
            </a>
          </div>

          <ReviewSystem placeId={place.id} />

          <button
            onClick={report}
            disabled={reporting}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#C62828]/30 py-2 text-xs font-medium text-[#C62828] disabled:opacity-50"
          >
            <Flag className="size-3.5" />
            {reporting ? "جارٍ الإرسال..." : "إبلاغ عن مشكلة"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
