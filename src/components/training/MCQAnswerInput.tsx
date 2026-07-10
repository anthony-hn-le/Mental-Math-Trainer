"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/sessionStore";
import type { Question } from "@/lib/mathEngine/types";

interface MCQAnswerInputProps {
  question: Question;
}

const FLASH_DURATION_MS = 250;

/** Render with `key={question.id}` from the parent so selection state resets per question. */
export function MCQAnswerInput({ question }: MCQAnswerInputProps) {
  const submitAnswer = useSessionStore((s) => s.submitAnswer);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const choices = question.choices ?? [];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= choices.length) {
        handleSelect(num - 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices.length, selectedIndex]);

  function handleSelect(index: number) {
    if (selectedIndex !== null) return; // already answered this question
    setSelectedIndex(index);
    window.setTimeout(() => submitAnswer(choices[index]), FLASH_DURATION_MS);
  }

  return (
    <div className="flex gap-2">
      {choices.map((choice, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = choice === question.answer;
        const showFeedback = selectedIndex !== null && (isSelected || isCorrect);

        return (
          <Button
            key={choice}
            variant="outline"
            size="lg"
            disabled={selectedIndex !== null}
            onClick={() => handleSelect(index)}
            aria-label={`Option ${index + 1}: ${choice}`}
            className={cn(
              "relative h-16 flex-1 font-mono text-lg",
              showFeedback && isCorrect && "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400",
              showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400",
            )}
          >
            {choice}
            <span className="absolute right-1.5 bottom-1 text-[10px] text-muted-foreground">{index + 1}</span>
          </Button>
        );
      })}
    </div>
  );
}
