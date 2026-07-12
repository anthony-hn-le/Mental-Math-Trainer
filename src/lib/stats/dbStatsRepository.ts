import type { StatsRepository } from "./statsRepository";
import type { DayActivity, LifetimeStats, SessionResult } from "./types";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * DB-backed implementation of the `StatsRepository` seam, used once a user is
 * signed in — swapped in by `statsStore`/`StatsHydrator` in place of
 * `localStorageStatsRepository`. Talks to the `/api/scores*` routes, which
 * scope every query to the authenticated user server-side.
 */
export const dbStatsRepository = {
  async recordSession(result: SessionResult): Promise<void> {
    const { completedAt, config, durationMs, questionLimit, score, correctCount, totalCount, accuracy, avgSpeedMs } =
      result;
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completedAt,
        config,
        durationMs,
        questionLimit,
        score,
        correctCount,
        totalCount,
        accuracy,
        avgSpeedMs,
      }),
    });
  },

  getLastSession(): Promise<SessionResult | null> {
    return getJson<SessionResult | null>("/api/scores/last");
  },

  getActivity(days: number): Promise<DayActivity[]> {
    const tzOffsetMinutes = new Date().getTimezoneOffset();
    return getJson<DayActivity[]>(`/api/scores/activity?days=${days}&tzOffsetMinutes=${tzOffsetMinutes}`);
  },

  getLifetimeStats(): Promise<LifetimeStats> {
    return getJson<LifetimeStats>("/api/scores/lifetime");
  },
} satisfies StatsRepository;
