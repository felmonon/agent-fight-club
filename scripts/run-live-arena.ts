import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { runLiveArenaSeason } from "../src/arena/runner.ts";
import { buildSeasonSummaryFromData } from "../src/lib/tournament.ts";

const outputPath = path.resolve("src/data/liveArena.generated.json");

const dataset = await runLiveArenaSeason();
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

const summary = buildSeasonSummaryFromData(dataset);

console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
console.log(`Champion: ${summary.champion.agent.name} (${summary.champion.elo} Elo)`);
console.log(`Title fight: ${summary.featuredFight.headline} -> ${summary.featuredFight.finish}`);
