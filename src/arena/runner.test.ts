import { describe, expect, it } from "vitest";
import { runLiveArenaSeason } from "./runner.ts";
import { computeFight } from "../lib/tournament.ts";

describe("live arena runner", () => {
  it("executes live fixture fights and produces a champion-grade card", async () => {
    const dataset = await runLiveArenaSeason();
    expect(dataset.source).toBe("live-arena-runner");
    expect(dataset.fights).toHaveLength(6);
    expect(dataset.tasks).toHaveLength(3);

    const titleFight = dataset.fights.find((fight) => fight.titleFight);
    expect(titleFight).toBeDefined();
    expect(titleFight?.blue.metrics.correctness).toBeGreaterThan(0);

    const computedTitleFight = computeFight(titleFight!);
    expect(computedTitleFight.winnerId).toBe("ghostwire");
  });
});
