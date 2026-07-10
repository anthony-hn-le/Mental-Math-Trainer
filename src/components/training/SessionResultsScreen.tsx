"use client";

import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SessionResultsScreen() {
  const router = useRouter();
  const result = useSessionStore((s) => s.result);
  const startSession = useSessionStore((s) => s.startSession);
  const reset = useSessionStore((s) => s.reset);

  if (!result) return null;

  const stats = [
    { label: "Score", value: `${result.score}` },
    { label: "Accuracy", value: `${Math.round(result.accuracy * 100)}%` },
    { label: "Correct / Total", value: `${result.correctCount} / ${result.totalCount}` },
    { label: "Avg Speed", value: `${(result.avgSpeedMs / 1000).toFixed(1)}s` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Complete</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border p-4 text-center">
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="font-mono text-2xl font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              reset();
              router.push("/");
            }}
          >
            Back to Dashboard
          </Button>
          <Button
            className="flex-1"
            onClick={() => startSession(result.config, result.durationMs, result.questionLimit)}
          >
            Practice Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
