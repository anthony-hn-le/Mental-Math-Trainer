import { describe, expect, it } from "vitest";
import { generateChoices } from "@/lib/mathEngine/mcqDistractors";
import type { Question } from "@/lib/mathEngine/types";

function makeQuestion(overrides: Partial<Question>): Question {
  return {
    id: "test",
    operation: "percentage-add-sub",
    prompt: "44% + 43%",
    answer: "87%",
    answerValue: 87,
    metadata: { tier: "test", operands: [] },
    ...overrides,
  };
}

describe("generateChoices", () => {
  it("percentage distractors all carry the same '%' suffix as the correct answer", () => {
    const q = makeQuestion({});
    for (let i = 0; i < 200; i++) {
      const { choices } = generateChoices(q, 5);
      expect(choices).toHaveLength(5);
      for (const choice of choices) {
        expect(choice.endsWith("%")).toBe(true);
      }
    }
  });

  it("non-percentage numeric distractors have no suffix", () => {
    const q = makeQuestion({ operation: "integer-add-sub", answer: "112", answerValue: 112 });
    const { choices } = generateChoices(q, 4);
    for (const choice of choices) {
      expect(choice.endsWith("%")).toBe(false);
    }
  });
});
