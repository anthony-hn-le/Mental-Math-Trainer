"use client";

import { useRouter } from "next/navigation";
import { useStatsStore } from "@/stores/statsStore";
import { useSessionStore } from "@/stores/sessionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LastResultsWidget() {
  const lastSession = useStatsStore((s) => s.lastSession);
  const startSession = useSessionStore((s) => s.startSession);
  const router = useRouter();

  if (!lastSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last Training</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Complete a session to see your results here.</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: "Score", value: `${lastSession.score}` },
    { label: "Accuracy", value: `${Math.round(lastSession.accuracy * 100)}%` },
    { label: "Correct / Total", value: `${lastSession.correctCount} / ${lastSession.totalCount}` },
    { label: "Avg Speed", value: `${(lastSession.avgSpeedMs / 1000).toFixed(1)}s` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last Training</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="font-mono text-base font-semibold tabular-nums">{stat.value}</span>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            startSession(lastSession.config, lastSession.durationMs, lastSession.questionLimit);
            router.push("/train");
          }}
        >
          Practice Again
        </Button>
      </CardContent>
    </Card>
  );
}
