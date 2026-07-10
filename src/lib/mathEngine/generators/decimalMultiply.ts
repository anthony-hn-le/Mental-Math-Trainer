import type { Question, RngFn } from "../types";
import { fromScaledInt } from "../decimalUtils";
import { pickWeighted, type WeightedTier } from "../weightedPick";
import { randomDecimalOperand, randomIntOperand, randomSmallDecimal, type DecimalOperand } from "../randomUtils";

type Tier = "int-times-decimal" | "small-decimal-square";

const TIERS: WeightedTier<Tier>[] = [
  { weight: 60, value: "int-times-decimal" },
  { weight: 40, value: "small-decimal-square" },
];

export function generateDecimalMultiply(rng: RngFn = Math.random): Question {
  const tier = pickWeighted(TIERS, rng);
  let opA: DecimalOperand;
  let opB: DecimalOperand;

  if (tier === "int-times-decimal") {
    opA = randomIntOperand(rng() < 0.5 ? 1 : 2, rng);
    opB = randomDecimalOperand(rng);
  } else {
    opA = randomSmallDecimal(rng);
    opB = randomSmallDecimal(rng);
  }

  const productScaled = opA.scaledInt * opB.scaledInt;
  const productScale = opA.scale * opB.scale;
  const answer = fromScaledInt(productScaled, productScale);

  return {
    id: crypto.randomUUID(),
    operation: "decimal-multiply",
    prompt: `${opA.str} × ${opB.str}`,
    answer,
    answerValue: productScaled / productScale,
    metadata: { tier, operands: [opA.str, opB.str] },
  };
}
