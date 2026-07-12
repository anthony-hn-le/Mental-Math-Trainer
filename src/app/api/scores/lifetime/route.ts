import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { LifetimeStats } from "@/lib/stats/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agg = await prisma.trainingSession.aggregate({
    where: { userId: session.user.id },
    _max: { score: true },
    _sum: { totalCount: true, correctCount: true },
  });

  const totalAttempts = agg._sum.totalCount ?? 0;
  const totalCorrect = agg._sum.correctCount ?? 0;

  const lifetime: LifetimeStats = {
    highestScore: agg._max.score ?? 0,
    totalAttempts,
    totalCorrect,
    lifetimeAccuracy: totalAttempts === 0 ? 0 : totalCorrect / totalAttempts,
  };

  return NextResponse.json(lifetime);
}
