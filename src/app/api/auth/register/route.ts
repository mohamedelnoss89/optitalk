import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "الإيميل وكلمة المرور مطلوبان" }, { status: 400 });
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "هذا الإيميل مسجل بالفعل" }, { status: 409 });
    }
    const user = await db.user.create({
      data: { email, password, name: name ?? null, phone: phone ?? null, points: 0 },
    });
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "فشل التسجيل: " + (e as Error).message },
      { status: 500 }
    );
  }
}
