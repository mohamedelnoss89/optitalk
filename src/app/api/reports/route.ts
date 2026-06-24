import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, placeId, reason, description } = await req.json();
    if (!placeId || !reason) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }
    const report = await db.report.create({
      data: {
        userId: userId ?? null,
        placeId,
        reason,
        description: description ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: report.id });
  } catch (e) {
    return NextResponse.json(
      { error: "فشل الإبلاغ: " + (e as Error).message },
      { status: 500 }
    );
  }
}
