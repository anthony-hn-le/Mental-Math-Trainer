"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useStatsStore } from "@/stores/statsStore";
import { localStorageStatsRepository } from "@/lib/stats/localStorageStatsRepository";
import { dbStatsRepository } from "@/lib/stats/dbStatsRepository";

/**
 * Picks the active `StatsRepository` (guest localStorage vs. signed-in DB)
 * based on auth status, then (re)hydrates the store. Renders nothing.
 */
export function StatsHydrator() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    useStatsStore.getState().setRepository(status === "authenticated" ? dbStatsRepository : localStorageStatsRepository);
    void useStatsStore.getState().hydrate();
  }, [status]);

  return null;
}
