import { describe, expect, it } from "vitest";
import { checkAnswer } from "@/lib/mathEngine/checkAnswer";
import type { Question } from "@/lib/mathEngine/types";

function makeQuestion(overrides: Partial<Question>): Question {
  return {
    id: "test",
    operation: "integer-add-sub",
    prompt: "1 + 1",
    answer: "2",
    metadata: { tier: "test", operands: [] },
    ...overrides,
  };
}

describe("checkAnswer", () => {
  it("accepts an exact numeric match", () => {
    expect(checkAnswer(makeQuestion({ answer: "112", answerValue: 112 }), "112")).toBe(true);
  });

  it("rejects a wrong numeric answer", () => {
    expect(checkAnswer(makeQuestion({ answer: "112", answerValue: 112 }), "111")).toBe(false);
  });

  it("accepts a decimal answer within epsilon", () => {
    expect(checkAnswer(makeQuestion({ answer: "0.036", answerValue: 0.036 }), "0.036")).toBe(true);
  });

  it("accepts a reduced fraction answer", () => {
    expect(checkAnswer(makeQuestion({ answer: "8/3" }), "8/3")).toBe(true);
  });

  it("rejects an unreduced fraction answer", () => {
    expect(checkAnswer(makeQuestion({ answer: "1/3" }), "2/6")).toBe(false);
  });

  it("rejects a mixed-number fraction answer", () => {
    expect(checkAnswer(makeQuestion({ answer: "8/3" }), "2 2/3")).toBe(false);
  });

  it("rejects a fraction input when a plain number was expected", () => {
    expect(checkAnswer(makeQuestion({ answer: "5", answerValue: 5 }), "5/1")).toBe(false);
  });

  it("accepts either accepted-answer form for conversion questions", () => {
    const q = makeQuestion({ answer: "1/5", acceptedAnswers: ["1/5", "0.2"], answerValue: 0.2 });
    expect(checkAnswer(q, "1/5")).toBe(true);
    expect(checkAnswer(q, "0.2")).toBe(true);
    expect(checkAnswer(q, "0.3")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(checkAnswer(makeQuestion({ answer: "2", answerValue: 2 }), "   ")).toBe(false);
  });

  it("rejects non-numeric garbage", () => {
    expect(checkAnswer(makeQuestion({ answer: "2", answerValue: 2 }), "abc")).toBe(false);
  });
});
