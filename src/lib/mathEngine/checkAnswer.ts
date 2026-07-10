import { Fraction } from "./fraction";
import type { Question } from "./types";

const EPSILON = 1e-9;

export function checkAnswer(question: Question, userInput: string): boolean {
  const trimmed = userInput.trim();
  if (trimmed.length === 0) return false;

  const candidates = question.acceptedAnswers ?? [question.answer];
  return candidates.some((candidate) => matchesAnswer(candidate, trimmed, question.answerValue));
}

function matchesAnswer(candidate: string, input: string, answerValue: number | undefined): boolean {
  if (candidate.includes("/")) {
    const parsedInput = Fraction.parseStrict(input);
    const parsedCandidate = Fraction.parseStrict(candidate);
    if (!parsedInput || !parsedCandidate) return false;
    return parsedInput.num === parsedCandidate.num && parsedInput.den === parsedCandidate.den;
  }

  if (input.includes("/")) return false; // user gave a fraction where a plain number was expected

  const numericInput = parseFloat(input);
  if (Number.isNaN(numericInput)) return false;
  const target = answerValue ?? parseFloat(candidate);
  return Math.abs(numericInput - target) <= EPSILON;
}
