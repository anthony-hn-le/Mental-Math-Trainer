import { describe, expect, it } from "vitest";
import { generateFractionConversion } from "@/lib/mathEngine/generators/fractionConversion";
import { Fraction } from "@/lib/mathEngine/fraction";

describe("generateFractionConversion", () => {
  it("fraction-to-decimal: the source fraction always has a terminating decimal", () => {
    for (let i = 0; i < 1000; i++) {
      const q = generateFractionConversion();
      if (q.metadata.tier !== "fraction-to-decimal") continue;
      const [num, den] = q.metadata.operands as number[];
      expect(new Fraction(num, den).isTerminatingDecimal()).toBe(true);
    }
  });

  it("fraction-to-decimal: answer matches the fraction's exact decimal value", () => {
    for (let i = 0; i < 500; i++) {
      const q = generateFractionConversion();
      if (q.metadata.tier !== "fraction-to-decimal") continue;
      const [num, den] = q.metadata.operands as number[];
      expect(q.answer).toBe(new Fraction(num, den).toDecimalString());
    }
  });

  it("blank-multiply: acceptedAnswers forms are mutually equivalent", () => {
    for (let i = 0; i < 500; i++) {
      const q = generateFractionConversion();
      if (q.metadata.tier !== "blank-multiply") continue;
      const [n, resultInt] = q.metadata.operands as number[];
      const blank = new Fraction(resultInt, n);
      expect(q.answer).toBe(blank.toFractionString());
      if (blank.isTerminatingDecimal()) {
        expect(q.acceptedAnswers).toContain(blank.toDecimalString());
      }
      expect(q.acceptedAnswers).toContain(blank.toFractionString());
    }
  });
});
