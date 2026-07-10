"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionStore } from "@/stores/sessionStore";

const COUNTDOWN_SECONDS = 3;

export function CountdownOverlay() {
  const beginRunning = useSessionStore((s) => s.beginRunning);
  const [count, setCount] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (count <= 0) {
      beginRunning();
      return;
    }
    const timeout = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timeout);
  }, [count, beginRunning]);

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-20">
        <span role="status" aria-live="assertive" className="font-mono text-7xl font-bold tabular-nums">
          {count}
        </span>
        <span className="text-muted-foreground">Get ready…</span>
      </CardContent>
    </Card>
  );
}
