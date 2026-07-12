"use client";

import type { SessionResult } from "@/lib/stats/types";

interface ScoreHistoryChartProps {
  sessions: SessionResult[]; // any order — sorted internally, oldest first
}

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 12;

/** Dependency-free SVG line chart of score-over-time — same no-library philosophy as `ActivityGrid`. */
export function ScoreHistoryChart({ sessions }: ScoreHistoryChartProps) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );

  if (sorted.length === 0) {
    return <p className="text-xs text-muted-foreground">Complete a session to start your score history.</p>;
  }

  const scores = sorted.map((s) => s.score);
  const maxScore = Math.max(...scores, 1);
  const minScore = Math.min(...scores, 0);
  const range = maxScore - minScore || 1;

  const points = sorted.map((s, i) => {
    const x = sorted.length === 1 ? WIDTH / 2 : PADDING + (i / (sorted.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((s.score - minScore) / range) * (HEIGHT - PADDING * 2);
    return { x, y, score: s.score, completedAt: s.completedAt };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Score over time">
      <polyline points={polylinePoints} fill="none" className="stroke-primary" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-primary">
          <title>{`${new Date(p.completedAt).toLocaleDateString()}: ${p.score}`}</title>
        </circle>
      ))}
    </svg>
  );
}
