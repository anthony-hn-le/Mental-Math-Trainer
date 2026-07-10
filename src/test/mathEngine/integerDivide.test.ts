import { describe, expect, it } from "vitest";
import { generateIntegerDivide } from "@/lib/mathEngine/generators/integerDivide";

describe("generateIntegerDivide", () => {
  it("always divides cleanly with no remainder", () => {
    for (let i = 0; i < 5000; i++) {
      const q = generateIntegerDivide();
      const [dividend, divisor] = q.metadata.operands as number[];
      expect(dividend % divisor).toBe(0);
      expect(dividend / divisor).toBe(q.answerValue);
    }
  });

  it("divisor is never zero", () => {
    for (let i = 0; i < 2000; i++) {
      const q = generateIntegerDivide();
      const [, divisor] = q.metadata.operands as number[];
      expect(divisor).not.toBe(0);
    }
  });

  it("prompt is formatted as dividend ÷ divisor", () => {
    const q = generateIntegerDivide();
    const [dividend, divisor] = q.metadata.operands as number[];
    expect(q.prompt).toBe(`${dividend} ÷ ${divisor}`);
  });
});
