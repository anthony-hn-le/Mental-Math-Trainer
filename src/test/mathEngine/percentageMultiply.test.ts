import { describe, expect, it } from "vitest";
import { generatePercentageMultiply } from "@/lib/mathEngine/generators/percentageMultiply";

describe("generatePercentageMultiply", () => {
  it("always produces a clean whole-number answer (no decimal point)", () => {
    for (let i = 0; i < 2000; i++) {
      const q = generatePercentageMultiply();
      expect(q.answer).not.toContain(".");
      expect(Number.isInteger(q.answerValue)).toBe(true);
    }
  });

  it("generates correct arithmetic", () => {
    for (let i = 0; i < 500; i++) {
      const q = generatePercentageMultiply();
      const [integerOperand, p] = q.metadata.operands as number[];
      const expected = (integerOperand * p) / 100;
      expect(q.answerValue).toBeCloseTo(expected, 9);
      expect(q.prompt).toBe(`${integerOperand} × ${p}%`);
    }
  });
});
