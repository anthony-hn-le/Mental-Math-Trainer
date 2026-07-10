import { create } from "zustand";
import { localStorageStatsRepository } from "@/lib/stats/localStorageStatsRepository";
import type { StatsRepository } from "@/lib/stats/statsRepository";
import type { DayActivity, LifetimeStats, SessionResult } from "@/lib/stats/types";

const repository: StatsRepository = localStorageStatsRepository;
const ACTIVITY_WINDOW_DAYS = 30; // 3x10 grid

interface StatsState {
  hasHydrated: boolean;
  lastSession: SessionResult | null;
  activity: DayActivity[];
  lifetime: LifetimeStats;
  /** Call once on the client after mount — this store starts empty to stay SSR-safe. */
  hydrate: () => Promise<void>;
  recordSession: (result: SessionResult) => Promise<void>;
}

/**
 * A reactive cache around `StatsRepository` — never touches `localStorage`
 * directly. Swapping in a DB-backed repository (Phase 2) requires no changes
 * here or in any consuming component.
 */
export const useStatsStore = create<StatsState>((set) => ({
  hasHydrated: false,
  lastSession: null,
  activity: [],
  lifetime: { highestScore: 0, totalAttempts: 0, totalCorrect: 0, lifetimeAccuracy: 0 },

  hydrate: async () => {
    const [lastSession, activity, lifetime] = await Promise.all([
      repository.getLastSession(),
      repository.getActivity(ACTIVITY_WINDOW_DAYS),
      repository.getLifetimeStats(),
    ]);
    set({ lastSession, activity, lifetime, hasHydrated: true });
  },

  recordSession: async (result: SessionResult) => {
    await repository.recordSession(result);
    const [lastSession, activity, lifetime] = await Promise.all([
      repository.getLastSession(),
      repository.getActivity(ACTIVITY_WINDOW_DAYS),
      repository.getLifetimeStats(),
    ]);
    set({ lastSession, activity, lifetime });
  },
}));
