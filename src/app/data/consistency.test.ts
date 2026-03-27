import { describe, expect, it } from "vitest";
import type { ComputedFightReplay } from "../../lib/types.ts";
import { buildConsistencyProfile } from "./consistency.ts";

function createFight(
  overrides: Partial<ComputedFightReplay> & {
    id: string;
    winnerId: string;
    blueAgentId: string;
    redAgentId: string;
    blueScore: number;
    redScore: number;
  }
): ComputedFightReplay {
  return {
    id: overrides.id,
    date: "2026-03-01",
    venue: "Arena",
    division: "Main",
    taskId: "checkout-guard",
    headline: "Test Fight",
    judgesMemo: "memo",
    keyMoments: [],
    budgetMinutes: 10,
    tokenBudgetK: 120,
    blue: {
      agentId: overrides.blueAgentId,
      promptStyle: "prompt",
      diffSummary: "diff",
      notableMove: "move",
      metrics: { correctness: 90, diffQuality: 90, runtime: 90, cost: 90, resilience: 90, penalties: 0 },
      capture: {
        provider: "scripted",
        checkSummary: { publicPassed: 3, publicTotal: 4, hiddenPassed: 2, hiddenTotal: 3 }
      }
    },
    red: {
      agentId: overrides.redAgentId,
      promptStyle: "prompt",
      diffSummary: "diff",
      notableMove: "move",
      metrics: { correctness: 80, diffQuality: 80, runtime: 80, cost: 80, resilience: 80, penalties: 0 },
      capture: {
        provider: "scripted",
        checkSummary: { publicPassed: 2, publicTotal: 4, hiddenPassed: 1, hiddenTotal: 3 }
      }
    },
    blueScore: overrides.blueScore,
    redScore: overrides.redScore,
    margin: Math.abs(overrides.blueScore - overrides.redScore),
    winnerId: overrides.winnerId,
    loserId: overrides.winnerId === overrides.blueAgentId ? overrides.redAgentId : overrides.blueAgentId,
    finish: "Decision",
    seriesId: overrides.seriesId,
    seriesBout: overrides.seriesBout,
    seriesSize: overrides.seriesSize
  } as ComputedFightReplay;
}

describe("consistency profile", () => {
  it("combines sample size, variance, hidden checks, and series count into confidence", () => {
    const profile = buildConsistencyProfile("ghostwire", [
      createFight({
        id: "fight-1",
        winnerId: "ghostwire",
        blueAgentId: "ghostwire",
        redAgentId: "ironclad",
        blueScore: 90,
        redScore: 72,
        seriesId: "series-a",
        seriesBout: 1,
        seriesSize: 2
      }),
      createFight({
        id: "fight-2",
        winnerId: "ghostwire",
        blueAgentId: "ghostwire",
        redAgentId: "ironclad",
        blueScore: 84,
        redScore: 70,
        seriesId: "series-a",
        seriesBout: 2,
        seriesSize: 2
      }),
      createFight({
        id: "fight-3",
        winnerId: "cinder",
        blueAgentId: "cinder",
        redAgentId: "ghostwire",
        blueScore: 82,
        redScore: 81,
        seriesId: "series-b",
        seriesBout: 1,
        seriesSize: 1
      })
    ]);

    expect(profile).toMatchObject({
      bouts: 3,
      seriesCount: 2,
      hiddenPassRate: 56,
      confidenceLabel: "Solid"
    });
    expect(profile.scoreSpread).toBeGreaterThan(3);
    expect(profile.consistency).toBeLessThan(90);
    expect(profile.confidence).toBeGreaterThanOrEqual(60);
    expect(profile.summary).toContain("3 scored fights");
    expect(profile.summary).toContain("2 series");
  });

  it("returns an early profile when the agent has no fights yet", () => {
    expect(buildConsistencyProfile("ghostwire", [])).toEqual({
      bouts: 0,
      confidence: 0,
      confidenceLabel: "Early",
      consistency: 0,
      hiddenPassRate: null,
      scoreSpread: 0,
      seriesCount: 0,
      summary: "No scored fights yet."
    });
  });
});
