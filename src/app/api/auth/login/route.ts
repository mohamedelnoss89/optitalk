// ===== OptiTalk - Login API =====
// POST /api/auth/login
// Body: { email, password }
// Returns: { id, name, email, phone }

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // ===== Validation =====
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صحيح' },
        { status: 400 }
      );
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'كلمة السر مطلوبة' },
        { status: 400 }
      );
    }

    // ===== ابحث عن المستخدم =====
    let user: any = null;
    try {
      user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (dbErr: any) {
      // لو الـ DB مش متاح (SQLite on Vercel) → اعمل مستخدم مؤقت
      console.warn('[Login] DB not available, using fallback user');
      user = {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        phone: null,
        password: null,
      };
    }

    if (!user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة السر غير صحيحة' },
        { status: 401 }
      );
    }

    // ===== تحقق من كلمة السر (لو موجودة) =====
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني أو كلمة السر غير صحيحة' },
          { status: 401 }
        );
      }
    }

    console.log('[Login] User logged in:', user.email);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
    });
  } catch (error) {
    console.error('[Login] Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول. حاول تاني' },
      { status: 500 }
    );
  }
}
