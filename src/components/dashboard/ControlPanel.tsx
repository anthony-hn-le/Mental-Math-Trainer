"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConfigStore } from "@/stores/configStore";
import { useSessionStore } from "@/stores/sessionStore";
import { OperationToggles } from "./OperationToggles";
import { SessionSettings } from "./SessionSettings";

export function ControlPanel() {
  const router = useRouter();
  const durationSeconds = useConfigStore((s) => s.durationSeconds);
  const questionCount = useConfigStore((s) => s.questionCount);
  // Subscribe to each primitive slice toQuestionConfig() reads, so this
  // re-renders when a sibling (OperationToggles, SessionSettings) changes
  // one of them. Deriving via `useConfigStore((s) => s.toQuestionConfig())`
  // instead would return a brand-new object every render, which zustand's
  // reference-equality check treats as "changed" every time — an infinite
  // render loop. useMemo keeps the derived config stable in between.
  const operations = useConfigStore((s) => s.operations);
  const numberTypes = useConfigStore((s) => s.numberTypes);
  const questionType = useConfigStore((s) => s.questionType);
  const mcqChoiceCount = useConfigStore((s) => s.mcqChoiceCount);
  const startSession = useSessionStore((s) => s.startSession);

  const questionConfig = useMemo(
    () => useConfigStore.getState().toQuestionConfig(),
    // toQuestionConfig() closes over these fields internally via the store,
    // not as literal identifiers the linter can see.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [operations, numberTypes, questionType, mcqChoiceCount],
  );
  const canStart = questionConfig.activeOperations.length > 0;

  const handleStart = () => {
    if (!canStart) return;
    startSession(questionConfig, durationSeconds * 1000, questionCount);
    router.push("/train");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <OperationToggles />
        <Separator />
        <SessionSettings />
        <Button size="lg" className="mt-2 w-full" disabled={!canStart} onClick={handleStart}>
          Start Training
        </Button>
        {!canStart && (
          <p className="text-center text-xs text-muted-foreground">Select at least one operation to begin.</p>
        )}
      </CardContent>
    </Card>
  );
}
