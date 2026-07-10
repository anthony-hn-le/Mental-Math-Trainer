import type { Question, RngFn } from "../types";
import { Fraction } from "../fraction";

function generateFractionToDecimal(rng: RngFn): Question {
  let den = 2;
  let num = 1;
  let f = new Fraction(num, den);
  let attempts = 0;

  do {
    den = 2 + Math.floor(rng() * 11); // 2-12
    num = 1 + Math.floor(rng() * (den - 1));
    f = new Fraction(num, den);
    attempts++;
  } while (!f.isTerminatingDecimal() && attempts < 100);

  if (!f.isTerminatingDecimal()) f = new Fraction(1, 4); // safety net, practically unreachable

  const answer = f.toDecimalString();

  return {
    id: crypto.randomUUID(),
    operation: "fraction-conversion",
    prompt: `${f.toFractionString()} = ?`,
    answer,
    answerValue: parseFloat(answer),
    metadata: { tier: "fraction-to-decimal", operands: [num, den] },
  };
}

function generateBlankMultiply(rng: RngFn): Question {
  const n = 2 + Math.floor(rng() * 19); // 2-20
  const resultInt = 1 + Math.floor(rng() * 10); // 1-10
  const blank = new Fraction(resultInt, n);
  const acceptedAnswers = blank.isTerminatingDecimal()
    ? [blank.toFractionString(), blank.toDecimalString()]
    : [blank.toFractionString()];

  return {
    id: crypto.randomUUID(),
    operation: "fraction-conversion",
    prompt: `${n} × ? = ${resultInt}`,
    answer: blank.toFractionString(),
    acceptedAnswers,
    metadata: { tier: "blank-multiply", operands: [n, resultInt] },
  };
}

export function generateFractionConversion(rng: RngFn = Math.random): Question {
  return rng() < 0.5 ? generateFractionToDecimal(rng) : generateBlankMultiply(rng);
}
