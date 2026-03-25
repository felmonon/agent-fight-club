import { describe, expect, it } from "vitest";
import { runLiveArenaSeason } from "./runner.ts";
import { computeFight } from "../lib/tournament.ts";

describe("live arena runner", () => {
  it("executes live fixture fights and produces a champion-grade card", async () => {
    const dataset = await runLiveArenaSeason({ env: {} });
    expect(dataset.source).toBe("live-arena-runner");
    expect(dataset.fights).toHaveLength(6);
    expect(dataset.tasks).toHaveLength(3);
    expect(dataset.runMeta?.providers).toContain("scripted");

    const titleFight = dataset.fights.find((fight) => fight.titleFight);
    expect(titleFight).toBeDefined();
    expect(titleFight?.blue.metrics.correctness).toBeGreaterThan(0);
    expect(titleFight?.watchable).toBe(true);
    expect(titleFight?.blue.capture?.provider).toBe("scripted");
    expect(titleFight?.blue.capture?.transcript?.[0]?.channel).toBe("user");

    const computedTitleFight = computeFight(titleFight!);
    expect(computedTitleFight.winnerId).toBe("ghostwire");
  });
});
