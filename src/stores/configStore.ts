import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OperationKey, QuestionConfig, QuestionType } from "@/lib/mathEngine/types";

export type QuestionCountOption = 20 | 40 | 60 | 80 | 100 | 120 | null;

export interface OperationToggles {
  add: boolean;
  subtract: boolean;
  multiply: boolean;
  divide: boolean;
}

export interface NumberTypeToggles {
  integer: boolean;
  decimal: boolean;
  fraction: boolean;
}

interface ConfigState {
  operations: OperationToggles;
  numberTypes: NumberTypeToggles;
  /** 1-10 minutes. */
  durationMinutes: number;
  questionCount: QuestionCountOption;
  questionType: QuestionType;
  mcqChoiceCount: 3 | 4 | 5;

  toggleOperation: (key: keyof OperationToggles) => void;
  toggleNumberType: (key: keyof NumberTypeToggles) => void;
  setDurationMinutes: (minutes: number) => void;
  setQuestionCount: (count: QuestionCountOption) => void;
  setQuestionType: (type: QuestionType) => void;
  setMcqChoiceCount: (count: 3 | 4 | 5) => void;
  toQuestionConfig: () => QuestionConfig;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      operations: { add: true, subtract: true, multiply: true, divide: true },
      numberTypes: { integer: true, decimal: false, fraction: false },
      durationMinutes: 1,
      questionCount: null,
      questionType: "open",
      mcqChoiceCount: 4,

      toggleOperation: (key) => set((state) => ({ operations: { ...state.operations, [key]: !state.operations[key] } })),
      toggleNumberType: (key) =>
        set((state) => ({ numberTypes: { ...state.numberTypes, [key]: !state.numberTypes[key] } })),
      setDurationMinutes: (minutes) => set({ durationMinutes: minutes }),
      setQuestionCount: (count) => set({ questionCount: count }),
      setQuestionType: (type) => set({ questionType: type }),
      setMcqChoiceCount: (count) => set({ mcqChoiceCount: count }),

      toQuestionConfig: (): QuestionConfig => {
        const { operations, numberTypes, questionType, mcqChoiceCount } = get();
        const activeOperations: OperationKey[] = [];

        if (numberTypes.integer) {
          if (operations.add || operations.subtract) activeOperations.push("integer-add-sub");
          if (operations.multiply) activeOperations.push("integer-multiply");
          if (operations.divide) activeOperations.push("integer-divide");
        }
        if (numberTypes.decimal) {
          if (operations.add || operations.subtract) activeOperations.push("decimal-add-sub");
          if (operations.multiply) activeOperations.push("decimal-multiply");
          if (operations.divide) activeOperations.push("decimal-divide");
        }
        if (numberTypes.fraction) {
          if (operations.add || operations.subtract) activeOperations.push("fraction-add-sub");
          if (operations.multiply) activeOperations.push("fraction-multiply");
          // Fractions have no dedicated divide generator; "divide" maps to the
          // fill-in-the-blank conversion questions (e.g. "20 x ? = 4"), which
          // are structurally division problems.
          if (operations.divide) activeOperations.push("fraction-conversion");
        }

        return {
          activeOperations,
          questionType,
          mcqChoiceCount: questionType === "mcq" ? mcqChoiceCount : undefined,
          addSubMode: { add: operations.add, subtract: operations.subtract },
        };
      },
    }),
    {
      name: "mmt-config-v1",
      partialize: (state) => ({
        operations: state.operations,
        numberTypes: state.numberTypes,
        durationMinutes: state.durationMinutes,
        questionCount: state.questionCount,
        questionType: state.questionType,
        mcqChoiceCount: state.mcqChoiceCount,
      }),
    },
  ),
);
