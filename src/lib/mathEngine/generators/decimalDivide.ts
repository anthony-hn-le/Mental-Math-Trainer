import type { Question, RngFn } from "../types";
import { fromScaledInt } from "../decimalUtils";
import { randomIntOperand, randomSmallDecimal, type DecimalOperand } from "../randomUtils";

/** Constructs the quotient first, then the divisor, then multiplies for the dividend — always clean by construction. */
export function generateDecimalDivide(rng: RngFn = Math.random): Question {
  let quotientIsDecimal = rng() < 0.5;
  let divisorIsDecimal = rng() < 0.5;
  if (!quotientIsDecimal && !divisorIsDecimal) {
    // don't collapse into a plain integer-division question
    if (rng() < 0.5) quotientIsDecimal = true;
    else divisorIsDecimal = true;
  }

  const quotient: DecimalOperand = quotientIsDecimal ? randomSmallDecimal(rng) : randomIntOperand(1, rng);
  const divisor: DecimalOperand = divisorIsDecimal
    ? randomSmallDecimal(rng)
    : randomIntOperand(rng() < 0.7 ? 1 : 2, rng);

  const dividendScaled = quotient.scaledInt * divisor.scaledInt;
  const dividendScale = quotient.scale * divisor.scale;
  const dividendStr = fromScaledInt(dividendScaled, dividendScale);

  return {
    id: crypto.randomUUID(),
    operation: "decimal-divide",
    prompt: `${dividendStr} ÷ ${divisor.str}`,
    answer: quotient.str,
    answerValue: quotient.scaledInt / quotient.scale,
    metadata: { tier: "decimal-divide", operands: [dividendStr, divisor.str] },
  };
}
