"use client";

import { useStatsStore } from "@/stores/statsStore";
import type { SessionResult } from "@/lib/stats/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WIDTH = 260;
const HEIGHT = 100;
const PADDING = 10;

/** Dependency-free SVG line chart of recent scores — same no-library philosophy as `ActivityGrid`. Available to guests and signed-in users alike. */
export function ScoreTrend() {
  const recentSessions = useStatsStore((s) => s.recentSessions);
  const hasHydrated = useStatsStore((s) => s.hasHydrated);

  const sorted = [...recentSessions].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasHydrated || sorted.length === 0 ? (
          <p className="text-xs text-muted-foreground">Complete a session to start your score trend.</p>
        ) : (
          <ScoreTrendChart sessions={sorted} />
        )}
      </CardContent>
    </Card>
  );
}

function ScoreTrendChart({ sessions }: { sessions: SessionResult[] }) {
  const scores = sessions.map((s) => s.score);
  const maxScore = Math.max(...scores, 1);
  const minScore = Math.min(...scores, 0);
  const range = maxScore - minScore || 1;

  const points = sessions.map((s, i) => {
    const x = sessions.length === 1 ? WIDTH / 2 : PADDING + (i / (sessions.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((s.score - minScore) / range) * (HEIGHT - PADDING * 2);
    return { x, y, score: s.score, completedAt: s.completedAt };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Recent score trend">
      <polyline points={polylinePoints} fill="none" className="stroke-primary" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} className="fill-primary">
          <title>{`${new Date(p.completedAt).toLocaleDateString()}: ${p.score}`}</title>
        </circle>
      ))}
    </svg>
  );
}
