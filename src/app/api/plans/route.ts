import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (userId) {
    const plans = await db.dayPlan.findMany({
      where: { userId },
      include: { stops: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ plans });
  }
  const all = await db.dayPlan.findMany({
    include: { stops: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ plans: all });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, name, date, stops } = await req.json();
    if (!userId || !name) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }
    const plan = await db.dayPlan.create({
      data: {
        userId,
        name,
        date: date ?? new Date().toISOString().slice(0, 10),
        stops: {
          create: (stops as { placeId: string; order: number; duration: number }[]).map((s) => ({
            placeId: s.placeId,
            order: s.order,
            duration: s.duration ?? 60,
          })),
        },
      },
      include: { stops: true },
    });
    await db.user.update({
      where: { id: userId },
      data: { points: { increment: 10 } },
    }).catch(() => undefined);
    return NextResponse.json(plan);
  } catch (e) {
    return NextResponse.json(
      { error: "فشل إنشاء الخطة: " + (e as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });
    await db.dayPlan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "فشل الحذف: " + (e as Error).message },
      { status: 500 }
    );
  }
}
