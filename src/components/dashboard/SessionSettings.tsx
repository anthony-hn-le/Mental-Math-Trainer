"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export function SessionSettings() {
  const durationSeconds = useConfigStore((s) => s.durationSeconds);
  const questionCount = useConfigStore((s) => s.questionCount);
  const questionType = useConfigStore((s) => s.questionType);
  const mcqChoiceCount = useConfigStore((s) => s.mcqChoiceCount);
  const setDuration = useConfigStore((s) => s.setDuration);
  const setQuestionCount = useConfigStore((s) => s.setQuestionCount);
  const setQuestionType = useConfigStore((s) => s.setQuestionType);
  const setMcqChoiceCount = useConfigStore((s) => s.setMcqChoiceCount);

  const questionCountValue = questionCount === null ? "unlimited" : `${questionCount}`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Duration</h3>
        <ToggleGroup
          value={[`${durationSeconds}`]}
          onValueChange={(values) => {
            const next = values[0];
            if (next === "60" || next === "600") setDuration(next === "60" ? 60 : 600);
          }}
        >
          <ToggleGroupItem value="60" variant="outline" className="flex-1">
            1 min
          </ToggleGroupItem>
          <ToggleGroupItem value="600" variant="outline" className="flex-1">
            10 min
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Number of Questions</h3>
        <ToggleGroup
          value={[questionCountValue]}
          onValueChange={(values) => {
            const match = QUESTION_COUNT_OPTIONS.find((o) => o.value === values[0]);
            if (match) setQuestionCount(match.count);
          }}
          className="flex-wrap"
        >
          {QUESTION_COUNT_OPTIONS.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} variant="outline" size="sm">
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Question Type</h3>
        <ToggleGroup
          value={[questionType]}
          onValueChange={(values) => {
            const next = values[0];
            if (next === "open" || next === "mcq") setQuestionType(next);
          }}
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
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Choices</h3>
          <Select value={`${mcqChoiceCount}`} onValueChange={(v) => setMcqChoiceCount(Number(v) as 3 | 4 | 5)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 options</SelectItem>
              <SelectItem value="4">4 options</SelectItem>
              <SelectItem value="5">5 options</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
