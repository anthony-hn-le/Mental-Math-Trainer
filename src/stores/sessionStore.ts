import { create } from "zustand";
import { checkAnswer, generateQuestion } from "@/lib/mathEngine";
import type { Question, QuestionConfig } from "@/lib/mathEngine/types";
import { summarizeSession } from "@/lib/stats/scoring";
import type { SessionResult } from "@/lib/stats/types";
import { useStatsStore } from "./statsStore";

export type SessionStatus = "idle" | "running" | "finished";

export interface AnswerLogEntry {
  question: Question;
  userInput: string;
  correct: boolean;
  responseMs: number;
}

interface SessionState {
  status: SessionStatus;
  config: QuestionConfig | null;
  durationMs: number | null;
  questionLimit: number | null; // null = unlimited
  endsAt: number | null; // epoch ms
  currentQuestion: Question | null;
  questionShownAt: number | null; // performance.now() timestamp
  answeredLog: AnswerLogEntry[];
  result: SessionResult | null;

  startSession: (config: QuestionConfig, durationMs: number, questionLimit: number | null) => void;
  submitAnswer: (userInput: string) => void;
  /** Checks the "whichever limit is hit first" rule; call on a ~200ms interval while running. */
  tick: () => void;
  endSession: () => void;
  reset: () => void;
}

function nextQuestion(config: QuestionConfig): { question: Question; shownAt: number } {
  return { question: generateQuestion(config), shownAt: performance.now() };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: "idle",
  config: null,
  durationMs: null,
  questionLimit: null,
  endsAt: null,
  currentQuestion: null,
  questionShownAt: null,
  answeredLog: [],
  result: null,

  startSession: (config, durationMs, questionLimit) => {
    const { question, shownAt } = nextQuestion(config);
    set({
      status: "running",
      config,
      durationMs,
      questionLimit,
      endsAt: Date.now() + durationMs,
      currentQuestion: question,
      questionShownAt: shownAt,
      answeredLog: [],
      result: null,
    });
  },

  submitAnswer: (userInput: string) => {
    const state = get();
    if (state.status !== "running" || !state.currentQuestion || !state.config) return;

    const responseMs = performance.now() - (state.questionShownAt ?? performance.now());
    const correct = checkAnswer(state.currentQuestion, userInput);
    const answeredLog = [...state.answeredLog, { question: state.currentQuestion, userInput, correct, responseMs }];

    if (state.questionLimit !== null && answeredLog.length >= state.questionLimit) {
      set({ answeredLog });
      get().endSession();
      return;
    }

    const { question, shownAt } = nextQuestion(state.config);
    set({ answeredLog, currentQuestion: question, questionShownAt: shownAt });
  },

  tick: () => {
    const state = get();
    if (state.status !== "running" || state.endsAt === null) return;
    if (Date.now() >= state.endsAt) get().endSession();
  },

  endSession: () => {
    const state = get();
    if (state.status !== "running") return; // idempotent: guards a tick()/submitAnswer() race

    const summary = summarizeSession(state.answeredLog.map((e) => ({ correct: e.correct, responseMs: e.responseMs })));
    const result: SessionResult = {
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      config: state.config as QuestionConfig,
      durationMs: state.durationMs as number,
      questionLimit: state.questionLimit,
      ...summary,
    };

    set({ status: "finished", result, currentQuestion: null });
    void useStatsStore.getState().recordSession(result);
  },

  reset: () => {
    set({
      status: "idle",
      config: null,
      durationMs: null,
      questionLimit: null,
      endsAt: null,
      currentQuestion: null,
      questionShownAt: null,
      answeredLog: [],
      result: null,
    });
  },
}));
