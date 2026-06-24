import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "كل البيانات مطلوبة" }, { status: 400 });
    }
    const msg = await db.contactMessage.create({
      data: { name, email, message },
    });
    return NextResponse.json({ ok: true, id: msg.id });
  } catch (e) {
    return NextResponse.json(
      { error: "فشل الإرسال: " + (e as Error).message },
      { status: 500 }
    );
  }
}
