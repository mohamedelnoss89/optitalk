import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BADGES } from "@/lib/data";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const allBadges = await db.badge.findMany();
  // seed badges if empty
  if (allBadges.length === 0) {
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
  let earned: { badgeId: string }[] = [];
  if (userId) {
    earned = await db.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
  }
  return NextResponse.json({
    badges: BADGES,
    earned: earned.map((e) => e.badgeId),
  });
}
