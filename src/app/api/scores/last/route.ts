import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toSessionResult } from "@/lib/stats/sessionMapper";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.trainingSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" },
  });

  return NextResponse.json(row ? toSessionResult(row) : null);
}
