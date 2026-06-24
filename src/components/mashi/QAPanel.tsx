"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

interface QuestionDTO {
  id: string;
  title: string;
  content: string | null;
  category: string;
  createdAt: string;
  user?: { name: string | null } | null;
  answers: {
    id: string;
    content: string;
    createdAt: string;
    user?: { name: string | null } | null;
  }[];
}

export default function QAPanel() {
  const { currentUser, setSelectedPlace } = useStore();
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [answerFor, setAnswerFor] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  const load = () => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const ask = async () => {
    if (!currentUser) {
      toast.error("سجّل الدخول لطرح سؤال");
      return;
    }
    if (!title.trim()) {
      toast.error("اكتب عنوان السؤال");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, title, content, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions([
        {
          ...data,
          user: { name: currentUser.name },
          answers: [],
        },
        ...questions,
      ]);
      setTitle("");
      setContent("");
      setShowForm(false);
      toast.success("تم نشر سؤالك (+2 نقطة)");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitAnswer = async (qid: string) => {
    if (!currentUser) {
      toast.error("سجّل الدخول للإجابة");
      return;
    }
    if (!answerText.trim()) return;
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qid, userId: currentUser.id, content: answerText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(
        questions.map((q) =>
          q.id === qid
            ? { ...q, answers: [...q.answers, { ...data, user: { name: currentUser.name } }] }
            : q
        )
      );
      setAnswerText("");
      setAnswerFor(null);
      toast.success("تم نشر إجابتك (+3 نقاط)");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#F5F0E8]">
          <MessageCircle className="size-5 text-[#D4A03C]" />
          أسئلة المجتمع
        </h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 rounded-full bg-[#D4A03C] px-3 py-1.5 text-xs font-bold text-[#0D0B09]"
        >
          <Plus className="size-3.5" />
          اسأل سؤال
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 rounded-xl border border-[#D4A03C]/20 bg-[#1A1612] p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F5F0E8]">سؤال جديد</h3>
                <button onClick={() => setShowForm(false)} aria-label="إغلاق">
                  <X className="size-4 text-[#8A8078]" />
                </button>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان السؤال"
                className="w-full rounded-lg border border-[#D4A03C]/15 bg-[#0D0B09] px-3 py-2 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="تفاصيل السؤال (اختياري)"
                rows={3}
                className="w-full resize-none rounded-lg border border-[#D4A03C]/15 bg-[#0D0B09] px-3 py-2 text-sm text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
              />
              <button
                onClick={ask}
                disabled={submitting}
                className="w-full rounded-lg bg-[#D4A03C] py-2 text-sm font-bold text-[#0D0B09] disabled:opacity-50"
              >
                {submitting ? "جارٍ النشر..." : "انشر السؤال"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="py-10 text-center text-sm text-[#8A8078]">جارٍ التحميل...</p>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D4A03C]/20 p-8 text-center">
          <MessageCircle className="mx-auto mb-2 size-8 text-[#8A8078]" />
          <p className="text-sm text-[#8A8078]">لا توجد أسئلة بعد. كن أول من يسأل!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <motion.article
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="rounded-2xl border border-[#D4A03C]/15 cairo-card p-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#D4A03C]/15 text-[10px] font-bold text-[#D4A03C]">
                  {(q.user?.name ?? "زائر").charAt(0)}
                </span>
                <div>
                  <p className="text-xs font-bold text-[#F5F0E8]">{q.user?.name ?? "زائر"}</p>
                  <p className="text-[10px] text-[#8A8078]">{new Date(q.createdAt).toLocaleDateString("ar-EG")}</p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#F5F0E8]">{q.title}</h3>
              {q.content && <p className="mt-1 text-xs leading-relaxed text-[#8A8078]">{q.content}</p>}

              {/* answers */}
              {q.answers.length > 0 && (
                <div className="mt-2 space-y-1.5 border-r-2 border-[#D4A03C]/20 pr-2">
                  {q.answers.map((a) => (
                    <div key={a.id} className="rounded-lg bg-[#0D0B09]/40 p-2">
                      <p className="text-[11px] font-bold text-[#C4A882]">{a.user?.name ?? "زائر"}</p>
                      <p className="text-xs text-[#F5F0E8]">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {answerFor === q.id ? (
                <div className="mt-2 flex gap-1.5">
                  <input
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="اكتب إجابتك..."
                    className="flex-1 rounded-lg border border-[#D4A03C]/15 bg-[#0D0B09] px-2 py-1.5 text-xs text-[#F5F0E8] placeholder:text-[#8A8078] focus:border-[#D4A03C]/40 focus:outline-none"
                  />
                  <button
                    onClick={() => submitAnswer(q.id)}
                    className="flex size-7 items-center justify-center rounded-lg bg-[#D4A03C] text-[#0D0B09]"
                    aria-label="إرسال"
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAnswerFor(q.id)}
                  className="mt-2 text-[11px] font-bold text-[#D4A03C] hover:underline"
                >
                  + أجب على السؤال
                </button>
              )}
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
