"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { SessionTimer } from "@/components/training/SessionTimer";
import { QuestionCard } from "@/components/training/QuestionCard";
import { SessionResultsScreen } from "@/components/training/SessionResultsScreen";

export default function TrainPage() {
  const router = useRouter();
  const status = useSessionStore((s) => s.status);
  const currentQuestion = useSessionStore((s) => s.currentQuestion);

  useEffect(() => {
    // Guards a mid-session refresh (or direct navigation to /train) — there's no session to resume.
    if (status === "idle") router.replace("/");
  }, [status, router]);

  if (status === "idle") return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      {status === "running" && (
        <>
          <SessionTimer />
          {currentQuestion && <QuestionCard question={currentQuestion} />}
        </>
      )}
      {status === "finished" && <SessionResultsScreen />}
    </div>
  );
}
