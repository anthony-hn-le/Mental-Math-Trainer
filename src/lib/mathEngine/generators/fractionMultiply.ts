import type { Question, RngFn } from "../types";
import { Fraction } from "../fraction";

/**
 * 50% of questions are constructed so `fa`'s denominator and `fb`'s numerator
 * share a factor (a "cross-cancel" pair, e.g. 4/7 x 14/3 — 14 and 7 both
 * carry a factor of 7). The raw pre-reduction operands are kept in
 * `metadata.operands` so tests can verify the cancellation structurally.
 */
export function generateFractionMultiply(rng: RngFn = Math.random): Question {
  const crossCancel = rng() < 0.5;
  let numA: number;
  let denA: number;
  let numB: number;
  let denB: number;

  if (crossCancel) {
    const sharedFactor = 2 + Math.floor(rng() * 8); // 2-9
    denA = sharedFactor * (1 + Math.floor(rng() * 4));
    numB = sharedFactor * (1 + Math.floor(rng() * 4));
    numA = 1 + Math.floor(rng() * (denA - 1));
    denB = 2 + Math.floor(rng() * 11);
  } else {
    denA = 2 + Math.floor(rng() * 11);
    denB = 2 + Math.floor(rng() * 11);
    numA = 1 + Math.floor(rng() * (denA - 1));
    numB = 1 + Math.floor(rng() * (denB - 1));
  }

  const fa = new Fraction(numA, denA);
  const fb = new Fraction(numB, denB);
  const result = fa.mul(fb);

  return {
    id: crypto.randomUUID(),
    operation: "fraction-multiply",
    prompt: `${fa.toFractionString()} × ${fb.toFractionString()}`,
    answer: result.toFractionString(),
    metadata: { tier: crossCancel ? "cross-cancel" : "general", operands: [numA, denA, numB, denB] },
  };
}
