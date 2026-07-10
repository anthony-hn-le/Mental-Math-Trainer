import type { QuestionConfig } from "@/lib/mathEngine/types";

export interface SessionResult {
  id: string;
  completedAt: string; // ISO timestamp
  config: QuestionConfig;
  durationMs: number;
  questionLimit: number | null;
  score: number;
  correctCount: number;
  totalCount: number;
  accuracy: number; // 0-1
  avgSpeedMs: number;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD, local calendar date
  questionsAnswered: number;
}

export interface LifetimeStats {
  highestScore: number;
  totalAttempts: number;
  totalCorrect: number;
  lifetimeAccuracy: number; // 0-1
}
