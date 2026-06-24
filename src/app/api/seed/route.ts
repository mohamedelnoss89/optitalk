import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BADGES } from "@/lib/data";

export async function POST() {
  try {
    // seed badges
    const count = await db.badge.count();
    if (count === 0) {
      await db.badge.createMany({
        data: BADGES.map((b) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.icon,
          requirement: b.requirement,
        })),
      });
    }
    // seed demo user
    let demoUser = await db.user.findUnique({ where: { email: "demo@mashi.app" } });
    if (!demoUser) {
      demoUser = await db.user.create({
        data: {
          email: "demo@mashi.app",
          password: "demo123",
          name: "زائر تجريبي",
          points: 25,
        },
      });
    }
    // seed a sample question
    const qCount = await db.question.count();
    if (qCount === 0) {
      await db.question.create({
        data: {
          userId: demoUser.id,
          title: "إيه أفضل وقت لزيارة مسجد السيدة زينب؟",
          content: "عايز أعرف أفضل وقت للزيارة وتفادي الزحمة",
          category: "general",
        },
      });
    }
    return NextResponse.json({ ok: true, message: "تم زراعة البيانات التجريبية بنجاح" });
  } catch (e) {
    return NextResponse.json(
      { error: "فشل الزراعة: " + (e as Error).message },
      { status: 500 }
    );
  }
}
