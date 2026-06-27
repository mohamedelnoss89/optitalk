# Worklog

## Task ID: optitalk-build — OptiTalk — تعلّم الإنجليزية بالمحادثة الحية

**Date:** 2026-06-27
**Status:** ✅ Completed
**Port:** 3000 (auto dev server)

### ملخص المشروع
تطبيق موبايل ستايل (Next.js 16) لتعليم اللغة الإنجليزية بالمحادثة الحية مع مدرس AI. 6 شخصيات مدرسين، تحدث واستماع بصوت حقيقي (Web Speech API)، تصحيح فوري للأخطاء بالعربي، نظام نقاط/streak/إنجازات. ثيم احترافي بنفسجي/تركوازي/ذهبي يتناسب مع opti-group.

### المخرجات المنجزة

#### 1. Prisma Schema (`prisma/schema.prisma`)
7 جداول:
- `User` (id, email?, name, age, gender, level, avatar?, teacherId, points, streak, createdAt, updatedAt)
- `Conversation` (id, userId, teacherId, startedAt, endedAt?) + `messages`
- `Message` (id, conversationId, role, content, correction?, translatedWord?, createdAt)
- `Achievement` (id, name, description, icon, requirement, points)
- `UserAchievement` (id, userId, achievementId, earnedAt) — `@@unique([userId, achievementId])`
- `Lesson` (id, level, title, description, content, order)
- `LessonProgress` (id, userId, lessonId, completed, score, completedAt?) — `@@unique([userId, lessonId])`
- تم تنفيذ `bun run db:push` بنجاح ✅ (بعد reset لـ DB القديم من mashi-build)

#### 2. Theme (`src/app/globals.css`)
- الألوان المطلوبة: Background `#0a0e1a`, Card `#141925`, Primary `#6C5CE7`, Accent `#00CEC9`, Gold `#D4A03C`, Text `#F5F0E8`, Muted `#8A8078`, Success `#00B894`, Error `#FF7675`
- Cairo font + RTL support
- Glass morphism (`.opti-glass`, `.opti-glass-teal`)
- Gradients: `.opti-primary-gradient`, `.opti-gold-gradient`, `.opti-accent-gradient`
- Animations: `opti-pulse-ring` (speaking halo), `opti-wave` (waveform), `opti-shimmer`, `opti-float-slow/slower` (blobs), `opti-bounce-in` (achievements)
- Custom scrollbar بنفسجي/تركوازي
- Focus indicators + reduced-motion + safe-area + touch targets

#### 3. Teachers (`src/lib/teachers.ts`)
6 شخصيات مدرسين كاملة (id, name, nameAr, gender, ageGroup, avatar emoji, gradient CSS, color, personality EN, personalityAr, greeting EN+AR, teachingStyle, tags):
1. **Mr. James** — 👨‍🏫 ذكر بالغ، صبور، بنفسجي `#6C5CE7`
2. **Ms. Sarah** — 👩‍🏫 أنثى شابة، مرحة، تركوازي `#00CEC9`
3. **Professor David** — 🧑‍🔬 ذكر كبير، أكاديمي، ذهبي `#D4A03C`
4. **Miss Emma** — 👩‍💼 أنثى بالغة، ودودة، وردي `#FD79A8`
5. **Coach Mike** — 🏋️‍♂️ ذكر شاب، تحفيزي، أحمر `#FF7675`
6. **Dr. Lisa** — 👩‍⚕️ أنثى كبيرة، احترافية، بنفسجي فاتح `#A29BFE`
- + `LEVELS` (مبتدئ/متوسط/متقدم) + `AGE_GROUPS` (4 فئات) + `ACHIEVEMENTS` (7 إنجازات)

#### 4. Zustand Store (`src/lib/store.ts`)
- Onboarding: `user`, `selectedTeacher`
- Chat: `messages[]`, `isListening`, `isSpeaking`, `isAiThinking`, `conversationId`
- Progress: `points`, `streak`, `achievements[]`, `lastActiveDate`, `messagesCount`, `perfectStreak`
- UI: `currentScreen` (welcome/onboarding/chat), `cameraEnabled`, `micEnabled`, `showAchievement`
- Auto-awards achievements عند بلوغ رسائل معينة (1/10/50) و 5 رسائل صحيحة متتالية
- `bumpStreak` يحسب الـ streak يومياً (يوم جديد → +1، انقطاع → reset لـ 1)
- `persist` middleware يحفظ: user, selectedTeacher, points, streak, achievements, lastActiveDate, messagesCount, currentScreen

#### 5. API Routes

##### `POST /api/chat/route.ts`
- يبني system prompt احترافي يشمل: شخصية المدرس، أسلوب التدريس، معلومات الطالب (name/age/gender/level)، guidelines حسب المستوى، 9 قواعد صارمة
- يستخدم `z-ai-web-dev-sdk` (`zai.chat.completions.create`)
- يطلب JSON response: `{reply, correction, translatedWord}`
- `extractJson()` يتعامل مع code fences و parsing fallback
- يحفظ الـ conversation + messages في DB و يضيف 2 نقطة لكل رد
- Fallback آمن لو الـ AI فشل: يرجع رسالة "Could you say that again?"
- **تم اختباره:** "I goes to school yesterday" → رد صحيح + تصحيح بالعربي "الصيغة الصحيحة هي 'I went'"

##### `POST/GET /api/user/route.ts`
- POST: ينشئ/يحدّث مستخدم من onboarding (synthetic email `name-timestamp@optitalk.local` لأن مفيش signup)
- GET: يجيب مستخدم بـ userId

#### 6. Hooks (Web Speech API)

##### `use-speech-recognition.ts`
- `SpeechRecognition` / `webkitSpeechRecognition` wrapper
- `lang='en-US'`, `continuous=false`, `interimResults=true`
- يبعت `onFinal(transcript)` و `onInterim(transcript)` و `onError(error)`
- `supported` detect بـ lazy initializer (مش setState in effect)

##### `use-speech-synthesis.ts`
- `SpeechSynthesisUtterance` wrapper
- `rate=0.9` (أبطأ للتعليم), `lang='en-US'`
- `pickVoice()` يختار voice مناسب حسب جنس المدرس (female/male hints by name)
- يبعت `onStart` و `onEnd`
- `supported` detect بـ lazy initializer

#### 7. Components (`src/components/optitalk/` — 6 مكونات)

##### `WelcomeScreen.tsx`
- لوجو OptiTalk كبير بـ gradient + halo
- Floating blobs (بنفسجي/تركوازي/ذهبي) في الخلفية
- 3 feature pills: محادثة فورية / صوت حي / تصحيح فوري
- زرار "ابدأ الآن" + إحصائيات (6 مدرسين / 3 مستويات / ∞ محادثات)

##### `OnboardingScreen.tsx` — 3 خطوات
- **Step 1:** الاسم + السن (4 فئات بأزرار) + النوع (ذكر/أنثى) + المستوى (مبتدئ/متوسط/متقدم)
- **Step 2:** شبكة 6 مدرسين، كل واحد بأفاتار + اسم + tags + زرار اختيار، يظهر greeting عند الاختيار
- **Step 3:** ملخص المعلومات + طلب إذن الكاميرا والميكروفون (يطلب فعلياً `getUserMedia`)
- Header sticky مع step dots و counter

##### `ChatScreen.tsx` (الشاشة الرئيسية)
تقسيم كامل:
```
┌─ Header: اسم المدرس + streak (🔥) + points (🏆) + settings ─┐
├─ Teacher Avatar (متحدث)  │  Student Camera (LIVE)          ─┤
├─ Messages List (scrollable, glass card)                    ─┤
├─ Control Bar: [❌] [🎤/⏹️] [⌨️]                              ─┤
└──────────────────────────────────────────────────────────────┘
```
- عند أول load: يبعت greeting المدرس ويتكلمه بصوت
- عند الضغط على الميكروفون: يبدأ الاستماع → final transcript → POST /api/chat → يعرض الرد ويتكلمه
- "المدرس بيفكر..." overlay على الأفاتار أثناء انتظار الرد
- Settings sheet (bottom): إحصائيات + toggle كاميرا + كل الإنجازات (مكتسبة/مقفولة) + إنهاء
- Achievement popup مع confetti عند كسب إنجاز جديد

##### `TeacherAvatar.tsx`
- أفاتار دائري بـ gradient المدرس
- Halo rings متحركة (2 حلقات) لما المدرس بيتكلم
- Waveform overlay لما بيفكر
- Online status dot أخضر
- Label "بيتكلم.../بيفكر.../جاهز"

##### `StudentCamera.tsx`
- `getUserMedia({video, audio:false})` preview
- `-scale-x-100` للمرآة
- LIVE indicator نابض
- Toggle button + error handling

##### `MessagesList.tsx`
- فقاعات المحادثة (user بنفسجي / teacher glass)
- Correction banner ذهبي أسفل رسالة المدرس لو فيه تصحيح
- Translated word pill بنفسجي
- "صح! ✓" indicator أخضر تحت رسالة الطالب لو مفيش أخطاء
- Replay button لكل رسالة المدرس (Volume2 icon)
- Auto-scroll للأسفل
- "المدرس بيكتب..." waveform indicator أثناء التفكير

##### `ControlBar.tsx`
- زرار الميكروفون الكبير (يتحول لأحمر مع pulse ring أثناء الاستماع)
- Text input mode fallback (لو الميكروفون مش متاح)
- Interim transcript display أثناء الاستماع
- زرار إيقاف الصوت + زرار إنهاء + زرار الكتابة
- Status hint تحت الأزرار

#### 8. Layout (`src/app/layout.tsx`)
- `lang="ar"` + `dir="rtl"`
- Cairo font من Google Fonts (subsets: arabic, latin; weights 300-900)
- metadata: "OptiTalk - تعلّم الإنجليزية بالمحادثة"
- viewport: themeColor `#0a0e1a`, `viewportFit: cover` للـ safe-area
- Sonner Toaster (top-center, richColors)

#### 9. Page (`src/app/page.tsx`)
- max-w-md wrapper (mobile-first)
- AnimatePresence بين الشاشات الثلاث (welcome/onboarding/chat) مع transitions (fade/slide/scale)

### التحقق النهائي

#### Lint
```
$ bun run lint
$ eslint .
EXIT: 0
```
✅ صفر أخطاء lint (بعد إصلاح: setState-in-effect في hooks → lazy initializers، و إزالة unused eslint-disable directives)

#### Dev Log
- ✓ `Compiled` بدون أخطاء
- `GET / 200 in 57ms` — الصفحة الرئيسية تعمل بسرعة بعد أول compile
- `POST /api/user 200 in 480ms` — إنشاء مستخدم شغال
- `POST /api/chat 200 in 931ms` — رد المدرس AI سريع (~1s)
- `POST /api/chat 200 in 1546ms` — مع تصحيح قواعد
- لا توجد أخطاء runtime/compile في السجل

#### اختبار يدوي للـ AI
- رسالة: `"I goes to school yesterday"`
- رد المدرس: `"You go to school every day. Yesterday you went to school. Do you like your school?"`
- correction: `"التصحيح: 'I goes' غير صحيح. الصيغة الصحيحة هي 'I go' للمضارع البسيط أو 'I went' للماضي. 'I went to school yesterday' هي الصيغة الصحيحة."`
✅ التصحيح بالعربي + متابعة المحادثة بسؤال

### ملاحظات تقنية
- تم تنظيف ملفات mashi-build القديمة (components, APIs, data, manifest) بالكامل
- تم reset لـ SQLite DB لان الـ schema القديم (مع `password` required) كان غير متوافق
- Dev server اتعمل له restart نظيف بعد `prisma generate` لتحديث الـ PrismaClient في الذاكرة
- Web Speech APIs بتتدهور بأناقة: لو الميكروفون اترفض → text-input mode متاح؛ لو synthesis مش مدعوم → الرسائل بتظهر من غير صوت
- `synthetic email` (name-timestamp@optitalk.local) لأن مفيش signup flow — الـ user between بـ localStorage + DB
- إزالة الـ Arabic translations من النطق (`text.replace(/\([^)]*\)/g, '')`) عشان الـ TTS ينطق إنجليزي بس

### المسار التالي (إن وُجد)
- يمكن إضافة: حفظ الـ user.id في localStorage وربطه بـ DB user، دروس منظمة (Lesson + LessonProgress)، أسئلة متعددة الخيارات، تصدير تقدم الطالب، multi-turn roleplay scenarios.

---

## Task ID: mashi-build — "الماشي" دليل السيدة زينب بالقاهرة

**Date:** 2025-06-24
**Status:** ✅ Completed
**Port:** 3000 (auto dev server)

### ملخص المشروع
تطبيق موبايل ستايل (Next.js 16 PWA) بتصميم "ليالي القاهرة الذهبي" لدليل منطقة السيدة زينب بالقاهرة. يضم 80+ مكان موزعين على 12 تصنيف.

### المخرجات المنجزة

#### 1. Prisma Schema (`prisma/schema.prisma`)
10 جداول:
- `User` (id, email, name, password, phone, avatar, points, createdAt)
- `Review`, `DayPlan`, `PlanStop`, `Badge`, `UserBadge`
- `Question`, `Answer`, `ContactMessage`, `Report`
- تم تنفيذ `bun run db:push` بنجاح ✅

#### 2. Data File (`src/lib/data.ts`)
- 80 مكان حقيقي في 12 تصنيف
- تصنيفات: المشويات (9), الكبده والسجق (6), القهوه (17), حلويات (7), الجوامع والسياحه (8), الاسماك (5), الفول والطعميه (5), الكشرى (4), لحوم (5), مستشفايات (5), براندات (5), شريكات الاتصالات (5)
- أسماء حقيقية: كشري أبو طارق، حلوانيات عبد الرحمن، قهوة بلبع، مسجد السيدة زينب، إلخ.
- كل مكان له: id, name, category, description, address, lat, lng, phone, hours, rating, image (emoji), priceRange, tags[]
- 12 لون للتصنيفات كما طُلب (#C0623B, #D4A03C, #5D4037, ... إلخ)
- قاموس `MOODS` للاكتشاف حسب المود
- قاموس `BADGES` (6 أوسمة)

#### 3. Zustand Store (`src/lib/store.ts`)
- `activeTab`, `searchQuery`, `activeCategory`, `activeMood`, `selectedPlace`
- `favorites`, `currentUser`, `guestMode`, `placeReviews`, `dayPlans`
- إجراءات: `toggleFavorite`, `addDayPlan`, `addStopToPlan`, `reorderStop`, `removeStopFromPlan`, ... إلخ
- `persist` middleware مع `partialize` لحفظ: favorites, currentUser, guestMode, placeReviews, dayPlans في localStorage

#### 4. API Routes (9 endpoints)
- `POST /api/auth/register` — تسجيل مستخدم (+points=0)
- `POST /api/auth/login` — تسجيل دخول
- `GET /POST /api/reviews` — تقييمات (+5 نقاط للمستخدم)
- `GET /POST /DELETE /api/plans` — خطط اليوم (+10 نقاط)
- `GET /POST /api/questions` — أسئلة وإجابات (+2 سؤال / +3 إجابة)
- `POST /api/contact` — رسالة تواصل (الإيميل optigroup.10@gmail.com يُستخدم داخل الكود فقط)
- `GET /api/badges?userId=` — الأوسمة
- `POST /api/reports` — بلاغ
- `POST /api/seed` — زرع بيانات تجريبية (Badges + مستخدم demo + سؤال نموذجي)

#### 5. Components (`src/components/mashi/` — 18 مكون)
- `TabBar.tsx` — 5 تبويبات سفلية sticky (الرئيسية، الخريطة، خطط، سؤال، المفضلة + badge)
- `WelcomeScreen.tsx` — شاشة ترحيب بـ Framer Motion (ضيف/دخول/حساب جديد)
- `HomeScreen.tsx` — الترتيب الرئيسي: SearchBar → HeroBanner → MoodDiscovery → FeaturedSpot → CategoryGrid → قائمة الأماكن
- `SearchBar.tsx` — بحث فوري + suggestions (top 6)
- `HeroBanner.tsx` — بانر متدرّج "اكتشف السيدة زينب"
- `MoodDiscovery.tsx` — 6 أزرار حسب المود
- `FeaturedSpot.tsx` — مكان مميز (الأعلى تقييماً)
- `CategoryGrid.tsx` — شبكة 12 تصنيف
- `CategoryScreen.tsx` — عرض الأماكن حسب التصنيف
- `PlaceCard.tsx` — كارت مكان + زر مفضلة
- `PlaceDetail.tsx` — Sheet من الأسفل + معلومات + actions (أضف للخطة، الاتجاهات، إبلاغ) + ReviewSystem
- `MapScreen.tsx` — خريطة مخصصة بـ markers بلون التصنيف + filter chips + قائمة الأماكن القريبة
- `DayPlanBuilder.tsx` — إنشاء/حذف خطط + timeline + reorder (up/down)
- `QAPanel.tsx` — أسئلة المجتمع + إجابات + سؤال جديد
- `FavoritesScreen.tsx` — قائمة المفضلة + empty state
- `ReviewSystem.tsx` — تقييم بالنجوم + متوسط + قائمة
- `BadgesPanel.tsx` — 6 أوسمة (مكتسبة vs مقفلة)
- `ContactPanel.tsx` — نموذج تواصل
- `ProjectDocPanel.tsx` — وصف المشروع

#### 6. Layout (`src/app/layout.tsx`)
- `lang="ar"` + `dir="rtl"`
- خط Cairo من Google Fonts ( subsets: arabic, latin; weights: 300-900)
- metadata بالعربي + keywords عربية
- viewport مع themeColor #0D0B09
- manifest.json في /public
- Sonner Toaster (top-center) + Radix Toaster

#### 7. Page (`src/app/page.tsx`)
- Header sticky top: Logo + Info + Mail + User menu
- main content area: AnimatePresence بين التبويبات
- إذا مش مسجل → WelcomeScreen
- إذا مسجل → التبويبات (HomeScreen, MapScreen, DayPlanBuilder+Badges, QAPanel, FavoritesScreen)
- Sheets: PlaceDetail, ContactPanel, ProjectDocPanel
- TabBar sticky bottom (يظهر فقط لما يكون مسجل/ضيف)

### التحقق النهائي

#### Lint
```
$ bun run lint
$ eslint .
EXIT: 0
```
✅ صفر أخطاء lint

#### Dev Log
- ✓ Compiled بدون أخطاء
- `GET / 200` — الصفحة الرئيسية تعمل
- `GET /api/badges 200` — يرجع الـ badges
- `POST /api/seed 200` — زرع البيانات التجريبية بنجاح (Badge, User, Question)
- `POST /api/auth/register 200` — تسجيل مستخدم تجريبي
- `POST /api/auth/login 200` — تسجيل دخول
- `GET /api/reviews?placeId=g1 200` — `{"reviews":[],"avg":0}`
- لا توجد أخطاء runtime/compile في السجل

### ملاحظات تقنية
- تم تجاهل مجلدات `optisize_work`, `mini-services`, `download`, `upload`, `_read_optisize` في eslint config
- استُخدم `useEffect` (وليس `useState` initializer) لجلب التقييمات في ReviewSystem
- إيميل التواصل `optigroup.10@gmail.com` غير ظاهر للمستخدم (مُحفوظ في backend فقط)
- PWA manifest + SVG icons مُضمّنة (data URIs)

### المسار التالي (إن وُجد)
- يمكن إضافة: ربط NextAuth، تأمين كلمات المرور بـ bcrypt، رفع صور حقيقية للأماكن، WebSockets للأسئلة المباشرة.
