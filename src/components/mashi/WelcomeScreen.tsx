"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, LogIn, UserPlus, X, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

type Mode = "welcome" | "login" | "register";

export default function WelcomeScreen() {
  const { setCurrentUser, setGuestMode, setActiveTab } = useStore();
  const [mode, setMode] = useState<Mode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const guest = () => {
    setGuestMode(true);
    setActiveTab("home");
    toast.success("أهلاً بك ضيفاً في الماشي");
  };

  const submit = async () => {
    if (!email || !password) {
      toast.error("الإيميل وكلمة المرور مطلوبان");
      return;
    }
    setSubmitting(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setCurrentUser({ id: data.id, name: data.name ?? email, email: data.email });
      setGuestMode(false);
      setActiveTab("home");
      toast.success(mode === "login" ? `أهلاً بعودتك ${data.name ?? ""}` : "تم إنشاء حسابك بنجاح");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-130px)] flex-col items-center justify-center px-6 py-8">
      {/* ambient bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(212,160,60,0.18), transparent 60%), radial-gradient(circle at 70% 80%, rgba(192,98,59,0.15), transparent 55%)",
        }}
      />
      <div className="pointer-events-none absolute -left-10 top-20 size-40 rounded-full bg-[#D4A03C]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-20 size-40 rounded-full bg-[#C0623B]/10 blur-3xl" />

      <AnimatePresence mode="wait">
        {mode === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
          >
            {/* صورة الواجهة */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative mb-6 w-full overflow-hidden rounded-3xl border border-[#D4A03C]/25 cairo-shadow-lg"
            >
              <img
                src="/hero-image.jpg"
                alt="الماشي - دليل السيدة زينب"
                className="w-full h-56 object-cover"
              />
              {/* overlay متدرج */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B09] via-[#0D0B09]/40 to-transparent" />
              {/* اسم التطبيق فوق الصورة */}
              <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center">
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-extrabold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                >
                  <span className="cairo-text-gold">الماشي</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-1 text-sm text-[#F5F0E8]/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                >
                  دليل السيدة زينب بالقاهرة
                </motion.p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 max-w-xs text-sm leading-relaxed text-[#C4A882]"
            >
              اكتشف روح القاهرة الفاطمية. مشويات أصيلة، قهوة بلدي، جوامع تاريخية وأكثر من 80 مكاناً ينتظرك.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex w-full flex-col gap-2.5"
            >
              <button
                onClick={guest}
                className="w-full rounded-xl bg-[#D4A03C] py-3 text-sm font-bold text-[#0D0B09] transition-transform active:scale-95 cairo-glow"
              >
                ابدأ الاستكشاف كضيف
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("login")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D4A03C]/30 bg-[#1A1612] py-2.5 text-sm font-bold text-[#F5F0E8]"
                >
                  <LogIn className="size-4" />
                  دخول
                </button>
                <button
                  onClick={() => setMode("register")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D4A03C]/30 bg-[#1A1612] py-2.5 text-sm font-bold text-[#F5F0E8]"
                >
                  <UserPlus className="size-4" />
                  حساب جديد
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {(mode === "login" || mode === "register") && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 w-full max-w-sm"
          >
            <button
              onClick={() => setMode("welcome")}
              className="mb-3 flex items-center gap-1 text-xs text-[#8A8078] hover:text-[#F5F0E8]"
            >
              <X className="size-3.5" /> رجوع
            </button>

            <div className="rounded-3xl border border-[#D4A03C]/20 cairo-card p-6">
              <h2 className="text-xl font-bold text-[#F5F0E8]">
                {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
              </h2>
              <p className="mt-1 text-xs text-[#8A8078]">
                {mode === "login" ? "ادخل بياناتك للمتابعة" : "انضم لمجتمع الماشي"}
              </p>

              <div className="mt-5 space-y-3">
                {mode === "register" && (
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-[#C4A882]">
                      <UserIcon className="size-3" /> الاسم
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك الكريم"
                      className="w-full rounded-lg border border-[#D4A03C]/15 bg-[#0D0B09] px-3 py-2.5 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
                    />
                  </div>
                )}
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
                    className="w-full rounded-lg border border-[#D4A03C]/15 bg-[#0D0B09] px-3 py-2.5 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-[#C4A882]">
                    <Lock className="size-3" /> كلمة المرور
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    dir="ltr"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#D4A03C]/15 bg-[#0D0B09] px-3 py-2.5 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
                  />
                </div>

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4A03C] py-3 text-sm font-bold text-[#0D0B09] disabled:opacity-50"
                >
                  {submitting ? "جارٍ..." : mode === "login" ? "دخول" : "إنشاء الحساب"}
                </button>

                <p className="text-center text-xs text-[#8A8078]">
                  {mode === "login" ? "ليس لديك حساب؟ " : "لديك حساب؟ "}
                  <button
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    className="font-bold text-[#D4A03C] hover:underline"
                  >
                    {mode === "login" ? "أنشئ واحداً" : "سجّل دخول"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
