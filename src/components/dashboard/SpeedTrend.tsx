"use client";

import { useStatsStore } from "@/stores/statsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "./TrendChart";

/** Available to guests and signed-in users alike, backed by the active `StatsRepository`. */
export function SpeedTrend() {
  const recentSessions = useStatsStore((s) => s.recentSessions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speed Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <TrendChart
          sessions={recentSessions}
          label="Speed trend"
          getValue={(s) => s.avgSpeedMs / 1000}
          formatValue={(v) => `${v.toFixed(1)}s`}
        />
      </CardContent>
    </Card>
  );
}
