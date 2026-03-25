import { describe, expect, it } from "vitest";
import { buildSeasonSummary, computeFight } from "./tournament.ts";
import { fights } from "../data/season.ts";

describe("tournament engine", () => {
  it("computes winners from the composite score", () => {
    const result = computeFight(fights[0]);
    expect(result.winnerId).toBe("ironclad");
    expect(result.finish).toBe("Submission");
    expect(result.blueScore).toBeGreaterThan(result.redScore);
  });

  it("builds a stable champion-led season summary", () => {
    const summary = buildSeasonSummary();
    expect(summary.champion.agent.id).toBe("ghostwire");
    expect(summary.rankings).toHaveLength(6);
    expect(summary.featuredFight.titleFight).toBe(true);
  });
});
