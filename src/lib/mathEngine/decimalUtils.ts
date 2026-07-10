/** Exact scaled-integer decimal arithmetic — avoids float drift (e.g. 0.1 + 0.2). */

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export interface ScaledInt {
  /** Integer value; the real value is `intVal / scale`. */
  intVal: number;
  /** A power of 10. */
  scale: number;
}

export function toScaledInt(str: string): ScaledInt {
  const trimmed = str.trim();
  const negative = trimmed.startsWith("-");
  const abs = negative ? trimmed.slice(1) : trimmed;
  const [intPart, decPart = ""] = abs.split(".");
  const scale = 10 ** decPart.length;
  const intVal = parseInt((intPart || "0") + decPart, 10) * (negative ? -1 : 1);
  return { intVal, scale };
}

export function fromScaledInt(intVal: number, scale: number): string {
  const negative = intVal < 0;
  const abs = Math.abs(intVal);
  const places = Math.round(Math.log10(scale));
  if (places === 0) {
    return `${negative ? "-" : ""}${abs}`;
  }
  const intPart = Math.floor(abs / scale);
  const fracPart = (abs % scale).toString().padStart(places, "0");
  const strippedFrac = fracPart.replace(/0+$/, "");
  const str = strippedFrac.length > 0 ? `${intPart}.${strippedFrac}` : `${intPart}`;
  return negative ? `-${str}` : str;
}

/** True iff numerator/denominator (reduced) has a terminating decimal representation. */
export function isTerminatingDivision(numerator: number, denominator: number): boolean {
  const g = gcd(numerator, denominator);
  let d = Math.abs(denominator / g);
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}
