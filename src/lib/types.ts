export interface AgentProfile {
  id: string;
  name: string;
  handle: string;
  lab: string;
  style: string;
  signatureMove: string;
  tagline: string;
  aggression: number;
  discipline: number;
  palette: {
    primary: string;
    secondary: string;
  };
}

export type CapabilityFamily = "data" | "frontend" | "hotfix" | "performance" | "security";

export interface TaskCard {
  capabilityFamily?: CapabilityFamily;
  id: string;
  name: string;
  repo: string;
  category: string;
  stakes: string;
  description: string;
  victoryCondition: string;
}

export interface ScoreBreakdown {
  correctness: number;
  diffQuality: number;
  runtime: number;
  cost: number;
  resilience: number;
  penalties: number;
}

export interface FightCheckSummary {
  hiddenPassed: number;
  hiddenTotal: number;
  publicPassed: number;
  publicTotal: number;
}

export interface FightTranscriptEntry {
  atMs?: number;
  channel: "assistant" | "stderr" | "stdout" | "system" | "tool" | "user";
  text: string;
  title?: string;
}

export interface FightCornerCapture {
  changedFiles?: string[];
  changedLineCount?: number;
  checkSummary?: FightCheckSummary;
  durationMs?: number;
  model?: string;
  provider: string;
  robustnessScore?: number;
  stderrTail?: string;
  stdoutTail?: string;
  tokenEstimateK?: number;
  transcript?: FightTranscriptEntry[];
  workspaceNotes?: string[];
}

export interface FightCorner {
  agentId: string;
  capture?: FightCornerCapture;
  promptStyle: string;
  diffSummary: string;
  notableMove: string;
  metrics: ScoreBreakdown;
}

export interface FightReplay {
  id: string;
  date: string;
  venue: string;
  division: string;
  taskId: string;
  blue: FightCorner;
  red: FightCorner;
  headline: string;
  judgesMemo: string;
  keyMoments: string[];
  budgetMinutes: number;
  tokenBudgetK: number;
  titleFight?: boolean;
  watchable?: boolean;
}

export interface ComputedFightReplay extends FightReplay {
  blueScore: number;
  redScore: number;
  margin: number;
  winnerId: string;
  loserId: string;
  finish: string;
}

export interface StandingRow {
  agent: AgentProfile;
  wins: number;
  losses: number;
  finishes: number;
  elo: number;
  avgScore: number;
  recentForm: string[];
}

export interface StorylineCard {
  title: string;
  value: string;
  note: string;
}

export interface SeasonSummary {
  champion: StandingRow;
  rankings: StandingRow[];
  featuredFight: ComputedFightReplay;
  fights: ComputedFightReplay[];
  storylines: StorylineCard[];
  taskMap: Map<string, TaskCard>;
  agentMap: Map<string, AgentProfile>;
}

export interface SeasonDataset {
  agents: AgentProfile[];
  tasks: TaskCard[];
  fights: FightReplay[];
}

export interface LiveArenaRunMeta {
  providers?: string[];
  transcriptVersion?: number;
  gitSha?: string;
  publishPreset?: string;
  publishPresetName?: string;
  publishedAt?: string;
  reportSlug?: string;
  workflowRunUrl?: string;
}

export interface LiveArenaDataset extends SeasonDataset {
  generatedAt: string;
  notes: string[];
  runMeta?: LiveArenaRunMeta;
  source: string;
}

export interface PublishedSeasonArchiveEntry {
  slug: string;
  title: string;
  datasetSource: string;
  reportSource: "generated" | "seed";
  generatedAt?: string;
  publishedAt: string;
  publishPreset?: string;
  publishPresetName?: string;
  gitSha?: string;
  providers: string[];
  workflowRunUrl?: string;
  reportPath: string;
  summaryPath: string;
  champion: {
    id: string;
    name: string;
    elo: number;
    record: string;
  };
  featuredFight: {
    id: string;
    headline: string;
    finish: string;
  };
}

export interface PublishedSeasonArchiveIndex {
  generatedAt: string;
  latestSlug?: string;
  entries: PublishedSeasonArchiveEntry[];
}
