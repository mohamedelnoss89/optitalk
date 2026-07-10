import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "الإيميل وكلمة المرور مطلوبان" }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "فشل تسجيل الدخول: " + (e as Error).message },
      { status: 500 }
    );
  }
}
