import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { fights, seedSeason } from "../src/data/season.ts";
import {
  buildSeasonReportText,
  loadSeasonReportDataset
} from "./season-report-lib.ts";
import type { LiveArenaDataset } from "../src/lib/types.ts";

const cleanupDirs: string[] = [];

afterEach(async () => {
  await Promise.all(cleanupDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("season report dataset loader", () => {
  it("prefers the generated live arena dataset when one is available", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "afc-season-report-"));
    cleanupDirs.push(tempDir);

    const generatedPath = path.join(tempDir, "liveArena.generated.json");
    const generatedDataset: LiveArenaDataset = {
      ...seedSeason,
      fights: [
        ...fights.slice(0, -1),
        {
          ...fights.at(-1)!,
          headline: "Live Fixture Final"
        }
      ],
      generatedAt: "2026-03-25T20:00:00.000Z",
      notes: [],
      source: "live-arena-runner"
    };

    await writeFile(generatedPath, `${JSON.stringify(generatedDataset, null, 2)}\n`, "utf8");

    const reportDataset = await loadSeasonReportDataset({
      generatedPath,
      fallbackDataset: seedSeason
    });

    expect(reportDataset.source).toBe("generated");
    expect(reportDataset.generatedAt).toBe("2026-03-25T20:00:00.000Z");

    const reportText = buildSeasonReportText(
      reportDataset.data,
      reportDataset.source,
      reportDataset.generatedAt
    );

    expect(reportText).toContain("Source: generated live arena dataset");
    expect(reportText).toContain("Featured fight: Live Fixture Final");
  });

  it("falls back to the seed dataset when the generated file is missing", async () => {
    const reportDataset = await loadSeasonReportDataset({
      generatedPath: path.join(os.tmpdir(), "afc-missing-liveArena.generated.json"),
      fallbackDataset: seedSeason
    });

    expect(reportDataset.source).toBe("seed");
    expect(reportDataset.data).toEqual(seedSeason);

    const reportText = buildSeasonReportText(reportDataset.data, reportDataset.source);

    expect(reportText).toContain("Source: seed season dataset");
    expect(reportText).toContain("Featured fight: Ghostwire vs Afterglow");
  });
});
