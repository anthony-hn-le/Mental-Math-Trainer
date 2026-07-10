import { beforeEach, describe, expect, it } from "vitest";
import { localStorageStatsRepository } from "@/lib/stats/localStorageStatsRepository";
import type { SessionResult } from "@/lib/stats/types";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  clear() {
    this.store.clear();
  }
}

function makeSession(overrides: Partial<SessionResult> = {}): SessionResult {
  return {
    id: crypto.randomUUID(),
    completedAt: new Date().toISOString(),
    config: { activeOperations: ["integer-add-sub"], questionType: "open" },
    durationMs: 60_000,
    questionLimit: null,
    score: 8,
    correctCount: 8,
    totalCount: 10,
    accuracy: 0.8,
    avgSpeedMs: 2500,
    ...overrides,
  };
}

describe("localStorageStatsRepository", () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: new MemoryStorage() };
  });

  it("returns empty defaults when nothing has been recorded", () => {
    expect(localStorageStatsRepository.getLastSession()).toBeNull();
    expect(localStorageStatsRepository.getLifetimeStats()).toEqual({
      highestScore: 0,
      totalAttempts: 0,
      totalCorrect: 0,
      lifetimeAccuracy: 0,
    });
  });

  it("records a session and reflects it in lastSession and lifetime stats", () => {
    localStorageStatsRepository.recordSession(makeSession({ score: 8, correctCount: 8, totalCount: 10 }));
    expect(localStorageStatsRepository.getLastSession()?.score).toBe(8);
    const lifetime = localStorageStatsRepository.getLifetimeStats();
    expect(lifetime.highestScore).toBe(8);
    expect(lifetime.totalAttempts).toBe(10);
    expect(lifetime.totalCorrect).toBe(8);
    expect(lifetime.lifetimeAccuracy).toBeCloseTo(0.8);
  });

  it("accumulates across multiple sessions and tracks the highest score", () => {
    localStorageStatsRepository.recordSession(makeSession({ score: 5, correctCount: 5, totalCount: 10 }));
    localStorageStatsRepository.recordSession(makeSession({ score: 12, correctCount: 12, totalCount: 15 }));
    const lifetime = localStorageStatsRepository.getLifetimeStats();
    expect(lifetime.highestScore).toBe(12);
    expect(lifetime.totalAttempts).toBe(25);
    expect(lifetime.totalCorrect).toBe(17);
  });

  it("buckets today's activity under today's date", () => {
    localStorageStatsRepository.recordSession(makeSession({ totalCount: 7 }));
    const activity = localStorageStatsRepository.getActivity(7);
    expect(activity).toHaveLength(7);
    expect(activity[activity.length - 1].questionsAnswered).toBe(7);
  });
});
