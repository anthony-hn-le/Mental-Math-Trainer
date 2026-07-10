import { Fraction } from "./fraction";
import type { Question, RngFn } from "./types";

export interface McqChoices {
  choices: string[];
  correctIndex: number;
}

export function generateChoices(question: Question, choiceCount: number, rng: RngFn = Math.random): McqChoices {
  const correct = question.answer;
  const isFraction = correct.includes("/");
  const distractors = new Set<string>();

  let attempts = 0;
  const maxAttempts = 500;
  while (distractors.size < choiceCount - 1 && attempts < maxAttempts) {
    const candidate = isFraction
      ? perturbFraction(correct, attempts, rng)
      : perturbNumeric(correct, question.answerValue, attempts, rng);
    if (candidate !== correct) distractors.add(candidate);
    attempts++;
  }

  const options = [correct, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { choices: options, correctIndex: options.indexOf(correct) };
}

function perturbNumeric(correctStr: string, value: number | undefined, attemptSeed: number, rng: RngFn): string {
  // Percentage answers carry a "%" suffix (e.g. "87%") — strip it for the
  // arithmetic and reattach it so distractors display consistently with the
  // correct choice, rather than showing a bare "84" next to "87%".
  const isPercent = correctStr.endsWith("%");
  const numericStr = isPercent ? correctStr.slice(0, -1) : correctStr;

  const base = value ?? parseFloat(numericStr);
  const decimalPlaces = (numericStr.split(".")[1] || "").length;
  const unit = decimalPlaces > 0 ? 1 / 10 ** decimalPlaces : 1;
  const growth = attemptSeed + Math.floor(rng() * 9) + 1;
  const offset = unit * growth * (rng() < 0.5 ? -1 : 1);
  const perturbed = base + offset;
  const formatted = decimalPlaces > 0 ? perturbed.toFixed(decimalPlaces) : `${Math.round(perturbed)}`;
  return isPercent ? `${formatted}%` : formatted;
}

function perturbFraction(correctStr: string, attemptSeed: number, rng: RngFn): string {
  const [numStr, denStr] = correctStr.split("/");
  const num = parseInt(numStr, 10);
  const den = denStr ? parseInt(denStr, 10) : 1;
  const delta = (Math.floor(rng() * 3) + 1 + attemptSeed) * (rng() < 0.5 ? -1 : 1);
  const kind = attemptSeed % 3;

  if (kind === 0) {
    const newNum = num + delta;
    return new Fraction(newNum === 0 ? 1 : newNum, den).toFractionString();
  }
  if (kind === 1) {
    const newDen = den + delta;
    return new Fraction(num, newDen === 0 ? 1 : Math.abs(newDen)).toFractionString();
  }
  return denStr ? new Fraction(den, num === 0 ? 1 : num).toFractionString() : new Fraction(num + delta, 1).toFractionString();
}
