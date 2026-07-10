import type { OperationKey, Question, QuestionConfig, RngFn } from "./types";
import { generateIntegerAddSub } from "./generators/integerAddSub";
import { generateIntegerMultiply } from "./generators/integerMultiply";
import { generateIntegerDivide } from "./generators/integerDivide";
import { generateDecimalAddSub } from "./generators/decimalAddSub";
import { generateDecimalMultiply } from "./generators/decimalMultiply";
import { generateDecimalDivide } from "./generators/decimalDivide";
import { generateFractionAddSub } from "./generators/fractionAddSub";
import { generateFractionMultiply } from "./generators/fractionMultiply";
import { generateFractionConversion } from "./generators/fractionConversion";
import { generateChoices } from "./mcqDistractors";

const GENERATORS: Record<OperationKey, (rng: RngFn) => Question> = {
  "integer-add-sub": generateIntegerAddSub,
  "integer-multiply": generateIntegerMultiply,
  "integer-divide": generateIntegerDivide,
  "decimal-add-sub": generateDecimalAddSub,
  "decimal-multiply": generateDecimalMultiply,
  "decimal-divide": generateDecimalDivide,
  "fraction-add-sub": generateFractionAddSub,
  "fraction-multiply": generateFractionMultiply,
  "fraction-conversion": generateFractionConversion,
};

export function generateQuestion(config: QuestionConfig, rng: RngFn = Math.random): Question {
  if (config.activeOperations.length === 0) {
    throw new Error("QuestionConfig.activeOperations must not be empty");
  }

  const operation = config.activeOperations[Math.floor(rng() * config.activeOperations.length)];
  const question = GENERATORS[operation](rng);

  if (config.questionType === "mcq") {
    const choiceCount = config.mcqChoiceCount ?? 4;
    const { choices, correctIndex } = generateChoices(question, choiceCount, rng);
    return { ...question, choices, correctChoiceIndex: correctIndex };
  }

  return question;
}

export * from "./types";
export { Fraction } from "./fraction";
export { checkAnswer } from "./checkAnswer";
export * from "./generators/integerAddSub";
export * from "./generators/integerMultiply";
export * from "./generators/integerDivide";
export * from "./generators/decimalAddSub";
export * from "./generators/decimalMultiply";
export * from "./generators/decimalDivide";
export * from "./generators/fractionAddSub";
export * from "./generators/fractionMultiply";
export * from "./generators/fractionConversion";
