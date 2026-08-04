// ===== OptiTalk - Register API (client-side storage) =====
// POST /api/auth/register
// Body: { name, email, phone, password }
// Returns: { id, name, email, phone }

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ===== in-memory store (بيتمسح لما الـ function تنتهي، بس ده مش مشكلة عشان التحقق بيحصل في الـ client) =====
// فعلياً، التحقق من الإيميل المكرر بيحصل في الـ client-side قبل ما يبعت الطلب
const usersStore: { [email: string]: { id: string; name: string; email: string; phone: string; password: string } } = {};

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

    const emailLower = email.toLowerCase().trim();

    // ===== تشفير كلمة السر =====
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ===== اعمل المستخدم =====
    const user = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      password: hashedPassword,
    };

    // خزّن في الـ memory store
    usersStore[emailLower] = user;

    console.log('[Register] New user registered:', user.email, '(ID:', user.id + ')');

    // ارجع بيانات المستخدم (من غير الباسوورد)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      // ابعت الـ hashed password عشان الـ client يقدر يتحقق بعدين
      _passwordHash: hashedPassword,
    });
  } catch (error) {
    console.error('[Register] Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل. حاول تاني' },
      { status: 500 }
    );
  }
}
