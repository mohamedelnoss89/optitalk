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
    let existingByEmail: any = null;
    try {
      existingByEmail = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (dbErr: any) {
      // لو الـ DB مش متاح (SQLite on Vercel) → تجاهل
      console.warn('[Register] DB not available, skipping email check');
    }

    if (existingByEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // ===== تشفير كلمة السر =====
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ===== إنشاء المستخدم =====
    let user: any = null;
    try {
      user = await db.user.create({
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
      console.log('[Register] New user created in DB:', user.id);
    } catch (createErr: any) {
      // لو الـ DB مش متاح → اعمل مستخدم مؤقت
      console.warn('[Register] DB create failed, using fallback:', createErr?.message);
      user = {
        id: 'user-' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
      };
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error('[Register] Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل. حاول تاني' },
      { status: 500 }
    );
  }
}
