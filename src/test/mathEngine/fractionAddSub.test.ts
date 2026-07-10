import { describe, expect, it } from "vitest";
import { generateFractionAddSub } from "@/lib/mathEngine/generators/fractionAddSub";
import { Fraction } from "@/lib/mathEngine/fraction";

describe("generateFractionAddSub", () => {
  it("denominators are always restricted to 2-12", () => {
    for (let i = 0; i < 2000; i++) {
      const q = generateFractionAddSub();
      for (const opStr of q.metadata.operands as string[]) {
        const den = opStr.includes("/") ? parseInt(opStr.split("/")[1], 10) : 1;
        expect(den).toBeGreaterThanOrEqual(1);
        expect(den).toBeLessThanOrEqual(12);
      }
    }
  });

  it("roughly matches the 30% common-denominator / 70% LCM-required split", () => {
    const n = 20000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const q = generateFractionAddSub();
      counts[q.metadata.tier] = (counts[q.metadata.tier] ?? 0) + 1;
    }
    expect((counts["common-denominator"] ?? 0) / n).toBeGreaterThan(0.25);
    expect((counts["common-denominator"] ?? 0) / n).toBeLessThan(0.35);
    expect((counts["lcm-required"] ?? 0) / n).toBeGreaterThan(0.65);
    expect((counts["lcm-required"] ?? 0) / n).toBeLessThan(0.75);
  });

  it("answers are always reduced", () => {
    for (let i = 0; i < 1000; i++) {
      const q = generateFractionAddSub();
      const parsed = Fraction.parseStrict(q.answer);
      expect(parsed).not.toBeNull();
      expect(parsed?.isReduced()).toBe(true);
    }
  });

  it("subtraction never produces a negative result", () => {
    for (let i = 0; i < 1000; i++) {
      const q = generateFractionAddSub();
      if (q.prompt.includes(" - ")) {
        const answer = Fraction.parseStrict(q.answer)!;
        expect(answer.num).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
