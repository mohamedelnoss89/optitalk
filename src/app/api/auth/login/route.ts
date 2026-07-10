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
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة السر غير صحيحة' },
        { status: 401 }
      );
    }

    // ===== تحقق من كلمة السر =====
    if (!user.password) {
      return NextResponse.json(
        { error: 'هذا الحساب مسجل بـ Google. استخدم تسجيل الدخول بـ Google' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة السر غير صحيحة' },
        { status: 401 }
      );
    }

    console.log('[OptiTalk Auth] User logged in:', user.email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('[OptiTalk Auth] Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول. حاول تاني' },
      { status: 500 }
    );
  }
}
