"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";

function formatMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Owns the ~200ms tick loop: re-renders the countdown and checks the first-limit-reached rule. */
export function SessionTimer() {
  const endsAt = useSessionStore((s) => s.endsAt);
  const questionLimit = useSessionStore((s) => s.questionLimit);
  const answeredCount = useSessionStore((s) => s.answeredLog.length);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      useSessionStore.getState().tick();
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = endsAt ? Math.max(0, endsAt - now) : 0;
  const currentQuestionNumber = answeredCount + 1;

  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-2xl font-semibold tabular-nums">{formatMs(remainingMs)}</span>
      <span className="text-sm text-muted-foreground">
        Q {currentQuestionNumber}
        {questionLimit !== null ? ` / ${questionLimit}` : ""}
      </span>
    </div>
  );
}
