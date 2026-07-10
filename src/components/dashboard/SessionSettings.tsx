"use client";

import { Info } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { useConfigStore, type QuestionCountOption } from "@/stores/configStore";

const QUESTION_COUNT_OPTIONS: { value: string; label: string; count: QuestionCountOption }[] = [
  { value: "20", label: "20", count: 20 },
  { value: "40", label: "40", count: 40 },
  { value: "60", label: "60", count: 60 },
  { value: "80", label: "80", count: 80 },
  { value: "100", label: "100", count: 100 },
  { value: "120", label: "120", count: 120 },
  { value: "unlimited", label: "∞", count: null },
];

const MCQ_CHOICE_OPTIONS = [3, 4, 5] as const;

export function SessionSettings() {
  const durationMinutes = useConfigStore((s) => s.durationMinutes);
  const questionCount = useConfigStore((s) => s.questionCount);
  const questionType = useConfigStore((s) => s.questionType);
  const mcqChoiceCount = useConfigStore((s) => s.mcqChoiceCount);
  const numberTypes = useConfigStore((s) => s.numberTypes);
  const setDurationMinutes = useConfigStore((s) => s.setDurationMinutes);
  const setQuestionCount = useConfigStore((s) => s.setQuestionCount);
  const setQuestionType = useConfigStore((s) => s.setQuestionType);
  const setMcqChoiceCount = useConfigStore((s) => s.setMcqChoiceCount);

  const questionCountValue = questionCount === null ? "unlimited" : `${questionCount}`;
  const questionCountIndex = Math.max(
    0,
    QUESTION_COUNT_OPTIONS.findIndex((o) => o.value === questionCountValue),
  );
  const questionCountLabel = questionCount === null ? "Unlimited" : `${questionCount} questions`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
          <span className="font-mono text-sm font-semibold text-primary">
            {durationMinutes} minute{durationMinutes === 1 ? "" : "s"}
          </span>
        </div>
        <Slider
          value={[durationMinutes]}
          min={1}
          max={10}
          step={1}
          onValueChange={(value) => setDurationMinutes(Array.isArray(value) ? value[0] : value)}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>1 min</span>
          <span>10 min</span>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Number of Questions</h3>
          <span className="font-mono text-sm font-semibold text-primary">{questionCountLabel}</span>
        </div>
        <Slider
          value={[questionCountIndex]}
          min={0}
          max={QUESTION_COUNT_OPTIONS.length - 1}
          step={1}
          onValueChange={(value) => {
            const index = Array.isArray(value) ? value[0] : value;
            setQuestionCount(QUESTION_COUNT_OPTIONS[index].count);
          }}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>20</span>
          <span>∞</span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Question Type</h3>
        <ToggleGroup
          value={[questionType]}
          onValueChange={(values) => {
            const next = values[0];
            if (next === "open" || next === "mcq") setQuestionType(next);
          }}
          className="w-full"
        >
          <ToggleGroupItem value="open" variant="outline" className="flex-1">
            Open
          </ToggleGroupItem>
          <ToggleGroupItem value="mcq" variant="outline" className="flex-1">
            Multiple Choice
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {questionType === "mcq" && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Answer Options</h3>
          <ToggleGroup
            value={[`${mcqChoiceCount}`]}
            onValueChange={(values) => {
              const next = Number(values[0]);
              if (next === 3 || next === 4 || next === 5) setMcqChoiceCount(next);
            }}
          >
            {MCQ_CHOICE_OPTIONS.map((count) => (
              <ToggleGroupItem key={count} value={`${count}`} variant="outline" className="flex-1">
                {count}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {questionType === "open" && numberTypes.fraction && (
        <div className="flex gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-700 dark:text-blue-300">
          <Info className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Fraction answer format</p>
            <p className="mt-1 text-blue-700/90 dark:text-blue-300/90">
              If your answer is a fraction, write it as a reduced improper fraction. Do not use mixed numbers
              (e.g., instead of 2 2/3, write <code className="rounded bg-blue-500/15 px-1">8/3</code>). Always
              reduce fractions to lowest terms (e.g., <code className="rounded bg-blue-500/15 px-1">6/18</code>{" "}
              → <code className="rounded bg-blue-500/15 px-1">1/3</code>).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
