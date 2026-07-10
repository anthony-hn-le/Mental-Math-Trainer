import { gcd } from "./decimalUtils";

/**
 * A fraction that is always reduced to lowest terms by construction, with a
 * non-negative denominator. `toFractionString()` always prints the plain
 * reduced form (e.g. "8/3", "1/3") — never a mixed number.
 */
export class Fraction {
  readonly num: number;
  readonly den: number;

  constructor(num: number, den: number) {
    if (den === 0) throw new Error("Fraction denominator cannot be zero");
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      throw new Error("Fraction requires integer num/den");
    }
    const sign = den < 0 ? -1 : 1;
    const signedNum = num * sign;
    const signedDen = den * sign;
    const g = gcd(signedNum, signedDen);
    this.num = signedNum / g;
    this.den = signedDen / g;
  }

  add(o: Fraction): Fraction {
    return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den);
  }

  sub(o: Fraction): Fraction {
    return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den);
  }

  mul(o: Fraction): Fraction {
    return new Fraction(this.num * o.num, this.den * o.den);
  }

  div(o: Fraction): Fraction {
    if (o.num === 0) throw new Error("Division by zero fraction");
    return new Fraction(this.num * o.den, this.den * o.num);
  }

  isReduced(): boolean {
    return gcd(this.num, this.den) === 1;
  }

  /** True iff this fraction's denominator has only 2 and 5 as prime factors. */
  isTerminatingDecimal(): boolean {
    let d = this.den;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1;
  }

  toFractionString(): string {
    if (this.den === 1) return `${this.num}`;
    return `${this.num}/${this.den}`;
  }

  /** Exact terminating decimal string via scaled-integer long division. Throws if non-terminating. */
  toDecimalString(): string {
    if (!this.isTerminatingDecimal()) {
      throw new Error(`${this.toFractionString()} does not have a terminating decimal representation`);
    }
    let d = this.den;
    let twos = 0;
    let fives = 0;
    while (d % 2 === 0) {
      d /= 2;
      twos++;
    }
    while (d % 5 === 0) {
      d /= 5;
      fives++;
    }
    const places = Math.max(twos, fives);
    const scale = 10 ** places;
    const scaledNum = this.num * (scale / this.den);
    const negative = scaledNum < 0;
    const absScaled = Math.abs(scaledNum);

    if (places === 0) {
      return `${negative ? "-" : ""}${absScaled}`;
    }

    const intPart = Math.floor(absScaled / scale);
    const fracPart = (absScaled % scale).toString().padStart(places, "0").replace(/0+$/, "");
    const str = fracPart.length > 0 ? `${intPart}.${fracPart}` : `${intPart}`;
    return negative ? `-${str}` : str;
  }

  /**
   * Parses a string as a fraction only if it is already written in strict
   * canonical form: a bare integer, or "num/den" already reduced to lowest
   * terms with a positive denominator. Rejects mixed numbers ("2 2/3") and
   * unreduced fractions ("6/18").
   */
  static parseStrict(input: string): Fraction | null {
    const trimmed = input.trim();

    if (/^-?\d+\s+\d+\/\d+$/.test(trimmed)) return null; // mixed number

    const fracMatch = /^(-?\d+)\/(-?\d+)$/.exec(trimmed);
    if (fracMatch) {
      const num = parseInt(fracMatch[1], 10);
      const den = parseInt(fracMatch[2], 10);
      if (den === 0) return null;
      const reduced = new Fraction(num, den);
      if (reduced.num !== num || reduced.den !== den) return null; // wasn't already canonical
      return reduced;
    }

    if (/^-?\d+$/.test(trimmed)) {
      return new Fraction(parseInt(trimmed, 10), 1);
    }

    return null;
  }
}
