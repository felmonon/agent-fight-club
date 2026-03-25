import liveArenaData from "../../data/liveArena.generated.json";
import { buildSeasonSummaryFromData, computeFight } from "../../lib/tournament.ts";
import type {
  ComputedFightReplay,
  LiveArenaDataset,
  ScoreBreakdown,
  TaskCard as ArenaTaskCard
} from "../../lib/types.ts";

export interface Agent {
  id: string;
  name: string;
  modelName: string;
  provider: string;
  tier?: "S" | "A" | "B" | "C";
  rank: number;
  elo: number;
  wins: number;
  losses: number;
  winStreak: number;
  finishes: number;
  avgCost: number;
  avgRuntime: number;
  efficiency: number;
  trend: "up" | "down" | "stable";
  rankChange: number;
  tags: string[];
  style: string;
  strengths: string[];
  weaknesses: string[];
  lastFight: string;
  signatureWin?: string;
  worstLoss?: string;
  organization?: string;
}

export interface Fight {
  id: string;
  agentA: string;
  agentB: string;
  winner: string;
  taskType: string;
  repository: string;
  status: "scheduled" | "live" | "completed";
  timestamp: string;
  rounds: number;
  scoreA: number;
  scoreB: number;
  budgetUsedA: number;
  budgetUsedB: number;
  runtimeA: number;
  runtimeB: number;
}

export interface Task {
  id: string;
  name: string;
  category: string;
  difficulty: "TRIVIAL" | "STANDARD" | "COMPLEX" | "BRUTAL";
  repository: string;
  constraints: {
    budget: number;
    timeout: number;
    tools: string[];
  };
  failureModes: string[];
  completionRate: number;
  avgAttempts: number;
}

export interface SeasonStats {
  season: number;
  startDate: string;
  endDate: string;
  nextSeasonDate: string;
  totalFights: number;
  biggestUpset: {
    winner: string;
    loser: string;
    eloDiff: number;
    task: string;
  };
  mostDominant: {
    agent: string;
    streak: number;
    avgScore: number;
  };
  highestEfficiency: {
    agent: string;
    avgCost: number;
    avgRuntime: number;
  };
  controversialDecision: {
    fightId: string;
    agentA: string;
    agentB: string;
    dispute: string;
  };
}

const liveDataset = liveArenaData as LiveArenaDataset;
const computedFights = liveDataset.fights.map(computeFight);
const seasonSummary = buildSeasonSummaryFromData(liveDataset);
const previousSeasonSummary =
  liveDataset.fights.length > 1
    ? buildSeasonSummaryFromData({ ...liveDataset, fights: liveDataset.fights.slice(0, -1) })
    : seasonSummary;

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;

const roundTo = (value: number, decimals = 0): number => Number(value.toFixed(decimals));
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const normalizeLabel = (value: string): string =>
  value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const titleCase = (value: string): string =>
  normalizeLabel(value)
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
const toTaskType = (value: string): string =>
  normalizeLabel(value)
    .toUpperCase()
    .replace(/\s+/g, "_");

const metricLabels: Array<{ key: keyof Omit<ScoreBreakdown, "penalties">; label: string }> = [
  { key: "correctness", label: "Correctness under review" },
  { key: "diffQuality", label: "Clean diffs" },
  { key: "runtime", label: "Runtime pace" },
  { key: "cost", label: "Cost discipline" },
  { key: "resilience", label: "Pressure handling" }
];

const taskToolsByCategory: Record<string, string[]> = {
  Hotfix: ["test-runner", "diff-review", "static-check"],
  Security: ["scanner", "audit-log", "policy-check"],
  Performance: ["profiler", "benchmark", "analyzer"]
};

const failureModesByCategory: Record<string, string[]> = {
  Hotfix: ["Regression spillover", "Coupon logic drift", "Broken helper contract"],
  Security: ["Auth bypass", "Token leakage", "Session invalidation bugs"],
  Performance: ["False speedups", "State corruption", "Benchmark overfitting"]
};

function tierForRank(rank: number): Agent["tier"] {
  if (rank === 1) return "S";
  if (rank === 2) return "A";
  if (rank === 3) return "B";
  return "C";
}

function estimateSpend(fight: ComputedFightReplay, corner: "blue" | "red"): number {
  const capture = fight[corner].capture;
  const tokenEstimateK = capture?.tokenEstimateK ?? fight.tokenBudgetK * (corner === "blue" ? 0.28 : 0.32);
  return roundTo(Math.min(1.4, tokenEstimateK / 100), 2);
}

function estimateRuntime(fight: ComputedFightReplay, corner: "blue" | "red"): number {
  const captureDuration = fight[corner].capture?.durationMs;
  if (captureDuration && captureDuration > 0) {
    return Math.max(20, Math.round(captureDuration / 1000));
  }

  const runtimeScore = fight[corner].metrics.runtime;
  return Math.max(45, Math.round(fight.budgetMinutes * (1.35 - runtimeScore / 100) * 20));
}

function roundsForFight(fight: ComputedFightReplay): number {
  return clamp(Math.round(fight.budgetMinutes / 2), 3, 5);
}

function strengthProfile(agentId: string): { strengths: string[]; weaknesses: string[] } {
  const appearances = computedFights.flatMap((fight) => {
    if (fight.blue.agentId === agentId) return [fight.blue.metrics];
    if (fight.red.agentId === agentId) return [fight.red.metrics];
    return [];
  });

  const metricAverages = metricLabels.map(({ key, label }) => ({
    label,
    value: average(appearances.map((metrics) => metrics[key]))
  }));
  const strongest = [...metricAverages].sort((left, right) => right.value - left.value).slice(0, 3);
  const weakest = [...metricAverages].sort((left, right) => left.value - right.value).slice(0, 2);

  return {
    strengths: strongest.map((entry) => entry.label),
    weaknesses: weakest.map((entry) => entry.label)
  };
}

function currentWinStreak(agentId: string): number {
  const results = computedFights
    .filter((fight) => fight.blue.agentId === agentId || fight.red.agentId === agentId)
    .map((fight) => fight.winnerId === agentId);

  let streak = 0;
  for (let index = results.length - 1; index >= 0; index -= 1) {
    if (!results[index]) break;
    streak += 1;
  }

  return streak;
}

function buildNarrativeRecord(agentId: string, didWin: boolean): string | undefined {
  const relevantFights = computedFights.filter((fight) =>
    didWin ? fight.winnerId === agentId : fight.loserId === agentId
  );
  const targetFight = relevantFights.sort((left, right) => right.margin - left.margin)[0];
  if (!targetFight) return undefined;

  const opponentId = didWin ? targetFight.loserId : targetFight.winnerId;
  const opponent = seasonSummary.agentMap.get(opponentId);
  const task = seasonSummary.taskMap.get(targetFight.taskId);
  if (!opponent || !task) return undefined;

  return `vs ${opponent.name} in ${task.name.toLowerCase()}`;
}

function buildCompletedFight(fight: ComputedFightReplay): Fight {
  const task = seasonSummary.taskMap.get(fight.taskId);

  return {
    id: fight.id,
    agentA: seasonSummary.agentMap.get(fight.blue.agentId)?.name ?? fight.blue.agentId,
    agentB: seasonSummary.agentMap.get(fight.red.agentId)?.name ?? fight.red.agentId,
    winner: seasonSummary.agentMap.get(fight.winnerId)?.name ?? fight.winnerId,
    taskType: toTaskType(task?.name ?? fight.taskId),
    repository: task?.repo ?? fight.venue,
    status: "completed",
    timestamp: new Date(`${fight.date}T18:00:00Z`).toISOString(),
    rounds: roundsForFight(fight),
    scoreA: fight.blueScore,
    scoreB: fight.redScore,
    budgetUsedA: estimateSpend(fight, "blue"),
    budgetUsedB: estimateSpend(fight, "red"),
    runtimeA: estimateRuntime(fight, "blue"),
    runtimeB: estimateRuntime(fight, "red")
  };
}

function buildTask(task: ArenaTaskCard): Task {
  const relatedFights = computedFights.filter((fight) => fight.taskId === task.id);
  const correctnessScores = relatedFights.flatMap((fight) => [
    fight.blue.metrics.correctness,
    fight.red.metrics.correctness
  ]);
  const penaltyScores = relatedFights.flatMap((fight) => [
    fight.blue.metrics.penalties,
    fight.red.metrics.penalties
  ]);
  const completionRate = clamp(Math.round(average(correctnessScores) - average(penaltyScores) * 12), 28, 98);
  const difficulty: Task["difficulty"] =
    completionRate < 45 ? "BRUTAL" : completionRate < 65 ? "COMPLEX" : completionRate < 80 ? "STANDARD" : "TRIVIAL";
  const averageBudget = relatedFights.length > 0 ? average(relatedFights.map((fight) => fight.tokenBudgetK / 200)) : 1;

  return {
    id: task.id,
    name: toTaskType(task.name),
    category: task.category.toUpperCase(),
    difficulty,
    repository: task.repo,
    constraints: {
      budget: roundTo(averageBudget, 1),
      timeout: Math.max(...relatedFights.map((fight) => fight.budgetMinutes * 60), 300),
      tools: taskToolsByCategory[task.category] ?? ["test-runner", "workspace-diff", "review-check"]
    },
    failureModes:
      failureModesByCategory[task.category] ?? ["Missed regression", "Over-wide diff", "Weak review notes"],
    completionRate,
    avgAttempts: roundTo(1.2 + (100 - completionRate) / 25, 1)
  };
}

export const tasks: Task[] = liveDataset.tasks.map(buildTask);

const completedFights = computedFights
  .map(buildCompletedFight)
  .sort((left, right) => right.timestamp.localeCompare(left.timestamp));

const previousRankMap = new Map(
  previousSeasonSummary.rankings.map((row, index) => [row.agent.id, index + 1] as const)
);

const baseAgents = seasonSummary.rankings.map((row, index): Agent => {
  const rank = index + 1;
  const appearances = computedFights.filter(
    (fight) => fight.blue.agentId === row.agent.id || fight.red.agentId === row.agent.id
  );
  const rankChange = (previousRankMap.get(row.agent.id) ?? rank) - rank;
  const spendSamples = appearances.map((fight) =>
    estimateSpend(fight, fight.blue.agentId === row.agent.id ? "blue" : "red")
  );
  const runtimeSamples = appearances.map((fight) =>
    estimateRuntime(fight, fight.blue.agentId === row.agent.id ? "blue" : "red")
  );
  const { strengths, weaknesses } = strengthProfile(row.agent.id);

  return {
    id: row.agent.id,
    name: row.agent.name,
    modelName: row.agent.name,
    provider: row.agent.lab,
    tier: tierForRank(rank),
    rank,
    elo: row.elo,
    wins: row.wins,
    losses: row.losses,
    winStreak: currentWinStreak(row.agent.id),
    finishes: row.finishes,
    avgCost: roundTo(average(spendSamples), 2),
    avgRuntime: Math.round(average(runtimeSamples)),
    efficiency: Math.round(row.avgScore),
    trend: rankChange > 0 ? "up" : rankChange < 0 ? "down" : "stable",
    rankChange,
    tags: [],
    style: row.agent.style.toUpperCase(),
    strengths,
    weaknesses,
    lastFight: appearances.at(-1)
      ? new Date(`${appearances.at(-1)!.date}T18:00:00Z`).toISOString()
      : liveDataset.generatedAt,
    signatureWin: buildNarrativeRecord(row.agent.id, true),
    worstLoss: buildNarrativeRecord(row.agent.id, false),
    organization: liveDataset.runMeta?.providers?.join(" / ") ?? "scripted"
  };
});

const efficientLeader = [...baseAgents].sort((left, right) => left.avgCost - right.avgCost)[0];
const finisherLeader = [...baseAgents].sort((left, right) => right.finishes - left.finishes)[0];
const risingLeader = [...baseAgents].sort((left, right) => right.rankChange - left.rankChange)[0];

export const agents: Agent[] = baseAgents.map((agent) => {
  const tags: string[] = [];

  if (agent.rank === 1) tags.push("CHAMPION");
  if (agent.id === efficientLeader?.id) tags.push("MOST EFFICIENT");
  if (agent.id === risingLeader?.id && agent.rankChange > 0) tags.push("RISING STAR");
  if (agent.id === finisherLeader?.id && agent.finishes > 0) tags.push("DOMINANT");
  if (agent.losses > agent.wins) tags.push("UNDER REVIEW");
  if (tags.length === 0 && agent.winStreak >= 2) tags.push("IN FORM");
  if (tags.length === 0) tags.push("ACTIVE");

  return {
    ...agent,
    tags: tags.slice(0, 3)
  };
});

function buildLiveFight(source: Fight): Fight {
  return {
    ...source,
    id: `${source.id}-live`,
    status: "live",
    winner: "",
    timestamp: liveDataset.generatedAt,
    scoreA: 0,
    scoreB: 0,
    budgetUsedA: roundTo(source.budgetUsedA * 0.72, 2),
    budgetUsedB: roundTo(source.budgetUsedB * 0.68, 2)
  };
}

function buildScheduledFight(): Fight {
  const [champion, contender, backup] = agents;
  const featuredTask = [...tasks].sort((left, right) => left.completionRate - right.completionRate)[0];
  const challenger = contender?.id === champion?.id ? backup : contender;
  const kickoff = new Date(Date.parse(liveDataset.generatedAt) + 4 * 60 * 60 * 1000);

  return {
    id: "scheduled-main-event",
    agentA: champion?.modelName ?? "Ghostwire",
    agentB: challenger?.modelName ?? "Ironclad",
    winner: "",
    taskType: featuredTask?.name ?? "FEATURE_FIGHT",
    repository: featuredTask?.repository ?? "fixtures/arena",
    status: "scheduled",
    timestamp: kickoff.toISOString(),
    rounds: 5,
    scoreA: 0,
    scoreB: 0,
    budgetUsedA: 0,
    budgetUsedB: 0,
    runtimeA: 0,
    runtimeB: 0
  };
}

const liveFight = completedFights[0] ? buildLiveFight(completedFights[0]) : undefined;
const scheduledFight = buildScheduledFight();

export const fights: Fight[] = [
  ...(liveFight ? [liveFight] : []),
  ...completedFights,
  scheduledFight
];

function biggestUpsetStats(): SeasonStats["biggestUpset"] {
  const indexedAgents = new Map(agents.map((agent) => [agent.modelName, agent]));
  const upset = completedFights.reduce<Fight | undefined>((best, fight) => {
    const winner = indexedAgents.get(fight.winner);
    const loser = fight.winner === fight.agentA ? indexedAgents.get(fight.agentB) : indexedAgents.get(fight.agentA);
    if (!winner || !loser || winner.rank < loser.rank) return best;
    if (!best) return fight;

    const bestWinner = indexedAgents.get(best.winner);
    const bestLoser = best.winner === best.agentA ? indexedAgents.get(best.agentB) : indexedAgents.get(best.agentA);
    const currentGap = Math.abs(winner.elo - loser.elo);
    const bestGap = bestWinner && bestLoser ? Math.abs(bestWinner.elo - bestLoser.elo) : -1;
    return currentGap > bestGap ? fight : best;
  }, undefined);

  const fallbackFight = upset ?? completedFights.at(-1) ?? completedFights[0];
  if (!fallbackFight) {
    return {
      winner: "Ghostwire",
      loser: "Ironclad",
      eloDiff: 0,
      task: "Feature Fight"
    };
  }

  const winner = indexedAgents.get(fallbackFight.winner);
  const loser = fallbackFight.winner === fallbackFight.agentA
    ? indexedAgents.get(fallbackFight.agentB)
    : indexedAgents.get(fallbackFight.agentA);

  return {
    winner: fallbackFight.winner,
    loser: loser?.modelName ?? "Contender",
    eloDiff: winner && loser ? Math.abs(winner.elo - loser.elo) : 0,
    task: titleCase(fallbackFight.taskType)
  };
}

const dominantAgent = [...agents].sort((left, right) => {
  if (right.winStreak !== left.winStreak) return right.winStreak - left.winStreak;
  return right.efficiency - left.efficiency;
})[0];

const mostEfficientAgent = [...agents].sort((left, right) => left.avgCost - right.avgCost)[0];

const controversialFight =
  [...completedFights].sort(
    (left, right) => Math.abs(left.scoreA - left.scoreB) - Math.abs(right.scoreA - right.scoreB)
  )[0] ?? completedFights[0];

const firstFightTimestamp = computedFights[0]
  ? new Date(`${computedFights[0].date}T18:00:00Z`).toISOString()
  : liveDataset.generatedAt;
const seasonEndDate = new Date(Date.parse(liveDataset.generatedAt) + 21 * 24 * 60 * 60 * 1000).toISOString();
const nextSeasonDate = new Date(Date.parse(seasonEndDate) + 14 * 24 * 60 * 60 * 1000).toISOString();

export const seasonStats: SeasonStats = {
  season: 1,
  startDate: firstFightTimestamp.slice(0, 10),
  endDate: seasonEndDate.slice(0, 10),
  nextSeasonDate: nextSeasonDate.slice(0, 10),
  totalFights: completedFights.length,
  biggestUpset: biggestUpsetStats(),
  mostDominant: {
    agent: dominantAgent?.modelName ?? "Ghostwire",
    streak: dominantAgent?.winStreak ?? 0,
    avgScore: dominantAgent?.efficiency ?? 0
  },
  highestEfficiency: {
    agent: mostEfficientAgent?.modelName ?? "Ghostwire",
    avgCost: mostEfficientAgent?.avgCost ?? 0,
    avgRuntime: mostEfficientAgent?.avgRuntime ?? 0
  },
  controversialDecision: {
    fightId: controversialFight?.id ?? "main-event",
    agentA: controversialFight?.agentA ?? "Ghostwire",
    agentB: controversialFight?.agentB ?? "Ironclad",
    dispute: controversialFight
      ? `Split on ${titleCase(controversialFight.taskType)} scoring after a ${Math.abs(
          controversialFight.scoreA - controversialFight.scoreB
        ).toFixed(1)} point margin.`
      : "Judges disagreed on weighted scoring priorities."
  }
};
