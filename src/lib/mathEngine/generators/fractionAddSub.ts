import type { AddSubMode, Question, RngFn } from "../types";
import { DEFAULT_ADD_SUB_MODE } from "../types";
import { Fraction } from "../fraction";

export function generateFractionAddSub(rng: RngFn = Math.random, addSubMode: AddSubMode = DEFAULT_ADD_SUB_MODE): Question {
  const isAdd = addSubMode.add && addSubMode.subtract ? rng() < 0.5 : addSubMode.add;
  const useCommonDenominator = rng() < 0.3;

  const denA = 2 + Math.floor(rng() * 11); // 2-12
  let denB: number;
  if (useCommonDenominator) {
    denB = denA;
  } else {
    do {
      denB = 2 + Math.floor(rng() * 11);
    } while (denB === denA);
  }

  const numA = 1 + Math.floor(rng() * (denA - 1));
  const numB = 1 + Math.floor(rng() * (denB - 1));

  let fa = new Fraction(numA, denA);
  let fb = new Fraction(numB, denB);

  if (!isAdd && fb.num / fb.den > fa.num / fa.den) {
    [fa, fb] = [fb, fa]; // keep the result non-negative
  }

  const result = isAdd ? fa.add(fb) : fa.sub(fb);

  return {
    id: crypto.randomUUID(),
    operation: "fraction-add-sub",
    prompt: `${fa.toFractionString()} ${isAdd ? "+" : "-"} ${fb.toFractionString()}`,
    answer: result.toFractionString(),
    metadata: {
      tier: useCommonDenominator ? "common-denominator" : "lcm-required",
      operands: [fa.toFractionString(), fb.toFractionString()],
    },
  };
}
