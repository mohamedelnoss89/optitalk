// ===== OptiTalk - User Onboarding API =====
// POST /api/user  — creates or updates user from onboarding
// GET  /api/user?userId=...  — fetches user

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UserPayload {
  name: string;
  age: string;
  gender: string;
  level: string;
  teacherId: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UserPayload;

    if (!body.name || !body.age || !body.gender || !body.level || !body.teacherId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const ageNum = parseInt(body.age, 10) || 0;
    const ageValue = Number.isNaN(ageNum) ? 18 : ageNum;

    // Synthetic email (no signup flow) — keep unique per onboarding
    const syntheticEmail = body.userId
      ? undefined
      : `${body.name.trim().toLowerCase().replace(/\s+/g, '.')}-${Date.now()}@optitalk.local`;

    let user;
    if (body.userId) {
      user = await db.user.update({
        where: { id: body.userId },
        data: {
          name: body.name,
          age: ageValue,
          gender: body.gender,
          level: body.level,
          teacherId: body.teacherId,
        },
      });
    } else {
      user = await db.user.create({
        data: {
          name: body.name,
          email: syntheticEmail as string,
          age: ageValue,
          gender: body.gender,
          level: body.level,
          teacherId: body.teacherId,
          points: 0,
          streak: 0,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[OptiTalk] User create error:', err);
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    console.error('[OptiTalk] User fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
