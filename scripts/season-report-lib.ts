import { readFile } from "node:fs/promises";
import path from "node:path";
import { seedSeason } from "../src/data/season.ts";
import { buildSeasonSummaryFromData } from "../src/lib/tournament.ts";
import type { LiveArenaDataset, SeasonDataset, SeasonSummary } from "../src/lib/types.ts";

export interface LoadedSeasonReportDataset {
  data: SeasonDataset;
  generatedAt?: string;
  source: "generated" | "seed";
}

interface LoadSeasonReportDatasetOptions {
  fallbackDataset?: SeasonDataset;
  generatedPath?: string;
}

function isSeasonDataset(value: unknown): value is SeasonDataset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SeasonDataset>;
  return (
    Array.isArray(candidate.agents) &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.fights)
  );
}

function resolveGeneratedDatasetPath(customPath?: string) {
  return customPath ?? path.resolve("src/data/liveArena.generated.json");
}

export async function loadSeasonReportDataset(
  options: LoadSeasonReportDatasetOptions = {}
): Promise<LoadedSeasonReportDataset> {
  const fallbackDataset = options.fallbackDataset ?? seedSeason;
  const generatedPath = resolveGeneratedDatasetPath(options.generatedPath);

  try {
    const raw = await readFile(generatedPath, "utf8");
    const parsed = JSON.parse(raw) as LiveArenaDataset;

    if (!isSeasonDataset(parsed)) {
      throw new Error("Generated dataset has an invalid shape.");
    }

    return {
      data: parsed,
      generatedAt: parsed.generatedAt,
      source: "generated"
    };
  } catch {
    return {
      data: fallbackDataset,
      source: "seed"
    };
  }
}

export function buildSeasonReportText(dataset: SeasonDataset, source: LoadedSeasonReportDataset["source"], generatedAt?: string) {
  const season = buildSeasonSummaryFromData(dataset);
  const lines = [
    "Agent Fight Club Season 01",
    "==========================",
    `Source: ${source === "generated" ? "generated live arena dataset" : "seed season dataset"}`
  ];

  if (source === "generated" && generatedAt) {
    lines.push(`Generated: ${generatedAt}`);
  }

  lines.push(
    `Champion: ${season.champion.agent.name} (${season.champion.elo} Elo)`,
    `Record: ${season.champion.wins}-${season.champion.losses}`,
    `Featured fight: ${season.featuredFight.headline} by ${season.featuredFight.finish}`,
    "",
    "Top 3"
  );

  season.rankings.slice(0, 3).forEach((row, index) => {
    lines.push(`${index + 1}. ${row.agent.name} | ${row.wins}-${row.losses} | Avg ${row.avgScore}`);
  });

  return lines.join("\n");
}

export function buildSeasonReportMarkdown(
  dataset: SeasonDataset,
  source: LoadedSeasonReportDataset["source"],
  generatedAt?: string
) {
  const season = buildSeasonSummaryFromData(dataset);
  const lines = [
    "# Agent Fight Club Season 01",
    "",
    `- Source: ${source === "generated" ? "generated live arena dataset" : "seed season dataset"}`
  ];

  if (source === "generated" && generatedAt) {
    lines.push(`- Generated: ${generatedAt}`);
  }

  lines.push(
    `- Champion: ${season.champion.agent.name} (${season.champion.elo} Elo)`,
    `- Record: ${season.champion.wins}-${season.champion.losses}`,
    `- Featured fight: ${season.featuredFight.headline} by ${season.featuredFight.finish}`,
    "",
    "## Top 3"
  );

  season.rankings.slice(0, 3).forEach((row, index) => {
    lines.push(`${index + 1}. ${row.agent.name} | ${row.wins}-${row.losses} | Avg ${row.avgScore}`);
  });

  lines.push("", "## Storylines");
  season.storylines.forEach((storyline) => {
    lines.push(`- ${storyline.title}: ${storyline.value} — ${storyline.note}`);
  });

  return lines.join("\n");
}

export function buildSeasonReportSummary(
  season: SeasonSummary,
  source: LoadedSeasonReportDataset["source"],
  generatedAt?: string
) {
  return {
    source,
    generatedAt,
    champion: {
      id: season.champion.agent.id,
      name: season.champion.agent.name,
      elo: season.champion.elo,
      record: `${season.champion.wins}-${season.champion.losses}`
    },
    featuredFight: {
      id: season.featuredFight.id,
      headline: season.featuredFight.headline,
      finish: season.featuredFight.finish
    },
    topThree: season.rankings.slice(0, 3).map((row) => ({
      id: row.agent.id,
      name: row.agent.name,
      record: `${row.wins}-${row.losses}`,
      avgScore: row.avgScore
    })),
    storylines: season.storylines
  };
}
