// ===== OptiTalk - رسائل الترحيب المتغيرة (بالعامية المصرية) =====
// pool كبير من greetings لكل مستوى ومرحلة
// عشان المستخدم ما يحسش بالملل من نفس الترحيب

export interface GreetingContext {
  userName: string;
  teacherNameAr: string;
  teacherName: string;
  learningStage: number; // 1-5 للمبتدئ
  messagesCount: number; // إجمالي رسائل المستخدم
  streak: number;
}

// ===== مرحلة التعلم للمبتدئ =====
export const STAGE_INFO: Record<number, { name: string; desc: string; emoji: string }> = {
  1: { name: 'الترحيب', desc: 'كلمات Hello و Hi', emoji: '👋' },
  2: { name: 'الكلمات الأساسية', desc: 'Yes / No / Thank you', emoji: '✅' },
  3: { name: 'جمل من كلمتين', desc: 'Good morning', emoji: '🔤' },
  4: { name: 'الجمل القصيرة', desc: 'How are you?', emoji: '💬' },
  5: { name: 'المحادثة البسيطة', desc: 'أسئلة وأجوبة', emoji: '🎤' },
};

// ===== greetings للمبتدئ — بالعامية المصرية =====
export function getBeginnerGreeting(ctx: GreetingContext): string {
  const { userName, teacherNameAr, stage } = { ...ctx, stage: ctx.learningStage };

  const stageGreetings: Record<number, string[]> = {
    1: [
      `أهلاً يا ${userName}! أنا ${teacherNameAr}. هندأ من الأول. بالإنجليزي عشان نسلم بنقول: Hello. حاول تقول Hello؟`,
      `مرحباً يا ${userName}! أنا ${teacherNameAr}. هندأ خطوة خطوة. أول كلمة: Hello يعني أهلاً. قول Hello؟`,
      `أهلاً! أنا ${teacherNameAr}. مبروك إنك بدأت. بالإنجليزي عشان نسلم بنقول: Hello. يلا قولها معايا؟`,
      `يا هلا يا ${userName}! أنا ${teacherNameAr}. جاهزين نبدأ؟ أول كلمة هنتعلمها: Hello. يعني أهلاً. حاول تقولها؟`,
      `أهلاً وسهلاً يا ${userName}! ${teacherNameAr} معاك. هندأ من الصفر. بالإنجليزي بنقول: Hello. قولها معايا؟`,
    ],
    2: [
      `شاطر يا ${userName}! خلينا نتعلم كلمة جديدة: Yes يعني أيوة. قول Yes؟`,
      `برافو! دلوقتي نتعلم: No يعني لأ. حاول تقول No؟`,
      `ممتاز يا ${userName}! كلمة النهارده: Thank you يعني شكراً. قولها؟`,
      `كويس جداً! خلينا نتعلم: Please يعني من فضلك. حاول تقولها؟`,
      `أحسنت! كلمة جديدة: Good يعني كويس. قول Good؟`,
    ],
    3: [
      `تخيل إنك بتسلم على حد الصبح. بالإنجليزي بنقول: Good morning. حاول تقولها؟`,
      `لو حد ساعدك، بتقول: Thank you. حاول تقول Thank you؟`,
      `عايز تعرّف نفسك: I am ${userName}. حاول تقول: I am؟`,
      `لما تيجي تروح، بتقول: Good bye. حاول تقولها؟`,
      `لو عايز تسلم على حد بالليل: Good night. قولها؟`,
    ],
    4: [
      `بالإنجليزي عشان نسأل حد إزيك بنقول: How are you? حاول تقولها؟`,
      `لو حد سألك إزيك، ترد: I am fine. حاول تقولها؟`,
      `عايز تقول إنك مبسوط: I am happy. قولها؟`,
      `لو عايز تسأل اسم حد: What is your name? حاول؟`,
      `عايز تقول اسمك: My name is ${userName}. قولها؟`,
    ],
    5: [
      `تخيل حد سألك How are you? تقدر ترد: I am fine, thank you. جرّب؟`,
      `لو حد قالهالك الصبح، ترد: Good morning! How are you? حاول؟`,
      `نتدرب على محادثة: أنا هسألك How are you? وأنت رد: I am good. جاهز؟`,
      `خلينا نتكلم: قولي، What is your name? حاول ترد بالإنجليزي؟`,
      `محادثة بسيطة: لو قلتلك Hello, how are you? ترد إيه؟ جرّب؟`,
    ],
  };

  const pool = stageGreetings[stage] || stageGreetings[1];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ===== greetings للمتوسط — بالعامية المصرية =====
export function getIntermediateGreeting(ctx: GreetingContext): string {
  const { userName, teacherNameAr, messagesCount } = ctx;

  const greetings = [
    `أهلاً يا ${userName}! أنا ${teacherNameAr}. عامل إيه النهاردة؟ How are you today?`,
    `مرحباً! ${teacherNameAr} هنا. جاهز نمارس إنجليزي شوية؟ What did you do today?`,
    `أهلاً يا ${userName}! يلا نكمّل تعلّم مع بعض. Tell me, how are you feeling today?`,
    `يا هلا! أنا ${teacherNameAr}. عايز نتكلم عن إيه النهارده؟ What's on your mind?`,
    `أهلاً وسهلاً يا ${userName}! ${teacherNameAr} معاك. What would you like to talk about?`,
    `مرحباً يا صاحبي! خلينا نمارس. Tell me about your day — how was it?`,
    `أهلاً! جاهز للمحادثة؟ Let's start — how are you doing today?`,
    `يا هلا يا ${userName}! ${teacherNameAr} هنا. What did you eat for breakfast today?`,
  ];

  // لو المستخدم له محادثات سابقة، نضيف greetings ترحيبية بالرجعة
  if (messagesCount > 5) {
    greetings.push(
      `أهلين يا ${userName}! سعيد برجوعك. آخر مرة كنا بنتكلم عن حاجة — تحب نكمّل ولا نبدأ موضوع جديد؟`,
      `مرحباً تاني يا ${userName}! شفت إنك بتتحسن. Tell me, what did you practice since last time?`,
      `أهلاً يا ${userName}! ${teacherNameAr} هنا. جاهز نكمّل من حيث وقفنا؟ How are you today?`,
    );
  }

  return greetings[Math.floor(Math.random() * greetings.length)];
}

// ===== greetings للمتقدم — بالإنجليزي =====
export function getAdvancedGreeting(ctx: GreetingContext): string {
  const { userName, teacherName, messagesCount } = ctx;

  const greetings = [
    `Welcome back, ${userName}! ${teacherName} here. Ready to dive in? What's been on your mind lately?`,
    `Great to see you, ${userName}! Let's pick up where we left off. What topic interests you today?`,
    `Hello ${userName}! I'm ${teacherName}. Shall we tackle something challenging? What would you like to explore?`,
    `Hey ${userName}! Good to see you again. What have you been up to? Let's discuss it in English.`,
    `Welcome, ${userName}! ${teacherName} here. Ready for some advanced practice? What's your take on... let's see, remote work?`,
    `Hi ${userName}! Let's dive into a real conversation. Tell me — what's a topic you're passionate about?`,
    `Hello there, ${userName}! ${teacherName} here. What's the most interesting thing that happened to you this week?`,
    `Welcome back, ${userName}! Ready to challenge yourself? Let's debate a topic — what interests you?`,
  ];

  if (messagesCount > 10) {
    greetings.push(
      `Welcome back, ${userName}! I've noticed your progress. Ready to push further? What topic shall we tackle?`,
      `Great to see you again, ${userName}! Your fluency is improving. Let's try something more nuanced today — what's your take on AI in education?`,
    );
  }

  return greetings[Math.floor(Math.random() * greetings.length)];
}

// ===== دالة موحدة لجلب الترحيب المناسب =====
export function getGreeting(
  level: 'beginner' | 'intermediate' | 'advanced',
  ctx: GreetingContext,
  lastIndex: number = -1
): { content: string; index: number } {
  let content: string;
  let attempts = 0;

  // حاول تختار greeting مختلف عن المرة اللي فاتت
  do {
    if (level === 'beginner') {
      content = getBeginnerGreeting(ctx);
    } else if (level === 'intermediate') {
      content = getIntermediateGreeting(ctx);
    } else {
      content = getAdvancedGreeting(ctx);
    }
    attempts++;
    // لو حاولنا 5 مرات ومش لقينا مختلف، خد اللي عندنا
    if (attempts >= 5) break;
  } while (content === lastIndex.toString() && attempts < 5);

  return { content, index: Date.now() };
}
