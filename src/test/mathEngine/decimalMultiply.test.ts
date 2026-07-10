import { describe, expect, it } from "vitest";
import { generateDecimalMultiply } from "@/lib/mathEngine/generators/decimalMultiply";

describe("generateDecimalMultiply", () => {
  it("computes exact products with no floating point drift", () => {
    for (let i = 0; i < 2000; i++) {
      const q = generateDecimalMultiply();
      const [aStr, bStr] = q.metadata.operands as string[];
      const expected = parseFloat(aStr) * parseFloat(bStr);
      expect(Math.abs((q.answerValue as number) - expected)).toBeLessThan(1e-6);
    }
  });

  it("roughly matches the 60/40 tier distribution", () => {
    const n = 20000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const q = generateDecimalMultiply();
      counts[q.metadata.tier] = (counts[q.metadata.tier] ?? 0) + 1;
    }
    expect((counts["int-times-decimal"] ?? 0) / n).toBeGreaterThan(0.55);
    expect((counts["int-times-decimal"] ?? 0) / n).toBeLessThan(0.65);
    expect((counts["small-decimal-square"] ?? 0) / n).toBeGreaterThan(0.35);
    expect((counts["small-decimal-square"] ?? 0) / n).toBeLessThan(0.45);
  });
});
