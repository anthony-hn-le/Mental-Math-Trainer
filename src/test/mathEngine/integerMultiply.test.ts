import { describe, expect, it } from "vitest";
import { generateIntegerMultiply } from "@/lib/mathEngine/generators/integerMultiply";

describe("generateIntegerMultiply", () => {
  it("roughly matches the 50/40/10 tier distribution", () => {
    const n = 30000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const q = generateIntegerMultiply();
      counts[q.metadata.tier] = (counts[q.metadata.tier] ?? 0) + 1;
    }
    expect((counts["2x1"] ?? 0) / n).toBeGreaterThan(0.46);
    expect((counts["2x1"] ?? 0) / n).toBeLessThan(0.54);
    expect((counts["2x2-easy"] ?? 0) / n).toBeGreaterThan(0.36);
    expect((counts["2x2-easy"] ?? 0) / n).toBeLessThan(0.44);
    expect((counts["2x2-hard"] ?? 0) / n).toBeGreaterThan(0.07);
    expect((counts["2x2-hard"] ?? 0) / n).toBeLessThan(0.13);
  });

  it("2x1 tier: one 2-digit and one 1-digit operand", () => {
    for (let i = 0; i < 500; i++) {
      let q = generateIntegerMultiply();
      while (q.metadata.tier !== "2x1") q = generateIntegerMultiply();
      const [a, b] = q.metadata.operands as number[];
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(9);
    }
  });

  it("2x2-easy tier: always has a qualifying operand (multiple of 5/10, or under 20)", () => {
    for (let i = 0; i < 500; i++) {
      let q = generateIntegerMultiply();
      while (q.metadata.tier !== "2x2-easy") q = generateIntegerMultiply();
      const [a, b] = q.metadata.operands as number[];
      const qualifies = (n: number) => n % 5 === 0 || n < 20;
      expect(qualifies(a) || qualifies(b)).toBe(true);
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeGreaterThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(99);
    }
  });

  it("2x2-hard tier: both operands are 2-digit near-squares", () => {
    for (let i = 0; i < 500; i++) {
      let q = generateIntegerMultiply();
      while (q.metadata.tier !== "2x2-hard") q = generateIntegerMultiply();
      const [a, b] = q.metadata.operands as number[];
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeGreaterThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(99);
      expect(Math.abs(a - b)).toBeGreaterThanOrEqual(2);
      expect(Math.abs(a - b)).toBeLessThanOrEqual(8);
    }
  });

  it("generates correct arithmetic", () => {
    for (let i = 0; i < 200; i++) {
      const q = generateIntegerMultiply();
      const [a, b] = q.metadata.operands as number[];
      expect(q.answerValue).toBe(a * b);
    }
  });
});
