import type { Question, RngFn } from "../types";
import { Fraction } from "../fraction";

/** Round percentages whose reduced denominator stays small, keeping the dividend's decimal short. */
const NICE_PERCENTAGES = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95];

/**
 * Constructs the quotient (the answer) first, then computes the dividend as
 * `quotient x percent`. Any percentage's reduced fraction has a denominator
 * that only divides 100 (2s and 5s only), so this always terminates cleanly
 * — no rejection sampling needed, unlike a general decimal divide.
 */
export function generatePercentageDivide(rng: RngFn = Math.random): Question {
  const p = NICE_PERCENTAGES[Math.floor(rng() * NICE_PERCENTAGES.length)];
  const percentFrac = new Fraction(p, 100);
  const quotient = 1 + Math.floor(rng() * 20); // 1-20, the clean answer

  const dividendFrac = percentFrac.mul(new Fraction(quotient, 1));
  const dividendStr = dividendFrac.toDecimalString();

  return {
    id: crypto.randomUUID(),
    operation: "percentage-divide",
    prompt: `${dividendStr} ÷ ${p}%`,
    answer: `${quotient}`,
    answerValue: quotient,
    metadata: { tier: "percentage-divide", operands: [dividendStr, p] },
  };
}
