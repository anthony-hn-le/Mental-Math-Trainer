export interface WeightedTier<T> {
  weight: number;
  value: T;
}

export function pickWeighted<T>(tiers: WeightedTier<T>[], rng: () => number = Math.random): T {
  const total = tiers.reduce((sum, t) => sum + t.weight, 0);
  let r = rng() * total;
  for (const tier of tiers) {
    if (r < tier.weight) return tier.value;
    r -= tier.weight;
  }
  return tiers[tiers.length - 1].value;
}
