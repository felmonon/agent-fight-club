import type {
  AgentProfile,
  FightReplay,
  FightTranscriptEntry,
  LiveArenaDataset,
  ScoreBreakdown,
  TaskCard
} from "../lib/types.ts";

export interface ArenaFileFixture {
  content: string;
  path: string;
}

export interface ArenaEvaluation {
  notes: string[];
  notableMove: string;
  passedChecks: number;
  performanceScore: number;
  reviewFlags: string[];
  totalChecks: number;
}

export interface ArenaTaskDefinition {
  budgetMinutes: number;
  card: TaskCard;
  evaluate: (workspaceDir: string) => Promise<ArenaEvaluation>;
  files: ArenaFileFixture[];
  prompt: string;
  tokenBudgetK: number;
}

export interface ArenaDiffStats {
  changedFiles: string[];
  changedLineCount: number;
}

export interface ArenaAgentContext {
  task: ArenaTaskDefinition;
  workspaceDir: string;
}

export interface ArenaAgentCapture {
  model?: string;
  provider: string;
  stderrTail?: string;
  stdoutTail?: string;
  transcript?: FightTranscriptEntry[];
  workspaceNotes?: string[];
}

export interface ArenaAgentExecution {
  capture?: ArenaAgentCapture;
  diffSummary: string;
  notableMove: string;
  promptStyle: string;
  tokenEstimateK: number;
  warnings: string[];
}

export interface ArenaAgentAdapter {
  profile: AgentProfile;
  run: (context: ArenaAgentContext) => Promise<ArenaAgentExecution>;
}

export interface ArenaCornerResult extends ArenaAgentExecution {
  diffStats: ArenaDiffStats;
  durationMs: number;
  evaluation: ArenaEvaluation;
  metrics: ScoreBreakdown;
}

export interface ArenaFightPlan {
  blueAgentId: string;
  date: string;
  division: string;
  id: string;
  redAgentId: string;
  taskId: string;
  titleFight?: boolean;
  venue: string;
}

export interface ArenaRunResult extends LiveArenaDataset {
  fights: FightReplay[];
  source: "live-arena-runner";
}
