import type { Question, RngFn } from "../types";
import { pickWeighted, type WeightedTier } from "../weightedPick";
import { randomIntWithDigits } from "../randomUtils";

type Tier = "2x1" | "2x2-easy" | "2x2-hard";

const TIERS: WeightedTier<Tier>[] = [
  { weight: 50, value: "2x1" },
  { weight: 40, value: "2x2-easy" },
  { weight: 10, value: "2x2-hard" },
];

/** A 2-digit number that's a multiple of 5/10, or a "teen" under 20. */
function randomEasyOperand(rng: RngFn): number {
  if (rng() < 0.5) {
    const multiplesOfFive = Array.from({ length: 18 }, (_, i) => 10 + i * 5); // 10..95
    return multiplesOfFive[Math.floor(rng() * multiplesOfFive.length)];
  }
  return 10 + Math.floor(rng() * 10); // 10-19
}

export function generateIntegerMultiply(rng: RngFn = Math.random): Question {
  const tier = pickWeighted(TIERS, rng);
  let a: number;
  let b: number;

  if (tier === "2x1") {
    a = randomIntWithDigits(2, rng);
    b = randomIntWithDigits(1, rng);
  } else if (tier === "2x2-easy") {
    a = randomIntWithDigits(2, rng);
    b = randomEasyOperand(rng);
    if (rng() < 0.5) [a, b] = [b, a];
  } else {
    const center = 14 + Math.floor(rng() * (95 - 14 + 1)); // keeps center±4 within 2 digits
    const offset = 1 + Math.floor(rng() * 4);
    a = center - offset;
    b = center + offset;
  }

  const answerValue = a * b;

  return {
    id: crypto.randomUUID(),
    operation: "integer-multiply",
    prompt: `${a} × ${b}`,
    answer: `${answerValue}`,
    answerValue,
    metadata: { tier, operands: [a, b] },
  };
}
