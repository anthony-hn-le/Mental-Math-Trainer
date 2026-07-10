import type { AddSubMode, Question, RngFn } from "../types";
import { DEFAULT_ADD_SUB_MODE } from "../types";
import { pickWeighted, type WeightedTier } from "../weightedPick";
import { randomIntWithDigits } from "../randomUtils";

const TIERS: WeightedTier<[number, number]>[] = [
  { weight: 15, value: [2, 2] },
  { weight: 10, value: [3, 2] },
  { weight: 10, value: [3, 3] },
  { weight: 10, value: [4, 3] },
  { weight: 10, value: [4, 4] },
  { weight: 10, value: [5, 4] },
  { weight: 10, value: [5, 5] },
  { weight: 10, value: [6, 5] },
  { weight: 10, value: [6, 6] },
  { weight: 5, value: [7, 5] },
];

export function generateIntegerAddSub(rng: RngFn = Math.random, addSubMode: AddSubMode = DEFAULT_ADD_SUB_MODE): Question {
  const [digitsA, digitsB] = pickWeighted(TIERS, rng);
  const isAdd = addSubMode.add && addSubMode.subtract ? rng() < 0.5 : addSubMode.add;

  let a = randomIntWithDigits(digitsA, rng);
  let b = randomIntWithDigits(digitsB, rng);

  let answerValue: number;
  let prompt: string;

  if (isAdd) {
    answerValue = a + b;
    prompt = `${a} + ${b}`;
  } else {
    if (b > a) [a, b] = [b, a]; // keep the result non-negative
    answerValue = a - b;
    prompt = `${a} - ${b}`;
  }

  return {
    id: crypto.randomUUID(),
    operation: "integer-add-sub",
    prompt,
    answer: `${answerValue}`,
    answerValue,
    metadata: { tier: `${digitsA}d${isAdd ? "+" : "-"}${digitsB}d`, operands: [a, b] },
  };
}
