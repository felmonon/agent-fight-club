import liveArenaData from "../../data/liveArena.generated.json";
import liveArenaArchiveData from "../../data/liveArenaArchive.generated.json";
import {
  buildCapabilityProfile,
  capabilityFamilyForTask,
  capabilityLabelForFamily,
  type CapabilityProfileEntry
} from "./capabilities.ts";
import { buildSeasonSummaryFromData, computeFight } from "../../lib/tournament.ts";
import type {
  CapabilityFamily,
  ComputedFightReplay,
  FightCheckSummary,
  FightTranscriptEntry,
  LiveArenaDataset,
  PublishedSeasonArchiveEntry,
  PublishedSeasonArchiveIndex,
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
  status: "scheduled" | "completed";
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
  capabilityFamily: CapabilityFamily;
  capabilityLabel: string;
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

export interface AgentHistoryPoint {
  date: string;
  elo: number;
  rank: number;
  winRate: number;
  wins: number;
  losses: number;
}

export interface FightCornerInsight {
  promptStyle: string;
  diffSummary: string;
  notableMove: string;
  metrics: ScoreBreakdown;
  changedFiles: string[];
  changedLineCount: number;
  checkSummary?: FightCheckSummary;
  durationMs?: number;
  model?: string;
  provider: string;
  robustnessScore?: number;
  transcript: FightTranscriptEntry[];
  stdoutTail?: string;
  stderrTail?: string;
  tokenEstimateK: number;
  workspaceNotes: string[];
}

export interface FightInsight {
  fight: Fight;
  task?: Task;
  judgesMemo: string;
  keyMoments: string[];
  finish?: string;
  margin?: number;
  blue: FightCornerInsight;
  red: FightCornerInsight;
}

export interface LiveArenaMeta {
  generatedAt: string;
  notes: string[];
  providers: string[];
  publishedReportPath: string;
  publishedSummaryPath: string;
  source: string;
  archiveCount: number;
  archiveIndexPath: string;
  latestArchiveReportPath?: string;
  latestArchiveSummaryPath?: string;
  gitSha?: string;
  publishPreset?: string;
  publishPresetName?: string;
  publishedAt?: string;
  transcriptVersion?: number;
  workflowRunUrl?: string;
}

const liveDataset = liveArenaData as LiveArenaDataset;
const archiveDataset = liveArenaArchiveData as PublishedSeasonArchiveIndex;
const computedFights = liveDataset.fights.map(computeFight);
const seasonSummary = buildSeasonSummaryFromData(liveDataset);
export const publishedSeasons: PublishedSeasonArchiveEntry[] = archiveDataset.entries;
export const latestPublishedSeason = publishedSeasons[0];
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
  "UI/UX": ["accessibility-audit", "layout-review", "interaction-smoke"],
  Security: ["scanner", "audit-log", "policy-check"],
  Data: ["pipeline-replay", "fixture-compare", "state-audit"],
  Performance: ["profiler", "benchmark", "analyzer"]
};

const failureModesByCategory: Record<string, string[]> = {
  Hotfix: ["Regression spillover", "Coupon logic drift", "Broken helper contract"],
  "UI/UX": ["Layout collapse", "Keyboard trap", "Component drift"],
  Security: ["Auth bypass", "Token leakage", "Session invalidation bugs"],
  Data: ["State corruption", "Silent duplication", "Retry storm"],
  Performance: ["False speedups", "State corruption", "Benchmark overfitting"]
};

function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + 10 ** ((eloB - eloA) / 400));
}

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
  const capabilityFamily = capabilityFamilyForTask(task) ?? "hotfix";

  return {
    capabilityFamily,
    capabilityLabel: capabilityLabelForFamily(capabilityFamily),
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
const displayTaskMap = new Map(tasks.map((task) => [task.id, task] as const));

export const completedFights: Fight[] = computedFights
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

export const latestCompletedFight = completedFights[0];
export const scheduledFights: Fight[] = [buildScheduledFight()];

export const fights: Fight[] = [
  ...completedFights,
  ...scheduledFights
];

const computedFightMap = new Map(computedFights.map((fight) => [fight.id, fight] as const));
const taskByTypeMap = new Map(tasks.map((task) => [task.name, task] as const));

function buildCornerInsight(fight: ComputedFightReplay, corner: "blue" | "red"): FightCornerInsight {
  const capture = fight[corner].capture;

  return {
    promptStyle: fight[corner].promptStyle,
    diffSummary: fight[corner].diffSummary,
    notableMove: fight[corner].notableMove,
    metrics: fight[corner].metrics,
    changedFiles: capture?.changedFiles ?? [],
    changedLineCount: capture?.changedLineCount ?? 0,
    checkSummary: capture?.checkSummary,
    durationMs: capture?.durationMs,
    model: capture?.model,
    provider: capture?.provider ?? "scripted",
    robustnessScore: capture?.robustnessScore,
    transcript: capture?.transcript ?? [],
    stdoutTail: capture?.stdoutTail,
    stderrTail: capture?.stderrTail,
    tokenEstimateK: capture?.tokenEstimateK ?? 0,
    workspaceNotes: capture?.workspaceNotes ?? []
  };
}

function buildFightInsight(fight: Fight): FightInsight | undefined {
  const sourceFightId = fight.id.endsWith("-live") ? fight.id.slice(0, -5) : fight.id;
  const computedFight = computedFightMap.get(sourceFightId);
  const rawTask = computedFight ? seasonSummary.taskMap.get(computedFight.taskId) : undefined;
  const task = rawTask ? displayTaskMap.get(rawTask.id) : taskByTypeMap.get(fight.taskType);

  if (!computedFight) {
    return {
      fight,
      task,
      judgesMemo: "Main-event preview is locked in. Replay evidence will publish once the bout closes.",
      keyMoments: [
        "Same repo, same budget, same tool belt.",
        "Both corners enter under the standard AFC scoring contract.",
        "Final replay evidence will publish after the fight resolves."
      ],
      blue: {
        promptStyle: "Awaiting fight kickoff.",
        diffSummary: "No diff yet.",
        notableMove: "Warm-up in progress.",
        metrics: { correctness: 0, diffQuality: 0, runtime: 0, cost: 0, resilience: 0, penalties: 0 },
        changedFiles: [],
        changedLineCount: 0,
        provider: "scheduled",
        transcript: [],
        tokenEstimateK: 0,
        workspaceNotes: []
      },
      red: {
        promptStyle: "Awaiting fight kickoff.",
        diffSummary: "No diff yet.",
        notableMove: "Warm-up in progress.",
        metrics: { correctness: 0, diffQuality: 0, runtime: 0, cost: 0, resilience: 0, penalties: 0 },
        changedFiles: [],
        changedLineCount: 0,
        provider: "scheduled",
        transcript: [],
        tokenEstimateK: 0,
        workspaceNotes: []
      }
    };
  }

  return {
    fight,
    task,
    judgesMemo: computedFight.judgesMemo,
    keyMoments: computedFight.keyMoments,
    finish: computedFight.finish,
    margin: computedFight.margin,
    blue: buildCornerInsight(computedFight, "blue"),
    red: buildCornerInsight(computedFight, "red")
  };
}

export function getFightInsight(fightId: string): FightInsight | undefined {
  const fight = fights.find((entry) => entry.id === fightId);
  return fight ? buildFightInsight(fight) : undefined;
}

function fightCornerForAgent(fight: ComputedFightReplay, agentId: string): "blue" | "red" | undefined {
  if (fight.blue.agentId === agentId) {
    return "blue";
  }
  if (fight.red.agentId === agentId) {
    return "red";
  }
  return undefined;
}

export function getAgentComputedFights(agentId: string): ComputedFightReplay[] {
  return computedFights.filter((fight) => fightCornerForAgent(fight, agentId));
}

function buildAgentHistoryMap(): Map<string, AgentHistoryPoint[]> {
  const tracker = new Map(
    liveDataset.agents.map((agent) => [
      agent.id,
      {
        elo: 1500,
        wins: 0,
        losses: 0,
        history: [] as AgentHistoryPoint[]
      }
    ])
  );

  const chronologicalFights = [...computedFights].sort((left, right) =>
    `${left.date}-${left.id}`.localeCompare(`${right.date}-${right.id}`)
  );

  for (const fight of chronologicalFights) {
    const blue = tracker.get(fight.blue.agentId)!;
    const red = tracker.get(fight.red.agentId)!;
    const blueExpected = expectedScore(blue.elo, red.elo);
    const redExpected = expectedScore(red.elo, blue.elo);
    const blueWon = fight.winnerId === fight.blue.agentId;
    const blueActual = blueWon ? 1 : 0;
    const redActual = 1 - blueActual;
    const kFactor = fight.titleFight ? 32 : 24;

    blue.elo += kFactor * (blueActual - blueExpected);
    red.elo += kFactor * (redActual - redExpected);
    blue.wins += blueWon ? 1 : 0;
    blue.losses += blueWon ? 0 : 1;
    red.wins += blueWon ? 0 : 1;
    red.losses += blueWon ? 1 : 0;

    const rankings = Array.from(tracker.entries())
      .sort((left, right) => right[1].elo - left[1].elo || right[1].wins - left[1].wins)
      .map(([agentId], index) => [agentId, index + 1] as const);
    const rankMap = new Map(rankings);
    const formattedDate = new Date(`${fight.date}T18:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });

    blue.history.push({
      date: formattedDate,
      elo: Number(blue.elo.toFixed(0)),
      rank: rankMap.get(fight.blue.agentId) ?? liveDataset.agents.length,
      winRate: Number(((blue.wins / (blue.wins + blue.losses)) * 100).toFixed(1)),
      wins: blue.wins,
      losses: blue.losses
    });
    red.history.push({
      date: formattedDate,
      elo: Number(red.elo.toFixed(0)),
      rank: rankMap.get(fight.red.agentId) ?? liveDataset.agents.length,
      winRate: Number(((red.wins / (red.wins + red.losses)) * 100).toFixed(1)),
      wins: red.wins,
      losses: red.losses
    });
  }

  return new Map(
    Array.from(tracker.entries()).map(([agentId, value]) => [agentId, value.history] as const)
  );
}

const agentHistoryMap = buildAgentHistoryMap();

export function getAgentHistory(agentId: string): AgentHistoryPoint[] {
  return agentHistoryMap.get(agentId) ?? [];
}

export function getAgentCapabilityProfile(agentId: string): CapabilityProfileEntry[] {
  return buildCapabilityProfile(agentId, computedFights, seasonSummary.taskMap);
}

export const liveArenaMeta: LiveArenaMeta = {
  generatedAt: liveDataset.generatedAt,
  notes: liveDataset.notes,
  providers: liveDataset.runMeta?.providers ?? [],
  publishedReportPath: "/reports/latest-season.md",
  publishedSummaryPath: "/reports/latest-season.json",
  source: liveDataset.source,
  archiveCount: publishedSeasons.length,
  archiveIndexPath: "/reports/archive/index.json",
  latestArchiveReportPath: latestPublishedSeason?.reportPath,
  latestArchiveSummaryPath: latestPublishedSeason?.summaryPath,
  gitSha: liveDataset.runMeta?.gitSha,
  publishPreset: liveDataset.runMeta?.publishPreset,
  publishPresetName: liveDataset.runMeta?.publishPresetName,
  publishedAt: liveDataset.runMeta?.publishedAt,
  transcriptVersion: liveDataset.runMeta?.transcriptVersion,
  workflowRunUrl: liveDataset.runMeta?.workflowRunUrl
};

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
