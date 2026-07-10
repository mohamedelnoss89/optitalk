"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Mail, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

export default function ContactPanel() {
  const { contactOpen, setContactOpen } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("كل البيانات مطلوبة");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("تم إرسال رسالتك بنجاح");
      setName("");
      setEmail("");
      setMessage("");
      setContactOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={contactOpen} onOpenChange={setContactOpen}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[80vh] w-full max-w-md rounded-t-3xl border-t-2 border-[#D4A03C]/30 bg-[#0a0e1a] p-0"
      >
        <SheetHeader className="p-5 pb-2">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-[#F5F0E8]">
            <Mail className="size-5 text-[#D4A03C]" />
            تواصل معنا
          </SheetTitle>
          <SheetDescription className="text-xs text-[#8A8078]">
            عندك اقتراح أو ملاحظة؟ ابعتلنا رسالة.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 p-5 pt-2">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-[#C4A882]">
              <User className="size-3" /> الاسم
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك الكريم"
              className="w-full rounded-lg border border-[#D4A03C]/15 bg-[#141925] px-3 py-2.5 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-[#C4A882]">
              <Mail className="size-3" /> الإيميل
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              dir="ltr"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#D4A03C]/15 bg-[#141925] px-3 py-2.5 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-[#C4A882]">
              <Send className="size-3" /> الرسالة
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="اكتب رسالتك..."
              className="w-full resize-none rounded-lg border border-[#D4A03C]/15 bg-[#141925] px-3 py-2.5 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
            />
          </div>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4A03C] py-3 text-sm font-bold text-[#0a0e1a] disabled:opacity-50"
          >
            <Send className="size-4" />
            {submitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
