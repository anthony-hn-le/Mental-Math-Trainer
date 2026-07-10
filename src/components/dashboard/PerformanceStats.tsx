"use client";

import { useStatsStore } from "@/stores/statsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PerformanceStats() {
  const lifetime = useStatsStore((s) => s.lifetime);

  const stats = [
    { label: "Highest Score", value: `${lifetime.highestScore}` },
    { label: "Total Attempts", value: `${lifetime.totalAttempts}` },
    { label: "Lifetime Accuracy", value: `${Math.round(lifetime.lifetimeAccuracy * 100)}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className="font-mono text-lg font-semibold tabular-nums">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
