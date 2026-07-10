import { describe, expect, it } from "vitest";
import { generatePercentageAddSub } from "@/lib/mathEngine/generators/percentageAddSub";

describe("generatePercentageAddSub", () => {
  it("never produces a negative result", () => {
    for (let i = 0; i < 2000; i++) {
      const q = generatePercentageAddSub();
      expect(q.answerValue).toBeGreaterThanOrEqual(0);
    }
  });

  it("generates correct arithmetic and a percent-formatted prompt", () => {
    for (let i = 0; i < 500; i++) {
      const q = generatePercentageAddSub();
      const [a, b] = q.metadata.operands as number[];
      const isAdd = q.prompt.includes("+");
      const expected = isAdd ? a + b : a - b;
      expect(q.answerValue).toBe(expected);
      expect(q.answer).toBe(`${expected}`);
      expect(q.prompt).toContain("%");
    }
  });

  it("addSubMode restricts to addition-only or subtraction-only", () => {
    for (let i = 0; i < 200; i++) {
      const addOnly = generatePercentageAddSub(Math.random, { add: true, subtract: false });
      expect(addOnly.prompt).toContain("+");
      const subOnly = generatePercentageAddSub(Math.random, { add: false, subtract: true });
      expect(subOnly.prompt).toContain("-");
    }
  });
});
