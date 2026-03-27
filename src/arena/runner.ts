import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { getLiveAgentRegistry } from "./agents.ts";
import { liveTasks } from "./tasks.ts";
import type {
  ArenaAgentAdapter,
  ArenaAgentExecution,
  ArenaCornerResult,
  ArenaDiffStats,
  ArenaFightPlan,
  ArenaRunResult,
  ArenaTaskDefinition
} from "./types.ts";
import type { FightCornerCapture, FightReplay, FightTranscriptEntry, ScoreBreakdown } from "../lib/types.ts";
import { computeFight } from "../lib/tournament.ts";

const LOG_TAIL_MAX_LENGTH = 1800;
const TRANSCRIPT_ENTRY_LIMIT = 14;
const TRANSCRIPT_TEXT_MAX_LENGTH = 520;
const DEFAULT_ARENA_HEARTBEAT_MS = 15_000;

interface ArenaLoggingConfig {
  enabled: boolean;
  heartbeatMs: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value);
}

function parseCsv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function trimText(value: string, maxLength = TRANSCRIPT_TEXT_MAX_LENGTH): string {
  const text = value.trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function deriveCorrectness(evaluation: Awaited<ReturnType<ArenaTaskDefinition["evaluate"]>>): number {
  const summary = evaluation.checkSummary;
  if (!summary) {
    return round((evaluation.passedChecks / evaluation.totalChecks) * 100);
  }

  const publicRate = summary.publicTotal > 0 ? summary.publicPassed / summary.publicTotal : 0;
  const hiddenRate = summary.hiddenTotal > 0 ? summary.hiddenPassed / summary.hiddenTotal : publicRate;
  return round((publicRate * 0.35 + hiddenRate * 0.65) * 100);
}

function tailText(value: string, maxLength = LOG_TAIL_MAX_LENGTH): string {
  const text = value.trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `…${text.slice(text.length - (maxLength - 1))}`;
}

function formatDurationMs(durationMs: number): string {
  const roundedSeconds = Math.round(durationMs / 100) / 10;
  return `${roundedSeconds}s`;
}

function resolveArenaLoggingConfig(env: Record<string, string | undefined>): ArenaLoggingConfig {
  const heartbeatMs = Number(env.AFC_ARENA_HEARTBEAT_MS ?? DEFAULT_ARENA_HEARTBEAT_MS);
  return {
    enabled: env.AFC_ARENA_LOGS === "1" || env.GITHUB_ACTIONS === "true",
    heartbeatMs: Number.isFinite(heartbeatMs) && heartbeatMs > 0 ? heartbeatMs : DEFAULT_ARENA_HEARTBEAT_MS
  };
}

function logArena(config: ArenaLoggingConfig, message: string) {
  if (config.enabled) {
    console.log(message);
  }
}

function describeCorner(fightId: string, agent: ArenaAgentAdapter, task: ArenaTaskDefinition): string {
  return `${fightId} ${agent.profile.name} [${agent.provider}] on ${task.card.id}`;
}

function normalizeTranscriptEntry(entry: FightTranscriptEntry): FightTranscriptEntry {
  return {
    ...entry,
    text: trimText(entry.text)
  };
}

function limitTranscript(entries: FightTranscriptEntry[]): FightTranscriptEntry[] {
  if (entries.length <= TRANSCRIPT_ENTRY_LIMIT) {
    return entries;
  }

  const head = entries[0];
  const tail = entries.slice(-(TRANSCRIPT_ENTRY_LIMIT - 2));
  const omittedCount = entries.length - tail.length - 1;

  return [
    head,
    {
      channel: "system",
      title: "Transcript truncated",
      text: `${omittedCount} earlier event${omittedCount === 1 ? "" : "s"} omitted from the saved replay.`
    },
    ...tail
  ];
}

function buildCornerCapture(
  task: ArenaTaskDefinition,
  execution: ArenaAgentExecution,
  diffStats: ArenaDiffStats,
  durationMs: number,
  evaluation: Awaited<ReturnType<ArenaTaskDefinition["evaluate"]>>
): FightCornerCapture {
  const transcript = (execution.capture?.transcript ?? []).map(normalizeTranscriptEntry);
  const baseTranscript: FightTranscriptEntry[] = [];

  if (!transcript.some((entry) => entry.channel === "user")) {
    baseTranscript.push({
      channel: "user",
      title: `${task.card.name} brief`,
      text: trimText(`${task.prompt}\nVictory condition: ${task.card.victoryCondition}`)
    });
  }

  baseTranscript.push(...transcript);

  if (!baseTranscript.some((entry) => entry.channel === "assistant")) {
    baseTranscript.push({
      channel: "assistant",
      title: "Corner summary",
      text: trimText(
        `${execution.promptStyle}\n${execution.diffSummary}\nNotable move: ${execution.notableMove}`
      )
    });
  }

  if (diffStats.changedFiles.length > 0) {
    baseTranscript.push({
      channel: "tool",
      title: "Workspace diff",
      text: trimText(
        `${diffStats.changedFiles.join(", ")} changed across ${diffStats.changedLineCount} touched lines.`
      )
    });
  }

  if (evaluation.notes[0]) {
    baseTranscript.push({
      channel: "system",
      title: "Fixture verdict",
      text: trimText(evaluation.notes[0])
    });
  }

  const workspaceNotes = Array.from(
    new Set(
      [
        ...execution.warnings,
        ...evaluation.reviewFlags,
        ...evaluation.notes,
        ...(execution.capture?.workspaceNotes ?? [])
      ].filter(Boolean)
    )
  );

  return {
    provider: execution.capture?.provider ?? "scripted",
    model: execution.capture?.model,
    durationMs: round(durationMs),
    tokenEstimateK: execution.tokenEstimateK,
    changedFiles: diffStats.changedFiles,
    changedLineCount: diffStats.changedLineCount,
    checkSummary: evaluation.checkSummary,
    robustnessScore: evaluation.robustnessScore,
    stdoutTail: execution.capture?.stdoutTail ? tailText(execution.capture.stdoutTail) : undefined,
    stderrTail: execution.capture?.stderrTail ? tailText(execution.capture.stderrTail) : undefined,
    transcript: limitTranscript(baseTranscript),
    workspaceNotes: workspaceNotes.length > 0 ? workspaceNotes : execution.capture?.workspaceNotes
  };
}

async function materializeTask(task: ArenaTaskDefinition, workspaceDir: string): Promise<Map<string, string>> {
  const snapshot = new Map<string, string>();

  for (const file of task.files) {
    const targetPath = path.join(workspaceDir, file.path);
    await writeFile(targetPath, file.content, "utf8");
    snapshot.set(file.path, file.content);
  }

  return snapshot;
}

async function computeDiffStats(
  workspaceDir: string,
  snapshot: Map<string, string>
): Promise<ArenaDiffStats> {
  const changedFiles: string[] = [];
  let changedLineCount = 0;

  for (const [relativePath, original] of snapshot.entries()) {
    const current = await readFile(path.join(workspaceDir, relativePath), "utf8");
    if (current === original) {
      continue;
    }

    changedFiles.push(relativePath);
    const originalLines = original.split("\n");
    const currentLines = current.split("\n");
    changedLineCount += Math.max(originalLines.length, currentLines.length);
  }

  return {
    changedFiles,
    changedLineCount
  };
}

function deriveMetrics(
  execution: ArenaAgentExecution,
  evaluation: Awaited<ReturnType<ArenaTaskDefinition["evaluate"]>>,
  diffStats: ArenaDiffStats,
  durationMs: number
): ScoreBreakdown {
  const correctness = deriveCorrectness(evaluation);
  const penalties = execution.warnings.length + evaluation.reviewFlags.length;
  const diffPenalty =
    Math.max(0, diffStats.changedFiles.length - 1) * 8 +
    Math.max(0, diffStats.changedLineCount - 18) * 0.8 +
    evaluation.reviewFlags.length * 8 +
    execution.warnings.length * 5;
  const diffQuality = clamp(round(98 - diffPenalty), 35, 98);
  const runtime = clamp(round(evaluation.performanceScore - durationMs / 18), 35, 99);
  const cost = clamp(
    round(98 - execution.tokenEstimateK * 0.52 - diffStats.changedFiles.length * 3),
    28,
    98
  );
  const resilience = clamp(
    round(95 - evaluation.reviewFlags.length * 13 - execution.warnings.length * 7 + (correctness === 100 ? 3 : 0)),
    20,
    99
  );

  return {
    correctness,
    diffQuality,
    runtime,
    cost,
    resilience,
    penalties
  };
}

function deriveKeyMoments(
  blue: ArenaCornerResult,
  red: ArenaCornerResult,
  winnerName: string,
  loserName: string
): string[] {
  const moments = [
    `${winnerName} landed ${
      blue.metrics.correctness === red.metrics.correctness
        ? "the cleaner review line"
        : blue.metrics.correctness > red.metrics.correctness
          ? "the cleaner correctness line"
          : "the better pressure answer"
    }.`,
    `${loserName} ${
      red.evaluation.reviewFlags.length > 0 || blue.evaluation.reviewFlags.length > 0
        ? "picked up avoidable review heat."
        : "kept the fight close on execution."
    }`,
    blue.evaluation.notes[0] ?? red.evaluation.notes[0] ?? "The fixture exposed real code-path tradeoffs."
  ];

  return moments;
}

function deriveJudgesMemo(
  fight: ReturnType<typeof computeFight>,
  blueAgent: ArenaAgentAdapter,
  redAgent: ArenaAgentAdapter,
  blue: ArenaCornerResult,
  red: ArenaCornerResult
): string {
  const winner = fight.winnerId === fight.blue.agentId ? blueAgent.profile.name : redAgent.profile.name;
  const loser = fight.loserId === fight.blue.agentId ? blueAgent.profile.name : redAgent.profile.name;
  const winnerCorner = fight.winnerId === fight.blue.agentId ? blue : red;
  const loserCorner = fight.winnerId === fight.blue.agentId ? red : blue;

  if (winnerCorner.metrics.diffQuality > loserCorner.metrics.diffQuality + 8) {
    return `${winner} beat ${loser} by surviving the repo with a cleaner patch shape and fewer review liabilities.`;
  }
  if (winnerCorner.metrics.runtime > loserCorner.metrics.runtime + 8) {
    return `${winner} beat ${loser} by solving the task while owning the speed column.`;
  }
  if (winnerCorner.metrics.correctness > loserCorner.metrics.correctness) {
    return `${winner} beat ${loser} because the fix actually closed more of the real problem surface.`;
  }
  return `${winner} edged ${loser} by stacking small advantages across correctness, restraint, and review safety.`;
}

async function runCorner(
  fightId: string,
  agent: ArenaAgentAdapter,
  task: ArenaTaskDefinition,
  logging: ArenaLoggingConfig
): Promise<ArenaCornerResult> {
  const workspaceDir = await mkdtemp(path.join(os.tmpdir(), `afc-${task.card.id}-${agent.profile.id}-`));
  const startedAt = performance.now();
  const label = describeCorner(fightId, agent, task);
  const heartbeatHandle =
    logging.enabled
      ? setInterval(() => {
          const elapsedMs = performance.now() - startedAt;
          logArena(
            logging,
            `[arena][heartbeat] ${label} still running after ${formatDurationMs(elapsedMs)}.`
          );
        }, logging.heartbeatMs)
      : undefined;

  heartbeatHandle?.unref();

  try {
    logArena(logging, `[arena][corner:start] ${label} started.`);
    const snapshot = await materializeTask(task, workspaceDir);
    const execution = await agent.run({ fightId, task, workspaceDir });
    const durationMs = performance.now() - startedAt;
    const evaluation = await task.evaluate(workspaceDir);
    const diffStats = await computeDiffStats(workspaceDir, snapshot);
    logArena(
      logging,
      `[arena][corner:done] ${label} finished in ${formatDurationMs(durationMs)} with ${evaluation.passedChecks}/${evaluation.totalChecks} checks and ${diffStats.changedFiles.length} changed file(s).`
    );

    return {
      ...execution,
      capture: buildCornerCapture(task, execution, diffStats, durationMs, evaluation),
      durationMs,
      evaluation,
      diffStats,
      metrics: deriveMetrics(execution, evaluation, diffStats, durationMs)
    };
  } catch (error) {
    const durationMs = performance.now() - startedAt;
    const details = error instanceof Error ? error.message : String(error);
    logArena(logging, `[arena][corner:error] ${label} failed after ${formatDurationMs(durationMs)}.`);
    throw new Error(
      `[arena] ${label} failed after ${formatDurationMs(durationMs)}.\n${details}`,
      error instanceof Error ? { cause: error } : undefined
    );
  } finally {
    clearInterval(heartbeatHandle);
    await rm(workspaceDir, { recursive: true, force: true });
  }
}

const fightPlan: ArenaFightPlan[] = [
  {
    id: "live-001",
    date: "2026-03-24",
    venue: "Fixture Hall",
    division: "Hotfix Eliminator",
    taskId: "checkout-guard",
    blueAgentId: "ghostwire",
    redAgentId: "ironclad"
  },
  {
    id: "live-002",
    date: "2026-03-24",
    venue: "Profiler Cage",
    division: "Performance Feature Fight",
    taskId: "dedupe-dojo",
    blueAgentId: "blackboxer",
    redAgentId: "cinder"
  },
  {
    id: "live-003",
    date: "2026-03-24",
    venue: "Seal Room",
    division: "Security Main Card",
    taskId: "session-shield",
    blueAgentId: "ghostwire",
    redAgentId: "blackboxer"
  },
  {
    id: "live-004",
    date: "2026-03-24",
    venue: "Seal Room",
    division: "Security Eliminator",
    taskId: "session-shield",
    blueAgentId: "ironclad",
    redAgentId: "cinder"
  },
  {
    id: "live-005",
    date: "2026-03-24",
    venue: "Profiler Cage",
    division: "Title Eliminator",
    taskId: "dedupe-dojo",
    blueAgentId: "ghostwire",
    redAgentId: "cinder"
  },
  {
    id: "live-006",
    date: "2026-03-24",
    venue: "World Engine",
    division: "World Title",
    taskId: "checkout-guard",
    blueAgentId: "ghostwire",
    redAgentId: "ironclad",
    titleFight: true
  }
];

function requireAgent(id: string, agents: ArenaAgentAdapter[]): ArenaAgentAdapter {
  const agent = agents.find((candidate) => candidate.profile.id === id);
  if (!agent) {
    throw new Error(`Unknown live agent: ${id}`);
  }
  return agent;
}

function requireTask(id: string): ArenaTaskDefinition {
  const task = liveTasks.find((candidate) => candidate.card.id === id);
  if (!task) {
    throw new Error(`Unknown live task: ${id}`);
  }
  return task;
}

export async function runLiveArenaSeason(
  options: { env?: Record<string, string | undefined> } = {}
): Promise<ArenaRunResult> {
  const env = options.env ?? process.env;
  const logging = resolveArenaLoggingConfig(env);
  const { agents: activeAgents, notes: registryNotes } = getLiveAgentRegistry(env);
  const selectedFightIds = parseCsv(env.AFC_FIGHT_IDS);
  const plannedFights =
    selectedFightIds.length > 0
      ? fightPlan.filter((fight) => selectedFightIds.includes(fight.id))
      : fightPlan;

  if (plannedFights.length === 0) {
    throw new Error(`AFC_FIGHT_IDS did not match any fights: ${selectedFightIds.join(", ")}`);
  }

  const fights: FightReplay[] = [];
  logArena(
    logging,
    `[arena][season:start] Running ${plannedFights.length} fight(s) with providers: ${Array.from(new Set(activeAgents.map((agent) => agent.provider))).join(", ")}.`
  );

  for (const plan of plannedFights) {
    const blueAgent = requireAgent(plan.blueAgentId, activeAgents);
    const redAgent = requireAgent(plan.redAgentId, activeAgents);
    const task = requireTask(plan.taskId);
    logArena(
      logging,
      `[arena][fight] ${plan.id} ${task.card.id}: ${blueAgent.profile.name} (${blueAgent.provider}) vs ${redAgent.profile.name} (${redAgent.provider}).`
    );
    const [blue, red] = await Promise.all([
      runCorner(plan.id, blueAgent, task, logging),
      runCorner(plan.id, redAgent, task, logging)
    ]);

    const baseFight: FightReplay = {
      id: plan.id,
      date: plan.date,
      venue: plan.venue,
      division: plan.division,
      taskId: task.card.id,
      headline: `${blueAgent.profile.name} vs ${redAgent.profile.name}`,
      judgesMemo: "",
      keyMoments: [],
      budgetMinutes: task.budgetMinutes,
      tokenBudgetK: task.tokenBudgetK,
      titleFight: plan.titleFight,
      watchable: Boolean(blue.capture || red.capture),
      blue: {
        agentId: blueAgent.profile.id,
        capture: blue.capture,
        promptStyle: blue.promptStyle,
        diffSummary: blue.diffSummary,
        notableMove: blue.notableMove,
        metrics: blue.metrics
      },
      red: {
        agentId: redAgent.profile.id,
        capture: red.capture,
        promptStyle: red.promptStyle,
        diffSummary: red.diffSummary,
        notableMove: red.notableMove,
        metrics: red.metrics
      }
    };

    const computedFight = computeFight(baseFight);
    const winnerName = computedFight.winnerId === blueAgent.profile.id ? blueAgent.profile.name : redAgent.profile.name;
    const loserName = computedFight.loserId === blueAgent.profile.id ? blueAgent.profile.name : redAgent.profile.name;
    logArena(
      logging,
      `[arena][result] ${plan.id} winner ${winnerName} over ${loserName} by ${computedFight.finish}.`
    );

    fights.push({
      ...baseFight,
      judgesMemo: deriveJudgesMemo(computedFight, blueAgent, redAgent, blue, red),
      keyMoments: deriveKeyMoments(blue, red, winnerName, loserName)
    });
  }

  logArena(logging, `[arena][season:done] Completed ${fights.length} fight(s).`);

  return {
    generatedAt: new Date().toISOString(),
    source: "live-arena-runner",
    notes: [
      ...registryNotes,
      ...(selectedFightIds.length > 0
        ? [`Fight filter active: ${selectedFightIds.join(", ")}.`]
        : []),
      "Each corner ran against a real fixture workspace in a fresh temp directory.",
      "Saved fight captures include transcript snippets plus stdout and stderr tails when the adapter exposes them.",
      fights.some(
        (fight) =>
          fight.blue.capture?.provider !== "scripted" || fight.red.capture?.provider !== "scripted"
      )
        ? "Any unselected fighters still use the built-in scripted adapters so you can mix real and deterministic corners."
        : "Current live season uses built-in scripted agents; set AFC_CODEX_AGENT_IDS, AFC_CLAUDE_AGENT_IDS, or AFC_GEMINI_AGENT_IDS to replace selected corners with real CLI fighters."
    ],
    runMeta: {
      providers: Array.from(
        new Set(
          fights.flatMap((fight) =>
            [fight.blue.capture?.provider, fight.red.capture?.provider].filter(isDefined)
          )
        )
      ),
      transcriptVersion: 1
    },
    agents: activeAgents.map((agent) => agent.profile),
    tasks: liveTasks.map((task) => task.card),
    fights
  };
}
