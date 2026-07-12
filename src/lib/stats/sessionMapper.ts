import type { TrainingSession } from "@prisma/client";
import type { QuestionConfig } from "@/lib/mathEngine/types";
import type { SessionResult } from "./types";

/** Maps a Prisma `TrainingSession` row to the client-facing `SessionResult` shape. */
export function toSessionResult(row: TrainingSession): SessionResult {
  return {
    id: row.id,
    completedAt: row.completedAt.toISOString(),
    config: row.config as unknown as QuestionConfig,
    durationMs: row.durationMs,
    questionLimit: row.questionLimit,
    score: row.score,
    correctCount: row.correctCount,
    totalCount: row.totalCount,
    accuracy: row.accuracy,
    avgSpeedMs: row.avgSpeedMs,
  };
}
