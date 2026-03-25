import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { getArenaPreset } from "./arena-presets.ts";
import { writeLiveArenaArtifacts } from "./live-arena-publish-lib.ts";
import { buildSeasonSummaryFromData } from "../src/lib/tournament.ts";
import { runLiveArenaSeason } from "../src/arena/runner.ts";

const execFileAsync = promisify(execFile);
const presetKey = process.argv[2] ?? process.env.AFC_PUBLISH_PRESET ?? "scripted";
const preset = getArenaPreset(presetKey);

async function resolveGitSha() {
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA.slice(0, 12);
  }

  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--short=12", "HEAD"]);
    return stdout.trim() || undefined;
  } catch {
    return undefined;
  }
}

function resolveWorkflowRunUrl() {
  const serverUrl = process.env.GITHUB_SERVER_URL;
  const repository = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;

  if (!serverUrl || !repository || !runId) {
    return undefined;
  }

  return `${serverUrl}/${repository}/actions/runs/${runId}`;
}

if (!preset) {
  console.error(`Unknown publish preset: ${presetKey}`);
  process.exitCode = 1;
  process.exit();
}

const publishedAt = new Date().toISOString();
const gitSha = await resolveGitSha();
const dataset = await runLiveArenaSeason({
  env: {
    ...process.env,
    ...preset.env
  }
});

const summary = buildSeasonSummaryFromData(dataset);
const artifacts = await writeLiveArenaArtifacts(dataset, {
  publishContext: {
    gitSha,
    presetKey,
    presetName: preset.name,
    publishedAt,
    workflowRunUrl: resolveWorkflowRunUrl()
  }
});

console.log(`Published preset: ${preset.name}`);
console.log(preset.description);
console.log(`Dataset: ${path.relative(process.cwd(), artifacts.datasetPath)}`);
console.log(`Markdown report: ${path.relative(process.cwd(), artifacts.markdownReportPath)}`);
console.log(`Summary JSON: ${path.relative(process.cwd(), artifacts.summaryJsonPath)}`);
console.log(`Archive entry: reports/archive/${artifacts.archiveSlug}.md`);
console.log(`Champion: ${summary.champion.agent.name} (${summary.champion.elo} Elo)`);
console.log(`Featured fight: ${summary.featuredFight.headline} -> ${summary.featuredFight.finish}`);
