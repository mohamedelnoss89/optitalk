// ===== OptiTalk - Onboarding Screen (3 steps) =====
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User as UserIcon,
  Users,
  Sparkles,
  Camera,
  Mic,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { TEACHERS, AGE_GROUPS, LEVELS, type Teacher, type Level } from '@/lib/teachers';
import { FRIENDS, type Friend } from '@/lib/friends';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

export function OnboardingScreen() {
  const setScreen = useStore((s) => s.setScreen);
  const setUser = useStore((s) => s.setUser);
  const setTeacher = useStore((s) => s.setTeacher);
  const setCameraEnabled = useStore((s) => s.setCameraEnabled);
  const setMicEnabled = useStore((s) => s.setMicEnabled);
  // ===== auth user — عشان نعرض اسمه تلقائياً =====
  const authUser = useStore((s) => s.authUser);
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  const [step, setStep] = useState<Step>(1);

  // Step 1 state — اعرض اسم المستخدم تلقائياً لو مسجل
  const [name, setName] = useState(authUser?.name || '');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [level, setLevel] = useState<Level | ''>('');

  // ===== لو المستخدم مش مسجل → ارجع للـ welcome =====
  useEffect(() => {
    if (!isAuthenticated) {
      setScreen('welcome');
    }
  }, [isAuthenticated, setScreen]);

  // Step 2 state
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [companionMode, setCompanionMode] = useState<'teacher' | 'friend'>('teacher');

  const canProceedStep1 = name.trim() && age && gender && level;
  const canProceedStep2 = companionMode === 'teacher' ? !!selectedTeacher : !!selectedFriend;

  const requestMediaPermissions = async () => {
    let cam = false;
    let mic = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cam = true;
      mic = true;
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      // Try mic-only as fallback
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mic = true;
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // user denied — proceed anyway, chat will degrade gracefully
      }
    }
    setCameraEnabled(cam);
    setMicEnabled(mic);
    if (!mic) {
      toast.warning('الميكروفون غير مفعّل — ستتمكن من الكتابة فقط');
    }
    return { cam, mic };
  };

  const handleStart = async () => {
    setUser({
      name: name.trim(),
      age,
      gender: gender as 'male' | 'female',
      level: level as Level,
    });
    if (companionMode === 'teacher') {
      setTeacher(selectedTeacher);
    } else {
      // نحول الصديق لـ Teacher format
      const friend = selectedFriend;
      if (friend) {
        setTeacher({
          id: friend.id,
          name: friend.name,
          nameAr: friend.nameAr,
          gender: friend.gender,
          ageGroup: friend.age === 'young' ? 'young' : 'adult',
          avatar: friend.avatar,
          gradient: friend.gradient,
          color: friend.color,
          personality: friend.personality,
          personalityAr: friend.personalityAr,
          greeting: friend.greeting,
          greetingAr: friend.greetingAr,
          teachingStyle: friend.conversationStyle,
          tags: friend.tags,
          imageUrl: friend.imageUrl,
        });
      }
    }
    await requestMediaPermissions();
    useStore.getState().bumpStreak();
    toast.success('يلا نبدأ! 🎉');
    setScreen('chat');
  };

  const handleReset = () => {
    setName('');
    setAge('');
    setGender('');
    setLevel('');
    setSelectedTeacher(null);
    setStep(1);
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col opti-gradient">
      {/* Header */}
      <header className="sticky top-0 z-20 opti-glass border-b border-opti-primary/10">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              if (step === 1) setScreen('welcome');
              else setStep((step - 1) as Step);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl opti-glass text-opti-text/70 transition-colors hover:text-opti-text"
            aria-label="رجوع"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <StepDot active={step >= 1} done={step > 1} />
            <StepDot active={step >= 2} done={step > 2} />
            <StepDot active={step >= 3} done={false} />
          </div>
          <div className="text-xs font-semibold text-opti-text/60">
            {step} / 3
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md px-4 py-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepHeader
                  icon={<UserIcon className="h-5 w-5" />}
                  title="معلوماتك الأساسية"
                  subtitle="عرفنا بنفسك عشان نظبط لك التجربة"
                />

                {/* Name — معروض تلقائياً من حساب المستخدم */}
                <Field label="الاسم" required>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: أحمد"
                      maxLength={30}
                      readOnly={!!authUser}
                      className={cn(
                        'w-full rounded-xl opti-glass border border-opti-primary/15 bg-transparent px-4 py-3 text-opti-text placeholder:text-opti-text/35 focus:border-opti-primary/50 focus:outline-none',
                        authUser && 'pr-24 opacity-90'
                      )}
                    />
                    {authUser && (
                      <div className="absolute top-1/2 left-2 -translate-y-1/2 flex items-center gap-1 rounded-full opti-glass-teal px-2 py-0.5">
                        <Check className="h-3 w-3 text-opti-accent" />
                        <span className="text-[9px] font-bold text-opti-accent">مسجّل</span>
                      </div>
                    )}
                  </div>
                  {authUser?.email && (
                    <p className="mt-1.5 text-[10px] text-opti-text/45">
                      {authUser.email}
                      {authUser.phone && ` • ${authUser.phone}`}
                    </p>
                  )}
                </Field>

                {/* Age */}
                <Field label="السن">
                  <div className="grid grid-cols-2 gap-2">
                    {AGE_GROUPS.map((a) => (
                      <button
                        key={a.value}
                        onClick={() => setAge(a.value)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3 py-3 text-right transition-all',
                          age === a.value
                            ? 'border-opti-primary bg-opti-primary/15 opti-glow'
                            : 'border-opti-primary/15 opti-glass hover:border-opti-primary/40'
                        )}
                      >
                        <span className="text-2xl">{a.emoji}</span>
                        <span className="text-sm font-semibold text-opti-text">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Gender */}
                <Field label="النوع">
                  <div className="grid grid-cols-2 gap-2">
                    <GenderButton
                      active={gender === 'male'}
                      onClick={() => setGender('male')}
                      emoji="👨"
                      label="ذكر"
                    />
                    <GenderButton
                      active={gender === 'female'}
                      onClick={() => setGender('female')}
                      emoji="👩"
                      label="أنثى"
                    />
                  </div>
                </Field>

                {/* Level */}
                <Field label="مستواك في الإنجليزي">
                  <div className="space-y-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setLevel(l.value)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-right transition-all',
                          level === l.value
                            ? 'border-opti-accent bg-opti-accent/10 opti-glow-accent'
                            : 'border-opti-primary/15 opti-glass hover:border-opti-accent/40'
                        )}
                      >
                        <div>
                          <div className="text-sm font-bold text-opti-text">{l.label}</div>
                          <div className="text-[11px] text-opti-text/55">{l.desc}</div>
                        </div>
                        <div
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                            level === l.value
                              ? 'border-opti-accent bg-opti-accent text-[#0a0e1a]'
                              : 'border-opti-text/30'
                          )}
                        >
                          {level === l.value && <Check className="h-3 w-3" strokeWidth={3} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </Field>

                <button
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className={cn(
                    'mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition-all',
                    canProceedStep1
                      ? 'opti-primary-gradient text-white opti-glow hover:scale-[1.02] active:scale-[0.98]'
                      : 'opti-glass text-opti-text/40'
                  )}
                >
                  التالي
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepHeader
                  icon={<Users className="h-5 w-5" />}
                  title={companionMode === 'teacher' ? 'اختار مدرسك' : 'اختار صديقك'}
                  subtitle={
                    companionMode === 'teacher'
                      ? 'كل مدرس له أسلوب مختلف — اختار اللي يناسبك'
                      : 'أصدقاء تتكلم معاهم كأصحاب — محادثة ودية وغير رسمية'
                  }
                />

                {/* تبديل بين المدرسين والأصدقاء */}
                <div className="mb-4 flex gap-2 rounded-2xl opti-glass p-1.5">
                  <button
                    onClick={() => setCompanionMode('teacher')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all',
                      companionMode === 'teacher'
                        ? 'opti-primary-gradient text-white'
                        : 'text-opti-text/60'
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    مدرسين
                  </button>
                  <button
                    onClick={() => setCompanionMode('friend')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all',
                      companionMode === 'friend'
                        ? 'opti-primary-gradient text-white'
                        : 'text-opti-text/60'
                    )}
                  >
                    <Users className="h-3.5 w-3.5" />
                    أصدقاء
                  </button>
                </div>

                {/* قائمة المدرسين */}
                {companionMode === 'teacher' && (
                  <div className="grid grid-cols-2 gap-3">
                    {TEACHERS.map((t) => (
                      <TeacherCard
                        key={t.id}
                        teacher={t}
                        selected={selectedTeacher?.id === t.id}
                        onSelect={() => setSelectedTeacher(t)}
                      />
                    ))}
                  </div>
                )}

                {/* قائمة الأصدقاء */}
                {companionMode === 'friend' && (
                  <div className="grid grid-cols-2 gap-3">
                    {FRIENDS.map((f) => (
                      <FriendCard
                        key={f.id}
                        friend={f}
                        selected={selectedFriend?.id === f.id}
                        onSelect={() => setSelectedFriend(f)}
                      />
                    ))}
                  </div>
                )}

                {/* معاينة المدرس المختار */}
                {companionMode === 'teacher' && selectedTeacher && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl opti-glass-teal p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                        style={{ background: selectedTeacher.gradient }}
                      >
                        {selectedTeacher.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-opti-text">
                          {selectedTeacher.nameAr} ({selectedTeacher.name})
                        </div>
                        <div className="text-[11px] leading-relaxed text-opti-text/70 mt-0.5">
                          {selectedTeacher.greetingAr}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* معاينة الصديق المختار */}
                {companionMode === 'friend' && selectedFriend && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl opti-glass-teal p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                        style={{ background: selectedFriend.gradient }}
                      >
                        {selectedFriend.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-opti-text">
                          {selectedFriend.nameAr} ({selectedFriend.name})
                        </div>
                        <div className="text-[11px] leading-relaxed text-opti-text/70 mt-0.5">
                          {selectedFriend.greetingAr}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                  className={cn(
                    'mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition-all',
                    canProceedStep2
                      ? 'opti-primary-gradient text-white opti-glow hover:scale-[1.02] active:scale-[0.98]'
                      : 'opti-glass text-opti-text/40'
                  )}
                >
                  التالي
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepHeader
                  icon={<Sparkles className="h-5 w-5" />}
                  title="تأكيد وبدء"
                  subtitle="كل حاجة جاهزة — نبدأ المحادثة؟"
                />

                {/* Summary card */}
                <div className="rounded-2xl opti-glass p-4 space-y-3">
                  <SummaryRow label="الاسم" value={name} />
                  <SummaryRow label="السن" value={AGE_GROUPS.find((a) => a.value === age)?.label || age} />
                  <SummaryRow label="النوع" value={gender === 'male' ? 'ذكر' : 'أنثى'} />
                  <SummaryRow
                    label="المستوى"
                    value={LEVELS.find((l) => l.value === level)?.label || ''}
                  />
                  <div className="h-px bg-opti-text/10" />
                  {selectedTeacher && (
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                        style={{ background: selectedTeacher.gradient }}
                      >
                        {selectedTeacher.avatar}
                      </div>
                      <div>
                        <div className="text-[11px] text-opti-text/55">المدرس</div>
                        <div className="text-sm font-bold text-opti-text">
                          {selectedTeacher.nameAr}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Permissions info */}
                <div className="mt-4 rounded-2xl opti-glass p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-opti-accent" />
                    <div className="text-sm font-bold text-opti-text">الأذونات المطلوبة</div>
                  </div>
                  <div className="space-y-2.5">
                    <PermissionRow
                      icon={<Mic className="h-4 w-4" />}
                      title="الميكروفون"
                      desc="عشان المدرس يسمعك ويتكلم معاك"
                    />
                    <PermissionRow
                      icon={<Camera className="h-4 w-4" />}
                      title="الكاميرا (اختياري)"
                      desc="تشوف نفسك وأنت بتتكلم"
                    />
                  </div>
                  <div className="mt-3 rounded-lg bg-opti-primary/10 p-2.5">
                    <p className="text-[10px] leading-relaxed text-opti-text/65">
                      💡 هنطلب الإذن عند بدء المحادثة. تقدر ترفض الكاميرا وتستخدم الكتابة بدلاً منها.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl opti-accent-gradient px-6 py-4 text-base font-black text-[#0a0e1a] opti-glow-accent transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  ابدأ المحادثة
                  <Sparkles className="h-4 w-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="mt-3 flex w-full items-center justify-center gap-2 text-xs text-opti-text/50 transition-colors hover:text-opti-text/80"
                >
                  <RotateCcw className="h-3 w-3" />
                  إعادة البدء
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div
      className={cn(
        'h-2 rounded-full transition-all duration-300',
        done ? 'w-6 bg-opti-accent' : active ? 'w-6 bg-opti-primary' : 'w-2 bg-opti-text/20'
      )}
    />
  );
}

function StepHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl opti-primary-gradient text-white opti-glow">
        {icon}
      </div>
      <h2 className="text-xl font-black text-opti-text">{title}</h2>
      <p className="text-xs text-opti-text/60 mt-1">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-bold text-opti-text/75">
        {label} {required && <span className="text-opti-error">*</span>}
      </label>
      {children}
    </div>
  );
}

function GenderButton({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition-all',
        active
          ? 'border-opti-primary bg-opti-primary/15 opti-glow'
          : 'border-opti-primary/15 opti-glass hover:border-opti-primary/40'
      )}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-semibold text-opti-text">{label}</span>
    </button>
  );
}

function TeacherCard({
  teacher,
  selected,
  onSelect,
}: {
  teacher: Teacher;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all',
        selected
          ? 'border-opti-primary bg-opti-primary/10 opti-glow'
          : 'border-opti-primary/15 opti-glass hover:border-opti-primary/40'
      )}
    >
      {selected && (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full opti-accent-gradient text-[#0a0e1a]">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      )}
      {teacher.imageUrl ? (
        <img
          src={teacher.imageUrl}
          alt={teacher.name}
          className="h-14 w-14 rounded-2xl object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
          style={{ background: teacher.gradient }}
        >
          {teacher.avatar}
        </div>
      )}
      <div className="mt-2 text-xs font-bold text-opti-text">{teacher.nameAr}</div>
      <div className="text-[10px] text-opti-text/55">{teacher.name}</div>
      <div className="mt-1.5 flex flex-wrap justify-center gap-1">
        {teacher.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-opti-primary/15 px-1.5 py-0.5 text-[9px] font-medium text-opti-text/75"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

function FriendCard({
  friend,
  selected,
  onSelect,
}: {
  friend: Friend;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all',
        selected
          ? 'border-opti-accent bg-opti-accent/10 opti-glow-accent'
          : 'border-opti-accent/15 opti-glass hover:border-opti-accent/40'
      )}
    >
      {selected && (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full opti-accent-gradient text-[#0a0e1a]">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      )}
      {friend.imageUrl ? (
        <img
          src={friend.imageUrl}
          alt={friend.name}
          className="h-14 w-14 rounded-2xl object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
          style={{ background: friend.gradient }}
        >
          {friend.avatar}
        </div>
      )}
      <div className="mt-2 text-xs font-bold text-opti-text">{friend.nameAr}</div>
      <div className="text-[10px] text-opti-text/55">{friend.name}</div>
      <div className="mt-1.5 flex flex-wrap justify-center gap-1">
        {friend.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-opti-accent/15 px-1.5 py-0.5 text-[9px] font-medium text-opti-text/75"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-opti-text/55">{label}</span>
      <span className="text-sm font-semibold text-opti-text">{value}</span>
    </div>
  );
}

function PermissionRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opti-glass-teal text-opti-accent">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold text-opti-text">{title}</div>
        <div className="text-[10px] text-opti-text/55">{desc}</div>
      </div>
    </div>
  );
}
