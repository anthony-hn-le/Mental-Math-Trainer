import { create } from "zustand";
import { localStorageStatsRepository } from "@/lib/stats/localStorageStatsRepository";
import type { StatsRepository } from "@/lib/stats/statsRepository";
import type { DayActivity, LifetimeStats, SessionResult } from "@/lib/stats/types";

const ACTIVITY_WINDOW_DAYS = 30; // 3x10 grid

interface StatsState {
  repository: StatsRepository;
  hasHydrated: boolean;
  lastSession: SessionResult | null;
  activity: DayActivity[];
  lifetime: LifetimeStats;
  /** Swaps the active repository (guest localStorage vs. signed-in DB) — see `StatsHydrator`. */
  setRepository: (repository: StatsRepository) => void;
  /** Call once on the client after mount — this store starts empty to stay SSR-safe. */
  hydrate: () => Promise<void>;
  recordSession: (result: SessionResult) => Promise<void>;
}

/**
 * A reactive cache around `StatsRepository` — never touches `localStorage`
 * directly. `StatsHydrator` swaps in a DB-backed repository once a user is
 * signed in; no other consuming component needs to change.
 */
export const useStatsStore = create<StatsState>((set, get) => ({
  repository: localStorageStatsRepository,
  hasHydrated: false,
  lastSession: null,
  activity: [],
  lifetime: { highestScore: 0, totalAttempts: 0, totalCorrect: 0, lifetimeAccuracy: 0 },

  setRepository: (repository) => set({ repository }),

  hydrate: async () => {
    const { repository } = get();
    const [lastSession, activity, lifetime] = await Promise.all([
      repository.getLastSession(),
      repository.getActivity(ACTIVITY_WINDOW_DAYS),
      repository.getLifetimeStats(),
    ]);
    set({ lastSession, activity, lifetime, hasHydrated: true });
  },

  recordSession: async (result: SessionResult) => {
    const { repository } = get();
    await repository.recordSession(result);
    const [lastSession, activity, lifetime] = await Promise.all([
      repository.getLastSession(),
      repository.getActivity(ACTIVITY_WINDOW_DAYS),
      repository.getLifetimeStats(),
    ]);
    set({ lastSession, activity, lifetime });
  },
}));
