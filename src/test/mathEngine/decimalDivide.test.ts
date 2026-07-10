import { describe, expect, it } from "vitest";
import { generateDecimalDivide } from "@/lib/mathEngine/generators/decimalDivide";
import { isTerminatingDivision, toScaledInt } from "@/lib/mathEngine/decimalUtils";

describe("generateDecimalDivide", () => {
  it("always resolves to a clean, terminating decimal", () => {
    for (let i = 0; i < 3000; i++) {
      const q = generateDecimalDivide();
      const [dividendStr, divisorStr] = q.metadata.operands as string[];
      const dividend = toScaledInt(dividendStr);
      const divisor = toScaledInt(divisorStr);
      // normalize to a common scale so both are plain integers before checking divisibility
      const commonScale = Math.max(dividend.scale, divisor.scale);
      const numerator = dividend.intVal * (commonScale / dividend.scale);
      const denominator = divisor.intVal * (commonScale / divisor.scale);
      expect(isTerminatingDivision(numerator, denominator)).toBe(true);
    }
  });

  it("never collapses into a plain integer-only division", () => {
    for (let i = 0; i < 3000; i++) {
      const q = generateDecimalDivide();
      const [dividendStr, divisorStr] = q.metadata.operands as string[];
      const isDecimal = (s: string) => s.includes(".");
      expect(isDecimal(dividendStr) || isDecimal(divisorStr) || isDecimal(q.answer)).toBe(true);
    }
  });

  it("dividend equals divisor times the quotient", () => {
    for (let i = 0; i < 1000; i++) {
      const q = generateDecimalDivide();
      const [dividendStr, divisorStr] = q.metadata.operands as string[];
      const expected = parseFloat(divisorStr) * (q.answerValue as number);
      expect(Math.abs(parseFloat(dividendStr) - expected)).toBeLessThan(1e-6);
    }
  });
});
