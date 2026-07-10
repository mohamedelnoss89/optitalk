// ===== OptiTalk - Register API =====
// POST /api/auth/register
// Body: { name, email, phone, password }
// Returns: { id, name, email, phone }

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    // ===== Validation =====
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'الاسم لازم يكون حرفين على الأقل' },
        { status: 400 }
      );
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صحيح' },
        { status: 400 }
      );
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صحيح' },
        { status: 400 }
      );
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة السر لازم تكون 6 حروف على الأقل' },
        { status: 400 }
      );
    }

    // ===== تحقق إن الإيميل مش مستخدم =====
    const existingByEmail = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // ===== تحقق إن الهاتف مش مستخدم =====
    const existingByPhone = await db.user.findUnique({
      where: { phone: phone.trim() },
    });
    if (existingByPhone) {
      return NextResponse.json(
        { error: 'رقم الهاتف مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // ===== تشفير كلمة السر =====
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ===== إنشاء المستخدم =====
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        provider: 'credentials',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    console.log('[OptiTalk Auth] New user registered:', user.email);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[OptiTalk Auth] Register error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل. حاول تاني' },
      { status: 500 }
    );
  }
}
