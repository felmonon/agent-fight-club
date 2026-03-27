import { describe, expect, it } from "vitest";
import type { ComputedFightReplay, TaskCard } from "../../lib/types.ts";
import { buildCapabilityProfile, capabilityFamilyForTask } from "./capabilities.ts";

function createFight(
  overrides: Partial<ComputedFightReplay> & {
    id: string;
    taskId: string;
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
    venue: "Warehouse 9",
    division: "Welterweight",
    taskId: overrides.taskId,
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
        checkSummary: { publicPassed: 3, publicTotal: 4, hiddenPassed: 2, hiddenTotal: 3 },
        robustnessScore: 82
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
        checkSummary: { publicPassed: 2, publicTotal: 4, hiddenPassed: 1, hiddenTotal: 3 },
        robustnessScore: 61
      }
    },
    blueScore: overrides.blueScore,
    redScore: overrides.redScore,
    margin: Math.abs(overrides.blueScore - overrides.redScore),
    winnerId: overrides.winnerId,
    loserId: overrides.winnerId === overrides.blueAgentId ? overrides.redAgentId : overrides.blueAgentId,
    finish: "Decision"
  } as ComputedFightReplay;
}

describe("capability profile helpers", () => {
  it("maps categories to capability families when older task data lacks an explicit family", () => {
    expect(capabilityFamilyForTask({ category: "UI/UX" })).toBe("frontend");
    expect(capabilityFamilyForTask({ category: "Data" })).toBe("data");
    expect(capabilityFamilyForTask({ category: "Security" })).toBe("security");
  });

  it("aggregates record, score, and hidden-check coverage by capability family", () => {
    const taskMap = new Map<string, TaskCard>([
      [
        "checkout-guard",
        {
          id: "checkout-guard",
          name: "Checkout Guard",
          category: "Hotfix",
          repo: "fixtures/cartline",
          stakes: "stakes",
          description: "description",
          victoryCondition: "victory"
        }
      ],
      [
        "frontend-rescue",
        {
          id: "frontend-rescue",
          name: "Frontend Rescue",
          category: "UI/UX",
          repo: "fixtures/boardlight",
          stakes: "stakes",
          description: "description",
          victoryCondition: "victory"
        }
      ]
    ]);

    const profile = buildCapabilityProfile(
      "ghostwire",
      [
        createFight({
          id: "fight-1",
          taskId: "checkout-guard",
          winnerId: "ghostwire",
          blueAgentId: "ghostwire",
          redAgentId: "ironclad",
          blueScore: 91,
          redScore: 78
        }),
        createFight({
          id: "fight-2",
          taskId: "frontend-rescue",
          winnerId: "ironclad",
          blueAgentId: "ghostwire",
          redAgentId: "ironclad",
          blueScore: 74,
          redScore: 86
        })
      ],
      taskMap
    );

    expect(profile).toHaveLength(2);
    const hotfix = profile.find((entry) => entry.family === "hotfix");
    const frontend = profile.find((entry) => entry.family === "frontend");

    expect(frontend).toMatchObject({
      family: "frontend",
      label: "Frontend repair",
      testedFights: 1,
      wins: 0,
      losses: 1,
      avgScore: 74,
      hiddenPassRate: 67,
      avgRobustness: 82
    });
    expect(hotfix).toMatchObject({
      family: "hotfix",
      label: "Hotfix reliability",
      testedFights: 1,
      wins: 1,
      losses: 0,
      avgScore: 91,
      hiddenPassRate: 67,
      avgRobustness: 82
    });
    expect(frontend?.taskNames).toEqual(["Frontend Rescue"]);
    expect(hotfix?.taskNames).toEqual(["Checkout Guard"]);
  });
});
