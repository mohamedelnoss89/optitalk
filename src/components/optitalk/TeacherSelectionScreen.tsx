// ===== OptiTalk - Teacher Selection Screen (اختيار المدرس لمحادثة جديدة) =====
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { TEACHERS, type Teacher } from '@/lib/teachers';
import { FRIENDS, type Friend } from '@/lib/friends';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAudioUnlock } from '@/hooks/use-audio-unlock';

export function TeacherSelectionScreen() {
  useAudioUnlock();
  const setScreen = useStore((s) => s.setScreen);
  const setTeacher = useStore((s) => s.setTeacher);
  const clearMessages = useStore((s) => s.clearMessages);
  const setConversationId = useStore((s) => s.setConversationId);
  const setCurrentTargetWord = useStore((s) => s.setCurrentTargetWord);
  const setInReviewMode = useStore((s) => s.setInReviewMode);
  const setInSentenceBuilderMode = useStore((s) => s.setInSentenceBuilderMode);
  const user = useStore((s) => s.user);

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [companionMode, setCompanionMode] = useState<'teacher' | 'friend'>('teacher');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const canProceed = companionMode === 'teacher' ? !!selectedTeacher : !!selectedFriend;

  const handleStart = () => {
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

    // امسح المحادثة السابقة وابدأ جديدة
    clearMessages();
    setConversationId(null);
    setCurrentTargetWord(null);
    setInReviewMode(false);
    setInSentenceBuilderMode(false);

    toast.success('يلا نبدأ محادثة جديدة! 🎉');
    setScreen('chat');
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col opti-gradient">
      {/* Header */}
      <header className="sticky top-0 z-20 opti-glass border-b border-opti-primary/10">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            onClick={() => setScreen('welcome')}
            className="flex h-9 w-9 items-center justify-center rounded-xl opti-glass text-opti-text/70 transition-colors hover:text-opti-text"
            aria-label="رجوع"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-opti-gold" />
            <span className="text-sm font-bold text-opti-text">اختر مدرسك</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-md">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <h2 className="text-xl font-black text-opti-text mb-1">
              مين تحب يدرسك؟
            </h2>
            <p className="text-xs text-opti-text/60">
              اختار المدرس اللي يناسبك وابدأ محادثة جديدة
            </p>
          </motion.div>

          {/* Mode toggle: Teachers / Friends */}
          <div className="mb-6 flex gap-2 rounded-2xl opti-glass p-1.5">
            <button
              onClick={() => setCompanionMode('teacher')}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all',
                companionMode === 'teacher'
                  ? 'opti-primary-gradient text-white'
                  : 'text-opti-text/60'
              )}
            >
              🎓 مدرسين
            </button>
            <button
              onClick={() => setCompanionMode('friend')}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all',
                companionMode === 'friend'
                  ? 'opti-primary-gradient text-white'
                  : 'text-opti-text/60'
              )}
            >
              👥 أصحاب
            </button>
          </div>

          {/* Teachers grid */}
          {companionMode === 'teacher' ? (
            <div className="grid grid-cols-2 gap-3">
              {TEACHERS.map((t, i) => (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedTeacher(t)}
                  className={cn(
                    'relative rounded-2xl overflow-hidden transition-all',
                    selectedTeacher?.id === t.id
                      ? 'ring-2 ring-opti-accent scale-[1.02]'
                      : 'ring-1 ring-white/5 hover:scale-[1.01]'
                  )}
                >
                  {/* Teacher image */}
                  <div className="relative aspect-square">
                    <img
                      src={`/teachers/${t.id}.png`}
                      alt={t.nameAr}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23${t.color.slice(1)}" width="100" height="100"/><text x="50" y="55" font-size="40" text-anchor="middle" fill="white">${t.avatar}</text></svg>`;
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {/* Selected check */}
                    {selectedTeacher?.id === t.id && (
                      <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opti-accent-gradient">
                        <Check className="h-4 w-4 text-[#0a0e1a]" />
                      </div>
                    )}
                    {/* Name & tags */}
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <div className="text-sm font-black text-white">{t.nameAr}</div>
                      <div className="text-[10px] text-white/70 mt-0.5 line-clamp-1">
                        {t.tags.join(' • ')}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {FRIENDS.map((f, i) => (
                <motion.button
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedFriend(f)}
                  className={cn(
                    'relative rounded-2xl overflow-hidden transition-all',
                    selectedFriend?.id === f.id
                      ? 'ring-2 ring-opti-accent scale-[1.02]'
                      : 'ring-1 ring-white/5 hover:scale-[1.01]'
                  )}
                >
                  <div className="relative aspect-square">
                    <img
                      src={`/friends/${f.id}.png`}
                      alt={f.nameAr}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23${f.color.slice(1)}" width="100" height="100"/><text x="50" y="55" font-size="40" text-anchor="middle" fill="white">${f.avatar}</text></svg>`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {selectedFriend?.id === f.id && (
                      <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opti-accent-gradient">
                        <Check className="h-4 w-4 text-[#0a0e1a]" />
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <div className="text-sm font-black text-white">{f.nameAr}</div>
                      <div className="text-[10px] text-white/70 mt-0.5 line-clamp-1">
                        {f.tags.join(' • ')}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Selected teacher details */}
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl opti-glass p-4"
            >
              {companionMode === 'teacher' && selectedTeacher && (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={`/teachers/${selectedTeacher.id}.png`}
                      alt={selectedTeacher.nameAr}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-opti-text">{selectedTeacher.nameAr}</div>
                      <div className="text-[11px] text-opti-text/60">{selectedTeacher.personalityAr}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-opti-text/70 leading-relaxed">
                    {selectedTeacher.greetingAr}
                  </p>
                </>
              )}
              {companionMode === 'friend' && selectedFriend && (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={`/friends/${selectedFriend.id}.png`}
                      alt={selectedFriend.nameAr}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-opti-text">{selectedFriend.nameAr}</div>
                      <div className="text-[11px] text-opti-text/60">{selectedFriend.personalityAr}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-opti-text/70 leading-relaxed">
                    {selectedFriend.greetingAr}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="sticky bottom-0 z-20 opti-glass border-t border-opti-primary/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleStart}
            disabled={!canProceed}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all',
              canProceed
                ? 'opti-primary-gradient text-white opti-glow hover:scale-[1.02] active:scale-[0.98]'
                : 'opti-glass text-opti-text/40 cursor-not-allowed'
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>ابدأ محادثة جديدة</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
