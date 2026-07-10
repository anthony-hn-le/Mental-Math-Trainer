import { describe, expect, it } from "vitest";
import { generateFractionMultiply } from "@/lib/mathEngine/generators/fractionMultiply";
import { Fraction } from "@/lib/mathEngine/fraction";
import { gcd } from "@/lib/mathEngine/decimalUtils";

describe("generateFractionMultiply", () => {
  it("cross-cancel tier: fa's raw denominator and fb's raw numerator share a factor > 1", () => {
    for (let i = 0; i < 1000; i++) {
      const q = generateFractionMultiply();
      if (q.metadata.tier !== "cross-cancel") continue;
      const [, denA, numB] = q.metadata.operands as number[];
      expect(gcd(denA, numB)).toBeGreaterThan(1);
    }
  });

  it("roughly matches the 50/50 cross-cancel/general split", () => {
    const n = 20000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const q = generateFractionMultiply();
      counts[q.metadata.tier] = (counts[q.metadata.tier] ?? 0) + 1;
    }
    expect((counts["cross-cancel"] ?? 0) / n).toBeGreaterThan(0.45);
    expect((counts["cross-cancel"] ?? 0) / n).toBeLessThan(0.55);
  });

  it("answers are always reduced fractions", () => {
    for (let i = 0; i < 1000; i++) {
      const q = generateFractionMultiply();
      const parsed = Fraction.parseStrict(q.answer);
      expect(parsed).not.toBeNull();
      expect(parsed?.isReduced()).toBe(true);
    }
  });

  it("matches the spec example: 4/7 x 14/3 = 8/3", () => {
    const fa = new Fraction(4, 7);
    const fb = new Fraction(14, 3);
    expect(fa.mul(fb).toFractionString()).toBe("8/3");
  });
});
