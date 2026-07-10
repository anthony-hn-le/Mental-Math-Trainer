import type { RngFn } from "./types";
import { fromScaledInt } from "./decimalUtils";

export function randomIntWithDigits(digits: number, rng: RngFn): number {
  if (digits <= 0) return 0;
  const min = digits === 1 ? 1 : 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return min + Math.floor(rng() * (max - min + 1));
}

export interface DecimalOperand {
  str: string;
  scaledInt: number;
  scale: number;
}

export function randomIntOperand(digits: number, rng: RngFn): DecimalOperand {
  const value = randomIntWithDigits(digits, rng);
  return { str: `${value}`, scaledInt: value, scale: 1 };
}

/** A decimal with 0-2 integer digits and 1-2 decimal places (always a nonzero fractional part). */
export function randomDecimalOperand(rng: RngFn): DecimalOperand {
  const intDigits = Math.floor(rng() * 3);
  const decimalPlaces = rng() < 0.5 ? 1 : 2;
  const intPart = intDigits === 0 ? 0 : randomIntWithDigits(intDigits, rng);
  const scale = 10 ** decimalPlaces;
  const fracPart = 1 + Math.floor(rng() * (scale - 1));
  const scaledInt = intPart * scale + fracPart;
  return { str: fromScaledInt(scaledInt, scale), scaledInt, scale };
}

/** A small decimal in [0.1, 0.9]. */
export function randomSmallDecimal(rng: RngFn): DecimalOperand {
  const scaledInt = 1 + Math.floor(rng() * 9);
  const scale = 10;
  return { str: fromScaledInt(scaledInt, scale), scaledInt, scale };
}
