"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { name: string | null } | null;
}

export default function ReviewSystem({ placeId }: { placeId: string }) {
  const currentUser = useStore((s) => s.currentUser);
  const setPlaceReview = useStore((s) => s.setPlaceReview);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // fetch on mount
  useEffect(() => {
    let active = true;
    fetch(`/api/reviews?placeId=${placeId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setReviews(d.reviews ?? []);
        if (d.avg) setPlaceReview(placeId, d.avg);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [placeId, setPlaceReview]);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const submit = async () => {
    if (!currentUser) {
      toast.error("سجّل الدخول لإضافة تقييم");
      return;
    }
    if (rating === 0) {
      toast.error("اختر تقييماً من النجوم");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, placeId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setReviews([{ ...data, user: { name: currentUser.name } }, ...reviews]);
      setRating(0);
      setComment("");
      setPlaceReview(placeId, (avg * reviews.length + rating) / (reviews.length + 1));
      toast.success("تم إضافة تقييمك (+5 نقاط)");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#F5F0E8]">التقييمات ({reviews.length})</h4>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 text-sm font-bold text-[#D4A03C]">
            <Star className="size-4 fill-[#D4A03C]" />
            {avg.toFixed(1)}
          </div>
        )}
      </div>

      {/* add review */}
      <div className="rounded-xl border border-[#D4A03C]/15 bg-[#1A1612] p-3">
        <div className="mb-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              aria-label={`${n} نجوم`}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  n <= (hover || rating) ? "fill-[#D4A03C] text-[#D4A03C]" : "text-[#2A2520]"
                )}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="شاركنا تجربتك..."
          rows={2}
          className="w-full resize-none rounded-lg border border-[#D4A03C]/15 bg-[#0D0B09] px-3 py-2 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={submitting}
          className="mt-2 w-full rounded-lg bg-[#D4A03C] py-2 text-sm font-bold text-[#0D0B09] disabled:opacity-50"
        >
          {submitting ? "جارٍ الإرسال..." : "أضف التقييم"}
        </button>
      </div>

      {/* list */}
      <div className="max-h-60 space-y-2 overflow-y-auto">
        {loading ? (
          <p className="py-3 text-center text-xs text-[#8A8078]">جارٍ التحميل...</p>
        ) : reviews.length === 0 ? (
          <p className="py-3 text-center text-xs text-[#8A8078]">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-[#D4A03C]/10 bg-[#1A1612]/60 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5F0E8]">{r.user?.name ?? "زائر"}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={cn("size-3", n <= r.rating ? "fill-[#D4A03C] text-[#D4A03C]" : "text-[#2A2520]")}
                    />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-xs leading-relaxed text-[#8A8078]">{r.comment}</p>}
              <span className="mt-1 block text-[10px] text-[#8A8078]">
                {new Date(r.createdAt).toLocaleDateString("ar-EG")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
