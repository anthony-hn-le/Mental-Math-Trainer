import { describe, expect, it } from "vitest";
import { Fraction } from "@/lib/mathEngine/fraction";

describe("Fraction", () => {
  it("reduces to lowest terms on construction", () => {
    expect(new Fraction(6, 18).toFractionString()).toBe("1/3");
    expect(new Fraction(14, 7).toFractionString()).toBe("2");
  });

  it("normalizes a negative denominator", () => {
    const f = new Fraction(3, -4);
    expect(f.num).toBe(-3);
    expect(f.den).toBe(4);
  });

  it("adds, subtracts, multiplies, and divides against known values", () => {
    const a = new Fraction(2, 3);
    const b = new Fraction(1, 4);
    expect(a.add(b).toFractionString()).toBe("11/12");
    expect(a.sub(b).toFractionString()).toBe("5/12");
    expect(a.mul(b).toFractionString()).toBe("1/6");
    expect(a.div(b).toFractionString()).toBe("8/3");
  });

  it("never prints a mixed number, always a reduced improper form", () => {
    const f = new Fraction(8, 3);
    expect(f.toFractionString()).toBe("8/3");
    expect(f.toFractionString()).not.toMatch(/^\d+\s+\d+\/\d+$/);
  });

  it("isReduced reflects the reduced invariant", () => {
    expect(new Fraction(6, 18).isReduced()).toBe(true); // already normalized to 1/3
    expect(new Fraction(1, 3).isReduced()).toBe(true);
  });

  describe("isTerminatingDecimal / toDecimalString", () => {
    it("identifies terminating denominators (factors of only 2 and 5)", () => {
      expect(new Fraction(3, 8).isTerminatingDecimal()).toBe(true);
      expect(new Fraction(1, 4).isTerminatingDecimal()).toBe(true);
      expect(new Fraction(1, 3).isTerminatingDecimal()).toBe(false);
      expect(new Fraction(1, 7).isTerminatingDecimal()).toBe(false);
    });

    it("produces exact decimal strings", () => {
      expect(new Fraction(3, 8).toDecimalString()).toBe("0.375");
      expect(new Fraction(1, 5).toDecimalString()).toBe("0.2");
      expect(new Fraction(1, 4).toDecimalString()).toBe("0.25");
      expect(new Fraction(-1, 4).toDecimalString()).toBe("-0.25");
    });

    it("throws for non-terminating fractions", () => {
      expect(() => new Fraction(1, 3).toDecimalString()).toThrow();
    });
  });

  describe("parseStrict", () => {
    it("accepts a reduced improper fraction", () => {
      const f = Fraction.parseStrict("8/3");
      expect(f?.num).toBe(8);
      expect(f?.den).toBe(3);
    });

    it("rejects an unreduced fraction", () => {
      expect(Fraction.parseStrict("6/18")).toBeNull();
    });

    it("rejects a mixed number", () => {
      expect(Fraction.parseStrict("2 2/3")).toBeNull();
    });

    it("accepts a bare integer", () => {
      const f = Fraction.parseStrict("5");
      expect(f?.num).toBe(5);
      expect(f?.den).toBe(1);
    });

    it("rejects garbage input", () => {
      expect(Fraction.parseStrict("abc")).toBeNull();
      expect(Fraction.parseStrict("1/0")).toBeNull();
    });
  });
});
