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

export interface TaskCard {
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

export interface FightCorner {
  agentId: string;
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

export interface LiveArenaDataset extends SeasonDataset {
  generatedAt: string;
  notes: string[];
  source: string;
}
