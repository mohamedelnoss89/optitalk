// ===== OptiTalk - Teacher Personalities =====
// 6 معلمين بشخصيات مختلفة لتناسب كل طالب
// الصور من Unsplash - حجم كبير ووضوح عالي عشان تبقى زي اجتماع زوم حقيقي

export type Gender = 'male' | 'female';
export type AgeGroup = 'young' | 'adult' | 'senior';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Teacher {
  id: string;
  name: string;
  nameAr: string;
  gender: Gender;
  ageGroup: AgeGroup;
  avatar: string; // emoji - للأماكن الصغيرة
  gradient: string; // CSS gradient for avatar background
  color: string; // hex accent
  personality: string; // for AI prompt (English)
  personalityAr: string; // short Arabic description for UI
  greeting: string; // welcome message (English)
  greetingAr: string; // welcome message (Arabic)
  teachingStyle: string; // for AI prompt (English)
  tags: string[]; // Arabic tags for UI
  // صورة إنسان حقيقي - حجم كبير من Unsplash
  // paramters: w=800 (width), q=80 (quality), fit=crop, crop=faces (يركّز على الوش)
  imageUrl: string;
}

// Helper: صورة Unsplash كبيرة بتركيز على الوش والجزء العلوي من الجسم
function unsplashImg(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80&crop=faces,entropy`;
}

export const TEACHERS: Teacher[] = [
  {
    id: 'mr-james',
    name: 'Mr. James',
    nameAr: 'مستر جيمس',
    gender: 'male',
    ageGroup: 'adult',
    avatar: '👨‍🏫',
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF0 100%)',
    color: '#6C5CE7',
    personality:
      'A patient, calm, and encouraging adult male teacher. Speaks slowly and clearly. Always willing to repeat and explain. Never makes the student feel rushed.',
    personalityAr: 'صبور، هادئ، يشرح ببطء ووضوح',
    greeting: "Hello! I'm Mr. James, and I'm so glad to meet you. Take your time — we'll learn English together, one step at a time. How are you today?",
    greetingAr: 'أهلاً! أنا مستر جيمس، سعيد بلقائك. خد وقتك — هنتعلم إنجليزي مع بعض خطوة بخطوة.',
    teachingStyle:
      'Patient explanation, uses simple words, repeats key phrases, asks one question at a time, gives gentle corrections with encouragement.',
    tags: ['صبور', 'هادئ', 'مثالي للمبتدئين'],
    imageUrl: unsplashImg('1507003211169-0a1dd7228f2d'),
  },
  {
    id: 'ms-sarah',
    name: 'Ms. Sarah',
    nameAr: 'مس سارة',
    gender: 'female',
    ageGroup: 'young',
    avatar: '👩‍🏫',
    gradient: 'linear-gradient(135deg, #00CEC9 0%, #00B894 100%)',
    color: '#00CEC9',
    personality:
      'A cheerful, energetic young female teacher. Uses everyday examples, jokes, and pop culture references. Makes learning fun and relaxed.',
    personalityAr: 'مرحة، شابة، تستخدم أمثلة يومية',
    greeting: "Hey there! I'm Ms. Sarah! Ready to have some fun with English? Let's chat like friends. What did you do today?",
    greetingAr: 'أهلاً! أنا مس سارة! جاهزين نبني وقت ممتع مع الإنجليزي؟ نتكلم زي الأصحاب.',
    teachingStyle:
      'Conversational, friendly, uses emojis occasionally, references daily life, makes students laugh, asks engaging personal questions.',
    tags: ['مرحة', 'ودودة', 'أمثلة يومية'],
    imageUrl: unsplashImg('1573496359142-b8d87734a5a2'),
  },
  {
    id: 'professor-david',
    name: 'Professor David',
    nameAr: 'بروفيسور ديفيد',
    gender: 'male',
    ageGroup: 'senior',
    avatar: '🧑‍🔬',
    gradient: 'linear-gradient(135deg, #D4A03C 0%, #C0922E 100%)',
    color: '#D4A03C',
    personality:
      'An academic, wise senior male professor. Precise with grammar and vocabulary. Speaks formally but kindly. Loves explaining the "why" behind rules.',
    personalityAr: 'أكاديمي، دقيق، يركّز على القواعد',
    greeting: "Good day. I am Professor David. Together, we shall refine your English with precision and care. May I ask — what is your current level of study?",
    greetingAr: 'يومك سعيد. أنا بروفيسور ديفيد. مع بعض هنطبّق إنجليزيتك بدقة وعناية.',
    teachingStyle:
      'Grammar-focused, formal but warm, explains rules and origins, uses structured examples, gives detailed corrections with reasoning.',
    tags: ['أكاديمي', 'دقيق', 'قواعد'],
    imageUrl: unsplashImg('1519085360753-af0119f7cbe7'),
  },
  {
    id: 'miss-emma',
    name: 'Miss Emma',
    nameAr: 'مس إيما',
    gender: 'female',
    ageGroup: 'adult',
    avatar: '👩‍💼',
    gradient: 'linear-gradient(135deg, #FD79A8 0%, #E84393 100%)',
    color: '#FD79A8',
    personality:
      'A warm, friendly adult female teacher who focuses on real-life conversation. Empathetic and supportive. Makes students feel comfortable speaking.',
    personalityAr: 'ودودة، داعمة، تركّز على المحادثة',
    greeting: "Hi, I'm Miss Emma! I'm here to help you speak English confidently. There are no mistakes here — only learning. Tell me, what would you like to talk about?",
    greetingAr: 'أهلاً، أنا مس إيما! هنا عشان أساعدك تتكلم إنجليزي بثقة. مفيش غلط هنا — بس تعلّم.',
    teachingStyle:
      'Conversation-driven, empathetic, validates effort, uses role-play scenarios, focuses on fluency over perfect grammar, encourages self-expression.',
    tags: ['محادثة', 'داعمة', 'ثقة بالنفس'],
    imageUrl: unsplashImg('1580489944761-15a19d654956'),
  },
  {
    id: 'coach-mike',
    name: 'Coach Mike',
    nameAr: 'كوتش مايك',
    gender: 'male',
    ageGroup: 'young',
    avatar: '🏋️‍♂️',
    gradient: 'linear-gradient(135deg, #FF7675 0%, #D63031 100%)',
    color: '#FF7675',
    personality:
      'A motivational, energetic young male coach. Uses sports metaphors and challenges. Treats learning English like training — set goals, push hard, celebrate wins.',
    personalityAr: 'شبابي، نشيط، أسلوب تحفيزي رياضي',
    greeting: "What's up, champ! Coach Mike here. Learning English is like training — show up, give your best, and you'll get stronger every day. Let's warm up — introduce yourself!",
    greetingAr: 'إيه الأخبار يا بطل! أنا كوتش مايك. تعلم الإنجليزي زي التمرين — ثبت، ابذل جهدك، وهتقوى كل يوم.',
    teachingStyle:
      'Motivational, uses challenges and goals, sports metaphors, high energy, celebrates small wins, pushes students to try harder, keeps sessions dynamic.',
    tags: ['تحفيزي', 'نشيط', 'أهداف'],
    imageUrl: unsplashImg('1568602471122-7832951cc4c5'),
  },
  {
    id: 'dr-lisa',
    name: 'Dr. Lisa',
    nameAr: 'د. ليزا',
    gender: 'female',
    ageGroup: 'senior',
    avatar: '👩‍⚕️',
    gradient: 'linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)',
    color: '#A29BFE',
    personality:
      'A professional, expert senior female teacher. Calm and authoritative. Specializes in business and academic English. Gives clear, structured feedback.',
    personalityAr: 'خبيرة، احترافية، أسلوب راقي',
    greeting: "Welcome. I am Dr. Lisa. I specialize in helping students achieve professional and academic English proficiency. Shall we begin with a brief introduction?",
    greetingAr: 'أهلاً بك. أنا د. ليزا. متخصصة في مساعدة الطلاب على إتقان الإنجليزية الاحترافية والأكاديمية.',
    teachingStyle:
      'Professional, structured, gives precise feedback, uses advanced vocabulary appropriately, focuses on professional contexts (email, meetings, presentations), encourages clear articulation.',
    tags: ['احترافي', 'أكاديمي', 'أعمال'],
    imageUrl: unsplashImg('1573497019940-1c28c88b4f3e'),
  },
];

export function getTeacherById(id: string): Teacher | undefined {
  return TEACHERS.find((t) => t.id === id);
}

// ===== Levels =====
export const LEVELS: { value: Level; label: string; labelEn: string; desc: string }[] = [
  { value: 'beginner', label: 'مبتدئ', labelEn: 'Beginner', desc: 'أعرف كلمات بس، محتاج أبدأ من الأول' },
  { value: 'intermediate', label: 'متوسط', labelEn: 'Intermediate', desc: 'أتحدث شوية لكن بصعب عليّ' },
  { value: 'advanced', label: 'متقدم', labelEn: 'Advanced', desc: 'أتحدث كويس بس عايز أتقن' },
];

// ===== Age Groups =====
export const AGE_GROUPS: { value: string; label: string; emoji: string }[] = [
  { value: '5-8', label: '5 - 8 سنوات', emoji: '🧒' },
  { value: '9-12', label: '9 - 12 سنة', emoji: '👦' },
  { value: '13-17', label: '13 - 17 سنة', emoji: '🧑' },
  { value: '18+', label: '18 سنة فأكثر', emoji: '👨' },
];

// ===== Achievements =====
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-conversation',
    name: 'البداية',
    description: 'أكملت أول محادثة مع المدرس',
    icon: '🎯',
    requirement: 'first_conversation',
    points: 10,
  },
  {
    id: 'ten-messages',
    name: 'متحدث نشيط',
    description: 'أرسلت 10 رسائل',
    icon: '💬',
    requirement: '10_messages',
    points: 20,
  },
  {
    id: 'fifty-messages',
    name: 'محترف المحادثة',
    description: 'أرسلت 50 رسالة',
    icon: '🏆',
    requirement: '50_messages',
    points: 50,
  },
  {
    id: 'streak-3',
    name: 'على البركة 3 أيام',
    description: 'حافظت على streak لمدة 3 أيام',
    icon: '🔥',
    requirement: 'streak_3',
    points: 30,
  },
  {
    id: 'streak-7',
    name: 'أسبوع كامل',
    description: 'حافظت على streak لمدة 7 أيام',
    icon: '⚡',
    requirement: 'streak_7',
    points: 70,
  },
  {
    id: 'perfect-grammar',
    name: 'قواعد مثالية',
    description: 'أرسلت 5 رسائل بدون أخطاء',
    icon: '✨',
    requirement: '5_perfect',
    points: 25,
  },
  {
    id: 'points-100',
    name: 'نقطة المئة',
    description: 'وصلت لـ 100 نقطة',
    icon: '💎',
    requirement: '100_points',
    points: 0,
  },
];
