export type OperationKey =
  | "integer-add-sub"
  | "integer-multiply"
  | "integer-divide"
  | "decimal-add-sub"
  | "decimal-multiply"
  | "decimal-divide"
  | "fraction-add-sub"
  | "fraction-multiply"
  | "fraction-conversion"
  | "percentage-add-sub"
  | "percentage-multiply"
  | "percentage-divide";

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "open" | "mcq";

/** Restricts the `*-add-sub` generators to addition only, subtraction only, or both (default). */
export interface AddSubMode {
  add: boolean;
  subtract: boolean;
}

export const DEFAULT_ADD_SUB_MODE: AddSubMode = { add: true, subtract: true };

/**
 * `difficulty` is reserved for a future dashboard control. The weighted-tier
 * distributions implemented in `generators/` are the default/medium behavior;
 * no generator branches on this field yet.
 */
export interface QuestionConfig {
  activeOperations: OperationKey[];
  questionType: QuestionType;
  mcqChoiceCount?: 3 | 4 | 5;
  difficulty?: Difficulty;
  addSubMode?: AddSubMode;
}

export interface Question {
  id: string;
  operation: OperationKey;
  prompt: string;
  /** Canonical answer string (e.g. "112", "0.036", "8/3"). */
  answer: string;
  /** Numeric value of `answer`, when a plain numeric comparison applies. */
  answerValue?: number;
  /** Alternate valid answer forms (e.g. conversion questions accepting both a fraction and a decimal). */
  acceptedAnswers?: string[];
  choices?: string[];
  correctChoiceIndex?: number;
  metadata: {
    tier: string;
    operands: (number | string)[];
  };
}

export type RngFn = () => number;
