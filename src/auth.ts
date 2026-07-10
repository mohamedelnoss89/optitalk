import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

// Auth.js v5 (NextAuth beta)
// Google OAuth + Credentials (email/password)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Google OAuth - يحتاج GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET في .env
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials provider (email/password) - للـ signup/login العادي
    Credentials({
      name: 'email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' }, // للـ signup
      },
      async authorize(credentials) {
        // هنا نقوم بفحص الـ credentials
        // حالياً بنقبل أي إيميل/باسورد (للتجربة)
        // في الإنتاج لازم نربطها بقاعدة بيانات

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // محاكاة مستخدم - في الإنتاج لازم نتصل بقاعدة بيانات
        const user = {
          id: credentials.email as string,
          email: credentials.email as string,
          name: (credentials.name as string) || (credentials.email as string).split('@')[0],
        };

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    // صفحات مخصصة (مش هنعملها دلوقتي - نستخدم dialogs)
    // signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || 'opticut-secret-key-change-in-production',
});
