// ===== OptiTalk - Teacher Avatar (شخصية كرتونية متحركة بتتكلم) =====
// شخصية SVG متحركة بالكامل: عيون بترمش، بؤ بيتحرك، رأس بيتحرك، حواجب
// مش صورة - شخصية حية بتنظر للطالب وتتفاعل معاه
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Teacher } from '@/lib/teachers';

interface Props {
  teacher: Teacher;
  isSpeaking: boolean;
  isThinking: boolean;
  isListening?: boolean;
}

interface CharacterConfig {
  skinColor: string;
  skinShadow: string;
  hairColor: string;
  shirtColor: string;
  shirtAccent: string;
  accentColor: string;
  hasGlasses: boolean;
  hasBeard: boolean;
  hairStyle: 'short-male' | 'long-female' | 'gray-senior' | 'buzz-male' | 'silver-bob';
}

const CHARACTER_CONFIGS: Record<string, CharacterConfig> = {
  'mr-james': {
    skinColor: '#E8B894',
    skinShadow: '#C99878',
    hairColor: '#2D1810',
    shirtColor: '#2C3E87',
    shirtAccent: '#1E2D6B',
    accentColor: '#6C5CE7',
    hasGlasses: true,
    hasBeard: false,
    hairStyle: 'short-male',
  },
  'ms-sarah': {
    skinColor: '#F5C5A8',
    skinShadow: '#D9A488',
    hairColor: '#6B4423',
    shirtColor: '#00838F',
    shirtAccent: '#005F66',
    accentColor: '#00CEC9',
    hasGlasses: false,
    hasBeard: false,
    hairStyle: 'long-female',
  },
  'professor-david': {
    skinColor: '#E8B894',
    skinShadow: '#C99878',
    hairColor: '#8B8589',
    shirtColor: '#6B5D4F',
    shirtAccent: '#4A3F35',
    accentColor: '#D4A03C',
    hasGlasses: true,
    hasBeard: true,
    hairStyle: 'gray-senior',
  },
  'miss-emma': {
    skinColor: '#F5C5A8',
    skinShadow: '#D9A488',
    hairColor: '#8B4513',
    shirtColor: '#C71585',
    shirtAccent: '#8B0F5F',
    accentColor: '#FD79A8',
    hasGlasses: false,
    hasBeard: false,
    hairStyle: 'long-female',
  },
  'coach-mike': {
    skinColor: '#E8B894',
    skinShadow: '#C99878',
    hairColor: '#1A1A1A',
    shirtColor: '#C0392B',
    shirtAccent: '#8B2820',
    accentColor: '#FF7675',
    hasGlasses: false,
    hasBeard: false,
    hairStyle: 'buzz-male',
  },
  'dr-lisa': {
    skinColor: '#F5C5A8',
    skinShadow: '#D9A488',
    hairColor: '#BFC1C2',
    shirtColor: '#9B7EBD',
    shirtAccent: '#6F5491',
    accentColor: '#A29BFE',
    hasGlasses: false,
    hasBeard: false,
    hairStyle: 'silver-bob',
  },
};

// بؤ بيتحرك - شكل مختلف لكل حالة نطق
const MOUTH_SHAPES = [
  // 0: ساكت (سمايل خفيف)
  { d: 'M 175 348 Q 200 358 225 348', fill: 'none' },
  // 1: بؤ صغير
  { d: 'M 180 345 Q 200 365 220 345 Q 200 355 180 345 Z', fill: '#5C1F1F' },
  // 2: بؤ مفتوح واسع
  { d: 'M 175 340 Q 200 380 225 340 Q 200 365 175 340 Z', fill: '#5C1F1F' },
  // 3: بؤ "أو"
  { d: 'M 188 340 Q 200 375 212 340 Q 200 360 188 340 Z', fill: '#5C1F1F' },
  // 4: بؤ ابتسامة عريضة
  { d: 'M 170 348 Q 200 360 230 348', fill: 'none' },
];

export function TeacherAvatar({
  teacher,
  isSpeaking,
  isThinking,
  isListening = false,
}: Props) {
  const config = CHARACTER_CONFIGS[teacher.id] || CHARACTER_CONFIGS['mr-james'];
  const [mouthIndex, setMouthIndex] = useState(0);
  const [blinkKey, setBlinkKey] = useState(0);

  // ===== رمش عشوائي =====
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    function scheduleBlink() {
      const delay = 2000 + Math.random() * 2500;
      timer = setTimeout(() => {
        if (!active) return;
        setBlinkKey((k) => k + 1);
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  // ===== بؤ بيتحرك لما بيتكلم =====
  useEffect(() => {
    if (!isSpeaking) {
      setMouthIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMouthIndex(Math.floor(Math.random() * 5));
    }, 130);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const currentMouth = MOUTH_SHAPES[mouthIndex];
  const isBlinking = blinkKey % 5 === 0;

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#0a0e1a] via-[#0e1330] to-[#1a1f3a]">
      {/* ===== خلفية متوهجة ===== */}
      <motion.div
        animate={{
          opacity: isSpeaking ? [0.18, 0.45, 0.18] : 0.12,
        }}
        transition={{ duration: 1.2, repeat: isSpeaking ? Infinity : 0, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 35%, ${config.accentColor}50, transparent 70%)`,
        }}
      />

      {/* ===== نقاط ضوء في الخلفية ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              width: 3 + (i % 2),
              height: 3 + (i % 2),
              background: config.accentColor,
              filter: 'blur(1px)',
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          />
        ))}
      </div>

      {/* ===== الشخصية الكرتونية المتحركة ===== */}
      <motion.div
        animate={
          isSpeaking
            ? { y: [0, -4, 0, -2, 0], rotate: [0, -1, 1, -0.5, 0] }
            : isListening
            ? { rotate: [0, 2, 0, -1, 0], y: [0, 1, 0] }
            : isThinking
            ? { rotate: [0, -2.5, 0], y: [0, -1, 0] }
            : { y: [0, -2.5, 0], rotate: [0, 0.5, 0, -0.5, 0] }
        }
        transition={{
          duration: isSpeaking ? 1.6 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-end justify-center"
      >
        <svg
          viewBox="0 0 400 600"
          className="h-full w-auto"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <radialGradient id={`skin-${teacher.id}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={config.skinColor} />
              <stop offset="100%" stopColor={config.skinShadow} />
            </radialGradient>
            <linearGradient id={`shirt-${teacher.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.shirtColor} />
              <stop offset="100%" stopColor={config.shirtAccent} />
            </linearGradient>
          </defs>

          {/* ===== الكتفين والجسم (قميص) ===== */}
          <path
            d="M 60 600 L 60 470 Q 60 400 200 400 Q 340 400 340 470 L 340 600 Z"
            fill={`url(#shirt-${teacher.id})`}
          />
          {/* ياقة القميص */}
          <path d="M 165 400 L 200 445 L 235 400 Z" fill="rgba(0,0,0,0.25)" />
          <path d="M 165 400 L 200 445 L 235 400 L 235 410 L 200 450 L 165 410 Z" fill={config.shirtAccent} opacity="0.6" />

          {/* ===== الرقبة ===== */}
          <rect x="180" y="360" width="40" height="50" fill={config.skinShadow} />
          <ellipse cx="200" cy="410" rx="28" ry="10" fill="rgba(0,0,0,0.18)" />

          {/* ===== الرأس ===== */}
          <ellipse cx="200" cy="270" rx="108" ry="128" fill={`url(#skin-${teacher.id})`} />

          {/* ===== الأذنين ===== */}
          <ellipse cx="92" cy="285" rx="14" ry="22" fill={config.skinShadow} />
          <ellipse cx="308" cy="285" rx="14" ry="22" fill={config.skinShadow} />
          <ellipse cx="92" cy="285" rx="6" ry="12" fill={config.skinColor} opacity="0.5" />
          <ellipse cx="308" cy="285" rx="6" ry="12" fill={config.skinColor} opacity="0.5" />

          {/* ===== الشعر - شكل مختلف لكل مدرس ===== */}
          {config.hairStyle === 'short-male' && (
            <path
              d="M 92 270 Q 92 145 200 145 Q 308 145 308 270 L 308 215 Q 308 165 200 165 Q 92 165 92 215 Z"
              fill={config.hairColor}
            />
          )}
          {config.hairStyle === 'buzz-male' && (
            <path
              d="M 95 250 Q 95 155 200 155 Q 305 155 305 250 L 305 210 Q 305 175 200 175 Q 95 175 95 210 Z"
              fill={config.hairColor}
            />
          )}
          {config.hairStyle === 'gray-senior' && (
            <>
              <path
                d="M 92 270 Q 92 140 200 140 Q 308 140 308 270 L 308 215 Q 308 160 200 160 Q 92 160 92 215 Z"
                fill={config.hairColor}
              />
              {/* سبايدبيرن */}
              <path d="M 92 270 L 92 325 L 102 325 L 102 270 Z" fill={config.hairColor} opacity="0.6" />
              <path d="M 308 270 L 308 325 L 298 325 L 298 270 Z" fill={config.hairColor} opacity="0.6" />
            </>
          )}
          {config.hairStyle === 'long-female' && (
            <>
              <path
                d="M 80 295 Q 80 125 200 125 Q 320 125 320 295 L 320 470 L 295 470 L 295 285 Q 295 170 200 170 Q 105 170 105 285 L 105 470 L 80 470 Z"
                fill={config.hairColor}
              />
              {/* لمعة شعر */}
              <path
                d="M 130 180 Q 200 150 270 180"
                stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none"
              />
            </>
          )}
          {config.hairStyle === 'silver-bob' && (
            <>
              <path
                d="M 85 300 Q 85 135 200 135 Q 315 135 315 300 L 315 410 L 290 410 L 290 290 Q 290 175 200 175 Q 110 175 110 290 L 110 410 L 85 410 Z"
                fill={config.hairColor}
              />
              <path
                d="M 130 185 Q 200 155 270 185"
                stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none"
              />
            </>
          )}

          {/* ===== اللحية (لو فيه) ===== */}
          {config.hasBeard && (
            <path
              d="M 125 315 Q 125 410 200 425 Q 275 410 275 315 Q 275 360 200 370 Q 125 360 125 315 Z"
              fill={config.hairColor}
              opacity="0.9"
            />
          )}

          {/* ===== الحواجب ===== */}
          <motion.rect
            x="140" y="218" width="38" height="7" rx="3.5"
            fill={config.hairColor}
            animate={
              isSpeaking
                ? { y: [218, 214, 218] }
                : isListening
                ? { y: 213 }
                : isThinking
                ? { y: 210, rotate: -5 }
                : { y: 218 }
            }
            transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }}
            style={{ originX: '159px', originY: '221px' }}
          />
          <motion.rect
            x="222" y="218" width="38" height="7" rx="3.5"
            fill={config.hairColor}
            animate={
              isSpeaking
                ? { y: [218, 214, 218] }
                : isListening
                ? { y: 213 }
                : isThinking
                ? { y: 210, rotate: 5 }
                : { y: 218 }
            }
            transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }}
            style={{ originX: '241px', originY: '221px' }}
          />

          {/* ===== العيون - بياض العين ===== */}
          <ellipse
            cx="160" cy="262" rx="24" ry={isBlinking ? 1.5 : 17}
            fill="white"
          />
          <ellipse
            cx="240" cy="262" rx="24" ry={isBlinking ? 1.5 : 17}
            fill="white"
          />

          {/* ===== الحدقة (بتتحرك حسب الحالة) ===== */}
          <motion.circle
            cx="160" cy="262" r="10" fill="#1a1a1a"
            animate={
              isListening
                ? { cy: 268 }
                : isThinking
                ? { cx: 153, cy: 252 }
                : { cx: 160, cy: 262 }
            }
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <motion.circle
            cx="240" cy="262" r="10" fill="#1a1a1a"
            animate={
              isListening
                ? { cy: 268 }
                : isThinking
                ? { cx: 247, cy: 252 }
                : { cx: 240, cy: 262 }
            }
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* ===== لمعان العين ===== */}
          <circle cx="164" cy="258" r="3.5" fill="white" />
          <circle cx="244" cy="258" r="3.5" fill="white" />
          <circle cx="157" cy="266" r="1.5" fill="white" opacity="0.7" />
          <circle cx="237" cy="266" r="1.5" fill="white" opacity="0.7" />

          {/* ===== النظارة (لو فيه) ===== */}
          {config.hasGlasses && (
            <g stroke="#1a1a1a" strokeWidth="3.5" fill="rgba(180,200,255,0.1)">
              <circle cx="160" cy="262" r="32" />
              <circle cx="240" cy="262" r="32" />
              <line x1="192" y1="262" x2="208" y2="262" />
              <line x1="128" y1="260" x2="100" y2="255" />
              <line x1="272" y1="260" x2="300" y2="255" />
            </g>
          )}

          {/* ===== الأنف ===== */}
          <path
            d="M 200 285 Q 193 308 198 320 Q 203 325 212 322"
            stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" fill="none" strokeLinecap="round"
          />
          <ellipse cx="195" cy="322" rx="3" ry="2" fill="rgba(0,0,0,0.2)" />
          <ellipse cx="210" cy="322" rx="3" ry="2" fill="rgba(0,0,0,0.2)" />

          {/* ===== البؤ - بيتحرك لما بيتكلم ===== */}
          <motion.path
            d={currentMouth.d}
            fill={currentMouth.fill}
            stroke="#8B3A3A"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ d: currentMouth.d, fill: currentMouth.fill }}
            transition={{ duration: 0.12 }}
          />
          {/* لمعان الشفايف */}
          {mouthIndex > 0 && (
            <ellipse cx="200" cy="345" rx="8" ry="2" fill="rgba(255,180,180,0.4)" />
          )}

          {/* ===== خدود وردية ===== */}
          <ellipse cx="130" cy="315" rx="20" ry="11" fill="#FFB6A0" opacity="0.35" />
          <ellipse cx="270" cy="315" rx="20" ry="11" fill="#FFB6A0" opacity="0.35" />
        </svg>
      </motion.div>

      {/* ===== اسم المدرس ===== */}
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10">
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: config.accentColor, boxShadow: `0 0 8px ${config.accentColor}` }}
        />
        <span className="text-[12px] font-bold text-white">{teacher.name}</span>
        <span className="text-[10px] text-white/50">•</span>
        <span className="text-[10px] font-medium text-white/70">{teacher.nameAr}</span>
      </div>

      {/* ===== LIVE indicator ===== */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 backdrop-blur-md border border-red-500/30">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[9px] font-black text-red-300 tracking-widest">LIVE</span>
      </div>

      {/* ===== حالة المدرس ===== */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center px-4 pointer-events-none">
        <motion.div
          key={isSpeaking ? 's' : isThinking ? 't' : isListening ? 'l' : 'r'}
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="flex items-center gap-2 rounded-full bg-black/65 px-3.5 py-1.5 backdrop-blur-md border border-white/10"
        >
          {isSpeaking ? (
            <>
              <div className="flex items-end gap-[2px] h-3.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[2.5px] rounded-full"
                    style={{ background: config.accentColor }}
                    animate={{ height: ['30%', '100%', '50%', '90%', '40%'] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-white">Speaking</span>
            </>
          ) : isThinking ? (
            <>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/60"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-white/75">Thinking...</span>
            </>
          ) : isListening ? (
            <>
              <motion.span
                className="h-2 w-2 rounded-full"
                style={{ background: config.accentColor }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[11px] font-bold text-white">Listening to you</span>
            </>
          ) : (
            <span className="text-[11px] font-medium text-white/75">Ready</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
