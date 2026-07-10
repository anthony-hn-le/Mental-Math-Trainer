import { Card, CardContent } from "@/components/ui/card";
import { OpenAnswerInput } from "./OpenAnswerInput";
import { MCQAnswerInput } from "./MCQAnswerInput";
import type { Question } from "@/lib/mathEngine/types";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-10">
        <span className="text-center font-mono text-4xl font-semibold tracking-tight sm:text-5xl">
          {question.prompt}
        </span>
        <div className="w-full max-w-sm">
          {question.choices ? (
            <MCQAnswerInput key={question.id} question={question} />
          ) : (
            <OpenAnswerInput key={question.id} question={question} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
