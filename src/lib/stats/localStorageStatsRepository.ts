import type { StatsRepository } from "./statsRepository";
import type { DayActivity, LifetimeStats, SessionResult } from "./types";

const STORAGE_KEY = "mmt-stats-v1";
const MAX_STORED_SESSIONS = 200;

interface StoredData {
  sessions: SessionResult[];
  activityByDate: Record<string, number>;
  highestScore: number;
  totalAttempts: number;
  totalCorrect: number;
}

function emptyData(): StoredData {
  return { sessions: [], activityByDate: {}, highestScore: 0, totalAttempts: 0, totalCorrect: 0 };
}

function readData(): StoredData {
  if (typeof window === "undefined") return emptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    return { ...emptyData(), ...JSON.parse(raw) };
  } catch {
    return emptyData();
  }
}

function writeData(data: StoredData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function dateKey(d: Date): string {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const localStorageStatsRepository = {
  recordSession(result: SessionResult): void {
    const data = readData();
    data.sessions = [result, ...data.sessions].slice(0, MAX_STORED_SESSIONS);

    const key = dateKey(new Date(result.completedAt));
    data.activityByDate[key] = (data.activityByDate[key] ?? 0) + result.totalCount;

    data.highestScore = Math.max(data.highestScore, result.score);
    data.totalAttempts += result.totalCount;
    data.totalCorrect += result.correctCount;

    writeData(data);
  },

  getLastSession(): SessionResult | null {
    return readData().sessions[0] ?? null;
  },

  getRecentSessions(limit: number): SessionResult[] {
    return readData().sessions.slice(0, limit);
  },

  getActivity(days: number): DayActivity[] {
    const data = readData();
    const today = new Date();
    const result: DayActivity[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      result.push({ date: key, questionsAnswered: data.activityByDate[key] ?? 0 });
    }
    return result;
  },

  getLifetimeStats(): LifetimeStats {
    const data = readData();
    return {
      highestScore: data.highestScore,
      totalAttempts: data.totalAttempts,
      totalCorrect: data.totalCorrect,
      lifetimeAccuracy: data.totalAttempts === 0 ? 0 : data.totalCorrect / data.totalAttempts,
    };
  },
} satisfies StatsRepository;
