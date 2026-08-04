// ===== OptiTalk - Google Auth API =====
// POST /api/auth/google
// Body: { credential } — Google JWT token
// Returns: { id, name, email, phone }

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// فك تشفير JWT token من Google
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (err) {
    console.error('[Google Auth] JWT decode error:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json(
        { error: 'Google credential مطلوب' },
        { status: 400 }
      );
    }

    const payload = decodeJWT(credential);
    if (!payload) {
      return NextResponse.json(
        { error: 'فشل قراءة بيانات Google' },
        { status: 400 }
      );
    }

    const email = payload.email?.toLowerCase().trim();
    const name = payload.name || 'مستخدم';
    const avatar = payload.picture || null;

    if (!email) {
      return NextResponse.json(
        { error: 'لم يتم الحصول على بريد إلكتروني من Google' },
        { status: 400 }
      );
    }

    // ابحث عن المستخدم أو اعمله create
    let user: any = null;
    try {
      user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email,
            name,
            provider: 'google',
            password: null,
            avatar,
            age: 0,
            gender: 'male',
            level: 'beginner',
            teacherId: '',
            points: 0,
            streak: 0,
          },
        });
        console.log('[Google Auth] New user created:', user.id);
      } else {
        if (avatar && user.avatar !== avatar) {
          await db.user.update({
            where: { id: user.id },
            data: { avatar },
          });
        }
        console.log('[Google Auth] Existing user logged in:', user.id);
      }
    } catch (dbErr: any) {
      // لو الـ DB مش متاح → اعمل مستخدم مؤقت
      console.warn('[Google Auth] DB error, using fallback:', dbErr?.message);
      user = {
        id: 'google-' + Date.now(),
        email,
        name,
        phone: null,
      };
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
    });
  } catch (err: any) {
    console.error('[Google Auth] Error:', err);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول بـ Google' },
      { status: 500 }
    );
  }
}
