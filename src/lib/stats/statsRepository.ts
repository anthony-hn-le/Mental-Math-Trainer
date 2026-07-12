import type { DayActivity, LifetimeStats, SessionResult } from "./types";

/**
 * The Phase-2 seam: `statsStore` depends only on this interface, never on
 * `localStorage` directly. A future DB-backed implementation (NextAuth +
 * Prisma + Supabase Postgres, not built in this MVP) can implement this same
 * interface behind an API route with zero changes to any UI component.
 */
export interface StatsRepository {
  recordSession(result: SessionResult): void | Promise<void>;
  getLastSession(): SessionResult | null | Promise<SessionResult | null>;
  /** Newest-first, for the homepage score trend chart. */
  getRecentSessions(limit: number): SessionResult[] | Promise<SessionResult[]>;
  getActivity(days: number): DayActivity[] | Promise<DayActivity[]>;
  getLifetimeStats(): LifetimeStats | Promise<LifetimeStats>;
}
