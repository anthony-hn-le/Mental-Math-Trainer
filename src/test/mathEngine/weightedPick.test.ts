import { describe, expect, it } from "vitest";
import { pickWeighted } from "@/lib/mathEngine/weightedPick";

describe("pickWeighted", () => {
  const tiers = [
    { weight: 15, value: "a" },
    { weight: 10, value: "b" },
    { weight: 75, value: "c" },
  ];

  it("picks the first tier at the lower boundary", () => {
    const rng = () => 0;
    expect(pickWeighted(tiers, rng)).toBe("a");
  });

  it("picks the tier just past the first boundary", () => {
    const rng = () => 15.0001 / 100;
    expect(pickWeighted(tiers, rng)).toBe("b");
  });

  it("picks the last tier near the upper boundary", () => {
    const rng = () => 0.999999;
    expect(pickWeighted(tiers, rng)).toBe("c");
  });

  it("falls back to the last tier if rng() returns exactly 1", () => {
    const rng = () => 1;
    expect(pickWeighted(tiers, rng)).toBe("c");
  });

  it("distributes roughly according to weights over many draws", () => {
    let a = 0;
    let b = 0;
    let c = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) {
      const value = pickWeighted(tiers);
      if (value === "a") a++;
      else if (value === "b") b++;
      else c++;
    }
    expect(a / n).toBeGreaterThan(0.1);
    expect(a / n).toBeLessThan(0.2);
    expect(b / n).toBeGreaterThan(0.05);
    expect(b / n).toBeLessThan(0.15);
    expect(c / n).toBeGreaterThan(0.7);
    expect(c / n).toBeLessThan(0.8);
  });
});
