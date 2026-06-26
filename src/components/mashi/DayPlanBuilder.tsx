"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronUp, ChevronDown, Calendar, Clock, MapPin, Route as RouteIcon } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { getPlaceById, getCategoryById } from "@/lib/data";

export default function DayPlanBuilder() {
  const { dayPlans, addDayPlan, removeDayPlan, removeStopFromPlan, reorderStop, currentUser, setSelectedPlace } = useStore();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const createPlan = () => {
    if (!newName.trim()) {
      toast.error("اكتب اسم الخطة");
      return;
    }
    addDayPlan({
      id: `plan_${Date.now()}`,
      name: newName.trim(),
      date: new Date().toISOString().slice(0, 10),
      stops: [],
    });
    setNewName("");
    setCreating(false);
    toast.success("تم إنشاء الخطة");
  };

  const saveToServer = async (planId: string) => {
    if (!currentUser) {
      toast.error("سجّل الدخول لحفظ الخطة");
      return;
    }
    const plan = dayPlans.find((p) => p.id === planId);
    if (!plan) return;
    setSavingId(planId);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          name: plan.name,
          date: plan.date,
          stops: plan.stops.map((s) => ({ placeId: s.placeId, order: s.order, duration: s.duration })),
        }),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      toast.success("تم حفظ الخطة (+10 نقاط)");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#F5F0E8]">
          <RouteIcon className="size-5 text-[#D4A03C]" />
          خططي اليومية
        </h2>
        <button
          onClick={() => setCreating((c) => !c)}
          className="flex items-center gap-1 rounded-full bg-[#D4A03C] px-3 py-1.5 text-xs font-bold text-[#0D0B09]"
        >
          <Plus className="size-3.5" />
          خطة جديدة
        </button>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[#D4A03C]/20 bg-[#1A1612] p-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="اسم الخطة (مثل: جمعة في السيدة)"
                className="w-full rounded-lg border border-[#D4A03C]/15 bg-[#0D0B09] px-3 py-2 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
              />
              <button
                onClick={createPlan}
                className="mt-2 w-full rounded-lg bg-[#D4A03C] py-2 text-sm font-bold text-[#0D0B09]"
              >
                إنشاء
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {dayPlans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D4A03C]/20 p-8 text-center">
          <Calendar className="mx-auto mb-2 size-8 text-[#8A8078]" />
          <p className="text-sm text-[#8A8078]">لا توجد خطط بعد. ابدأ بإنشاء خطتك الأولى!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayPlans.map((plan) => (
            <div key={plan.id} className="overflow-hidden rounded-2xl border border-[#D4A03C]/15 cairo-card">
              <div className="flex items-center justify-between border-b border-[#D4A03C]/10 p-3">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F0E8]">{plan.name}</h3>
                  <p className="flex items-center gap-1 text-[11px] text-[#8A8078]">
                    <Calendar className="size-3" />
                    {plan.date} • {plan.stops.length} محطة
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => saveToServer(plan.id)}
                    disabled={savingId === plan.id || plan.stops.length === 0}
                    className="rounded-lg bg-[#D4A03C]/15 px-2.5 py-1 text-xs font-bold text-[#D4A03C] disabled:opacity-40"
                  >
                    {savingId === plan.id ? "..." : "حفظ"}
                  </button>
                  <button
                    onClick={() => removeDayPlan(plan.id)}
                    className="flex size-7 items-center justify-center rounded-lg bg-[#C62828]/15 text-[#C62828]"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {plan.stops.length === 0 ? (
                <p className="p-4 text-center text-xs text-[#8A8078]">
                  أضف أماكن من بطاقات المكان بـ "أضف للخطة".
                </p>
              ) : (
                <ol className="relative space-y-0 p-3">
                  {plan.stops.map((stop, i) => {
                    const place = getPlaceById(stop.placeId);
                    if (!place) return null;
                    const cat = getCategoryById(place.category);
                    return (
                      <li key={stop.placeId} className="relative flex gap-3 pb-3">
                        {/* timeline dot */}
                        <div className="flex flex-col items-center">
                          <span
                            className="flex size-8 items-center justify-center rounded-full text-sm font-bold text-[#0D0B09]"
                            style={{ backgroundColor: cat?.color ?? "#D4A03C" }}
                          >
                            {i + 1}
                          </span>
                          {i < plan.stops.length - 1 && (
                            <span className="my-1 w-0.5 flex-1 bg-[#D4A03C]/20" style={{ minHeight: "16px" }} />
                          )}
                        </div>
                        <div className="mb-1 flex-1 rounded-lg border border-[#D4A03C]/10 bg-[#1A1612]/60 p-2">
                          <button
                            onClick={() => setSelectedPlace(place)}
                            className="block w-full text-right"
                          >
                            <span className="block text-sm font-semibold text-[#F5F0E8]">
                              {place.image} {place.name}
                            </span>
                            <span className="mt-0.5 flex items-center gap-2 text-[11px] text-[#8A8078]">
                              <span className="flex items-center gap-0.5">
                                <Clock className="size-3" />
                                {stop.duration} دقيقة
                              </span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="size-3" />
                                {cat?.name}
                              </span>
                            </span>
                          </button>
                          <div className="mt-1.5 flex gap-1">
                            <button
                              onClick={() => reorderStop(plan.id, stop.placeId, "up")}
                              disabled={i === 0}
                              className="flex size-6 items-center justify-center rounded bg-[#0D0B09]/50 text-[#8A8078] disabled:opacity-30"
                              aria-label="تحريك لأعلى"
                            >
                              <ChevronUp className="size-3" />
                            </button>
                            <button
                              onClick={() => reorderStop(plan.id, stop.placeId, "down")}
                              disabled={i === plan.stops.length - 1}
                              className="flex size-6 items-center justify-center rounded bg-[#0D0B09]/50 text-[#8A8078] disabled:opacity-30"
                              aria-label="تحريك لأسفل"
                            >
                              <ChevronDown className="size-3" />
                            </button>
                            <button
                              onClick={() => removeStopFromPlan(plan.id, stop.placeId)}
                              className="flex size-6 items-center justify-center rounded bg-[#C62828]/15 text-[#C62828]"
                              aria-label="إزالة"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
