import path from "node:path";
import { formatArenaPresetUsage, getArenaPreset } from "./arena-presets.ts";
import { writeLiveArenaArtifacts } from "./live-arena-publish-lib.ts";
import { runLiveArenaSeason } from "../src/arena/runner.ts";
import { buildSeasonSummaryFromData } from "../src/lib/tournament.ts";

const presetKey = process.argv[2] ?? "versus";
const preset = getArenaPreset(presetKey);

if (!preset) {
  console.log(formatArenaPresetUsage());
  process.exitCode = 1;
  process.exit();
}

const dataset = await runLiveArenaSeason({
  env: {
    ...process.env,
    ...preset.env
  }
});

const summary = buildSeasonSummaryFromData(dataset);
const artifacts = await writeLiveArenaArtifacts(dataset, {
  publishContext: {
    presetKey,
    presetName: preset.name,
    publishedAt: new Date().toISOString()
  }
});

console.log(`Preset: ${preset.name}`);
console.log(preset.description);
console.log(`Wrote ${path.relative(process.cwd(), artifacts.datasetPath)}`);
console.log(`Report: ${path.relative(process.cwd(), artifacts.markdownReportPath)}`);
console.log(`Archive: reports/archive/${artifacts.archiveSlug}.md`);
console.log(`Champion: ${summary.champion.agent.name} (${summary.champion.elo} Elo)`);
console.log(`Featured fight: ${summary.featuredFight.headline} -> ${summary.featuredFight.finish}`);
