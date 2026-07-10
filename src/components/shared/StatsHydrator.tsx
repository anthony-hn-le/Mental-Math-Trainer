"use client";

import { useEffect } from "react";
import { useStatsStore } from "@/stores/statsStore";

/** Triggers the one-time client-side load of guest stats from localStorage. Renders nothing. */
export function StatsHydrator() {
  useEffect(() => {
    void useStatsStore.getState().hydrate();
  }, []);

  return null;
}
