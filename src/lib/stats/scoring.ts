export interface AnsweredEntry {
  correct: boolean;
  responseMs: number;
}

export interface ScoreSummary {
  /** MVP scoring: correct-answer count for the session. */
  score: number;
  correctCount: number;
  totalCount: number;
  accuracy: number; // 0-1
  avgSpeedMs: number;
}

export function summarizeSession(answeredLog: AnsweredEntry[]): ScoreSummary {
  const totalCount = answeredLog.length;
  const correctCount = answeredLog.filter((e) => e.correct).length;
  const avgSpeedMs = totalCount === 0 ? 0 : answeredLog.reduce((sum, e) => sum + e.responseMs, 0) / totalCount;

  return {
    score: correctCount,
    correctCount,
    totalCount,
    accuracy: totalCount === 0 ? 0 : correctCount / totalCount,
    avgSpeedMs,
  };
}
