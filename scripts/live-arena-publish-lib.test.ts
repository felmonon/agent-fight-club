import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { seedSeason } from "../src/data/season.ts";
import { createTempDirRegistry } from "../src/test/support/arena.ts";
import { writeLiveArenaArtifacts } from "./live-arena-publish-lib.ts";

const tempDirs = createTempDirRegistry();

afterEach(async () => {
  await tempDirs.cleanup();
});

describe("live arena publish artifacts", () => {
  it("writes dataset, latest artifacts, and archive snapshots", async () => {
    const tempDir = await tempDirs.createDir("afc-publish-artifacts-");
    const artifacts = await writeLiveArenaArtifacts(seedSeason, {
      datasetPath: path.join(tempDir, "liveArena.generated.json"),
      markdownReportPath: path.join(tempDir, "reports/latest-season.md"),
      summaryJsonPath: path.join(tempDir, "reports/latest-season.json"),
      archiveDir: path.join(tempDir, "reports/archive"),
      archiveIndexPath: path.join(tempDir, "reports/archive/index.json"),
      archiveMirrorPath: path.join(tempDir, "liveArenaArchive.generated.json"),
      publishContext: {
        presetKey: "scripted",
        presetName: "Scripted season",
        publishedAt: "2026-03-25T21:00:00.000Z"
      }
    });

    const [datasetRaw, markdownRaw, summaryRaw, archiveMarkdownRaw, archiveSummaryRaw, archiveIndexRaw, archiveMirrorRaw] = await Promise.all([
      readFile(artifacts.datasetPath, "utf8"),
      readFile(artifacts.markdownReportPath, "utf8"),
      readFile(artifacts.summaryJsonPath, "utf8"),
      readFile(artifacts.archiveMarkdownReportPath, "utf8"),
      readFile(artifacts.archiveSummaryJsonPath, "utf8"),
      readFile(artifacts.archiveIndexPath, "utf8"),
      readFile(artifacts.archiveMirrorPath, "utf8")
    ]);

    expect(datasetRaw).toContain('"agents"');
    expect(markdownRaw).toContain("# Agent Fight Club Season 01");
    expect(markdownRaw).toContain("## Top 3");
    expect(archiveMarkdownRaw).toContain("# Agent Fight Club Season 01");

    const summary = JSON.parse(summaryRaw) as {
      champion: { name: string };
      featuredFight: { headline: string };
      publish: { archiveSlug: string; presetName: string };
      reportText: string;
      source: string;
    };
    const archiveSummary = JSON.parse(archiveSummaryRaw) as {
      publish: { archiveSlug: string; presetName: string };
    };
    const archiveIndex = JSON.parse(archiveIndexRaw) as {
      entries: Array<{ slug: string; reportPath: string; summaryPath: string }>;
      latestSlug?: string;
    };

    expect(summary.source).toBe("seed");
    expect(summary.champion.name).toBe("Ghostwire");
    expect(summary.featuredFight.headline).toBe("Ghostwire vs Afterglow");
    expect(summary.reportText).toContain("Agent Fight Club Season 01");
    expect(summary.publish.presetName).toBe("Scripted season");
    expect(archiveSummary.publish.archiveSlug).toBe(summary.publish.archiveSlug);
    expect(archiveIndex.latestSlug).toBe(summary.publish.archiveSlug);
    expect(archiveIndex.entries[0]?.reportPath).toBe(`/reports/archive/${summary.publish.archiveSlug}.md`);
    expect(archiveIndex.entries[0]?.summaryPath).toBe(`/reports/archive/${summary.publish.archiveSlug}.json`);
    expect(archiveMirrorRaw).toContain(summary.publish.archiveSlug);
  });
});
