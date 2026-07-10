"use client";

import { Input } from "@/components/ui/input";
import { checkAnswer } from "@/lib/mathEngine";
import { useSessionStore } from "@/stores/sessionStore";
import type { Question } from "@/lib/mathEngine/types";

interface OpenAnswerInputProps {
  question: Question;
}

/** Render with `key={question.id}` from the parent — remounting clears the field and refires autofocus. */
export function OpenAnswerInput({ question }: OpenAnswerInputProps) {
  const submitAnswer = useSessionStore((s) => s.submitAnswer);

  return (
    <Input
      autoFocus
      aria-label="Your answer"
      className="h-14 text-center font-mono text-2xl"
      onChange={(e) => {
        const value = e.target.value;
        // typing the exact correct answer submits instantly, no Enter needed
        if (value.trim().length > 0 && checkAnswer(question, value)) {
          submitAnswer(value);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          submitAnswer(e.currentTarget.value);
        }
      }}
    />
  );
}
