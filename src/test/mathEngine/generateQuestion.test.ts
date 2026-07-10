import { describe, expect, it } from "vitest";
import { generateQuestion } from "@/lib/mathEngine";
import type { OperationKey } from "@/lib/mathEngine/types";

const ALL_OPERATIONS: OperationKey[] = [
  "integer-add-sub",
  "integer-multiply",
  "integer-divide",
  "decimal-add-sub",
  "decimal-multiply",
  "decimal-divide",
  "fraction-add-sub",
  "fraction-multiply",
  "fraction-conversion",
  "percentage-add-sub",
  "percentage-multiply",
  "percentage-divide",
];

describe("generateQuestion", () => {
  it("throws when no operations are active", () => {
    expect(() => generateQuestion({ activeOperations: [], questionType: "open" })).toThrow();
  });

  it("only picks from the active operations", () => {
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion({ activeOperations: ["integer-multiply"], questionType: "open" });
      expect(q.operation).toBe("integer-multiply");
    }
  });

  it("generates every operation without error", () => {
    for (const op of ALL_OPERATIONS) {
      const q = generateQuestion({ activeOperations: [op], questionType: "open" });
      expect(q.operation).toBe(op);
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.answer.length).toBeGreaterThan(0);
    }
  });

  it("attaches choices and a correct index in mcq mode", () => {
    for (const choiceCount of [3, 4, 5] as const) {
      for (const op of ALL_OPERATIONS) {
        const q = generateQuestion({ activeOperations: [op], questionType: "mcq", mcqChoiceCount: choiceCount });
        expect(q.choices).toHaveLength(choiceCount);
        expect(q.correctChoiceIndex).toBeGreaterThanOrEqual(0);
        expect(q.choices?.[q.correctChoiceIndex as number]).toBe(q.answer);
        expect(new Set(q.choices)).toHaveProperty("size", choiceCount);
      }
    }
  });
});
