import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toSessionResult } from "@/lib/stats/sessionMapper";
import type { SessionResult } from "@/lib/stats/types";

function isValidBody(body: unknown): body is Omit<SessionResult, "id"> {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.completedAt === "string" &&
    typeof b.durationMs === "number" &&
    (b.questionLimit === null || typeof b.questionLimit === "number") &&
    typeof b.score === "number" &&
    typeof b.correctCount === "number" &&
    typeof b.totalCount === "number" &&
    typeof b.accuracy === "number" &&
    typeof b.avgSpeedMs === "number" &&
    typeof b.config === "object" &&
    b.config !== null
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json();
  if (!isValidBody(body)) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const row = await prisma.trainingSession.create({
    data: {
      userId: session.user.id,
      score: body.score,
      accuracy: body.accuracy,
      correctCount: body.correctCount,
      totalCount: body.totalCount,
      avgSpeedMs: body.avgSpeedMs,
      config: body.config as object,
      durationMs: body.durationMs,
      questionLimit: body.questionLimit,
      completedAt: new Date(body.completedAt),
    },
  });

  return NextResponse.json(toSessionResult(row), { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);

  const rows = await prisma.trainingSession.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(rows.map(toSessionResult));
}
