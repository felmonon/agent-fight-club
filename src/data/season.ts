import type { AgentProfile, FightReplay, SeasonDataset, TaskCard } from "../lib/types.ts";

export const agents: AgentProfile[] = [
  {
    id: "ghostwire",
    name: "Ghostwire",
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
    name: "Ironclad",
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
    name: "Afterglow",
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
    name: "Blackboxer",
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
    name: "Velvet Hammer",
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
    name: "Cinder",
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
    capabilityFamily: "hotfix",
    repo: "oss/cartline",
    category: "Hotfix",
    stakes: "Checkout bug is killing conversions.",
    description: "Patch a fragile production flow without widening the diff footprint.",
    victoryCondition: "Fix the bug, keep tests green, avoid regressions."
  },
  {
    id: "frontend-rescue",
    name: "Frontend Rescue Sprint",
    capabilityFamily: "frontend",
    repo: "oss/boardlight",
    category: "UI/UX",
    stakes: "New release looks broken on mobile and assistive tech.",
    description: "Repair hierarchy, interaction clarity, and responsiveness under a short deadline.",
    victoryCondition: "Ship a cleaner UI with strong semantics and zero layout collapse."
  },
  {
    id: "security-panic",
    name: "Security Panic",
    capabilityFamily: "security",
    repo: "oss/gatekeeper",
    category: "Security",
    stakes: "A credential leak report hits public issue trackers.",
    description: "Trace the vulnerability, lock the surface, and keep the blast radius contained.",
    victoryCondition: "Resolve the exploit path without breaking the auth contract."
  },
  {
    id: "data-pipeline",
    name: "Data Pipeline Rescue",
    capabilityFamily: "data",
    repo: "oss/warehouse",
    category: "Data",
    stakes: "Nightly jobs are timing out and finance is waiting.",
    description: "Reduce failure rate, preserve semantics, and keep operational cost in check.",
    victoryCondition: "Stabilize the pipeline while staying efficient."
  },
  {
    id: "benchmark-dojo",
    name: "Benchmark Dojo",
    capabilityFamily: "performance",
    repo: "oss/fastpath",
    category: "Performance",
    stakes: "The release is blocked on runtime and memory regressions.",
    description: "Find real speedups without lying to the benchmark harness.",
    victoryCondition: "Improve throughput with measured runtime and review-safe tradeoffs."
  }
];

export const fights: FightReplay[] = [
  {
    id: "afc-001",
    date: "2026-03-01",
    venue: "Warehouse 9",
    division: "Welterweight",
    taskId: "legacy-hotfix",
    headline: "Ironclad vs Blackboxer",
    judgesMemo:
      "Blackboxer found speed, but the patch expanded the blast radius and triggered review heat. Ironclad stayed boring and bankable.",
    keyMoments: [
      "Blackboxer rewrote adjacent retry logic and took two review penalties.",
      "Ironclad contained the fix to one boundary component and one contract test.",
      "Judges favored discipline over volatility."
    ],
    budgetMinutes: 10,
    tokenBudgetK: 180,
    blue: {
      agentId: "ironclad",
      promptStyle: "Constrain the patch, prove safety, leave the repo calmer.",
      diffSummary: "12-line guardrail fix with an explicit regression test.",
      notableMove: "Reused existing queue abstractions instead of inventing a new retry helper.",
      metrics: {
        correctness: 95,
        diffQuality: 93,
        runtime: 80,
        cost: 83,
        resilience: 92,
        penalties: 0
      }
    },
    red: {
      agentId: "blackboxer",
      promptStyle: "Take the fastest path to visible throughput gains.",
      diffSummary: "Large refactor that fixed the symptom but widened the risk profile.",
      notableMove: "Pulled retry and cache invalidation together into one aggressive rewrite.",
      metrics: {
        correctness: 88,
        diffQuality: 66,
        runtime: 91,
        cost: 75,
        resilience: 61,
        penalties: 2
      }
    }
  },
  {
    id: "afc-002",
    date: "2026-03-03",
    venue: "Redline Studio",
    division: "Lightweight",
    taskId: "frontend-rescue",
    headline: "Afterglow vs Velvet Hammer",
    judgesMemo:
      "Both agents improved the visual experience. Afterglow won because the interface got better without looking like a redesign tantrum.",
    keyMoments: [
      "Afterglow fixed spacing rhythm, focus states, and the mobile CTA stack.",
      "Velvet Hammer landed stronger visuals but broke the established component cadence.",
      "Review called Afterglow the cleaner product decision."
    ],
    budgetMinutes: 8,
    tokenBudgetK: 150,
    blue: {
      agentId: "afterglow",
      promptStyle: "Preserve the system, repair the surface, sharpen the hierarchy.",
      diffSummary: "Responsive layout cleanup with improved semantics and stronger CTA ordering.",
      notableMove: "Converted a decorative panel into a clearer task-focused summary block.",
      metrics: {
        correctness: 92,
        diffQuality: 90,
        runtime: 84,
        cost: 78,
        resilience: 88,
        penalties: 0
      }
    },
    red: {
      agentId: "velvet-hammer",
      promptStyle: "Make it unforgettable and trust the cleanup later.",
      diffSummary: "Bold restyle with fresh motion, but the component language drifted too far.",
      notableMove: "Introduced a dramatic hero section that reviewers liked but maintainers questioned.",
      metrics: {
        correctness: 87,
        diffQuality: 74,
        runtime: 79,
        cost: 70,
        resilience: 73,
        penalties: 1
      }
    }
  },
  {
    id: "afc-003",
    date: "2026-03-05",
    venue: "Nocturne Hall",
    division: "Middleweight",
    taskId: "security-panic",
    headline: "Ghostwire vs Cinder",
    judgesMemo:
      "Ghostwire closed the exploit path with almost insulting efficiency. Cinder optimized around the problem instead of sealing it.",
    keyMoments: [
      "Ghostwire removed the leaked token path and narrowed permissions in one pass.",
      "Cinder improved runtime under load, but the patch felt sideways under security stress.",
      "Minimal diffs win big when the repo is already on fire."
    ],
    budgetMinutes: 12,
    tokenBudgetK: 210,
    blue: {
      agentId: "ghostwire",
      promptStyle: "Find the exploit edge, close it, leave nothing extra.",
      diffSummary: "Boundary-check fix plus a credentials scrub and a narrow permission gate.",
      notableMove: "Used the existing auth guard path instead of adding a new middleware layer.",
      metrics: {
        correctness: 97,
        diffQuality: 96,
        runtime: 82,
        cost: 87,
        resilience: 95,
        penalties: 0
      }
    },
    red: {
      agentId: "cinder",
      promptStyle: "Patch and profile at the same time.",
      diffSummary: "Performance-aware cleanup that partially solved the issue but left review questions.",
      notableMove: "Shortened hot paths but didn't fully lock the credential replay surface.",
      metrics: {
        correctness: 85,
        diffQuality: 79,
        runtime: 89,
        cost: 81,
        resilience: 74,
        penalties: 1
      }
    }
  },
  {
    id: "afc-004",
    date: "2026-03-08",
    venue: "Union Terminal",
    division: "Welterweight",
    taskId: "legacy-hotfix",
    headline: "Afterglow vs Ironclad",
    judgesMemo:
      "This was the season's first real upset. Afterglow matched Ironclad on correctness and edged it on patch elegance under time pressure.",
    keyMoments: [
      "Afterglow shipped the smallest winning diff of the night.",
      "Ironclad was safe but slightly slower and more verbose.",
      "The judges rewarded precision over reputation."
    ],
    budgetMinutes: 9,
    tokenBudgetK: 160,
    blue: {
      agentId: "afterglow",
      promptStyle: "Solve the incident with the same craft you would use on the homepage.",
      diffSummary: "Lean state guard fix with strong test naming and no collateral churn.",
      notableMove: "Mapped the incident through UI state transitions before touching business logic.",
      metrics: {
        correctness: 94,
        diffQuality: 95,
        runtime: 83,
        cost: 84,
        resilience: 90,
        penalties: 0
      }
    },
    red: {
      agentId: "ironclad",
      promptStyle: "Never let a hotfix become archaeology.",
      diffSummary: "Safe repair with excellent coverage but slightly wider file touch count.",
      notableMove: "Added a safety wrapper that reviewers liked but did not strictly need.",
      metrics: {
        correctness: 94,
        diffQuality: 88,
        runtime: 82,
        cost: 82,
        resilience: 91,
        penalties: 0
      }
    }
  },
  {
    id: "afc-005",
    date: "2026-03-11",
    venue: "Pitlane",
    division: "Featherweight",
    taskId: "benchmark-dojo",
    headline: "Blackboxer vs Velvet Hammer",
    judgesMemo:
      "Blackboxer finally landed the chaos right. Velvet Hammer made the code prettier, but this was a performance fight and Blackboxer came with bad intentions.",
    keyMoments: [
      "Blackboxer cut a sluggish validation loop and won the runtime column hard.",
      "Velvet Hammer improved readability without enough raw speed.",
      "One clean night is enough to turn a brawler back into a threat."
    ],
    budgetMinutes: 11,
    tokenBudgetK: 200,
    blue: {
      agentId: "blackboxer",
      promptStyle: "Trade comfort for measurable speed if the harness blesses it.",
      diffSummary: "Targeted refactor of a tight loop with explicit micro-benchmark notes.",
      notableMove: "Deleted an unnecessary abstraction layer and let the hot path breathe.",
      metrics: {
        correctness: 90,
        diffQuality: 82,
        runtime: 97,
        cost: 86,
        resilience: 76,
        penalties: 0
      }
    },
    red: {
      agentId: "velvet-hammer",
      promptStyle: "Make the fix understandable enough to survive handoff.",
      diffSummary: "Cleaner structure with modest wins, but not enough to own the fight.",
      notableMove: "Converted profiler notes into docs comments instead of deeper loop cuts.",
      metrics: {
        correctness: 87,
        diffQuality: 84,
        runtime: 80,
        cost: 79,
        resilience: 78,
        penalties: 0
      }
    }
  },
  {
    id: "afc-006",
    date: "2026-03-15",
    venue: "Basement Array",
    division: "Middleweight",
    taskId: "data-pipeline",
    headline: "Cinder vs Afterglow",
    judgesMemo:
      "Cinder treated the job like a control room incident and stacked small wins everywhere. Afterglow made it understandable, but Cinder made it faster and cheaper.",
    keyMoments: [
      "Cinder stabilized the job graph and lowered cost without breaking semantics.",
      "Afterglow improved debuggability but conceded throughput.",
      "The judges liked both diffs, then gave the nod to operational leverage."
    ],
    budgetMinutes: 12,
    tokenBudgetK: 210,
    blue: {
      agentId: "cinder",
      promptStyle: "Profile first, then cut exactly where the scheduler hurts.",
      diffSummary: "Batch tuning, queue compaction, and cleaner retry semantics.",
      notableMove: "Collapsed duplicate transforms into one verified pass.",
      metrics: {
        correctness: 93,
        diffQuality: 89,
        runtime: 94,
        cost: 90,
        resilience: 87,
        penalties: 0
      }
    },
    red: {
      agentId: "afterglow",
      promptStyle: "Make the system legible enough that the next outage is easier to kill.",
      diffSummary: "Good reliability improvements and better logs, but less direct speedup.",
      notableMove: "Introduced clear runbook-style error surfaces in the worker output.",
      metrics: {
        correctness: 90,
        diffQuality: 91,
        runtime: 81,
        cost: 78,
        resilience: 88,
        penalties: 0
      }
    }
  },
  {
    id: "afc-007",
    date: "2026-03-18",
    venue: "Civic Dome",
    division: "Main Event Eliminator",
    taskId: "security-panic",
    headline: "Ghostwire vs Ironclad",
    judgesMemo:
      "Fight of the season. Ironclad was airtight. Ghostwire was airtight and leaner. That was the difference.",
    keyMoments: [
      "Both agents shipped production-grade fixes.",
      "Ghostwire won the diff-quality and cost columns by refusing every unnecessary move.",
      "The arena finally understood why maintainers fear this agent."
    ],
    budgetMinutes: 12,
    tokenBudgetK: 220,
    blue: {
      agentId: "ghostwire",
      promptStyle: "Win the review before the patch exists.",
      diffSummary: "Exploit closure, permission minimization, and a surgical audit trail.",
      notableMove: "Reframed a risky refactor into a single trusted guard path.",
      metrics: {
        correctness: 98,
        diffQuality: 97,
        runtime: 84,
        cost: 88,
        resilience: 97,
        penalties: 0
      }
    },
    red: {
      agentId: "ironclad",
      promptStyle: "Take the sure points and force no apologies.",
      diffSummary: "Near-perfect incident patch with excellent tests and zero drama.",
      notableMove: "Added a safety assertion matrix that reviewers immediately trusted.",
      metrics: {
        correctness: 97,
        diffQuality: 91,
        runtime: 82,
        cost: 82,
        resilience: 95,
        penalties: 0
      }
    }
  },
  {
    id: "afc-008",
    date: "2026-03-20",
    venue: "Terminal East",
    division: "Feature Bout",
    taskId: "benchmark-dojo",
    headline: "Blackboxer vs Ghostwire",
    judgesMemo:
      "Blackboxer came in hunting the highlight. Ghostwire dragged the match into composure and won the round-to-round math anyway.",
    keyMoments: [
      "Blackboxer owned raw runtime but leaked review trust.",
      "Ghostwire stayed inside the rails and took the cleaner composite score.",
      "The crowd got chaos. The judges got a champion audition."
    ],
    budgetMinutes: 11,
    tokenBudgetK: 190,
    blue: {
      agentId: "blackboxer",
      promptStyle: "If you can smell a benchmark, break its neck.",
      diffSummary: "Fast patch with a few sharp elbows around maintainability.",
      notableMove: "Flattened an expensive execution path into direct calls and dared review to keep up.",
      metrics: {
        correctness: 89,
        diffQuality: 73,
        runtime: 98,
        cost: 92,
        resilience: 71,
        penalties: 1
      }
    },
    red: {
      agentId: "ghostwire",
      promptStyle: "Let the win look boring until the scorecard drops.",
      diffSummary: "Measured speedup with cleaner isolation and stronger fallback behavior.",
      notableMove: "Used a cache-aware guard that improved runtime without destabilizing the shape of the code.",
      metrics: {
        correctness: 95,
        diffQuality: 94,
        runtime: 90,
        cost: 89,
        resilience: 96,
        penalties: 0
      }
    }
  },
  {
    id: "afc-009",
    date: "2026-03-22",
    venue: "Voltage Garden",
    division: "Undercard",
    taskId: "legacy-hotfix",
    headline: "Velvet Hammer vs Ironclad",
    judgesMemo:
      "Velvet Hammer came with flair and got leaned on. Ironclad walked into the pocket, solved the problem, and left with the points.",
    keyMoments: [
      "Velvet Hammer over-designed a recovery path and paid for it in penalties.",
      "Ironclad stayed within the repo's vocabulary.",
      "The crowd booed the decision until they saw the replay."
    ],
    budgetMinutes: 9,
    tokenBudgetK: 165,
    blue: {
      agentId: "velvet-hammer",
      promptStyle: "Turn the incident into a dramatic redemption arc.",
      diffSummary: "Readable but overstyled hotfix with two unnecessary component touches.",
      notableMove: "Expanded the solution surface to make the UI feel more cohesive.",
      metrics: {
        correctness: 86,
        diffQuality: 71,
        runtime: 78,
        cost: 74,
        resilience: 72,
        penalties: 2
      }
    },
    red: {
      agentId: "ironclad",
      promptStyle: "Pin the blast radius, force the queue through one safe gate.",
      diffSummary: "Trustworthy fix with crisp review notes and no wasted motion.",
      notableMove: "Pulled the recovery path back under one existing contract.",
      metrics: {
        correctness: 94,
        diffQuality: 92,
        runtime: 81,
        cost: 84,
        resilience: 94,
        penalties: 0
      }
    }
  },
  {
    id: "afc-010",
    date: "2026-03-24",
    venue: "Mercury Arena",
    division: "World Title",
    taskId: "data-pipeline",
    headline: "Ghostwire vs Afterglow",
    judgesMemo:
      "Afterglow made the pipeline more humane. Ghostwire made it win. The belt stays with the smallest killer in the building.",
    keyMoments: [
      "Afterglow landed an excellent observability pass and nearly stole the story.",
      "Ghostwire combined reliability, patch restraint, and elite review safety.",
      "The title fight was close enough to matter and clear enough to end clean."
    ],
    budgetMinutes: 12,
    tokenBudgetK: 220,
    titleFight: true,
    blue: {
      agentId: "ghostwire",
      promptStyle: "Take the minimum number of steps that can still end the fight.",
      diffSummary: "Throughput fix plus retry sanitation and tighter failure boundaries.",
      notableMove: "Deleted two shaky branches instead of patching around them.",
      metrics: {
        correctness: 96,
        diffQuality: 98,
        runtime: 91,
        cost: 90,
        resilience: 97,
        penalties: 0
      }
    },
    red: {
      agentId: "afterglow",
      promptStyle: "Make the fix feel inevitable and the system feel owned.",
      diffSummary: "Beautifully explained patch with stronger logs and a clean operator story.",
      notableMove: "Added runbook-grade failure labels that made the replay instantly understandable.",
      metrics: {
        correctness: 94,
        diffQuality: 93,
        runtime: 84,
        cost: 82,
        resilience: 92,
        penalties: 0
      }
    }
  }
];

export const seedSeason: SeasonDataset = {
  agents,
  tasks,
  fights
};
