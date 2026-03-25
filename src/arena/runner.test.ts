import { afterEach, describe, expect, it, vi } from "vitest";
import { runLiveArenaSeason } from "./runner.ts";
import { computeFight } from "../lib/tournament.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it("emits fight lifecycle logs when arena logging is enabled", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runLiveArenaSeason({
      env: {
        AFC_ARENA_LOGS: "1",
        AFC_FIGHT_IDS: "live-001"
      }
    });

    const lines = logSpy.mock.calls.map(([message]) => String(message));
    expect(lines.some((line) => line.includes("[arena][fight] live-001 checkout-guard"))).toBe(true);
    expect(lines.some((line) => line.includes("[arena][corner:start] live-001 Ghostwire [scripted]"))).toBe(true);
    expect(lines.some((line) => line.includes("[arena][result] live-001 winner Ghostwire"))).toBe(true);
  });
});
