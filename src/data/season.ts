import type { AgentProfile, FightReplay, SeasonDataset, TaskCard } from "../lib/types.ts";

export const agents: AgentProfile[] = [
  {
    id: "ghostwire",
    name: "Claude Sonnet 4.6",
    handle: "@anthropic/sonnet-4.6",
    lab: "Anthropic",
    style: "Minimal-diff assassin",
    signatureMove: "Patch Needle",
    tagline: "Smallest diff in the room, highest trust at the table.",
    aggression: 58,
    discipline: 97,
    palette: {
      primary: "#d2ff57",
      secondary: "#efffc5"
    }
  },
  {
    id: "ironclad",
    name: "Claude Opus 4.6",
    handle: "@anthropic/opus-4.6",
    lab: "Anthropic",
    style: "Regression-proof bruiser",
    signatureMove: "Lock Guard",
    tagline: "Wins ugly, ships clean, sleeps at night.",
    aggression: 64,
    discipline: 94,
    palette: {
      primary: "#ff824d",
      secondary: "#ffd7c6"
    }
  },
  {
    id: "afterglow",
    name: "Codex (GPT-5.3)",
    handle: "@openai/codex",
    lab: "OpenAI",
    style: "Frontend technician",
    signatureMove: "Render Step-In",
    tagline: "Turns a bug ticket into a product moment.",
    aggression: 74,
    discipline: 83,
    palette: {
      primary: "#7cf2ff",
      secondary: "#d7fbff"
    }
  },
  {
    id: "blackboxer",
    name: "Gemini 3.1 Pro",
    handle: "@google/gemini-3.1-pro",
    lab: "Google DeepMind",
    style: "High-variance brawler",
    signatureMove: "Benchmark Blitz",
    tagline: "Explosive upside, occasional scene of the crime.",
    aggression: 98,
    discipline: 49,
    palette: {
      primary: "#ff4d6d",
      secondary: "#ffc9d2"
    }
  },
  {
    id: "velvet-hammer",
    name: "GPT-5.4",
    handle: "@openai/gpt-5.4",
    lab: "OpenAI",
    style: "Narrative-heavy showman",
    signatureMove: "Full Rewrite Feint",
    tagline: "Looks incredible, sometimes lands too wide.",
    aggression: 91,
    discipline: 62,
    palette: {
      primary: "#f2b134",
      secondary: "#ffeab5"
    }
  },
  {
    id: "cinder",
    name: "GPT-5.4 Mini",
    handle: "@openai/gpt-5.4-mini",
    lab: "OpenAI",
    style: "Benchmark tactician",
    signatureMove: "Tight Loop Counter",
    tagline: "Treats every match like a profiler trace.",
    aggression: 79,
    discipline: 78,
    palette: {
      primary: "#9f8cff",
      secondary: "#e2dcff"
    }
  }
];

export const tasks: TaskCard[] = [
  {
    id: "legacy-hotfix",
    name: "Legacy Hotfix Ladder",
    repo: "oss/cartline",
    category: "Hotfix",
    stakes: "Checkout bug is killing conversions.",
    description: "Patch a fragile production flow without widening the diff footprint.",
    victoryCondition: "Fix the bug, keep tests green, avoid regressions."
  },
  {
    id: "frontend-rescue",
    name: "Frontend Rescue Sprint",
    repo: "oss/boardlight",
    category: "UI/UX",
    stakes: "New release looks broken on mobile and assistive tech.",
    description: "Repair hierarchy, interaction clarity, and responsiveness under a short deadline.",
    victoryCondition: "Ship a cleaner UI with strong semantics and zero layout collapse."
  },
  {
    id: "security-panic",
    name: "Security Panic",
    repo: "oss/gatekeeper",
    category: "Security",
    stakes: "A credential leak report hits public issue trackers.",
    description: "Trace the vulnerability, lock the surface, and keep the blast radius contained.",
    victoryCondition: "Resolve the exploit path without breaking the auth contract."
  },
  {
    id: "data-pipeline",
    name: "Data Pipeline Rescue",
    repo: "oss/warehouse",
    category: "Data",
    stakes: "Nightly jobs are timing out and finance is waiting.",
    description: "Reduce failure rate, preserve semantics, and keep operational cost in check.",
    victoryCondition: "Stabilize the pipeline while staying efficient."
  },
  {
    id: "benchmark-dojo",
    name: "Benchmark Dojo",
    repo: "oss/fastpath",
    category: "Performance",
    stakes: "The release is blocked on runtime and memory regressions.",
    description: "Find real speedups without lying to the benchmark harness.",
    victoryCondition: "Improve throughput with measured runtime and review-safe tradeoffs."
  }
];

export const fights: FightReplay[] = [];

export const seedSeason: SeasonDataset = {
  agents,
  tasks,
  fights
};
