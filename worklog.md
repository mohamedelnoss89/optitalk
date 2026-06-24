# Worklog

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
