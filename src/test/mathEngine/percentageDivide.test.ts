import { describe, expect, it } from "vitest";
import { generatePercentageDivide } from "@/lib/mathEngine/generators/percentageDivide";

describe("generatePercentageDivide", () => {
  it("the dividend always has at most 2 decimal places (clean, short)", () => {
    for (let i = 0; i < 2000; i++) {
      const q = generatePercentageDivide();
      const [dividendStr] = q.metadata.operands as string[];
      const decimalPlaces = (dividendStr.split(".")[1] || "").length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    }
  });

  it("dividend equals quotient x percent, and the answer is the clean quotient", () => {
    for (let i = 0; i < 500; i++) {
      const q = generatePercentageDivide();
      const [dividendStr, p] = q.metadata.operands as [string, number];
      const expectedDividend = ((q.answerValue as number) * p) / 100;
      expect(parseFloat(dividendStr)).toBeCloseTo(expectedDividend, 9);
      expect(q.prompt).toBe(`${dividendStr} ÷ ${p}%`);
    }
  });
});
