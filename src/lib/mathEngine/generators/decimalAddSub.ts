import type { AddSubMode, Question, RngFn } from "../types";
import { DEFAULT_ADD_SUB_MODE } from "../types";
import { fromScaledInt } from "../decimalUtils";
import { randomDecimalOperand, type DecimalOperand } from "../randomUtils";

export function generateDecimalAddSub(rng: RngFn = Math.random, addSubMode: AddSubMode = DEFAULT_ADD_SUB_MODE): Question {
  const isAdd = addSubMode.add && addSubMode.subtract ? rng() < 0.5 : addSubMode.add;
  let opA: DecimalOperand = randomDecimalOperand(rng);
  let opB: DecimalOperand = randomDecimalOperand(rng);

  const commonScale = Math.max(opA.scale, opB.scale);
  let scaledA = opA.scaledInt * (commonScale / opA.scale);
  let scaledB = opB.scaledInt * (commonScale / opB.scale);

  if (!isAdd && scaledB > scaledA) {
    [opA, opB] = [opB, opA];
    [scaledA, scaledB] = [scaledB, scaledA];
  }

  const resultScaled = isAdd ? scaledA + scaledB : scaledA - scaledB;
  const answer = fromScaledInt(resultScaled, commonScale);

  return {
    id: crypto.randomUUID(),
    operation: "decimal-add-sub",
    prompt: `${opA.str} ${isAdd ? "+" : "-"} ${opB.str}`,
    answer,
    answerValue: resultScaled / commonScale,
    metadata: { tier: isAdd ? "add" : "sub", operands: [opA.str, opB.str] },
  };
}
