"use client";

import { useState } from "react";
import type { SessionResult } from "@/lib/stats/types";

const WIDTH = 260;
const HEIGHT = 110;
const PADDING_X = 8;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 14;

interface TrendChartProps {
  sessions: SessionResult[]; // any order — sorted internally, oldest first
  label: string;
  getValue: (session: SessionResult) => number;
  formatValue: (value: number) => string;
}

/**
 * Dependency-free SVG line chart — same no-library philosophy as `ActivityGrid`.
 * Adds dashed gridlines + min/max scale labels for reference, and a hover
 * tooltip (mouse or tap) showing that attempt's date, score, and speed
 * regardless of which value (`getValue`) is actually plotted.
 */
export function TrendChart({ sessions, label, getValue, formatValue }: TrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );

  if (sorted.length === 0) {
    return <p className="text-xs text-muted-foreground">Complete a session to start your {label.toLowerCase()}.</p>;
  }

  const values = sorted.map(getValue);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  const points = sorted.map((session, i) => {
    const x = sorted.length === 1 ? WIDTH / 2 : PADDING_X + (i / (sorted.length - 1)) * (WIDTH - PADDING_X * 2);
    const y =
      HEIGHT - PADDING_BOTTOM - ((getValue(session) - minValue) / range) * (HEIGHT - PADDING_TOP - PADDING_BOTTOM);
    return { x, y, session };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const gridY = [PADDING_TOP, (PADDING_TOP + (HEIGHT - PADDING_BOTTOM)) / 2, HEIGHT - PADDING_BOTTOM];
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={label}>
        {gridY.map((y, i) => (
          <line key={i} x1={PADDING_X} x2={WIDTH - PADDING_X} y1={y} y2={y} className="stroke-border" strokeDasharray="2 2" />
        ))}
        <text x={PADDING_X} y={PADDING_TOP - 5} className="fill-muted-foreground text-[8px]">
          {formatValue(maxValue)}
        </text>
        <text x={PADDING_X} y={HEIGHT - 2} className="fill-muted-foreground text-[8px]">
          {formatValue(minValue)}
        </text>
        <polyline points={polylinePoints} fill="none" className="stroke-primary" strokeWidth={2} />
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={() => setHoverIndex(hoverIndex === i ? null : i)}
          >
            {/* generous invisible hit target, separate from the small visible dot */}
            <circle cx={p.x} cy={p.y} r={8} fill="transparent" className="cursor-pointer" />
            <circle cx={p.x} cy={p.y} r={hoverIndex === i ? 4 : 2.5} className="fill-primary" />
          </g>
        ))}
      </svg>
      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%`, marginTop: -8 }}
        >
          <div className="font-medium text-popover-foreground">
            {new Date(hovered.session.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </div>
          <div className="text-muted-foreground">
            Score <span className="font-mono text-popover-foreground">{hovered.session.score}</span>
          </div>
          <div className="text-muted-foreground">
            Speed <span className="font-mono text-popover-foreground">{(hovered.session.avgSpeedMs / 1000).toFixed(1)}s</span>
          </div>
        </div>
      )}
    </div>
  );
}
