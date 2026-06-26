import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const questions = await db.question.findMany({
    include: { answers: true, user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // support both question and answer creation
    if (body.questionId && body.content) {
      // answering
      const answer = await db.answer.create({
        data: {
          questionId: body.questionId,
          userId: body.userId,
          content: body.content,
        },
      });
      await db.user.update({
        where: { id: body.userId },
        data: { points: { increment: 3 } },
      }).catch(() => undefined);
      return NextResponse.json(answer);
    }
    const { userId, title, content, category } = body;
    if (!userId || !title) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }
    const q = await db.question.create({
      data: { userId, title, content: content ?? null, category: category ?? "general" },
    });
    await db.user.update({
      where: { id: userId },
      data: { points: { increment: 2 } },
    }).catch(() => undefined);
    return NextResponse.json(q);
  } catch (e) {
    return NextResponse.json(
      { error: "فشلت العملية: " + (e as Error).message },
      { status: 500 }
    );
  }
}
