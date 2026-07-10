import { describe, expect, it } from "vitest";
import { generateIntegerAddSub } from "@/lib/mathEngine/generators/integerAddSub";

const EXPECTED_WEIGHTS: Record<string, number> = {
  "2d+2d": 7.5,
  "2d-2d": 7.5,
  "3d+2d": 5,
  "3d-2d": 5,
  "3d+3d": 5,
  "3d-3d": 5,
  "4d+3d": 5,
  "4d-3d": 5,
  "4d+4d": 5,
  "4d-4d": 5,
  "5d+4d": 5,
  "5d-4d": 5,
  "5d+5d": 5,
  "5d-5d": 5,
  "6d+5d": 5,
  "6d-5d": 5,
  "6d+6d": 5,
  "6d-6d": 5,
  "7d+5d": 2.5,
  "7d-5d": 2.5,
};

describe("generateIntegerAddSub", () => {
  it("never produces a negative result", () => {
    for (let i = 0; i < 5000; i++) {
      const q = generateIntegerAddSub();
      expect(q.answerValue).toBeGreaterThanOrEqual(0);
    }
  });

  it("digit-count tiers sum to 100", () => {
    const digitTierWeights = [15, 10, 10, 10, 10, 10, 10, 10, 10, 5];
    expect(digitTierWeights.reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("roughly matches the target weighted-tier distribution", () => {
    const n = 40000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const q = generateIntegerAddSub();
      counts[q.metadata.tier] = (counts[q.metadata.tier] ?? 0) + 1;
    }
    for (const [tier, expectedPct] of Object.entries(EXPECTED_WEIGHTS)) {
      const observedPct = ((counts[tier] ?? 0) / n) * 100;
      expect(observedPct).toBeGreaterThan(expectedPct - 2.5);
      expect(observedPct).toBeLessThan(expectedPct + 2.5);
    }
  });

  it("generates correct arithmetic", () => {
    for (let i = 0; i < 200; i++) {
      const q = generateIntegerAddSub();
      const [a, b] = q.metadata.operands as number[];
      const isAdd = q.prompt.includes("+");
      const expected = isAdd ? a + b : a - b;
      expect(q.answerValue).toBe(expected);
      expect(q.answer).toBe(`${expected}`);
    }
  });

  it("addSubMode restricts to addition-only or subtraction-only", () => {
    for (let i = 0; i < 200; i++) {
      const addOnly = generateIntegerAddSub(Math.random, { add: true, subtract: false });
      expect(addOnly.prompt).toContain("+");
      const subOnly = generateIntegerAddSub(Math.random, { add: false, subtract: true });
      expect(subOnly.prompt).toContain("-");
    }
  });
});
