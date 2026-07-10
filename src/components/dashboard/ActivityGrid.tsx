"use client";

import { useStatsStore } from "@/stores/statsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LEVEL_THRESHOLDS = [0, 1, 6, 16, 31];
const LEVEL_CLASSES = ["bg-muted", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"];

function levelFor(count: number): number {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
}

export function ActivityGrid() {
  const activity = useStatsStore((s) => s.activity);
  const hasHydrated = useStatsStore((s) => s.hasHydrated);

  const rows: { date: string; questionsAnswered: number }[][] = [];
  for (let i = 0; i < activity.length; i += 7) {
    rows.push(activity.slice(i, i + 7));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasHydrated || activity.length === 0 ? (
          <p className="text-xs text-muted-foreground">No practice sessions yet.</p>
        ) : (
          <div className="flex flex-col gap-[6px]">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-[6px]">
                {row.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.questionsAnswered} question${day.questionsAnswered === 1 ? "" : "s"}`}
                    className={`size-6 shrink-0 rounded-[4px] ${LEVEL_CLASSES[levelFor(day.questionsAnswered)]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
