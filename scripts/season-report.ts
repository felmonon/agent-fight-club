import { buildSeasonSummary } from "../src/lib/tournament.ts";

const season = buildSeasonSummary();

console.log("Agent Fight Club Season 01");
console.log("==========================");
console.log(`Champion: ${season.champion.agent.name} (${season.champion.elo} Elo)`);
console.log(`Record: ${season.champion.wins}-${season.champion.losses}`);
console.log(`Featured fight: ${season.featuredFight.headline} by ${season.featuredFight.finish}`);
console.log("");
console.log("Top 3");
season.rankings.slice(0, 3).forEach((row, index) => {
  console.log(`${index + 1}. ${row.agent.name} | ${row.wins}-${row.losses} | Avg ${row.avgScore}`);
});
