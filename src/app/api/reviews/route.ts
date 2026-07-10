import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");
  if (placeId) {
    const reviews = await db.review.findMany({
      where: { placeId },
      orderBy: { createdAt: "desc" },
    });
    const avg =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    return NextResponse.json({ reviews, avg });
  }
  const all = await db.review.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ reviews: all });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, placeId, rating, comment } = await req.json();
    if (!userId || !placeId || !rating) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }
    const review = await db.review.create({
      data: { userId, placeId, rating: Number(rating), comment: comment ?? null },
    });
    // award points
    await db.user.update({
      where: { id: userId },
      data: { points: { increment: 5 } },
    }).catch(() => undefined);
    return NextResponse.json(review);
  } catch (e) {
    return NextResponse.json(
      { error: "فشل إضافة التقييم: " + (e as Error).message },
      { status: 500 }
    );
  }
}
