import type { Question, RngFn } from "../types";
import { Fraction } from "../fraction";

/** Round percentages whose reduced denominator stays small, keeping results clean and short. */
const NICE_PERCENTAGES = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95];

/**
 * Constructs the integer operand as a multiple of the percentage's reduced
 * denominator, so `integer x percent` is always an exact whole number —
 * clean by construction, no rejection sampling.
 */
export function generatePercentageMultiply(rng: RngFn = Math.random): Question {
  const p = NICE_PERCENTAGES[Math.floor(rng() * NICE_PERCENTAGES.length)];
  const percentFrac = new Fraction(p, 100);
  const multiplier = 1 + Math.floor(rng() * 10); // 1-10
  const integerOperand = percentFrac.den * multiplier;

  const resultFrac = percentFrac.mul(new Fraction(integerOperand, 1));
  const answer = resultFrac.toFractionString(); // always a plain integer (den reduces to 1)

  return {
    id: crypto.randomUUID(),
    operation: "percentage-multiply",
    prompt: `${integerOperand} × ${p}%`,
    answer,
    answerValue: parseFloat(answer),
    metadata: { tier: "percentage-multiply", operands: [integerOperand, p] },
  };
}
