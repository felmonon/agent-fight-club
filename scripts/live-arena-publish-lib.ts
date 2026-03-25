import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildSeasonReportMarkdown,
  buildSeasonReportSummary,
  buildSeasonReportText
} from "./season-report-lib.ts";
import { buildSeasonSummaryFromData } from "../src/lib/tournament.ts";
import type {
  LiveArenaDataset,
  PublishedSeasonArchiveEntry,
  PublishedSeasonArchiveIndex,
  SeasonDataset
} from "../src/lib/types.ts";

export interface PublishArtifactsResult {
  datasetPath: string;
  markdownReportPath: string;
  summaryJsonPath: string;
  archiveIndexPath: string;
  archiveMirrorPath: string;
  archiveMarkdownReportPath: string;
  archiveSummaryJsonPath: string;
  archiveSlug: string;
}

export interface PublishContext {
  gitSha?: string;
  presetKey?: string;
  presetName?: string;
  publishedAt?: string;
  workflowRunUrl?: string;
}

interface PublishArtifactsOptions {
  datasetPath?: string;
  markdownReportPath?: string;
  summaryJsonPath?: string;
  archiveDir?: string;
  archiveIndexPath?: string;
  archiveMirrorPath?: string;
  publishContext?: PublishContext;
}

function resolveArtifactPath(customPath: string | undefined, fallback: string) {
  return path.resolve(customPath ?? fallback);
}

function toSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildArchiveSlug(publishedAt: string, presetKey?: string) {
  const timestamp = publishedAt.replace(/[:.]/g, "-");
  const preset = toSlugPart(presetKey ?? "scripted") || "scripted";
  return `season-01-${timestamp}-${preset}`;
}

function isLiveArenaDataset(dataset: SeasonDataset): dataset is LiveArenaDataset {
  return typeof (dataset as Partial<LiveArenaDataset>).generatedAt === "string";
}

function normalizeArchiveIndex(value: unknown): PublishedSeasonArchiveIndex | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Partial<PublishedSeasonArchiveIndex>;
  if (!Array.isArray(candidate.entries)) {
    return undefined;
  }

  return {
    generatedAt: typeof candidate.generatedAt === "string" ? candidate.generatedAt : new Date().toISOString(),
    latestSlug: typeof candidate.latestSlug === "string" ? candidate.latestSlug : undefined,
    entries: candidate.entries.filter((entry): entry is PublishedSeasonArchiveEntry => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      const record = entry as Partial<PublishedSeasonArchiveEntry>;
      return (
        typeof record.slug === "string" &&
        typeof record.title === "string" &&
        typeof record.reportPath === "string" &&
        typeof record.summaryPath === "string" &&
        typeof record.publishedAt === "string"
      );
    })
  };
}

async function loadArchiveIndex(indexPath: string): Promise<PublishedSeasonArchiveIndex> {
  try {
    const raw = await readFile(indexPath, "utf8");
    const parsed = normalizeArchiveIndex(JSON.parse(raw));
    if (parsed) {
      return parsed;
    }
  } catch {
    // Fresh publish path: no archive file yet.
  }

  return {
    generatedAt: new Date().toISOString(),
    entries: []
  };
}

export async function writeLiveArenaArtifacts(
  dataset: SeasonDataset,
  options: PublishArtifactsOptions = {}
): Promise<PublishArtifactsResult> {
  const datasetPath = resolveArtifactPath(options.datasetPath, "src/data/liveArena.generated.json");
  const markdownReportPath = resolveArtifactPath(
    options.markdownReportPath,
    "public/reports/latest-season.md"
  );
  const summaryJsonPath = resolveArtifactPath(
    options.summaryJsonPath,
    "public/reports/latest-season.json"
  );
  const archiveDir = resolveArtifactPath(options.archiveDir, "public/reports/archive");
  const archiveIndexPath = resolveArtifactPath(options.archiveIndexPath, "public/reports/archive/index.json");
  const archiveMirrorPath = resolveArtifactPath(
    options.archiveMirrorPath,
    "src/data/liveArenaArchive.generated.json"
  );

  const reportSource =
    typeof (dataset as Partial<LiveArenaDataset>).source === "string" ? "generated" : "seed";
  const datasetSource = isLiveArenaDataset(dataset) ? dataset.source : "seed-season";
  const generatedAt =
    reportSource === "generated" ? (dataset as Partial<LiveArenaDataset>).generatedAt : undefined;
  const publishedAt =
    options.publishContext?.publishedAt ??
    (isLiveArenaDataset(dataset) ? dataset.runMeta?.publishedAt : undefined) ??
    generatedAt ??
    new Date().toISOString();
  const archiveSlug = buildArchiveSlug(
    publishedAt,
    options.publishContext?.presetKey ?? (isLiveArenaDataset(dataset) ? dataset.runMeta?.publishPreset : undefined)
  );
  const archiveMarkdownReportPath = path.join(archiveDir, `${archiveSlug}.md`);
  const archiveSummaryJsonPath = path.join(archiveDir, `${archiveSlug}.json`);
  const publicArchiveReportPath = `/reports/archive/${archiveSlug}.md`;
  const publicArchiveSummaryPath = `/reports/archive/${archiveSlug}.json`;
  const summary = buildSeasonSummaryFromData(dataset);
  const reportText = buildSeasonReportText(dataset, reportSource, generatedAt);
  const reportMarkdown = buildSeasonReportMarkdown(dataset, reportSource, generatedAt);

  const datasetToWrite: SeasonDataset | LiveArenaDataset = isLiveArenaDataset(dataset)
    ? {
        ...dataset,
        runMeta: {
          ...dataset.runMeta,
          publishPreset:
            options.publishContext?.presetKey ?? dataset.runMeta?.publishPreset,
          publishPresetName:
            options.publishContext?.presetName ?? dataset.runMeta?.publishPresetName,
          publishedAt,
          gitSha: options.publishContext?.gitSha ?? dataset.runMeta?.gitSha,
          reportSlug: archiveSlug,
          workflowRunUrl:
            options.publishContext?.workflowRunUrl ?? dataset.runMeta?.workflowRunUrl
        }
      }
    : dataset;
  const providers =
    isLiveArenaDataset(datasetToWrite) ? datasetToWrite.runMeta?.providers ?? [] : [];
  const reportSummary = {
    ...buildSeasonReportSummary(summary, reportSource, generatedAt),
    datasetSource,
    providers,
    publish: {
      publishedAt,
      presetKey:
        options.publishContext?.presetKey ??
        (isLiveArenaDataset(datasetToWrite) ? datasetToWrite.runMeta?.publishPreset : undefined),
      presetName:
        options.publishContext?.presetName ??
        (isLiveArenaDataset(datasetToWrite) ? datasetToWrite.runMeta?.publishPresetName : undefined),
      gitSha:
        options.publishContext?.gitSha ??
        (isLiveArenaDataset(datasetToWrite) ? datasetToWrite.runMeta?.gitSha : undefined),
      workflowRunUrl:
        options.publishContext?.workflowRunUrl ??
        (isLiveArenaDataset(datasetToWrite) ? datasetToWrite.runMeta?.workflowRunUrl : undefined),
      archiveSlug,
      reportPath: publicArchiveReportPath,
      summaryPath: publicArchiveSummaryPath
    }
  };
  const archiveEntry: PublishedSeasonArchiveEntry = {
    slug: archiveSlug,
    title: `Season 01 • ${reportSummary.publish.presetName ?? "Published card"}`,
    datasetSource,
    reportSource,
    generatedAt,
    publishedAt,
    publishPreset: reportSummary.publish.presetKey,
    publishPresetName: reportSummary.publish.presetName,
    gitSha: reportSummary.publish.gitSha,
    providers,
    workflowRunUrl: reportSummary.publish.workflowRunUrl,
    reportPath: publicArchiveReportPath,
    summaryPath: publicArchiveSummaryPath,
    champion: reportSummary.champion,
    featuredFight: reportSummary.featuredFight
  };

  await Promise.all([
    mkdir(path.dirname(datasetPath), { recursive: true }),
    mkdir(path.dirname(markdownReportPath), { recursive: true }),
    mkdir(path.dirname(summaryJsonPath), { recursive: true }),
    mkdir(archiveDir, { recursive: true }),
    mkdir(path.dirname(archiveMirrorPath), { recursive: true })
  ]);

  const existingArchive = await loadArchiveIndex(archiveIndexPath);
  const archiveEntries = [
    archiveEntry,
    ...existingArchive.entries.filter((entry) => entry.slug !== archiveEntry.slug)
  ].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  const archiveIndex: PublishedSeasonArchiveIndex = {
    generatedAt: publishedAt,
    latestSlug: archiveEntries[0]?.slug,
    entries: archiveEntries
  };

  await Promise.all([
    writeFile(datasetPath, `${JSON.stringify(datasetToWrite, null, 2)}\n`, "utf8"),
    writeFile(markdownReportPath, `${reportMarkdown}\n`, "utf8"),
    writeFile(
      summaryJsonPath,
      `${JSON.stringify(
        {
          ...reportSummary,
          reportText
        },
        null,
        2
      )}\n`,
      "utf8"
    ),
    writeFile(archiveMarkdownReportPath, `${reportMarkdown}\n`, "utf8"),
    writeFile(
      archiveSummaryJsonPath,
      `${JSON.stringify(
        {
          ...reportSummary,
          reportText
        },
        null,
        2
      )}\n`,
      "utf8"
    ),
    writeFile(archiveIndexPath, `${JSON.stringify(archiveIndex, null, 2)}\n`, "utf8"),
    writeFile(archiveMirrorPath, `${JSON.stringify(archiveIndex, null, 2)}\n`, "utf8")
  ]);

  return {
    datasetPath,
    markdownReportPath,
    summaryJsonPath,
    archiveIndexPath,
    archiveMirrorPath,
    archiveMarkdownReportPath,
    archiveSummaryJsonPath,
    archiveSlug
  };
}
