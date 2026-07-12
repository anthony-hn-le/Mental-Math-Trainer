import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { DayActivity } from "@/lib/stats/types";

/** Buckets a UTC timestamp into the caller's local calendar date, given their tz offset (minutes, `Date.getTimezoneOffset()`). */
function dateKeyForUser(utcDate: Date, tzOffsetMinutes: number): string {
  const shifted = new Date(utcDate.getTime() - tzOffsetMinutes * 60_000);
  const year = shifted.getUTCFullYear();
  const month = `${shifted.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${shifted.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? 30) || 30;
  const tzOffsetMinutes = Number(searchParams.get("tzOffsetMinutes") ?? 0) || 0;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const rows = await prisma.trainingSession.findMany({
    where: { userId: session.user.id, completedAt: { gte: since } },
    select: { completedAt: true, totalCount: true },
  });

  const byDate: Record<string, number> = {};
  for (const row of rows) {
    const key = dateKeyForUser(row.completedAt, tzOffsetMinutes);
    byDate[key] = (byDate[key] ?? 0) + row.totalCount;
  }

  const todayLocal = new Date(Date.now() - tzOffsetMinutes * 60_000);
  const result: DayActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayLocal);
    d.setUTCDate(d.getUTCDate() - i);
    const key = `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, "0")}-${`${d.getUTCDate()}`.padStart(2, "0")}`;
    result.push({ date: key, questionsAnswered: byDate[key] ?? 0 });
  }

  return NextResponse.json(result);
}
