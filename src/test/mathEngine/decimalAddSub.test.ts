import { describe, expect, it } from "vitest";
import { generateDecimalAddSub } from "@/lib/mathEngine/generators/decimalAddSub";

describe("generateDecimalAddSub", () => {
  it("never produces a negative result", () => {
    for (let i = 0; i < 5000; i++) {
      const q = generateDecimalAddSub();
      expect(q.answerValue).toBeGreaterThanOrEqual(0);
    }
  });

  it("computes exact results with no floating point drift", () => {
    for (let i = 0; i < 2000; i++) {
      const q = generateDecimalAddSub();
      const [aStr, bStr] = q.metadata.operands as string[];
      const isAdd = q.prompt.includes("+");
      const expected = isAdd ? parseFloat(aStr) + parseFloat(bStr) : parseFloat(aStr) - parseFloat(bStr);
      expect(Math.abs((q.answerValue as number) - expected)).toBeLessThan(1e-9);
    }
  });

  it("produces operands with varying decimal-place counts (misalignment occurs naturally)", () => {
    let sawMisaligned = false;
    for (let i = 0; i < 500; i++) {
      const q = generateDecimalAddSub();
      const [aStr, bStr] = q.metadata.operands as string[];
      const placesOf = (s: string) => (s.split(".")[1] || "").length;
      if (placesOf(aStr) !== placesOf(bStr)) {
        sawMisaligned = true;
        break;
      }
    }
    expect(sawMisaligned).toBe(true);
  });
});
