import type { Question, RngFn } from "../types";
import { pickWeighted, type WeightedTier } from "../weightedPick";
import { randomIntWithDigits } from "../randomUtils";

const QUOTIENT_DIGIT_TIERS: WeightedTier<number>[] = [
  { weight: 50, value: 1 },
  { weight: 35, value: 2 },
  { weight: 15, value: 3 },
];

/** Generates divisor and quotient first, then multiplies for the dividend — always clean by construction. */
export function generateIntegerDivide(rng: RngFn = Math.random): Question {
  const divisorDigits = rng() < 0.6 ? 1 : 2;
  const divisor = randomIntWithDigits(divisorDigits, rng);
  const quotientDigits = pickWeighted(QUOTIENT_DIGIT_TIERS, rng);
  const quotient = randomIntWithDigits(quotientDigits, rng);
  const dividend = divisor * quotient;

  return {
    id: crypto.randomUUID(),
    operation: "integer-divide",
    prompt: `${dividend} ÷ ${divisor}`,
    answer: `${quotient}`,
    answerValue: quotient,
    metadata: { tier: `${divisorDigits}dDivisor,${quotientDigits}dQuotient`, operands: [dividend, divisor] },
  };
}
