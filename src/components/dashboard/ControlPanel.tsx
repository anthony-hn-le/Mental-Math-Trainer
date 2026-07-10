"use client";

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
  const toQuestionConfig = useConfigStore((s) => s.toQuestionConfig);
  const durationSeconds = useConfigStore((s) => s.durationSeconds);
  const questionCount = useConfigStore((s) => s.questionCount);
  const startSession = useSessionStore((s) => s.startSession);

  const questionConfig = toQuestionConfig();
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
