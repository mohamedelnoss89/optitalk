// NextAuth route - متوافق مع next-auth v4
// بما إننا بنستخدم custom auth routes (/api/auth/login, /api/auth/register)
// فالـ NextAuth route ده مش ضروري، بس نسيبه عشان متكسرش الـ build

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // محاكاة - بنستخدم custom routes للـ auth الحقيقي
        if (!credentials?.email || !credentials?.password) return null;
        return { id: '1', email: credentials.email, name: 'User' };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET || 'fallback-secret',
});

export { handler as GET, handler as POST };
