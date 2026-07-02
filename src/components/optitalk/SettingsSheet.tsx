// ===== OptiTalk - Settings Sheet (احترافي) =====
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Gauge,
  Languages,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  LogOut,
  User,
  Trophy,
  Flame,
  Award,
  Info,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { TEACHERS, ACHIEVEMENTS } from '@/lib/teachers';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  onTeacherChange?: () => void;
}

export function SettingsSheet({ open, onClose, onReset, onTeacherChange }: Props) {
  const {
    user,
    selectedTeacher,
    setTeacher,
    cameraEnabled,
    setCameraEnabled,
    micEnabled,
    setMicEnabled,
    speechLang,
    setSpeechLang,
    audioRate,
    setAudioRate,
    autoSpeak,
    setAutoSpeak,
    showCorrections,
    setShowCorrections,
    showTranslations,
    setShowTranslations,
    points,
    streak,
    achievements,
    messagesCount,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'teacher' | 'achievements'>('general');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0a0e1a]/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-[#0a0e1a] border-t-2 border-opti-primary/30 max-h-[92vh] flex flex-col"
          >
            {/* ===== Header ===== */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-opti-text">الإعدادات</h3>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full opti-glass text-opti-text/60 hover:text-opti-text"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ===== Tabs ===== */}
            <div className="flex gap-1 p-3 border-b border-white/5 overflow-x-auto">
              {[
                { id: 'general', label: 'عام', icon: <User className="h-4 w-4" /> },
                { id: 'audio', label: 'الصوت', icon: <Volume2 className="h-4 w-4" /> },
                { id: 'teacher', label: 'المدرس', icon: <Sparkles className="h-4 w-4" /> },
                { id: 'achievements', label: 'الإنجازات', icon: <Trophy className="h-4 w-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'general' | 'audio' | 'teacher' | 'achievements')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap',
                    activeTab === tab.id
                      ? 'opti-primary-gradient text-white'
                      : 'opti-glass text-opti-text/60'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ===== Content ===== */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* ===== General Tab ===== */}
              {activeTab === 'general' && (
                <>
                  <div className="rounded-2xl opti-glass p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full opti-primary-gradient text-white">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-opti-text">{user?.name || 'مستخدم'}</div>
                        <div className="text-[11px] text-opti-text/50">
                          {user?.level === 'beginner' ? 'مبتدئ' : user?.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                          {' • '}
                          {messagesCount} رسالة
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <StatCard icon={<Trophy className="h-4 w-4" />} value={points} label="نقطة" color="text-opti-gold" />
                    <StatCard icon={<Flame className="h-4 w-4" />} value={streak} label="يوم" color="text-opti-error" />
                    <StatCard icon={<Award className="h-4 w-4" />} value={achievements.length} label="إنجاز" color="text-opti-accent" />
                  </div>

                  <ToggleRow
                    icon={cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                    title="الكاميرا"
                    desc="إظهار الفيديو الخاص بك"
                    value={cameraEnabled}
                    onChange={(v) => {
                      setCameraEnabled(v);
                      toast.success(v ? 'تم تفعيل الكاميرا' : 'تم إطفاء الكاميرا');
                    }}
                  />

                  <ToggleRow
                    icon={micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    title="الميكروفون"
                    desc="استخدام الصوت للكلام"
                    value={micEnabled}
                    onChange={(v) => {
                      setMicEnabled(v);
                      toast.success(v ? 'تم تفعيل الميكروفون' : 'تم إطفاء الميكروفون');
                    }}
                  />

                  <div className="rounded-2xl opti-glass p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Languages className="h-4 w-4 text-opti-accent" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-opti-text">لغة الميكروفون</div>
                        <div className="text-[10px] text-opti-text/50">لغة التعرف على صوتك</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSpeechLang('en')}
                        className={cn(
                          'rounded-xl py-2.5 text-xs font-bold transition-all',
                          speechLang === 'en'
                            ? 'opti-primary-gradient text-white'
                            : 'opti-glass text-opti-text/60'
                        )}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setSpeechLang('ar')}
                        className={cn(
                          'rounded-xl py-2.5 text-xs font-bold transition-all',
                          speechLang === 'ar'
                            ? 'opti-primary-gradient text-white'
                            : 'opti-glass text-opti-text/60'
                        )}
                      >
                        العربية
                      </button>
                    </div>
                  </div>

                  <ToggleRow
                    icon={showCorrections ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    title="إظهار التصحيحات"
                    desc="عرض أخطاء القواعد والنطق"
                    value={showCorrections}
                    onChange={setShowCorrections}
                  />

                  <ToggleRow
                    icon={showTranslations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    title="إظهار الترجمة"
                    desc="عرض ترجمة الكلمات الصعبة"
                    value={showTranslations}
                    onChange={setShowTranslations}
                  />
                </>
              )}

              {/* ===== Audio Tab ===== */}
              {activeTab === 'audio' && (
                <>
                  <ToggleRow
                    icon={autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    title="تشغيل الصوت تلقائياً"
                    desc="نطق ردود المدرس تلقائياً"
                    value={autoSpeak}
                    onChange={setAutoSpeak}
                  />

                  <div className="rounded-2xl opti-glass p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Gauge className="h-4 w-4 text-opti-accent" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-opti-text">سرعة الصوت</div>
                        <div className="text-[10px] text-opti-text/50">{audioRate.toFixed(2)}x</div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={audioRate}
                      onChange={(e) => setAudioRate(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer opti-slider"
                      style={{
                        background: `linear-gradient(to right, #6C5CE7 0%, #6C5CE7 ${((audioRate - 0.5) / 1.5) * 100}%, #1E2433 ${((audioRate - 0.5) / 1.5) * 100}%, #1E2433 100%)`,
                      }}
                    />
                    <div className="flex justify-between mt-2 text-[9px] text-opti-text/40">
                      <span>بطيء</span>
                      <span>عادي</span>
                      <span>سريع</span>
                    </div>
                  </div>

                  <div className="rounded-2xl opti-glass p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Info className="h-4 w-4 text-opti-gold" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-opti-text">نصائح للصوت</div>
                      </div>
                    </div>
                    <ul className="space-y-2 text-[11px] text-opti-text/70">
                      <li className="flex items-start gap-2">
                        <span className="text-opti-gold">•</span>
                        <span>لو الصوت مش بيشتغل، اضغط أي زرار في التطبيق الأول</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-opti-gold">•</span>
                        <span>على iOS، لازم تسمح بالصوت من إعدادات المتصفح</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-opti-gold">•</span>
                        <span>سرعة 0.9x مناسبة للمبتدئين</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {/* ===== Teacher Tab ===== */}
              {activeTab === 'teacher' && (
                <>
                  <div className="rounded-2xl opti-glass p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-4 w-4 text-opti-gold" />
                      <div>
                        <div className="text-sm font-bold text-opti-text">اختر مدرسك</div>
                        <div className="text-[10px] text-opti-text/50">6 شخصيات مختلفة</div>
                      </div>
                    </div>
                  </div>

                  {TEACHERS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTeacher(t);
                        toast.success(`تم اختيار ${t.nameAr}`);
                        if (onTeacherChange) onTeacherChange();
                      }}
                      className={cn(
                        'w-full rounded-2xl p-3 flex items-center gap-3 transition-all',
                        selectedTeacher?.id === t.id
                          ? 'opti-glass-teal border border-opti-accent/40'
                          : 'opti-glass hover:bg-white/5'
                      )}
                    >
                      <img
                        src={`/teachers/${t.id}.png`}
                        alt={t.name}
                        className="h-12 w-12 rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 text-right">
                        <div className="text-sm font-bold text-opti-text">{t.nameAr}</div>
                        <div className="text-[10px] text-opti-text/50">{t.tags.join(' • ')}</div>
                      </div>
                      {selectedTeacher?.id === t.id && (
                        <div className="h-2 w-2 rounded-full bg-opti-accent" />
                      )}
                    </button>
                  ))}
                </>
              )}

              {/* ===== Achievements Tab ===== */}
              {activeTab === 'achievements' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {ACHIEVEMENTS.map((a) => {
                      const earned = achievements.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          className={cn(
                            'rounded-2xl p-3 text-center transition-all',
                            earned
                              ? 'opti-glass-teal border border-opti-gold/30'
                              : 'opti-glass opacity-50 grayscale'
                          )}
                        >
                          <div className="text-3xl mb-1">{a.icon}</div>
                          <div className="text-[11px] font-bold text-opti-text">{a.name}</div>
                          <div className="text-[9px] text-opti-text/60 mt-0.5">{a.description}</div>
                          {earned && (
                            <div className="mt-1 text-[9px] font-bold text-opti-gold">+{a.points} نقطة</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* ===== Footer Actions ===== */}
            <div className="p-4 border-t border-white/5 space-y-2">
              <button
                onClick={() => {
                  if (confirm('هل تريد بدء محادثة جديدة؟ سيتم مسح الرسايل الحالية.')) {
                    onReset();
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-opti-gold/15 py-3 text-sm font-bold text-opti-gold transition-all hover:bg-opti-gold/25"
              >
                <RotateCcw className="h-4 w-4" />
                محادثة جديدة
              </button>
              <button
                onClick={() => {
                  if (confirm('هل تريد إنهاء المحادثة والعودة للرئيسية؟')) {
                    onReset();
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-opti-error/15 py-3 text-sm font-bold text-opti-error transition-all hover:bg-opti-error/25"
              >
                <LogOut className="h-4 w-4" />
                إنهاء المحادثة
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== Helper Components =====
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl opti-glass p-3 text-center">
      <div className={cn('flex justify-center mb-1', color)}>{icon}</div>
      <div className={cn('text-lg font-black', color)}>{value}</div>
      <div className="text-[9px] text-opti-text/50">{label}</div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  desc,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl opti-glass p-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl opti-glass text-opti-accent">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-opti-text">{title}</div>
        {desc && <div className="text-[10px] text-opti-text/50">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-all',
          value ? 'opti-primary-gradient' : 'bg-white/10'
        )}
        aria-label={title}
      >
        <div
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all',
            value ? 'right-0.5' : 'left-0.5'
          )}
        />
      </button>
    </div>
  );
}
