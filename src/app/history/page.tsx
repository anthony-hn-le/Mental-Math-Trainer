import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toSessionResult } from "@/lib/stats/sessionMapper";
import { TopBar } from "@/components/shared/TopBar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreHistoryChart } from "@/components/history/ScoreHistoryChart";
import type { OperationKey } from "@/lib/mathEngine/types";

const NUMBER_TYPE_LABELS: Record<string, string> = {
  integer: "Integer",
  decimal: "Decimal",
  fraction: "Fraction",
  percentage: "Percentage",
};

function numberTypesUsed(activeOperations: OperationKey[]): string {
  const types = new Set(activeOperations.map((key) => key.split("-")[0]));
  return [...types].map((t) => NUMBER_TYPE_LABELS[t] ?? t).join(", ") || "—";
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const userId = session.user.id;

  const [rows, agg] = await Promise.all([
    prisma.trainingSession.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 100,
    }),
    prisma.trainingSession.aggregate({
      where: { userId },
      _max: { score: true },
      _sum: { totalCount: true, correctCount: true },
    }),
  ]);

  const sessions = rows.map(toSessionResult);
  const totalAttempts = agg._sum.totalCount ?? 0;
  const totalCorrect = agg._sum.correctCount ?? 0;
  const lifetimeAccuracy = totalAttempts === 0 ? 0 : totalCorrect / totalAttempts;

  const stats = [
    { label: "Highest Score", value: `${agg._max.score ?? 0}` },
    { label: "Total Attempts", value: `${totalAttempts}` },
    { label: "Lifetime Accuracy", value: `${Math.round(lifetimeAccuracy * 100)}%` },
    { label: "Sessions Logged", value: `${sessions.length}` },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground">Every drill you&apos;ve completed while signed in.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <span className="font-mono text-lg font-semibold tabular-nums">{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Score Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreHistoryChart sessions={sessions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No sessions yet — head back and complete a drill.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-2 pr-4 font-normal">Date</th>
                      <th className="py-2 pr-4 font-normal">Score</th>
                      <th className="py-2 pr-4 font-normal">Accuracy</th>
                      <th className="py-2 pr-4 font-normal">Correct / Total</th>
                      <th className="py-2 pr-4 font-normal">Avg Speed</th>
                      <th className="py-2 pr-4 font-normal">Number Types</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-4 tabular-nums">{new Date(s.completedAt).toLocaleString()}</td>
                        <td className="py-2 pr-4 font-mono tabular-nums">{s.score}</td>
                        <td className="py-2 pr-4 font-mono tabular-nums">{Math.round(s.accuracy * 100)}%</td>
                        <td className="py-2 pr-4 font-mono tabular-nums">
                          {s.correctCount} / {s.totalCount}
                        </td>
                        <td className="py-2 pr-4 font-mono tabular-nums">{(s.avgSpeedMs / 1000).toFixed(1)}s</td>
                        <td className="py-2 pr-4">{numberTypesUsed(s.config.activeOperations)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>
      <Footer />
    </div>
  );
}
