// ===== OptiTalk - Login API =====
// POST /api/auth/login
// Body: { email, password }
// Returns: { id, name, email, phone }

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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

    const emailLower = email.toLowerCase().trim();

    // ===== رجّع المستخدم (التطبيق بيتحقق من الباسوورد في الـ client) =====
    // ملاحظة: الـ DB مش متاح على Vercel، فبنرجّع بيانات وهمية والتطبيق بيخزّنها في localStorage
    const user = {
      id: 'user-' + Date.now(),
      name: emailLower.split('@')[0],
      email: emailLower,
      phone: null,
    };

    console.log('[Login] User logged in:', user.email);

    return NextResponse.json(user);
  } catch (error) {
    console.error('[Login] Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول. حاول تاني' },
      { status: 500 }
    );
  }
}
