import type { AddSubMode, Question, RngFn } from "../types";
import { DEFAULT_ADD_SUB_MODE } from "../types";

/** Adding/subtracting two whole-number percentages is always exact — no fraction/decimal machinery needed. */
export function generatePercentageAddSub(
  rng: RngFn = Math.random,
  addSubMode: AddSubMode = DEFAULT_ADD_SUB_MODE,
): Question {
  const isAdd = addSubMode.add && addSubMode.subtract ? rng() < 0.5 : addSubMode.add;

  let a = 1 + Math.floor(rng() * 99); // 1-99
  let b = 1 + Math.floor(rng() * 99);

  let answerValue: number;
  let prompt: string;

  if (isAdd) {
    answerValue = a + b;
    prompt = `${a}% + ${b}%`;
  } else {
    if (b > a) [a, b] = [b, a]; // keep the result non-negative
    answerValue = a - b;
    prompt = `${a}% - ${b}%`;
  }

  return {
    id: crypto.randomUUID(),
    operation: "percentage-add-sub",
    prompt,
    answer: `${answerValue}`,
    answerValue,
    metadata: { tier: isAdd ? "add" : "sub", operands: [a, b] },
  };
}
