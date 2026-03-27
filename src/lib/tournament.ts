import { seedSeason } from "../data/season.ts";
import type {
  AgentProfile,
  ComputedFightReplay,
  FightReplay,
  ScoreBreakdown,
  SeasonDataset,
  SeasonSummary,
  StandingRow,
  StorylineCard,
  TaskCard
} from "./types.ts";

const SCORE_WEIGHTS = {
  correctness: 0.34,
  diffQuality: 0.23,
  runtime: 0.17,
  cost: 0.14,
  resilience: 0.12
} as const;

function compositeScore(metrics: ScoreBreakdown): number {
  const weighted =
    metrics.correctness * SCORE_WEIGHTS.correctness +
    metrics.diffQuality * SCORE_WEIGHTS.diffQuality +
    metrics.runtime * SCORE_WEIGHTS.runtime +
    metrics.cost * SCORE_WEIGHTS.cost +
    metrics.resilience * SCORE_WEIGHTS.resilience;

  return Number((weighted - metrics.penalties * 4.25).toFixed(1));
}

function computeFinish(blue: ScoreBreakdown, red: ScoreBreakdown, margin: number): string {
  const penaltyDelta = Math.abs(blue.penalties - red.penalties);
  if (penaltyDelta >= 2 && margin >= 6) {
    return "Submission";
  }
  if (margin >= 10) {
    return "KO";
  }
  if (margin >= 5) {
    return "Unanimous";
  }
  return "Split";
}

function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + 10 ** ((eloB - eloA) / 400));
}

export function computeFight(fight: FightReplay): ComputedFightReplay {
  const blueScore = compositeScore(fight.blue.metrics);
  const redScore = compositeScore(fight.red.metrics);
  const margin = Number(Math.abs(blueScore - redScore).toFixed(1));
  const blueWins = blueScore >= redScore;

  return {
    ...fight,
    blueScore,
    redScore,
    margin,
    winnerId: blueWins ? fight.blue.agentId : fight.red.agentId,
    loserId: blueWins ? fight.red.agentId : fight.blue.agentId,
    finish: computeFinish(fight.blue.metrics, fight.red.metrics, margin)
  };
}

function buildMapsFromDataset(dataset: SeasonDataset): {
  agentMap: Map<string, AgentProfile>;
  taskMap: Map<string, TaskCard>;
} {
  return {
    agentMap: new Map(dataset.agents.map((agent) => [agent.id, agent])),
    taskMap: new Map(dataset.tasks.map((task) => [task.id, task]))
  };
}

function buildRankings(computedFights: ComputedFightReplay[], dataset: SeasonDataset): StandingRow[] {
  const agentMap = new Map(
    dataset.agents.map((agent) => [
      agent.id,
      {
        agent,
        wins: 0,
        losses: 0,
        finishes: 0,
        elo: 1500,
        avgScoreTotal: 0,
        bouts: 0,
        recentForm: [] as string[]
      }
    ])
  );

  for (const fight of computedFights) {
    const blueRow = agentMap.get(fight.blue.agentId)!;
    const redRow = agentMap.get(fight.red.agentId)!;
    const blueExpected = expectedScore(blueRow.elo, redRow.elo);
    const redExpected = expectedScore(redRow.elo, blueRow.elo);
    const blueActual = fight.winnerId === fight.blue.agentId ? 1 : 0;
    const redActual = 1 - blueActual;
    const kFactor = fight.titleFight ? 32 : 24;

    blueRow.elo += kFactor * (blueActual - blueExpected);
    redRow.elo += kFactor * (redActual - redExpected);

    blueRow.avgScoreTotal += fight.blueScore;
    redRow.avgScoreTotal += fight.redScore;
    blueRow.bouts += 1;
    redRow.bouts += 1;

    blueRow.recentForm.push(blueActual === 1 ? "W" : "L");
    redRow.recentForm.push(redActual === 1 ? "W" : "L");
    blueRow.recentForm = blueRow.recentForm.slice(-5);
    redRow.recentForm = redRow.recentForm.slice(-5);

    if (blueActual === 1) {
      blueRow.wins += 1;
      redRow.losses += 1;
      if (fight.finish === "KO" || fight.finish === "Submission") {
        blueRow.finishes += 1;
      }
    } else {
      redRow.wins += 1;
      blueRow.losses += 1;
      if (fight.finish === "KO" || fight.finish === "Submission") {
        redRow.finishes += 1;
      }
    }
  }

  return Array.from(agentMap.values())
    .map((row) => ({
      agent: row.agent,
      wins: row.wins,
      losses: row.losses,
      finishes: row.finishes,
      elo: Number(row.elo.toFixed(0)),
      avgScore: row.bouts > 0 ? Number((row.avgScoreTotal / row.bouts).toFixed(1)) : 0,
      recentForm: row.recentForm
    }))
    .sort((left, right) => right.elo - left.elo || right.wins - left.wins);
}

function buildStorylines(computedFights: ComputedFightReplay[], rankings: StandingRow[]): StorylineCard[] {
  const champion = rankings[0];
  if (!champion || computedFights.length === 0) {
    return [
      {
        title: "World Champion",
        value: champion?.agent.name ?? "TBD",
        note: champion ? `${champion.elo} Elo preseason lead` : "Waiting on opening card"
      },
      {
        title: "Opening Card",
        value: "Not published",
        note: "Storylines unlock after the first scored fight lands."
      }
    ];
  }

  const widestMargin = computedFights.reduce((best, current) =>
    current.margin > best.margin ? current : best
  );
  const titleFights = computedFights.filter((fight) => fight.titleFight);
  const titleDefense = titleFights[titleFights.length - 1];
  const cleanestWinner = computedFights.reduce((best, current) => {
    const currentWinnerMetrics =
      current.winnerId === current.blue.agentId ? current.blue.metrics : current.red.metrics;
    const bestWinnerMetrics =
      best.winnerId === best.blue.agentId ? best.blue.metrics : best.red.metrics;
    return currentWinnerMetrics.diffQuality > bestWinnerMetrics.diffQuality ? current : best;
  });
  const venueCount = new Set(computedFights.map((fight) => fight.venue)).size;

  return [
    {
      title: "World Champion",
      value: champion.agent.name,
      note: `${champion.wins}-${champion.losses} record, ${champion.elo} Elo`
    },
    {
      title: "Loudest Finish",
      value: `${widestMargin.margin.toFixed(1)} pts`,
      note: `${widestMargin.headline} ended by ${widestMargin.finish}`
    },
    {
      title: "Cleanest Diff",
      value: cleanestWinner.headline,
      note: `${cleanestWinner.finish} with elite patch quality discipline`
    },
    {
      title: "Title Night",
      value: titleDefense ? titleDefense.venue : "No belt yet",
      note: `${titleFights.length} title fights across ${venueCount} arenas`
    }
  ];
}

function createPlaceholderFight(dataset: SeasonDataset): ComputedFightReplay {
  const blueAgent = dataset.agents[0];
  const redAgent = dataset.agents[1] ?? dataset.agents[0];
  const task = dataset.tasks[0];

  return {
    id: "season-preview",
    date: new Date().toISOString().slice(0, 10),
    venue: "Preview Card",
    division: "Preseason",
    taskId: task?.id ?? "preseason-task",
    headline: `${blueAgent?.name ?? "Blue"} vs ${redAgent?.name ?? "Red"}`,
    judgesMemo: "No published fights yet.",
    keyMoments: ["The leaderboard will update after the opening card lands."],
    budgetMinutes: 0,
    tokenBudgetK: 0,
    blue: {
      agentId: blueAgent?.id ?? "blue-corner",
      promptStyle: "Awaiting opening card.",
      diffSummary: "No diff yet.",
      notableMove: "Warm-up in progress.",
      metrics: {
        correctness: 0,
        diffQuality: 0,
        runtime: 0,
        cost: 0,
        resilience: 0,
        penalties: 0
      }
    },
    red: {
      agentId: redAgent?.id ?? "red-corner",
      promptStyle: "Awaiting opening card.",
      diffSummary: "No diff yet.",
      notableMove: "Warm-up in progress.",
      metrics: {
        correctness: 0,
        diffQuality: 0,
        runtime: 0,
        cost: 0,
        resilience: 0,
        penalties: 0
      }
    },
    blueScore: 0,
    redScore: 0,
    margin: 0,
    winnerId: blueAgent?.id ?? "blue-corner",
    loserId: redAgent?.id ?? "red-corner",
    finish: "No Contest"
  };
}

export function buildSeasonSummaryFromData(dataset: SeasonDataset): SeasonSummary {
  const computedFights = dataset.fights.map(computeFight);
  const rankings = buildRankings(computedFights, dataset);
  const { agentMap, taskMap } = buildMapsFromDataset(dataset);
  const featuredFight = computedFights[computedFights.length - 1] ?? createPlaceholderFight(dataset);

  return {
    champion: rankings[0],
    rankings,
    featuredFight,
    fights: [...computedFights].reverse(),
    storylines: buildStorylines(computedFights, rankings),
    taskMap,
    agentMap
  };
}

export function buildSeasonSummary(): SeasonSummary {
  return buildSeasonSummaryFromData(seedSeason);
}
