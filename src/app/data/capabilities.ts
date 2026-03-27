import type { CapabilityFamily, ComputedFightReplay, FightCheckSummary, TaskCard } from "../../lib/types.ts";

export interface CapabilityProfileEntry {
  avgRobustness: number | null;
  avgScore: number;
  family: CapabilityFamily;
  hiddenPassRate: number | null;
  label: string;
  losses: number;
  summary: string;
  taskNames: string[];
  testedFights: number;
  wins: number;
}

const capabilityLabels: Record<CapabilityFamily, string> = {
  data: "Data & pipeline work",
  frontend: "Frontend repair",
  hotfix: "Hotfix reliability",
  performance: "Performance tuning",
  security: "Security hardening"
};

const capabilitySummaries: Record<CapabilityFamily, string> = {
  data: "How the model handles state-heavy jobs where correctness has to survive scale and repetition.",
  frontend: "How well it repairs interface issues without turning a product fix into a redesign.",
  hotfix: "How safely it lands urgent production fixes when the cheapest mistake is still expensive.",
  performance: "How often it finds real speedups without gaming the benchmark or scrambling behavior.",
  security: "How well it closes exploit paths while keeping the rest of the app stable."
};

function roundTo(value: number, decimals = 0): number {
  return Number(value.toFixed(decimals));
}

export function capabilityFamilyForTask(
  task?: Pick<TaskCard, "capabilityFamily" | "category">
): CapabilityFamily | undefined {
  if (task?.capabilityFamily) {
    return task.capabilityFamily;
  }

  switch (task?.category?.trim().toLowerCase()) {
    case "data":
      return "data";
    case "frontend":
    case "ui/ux":
    case "ui":
      return "frontend";
    case "hotfix":
      return "hotfix";
    case "performance":
      return "performance";
    case "security":
      return "security";
    default:
      return undefined;
  }
}

export function capabilityLabelForFamily(family: CapabilityFamily): string {
  return capabilityLabels[family];
}

interface CapabilityAccumulator {
  family: CapabilityFamily;
  hiddenPassed: number;
  hiddenTotal: number;
  label: string;
  losses: number;
  robustnessCount: number;
  robustnessTotal: number;
  scoreTotal: number;
  summary: string;
  taskNames: Set<string>;
  testedFights: number;
  wins: number;
}

function createAccumulator(family: CapabilityFamily): CapabilityAccumulator {
  return {
    family,
    hiddenPassed: 0,
    hiddenTotal: 0,
    label: capabilityLabelForFamily(family),
    losses: 0,
    robustnessCount: 0,
    robustnessTotal: 0,
    scoreTotal: 0,
    summary: capabilitySummaries[family],
    taskNames: new Set<string>(),
    testedFights: 0,
    wins: 0
  };
}

function scoreForCorner(fight: ComputedFightReplay, corner: "blue" | "red") {
  return corner === "blue" ? fight.blueScore : fight.redScore;
}

function summaryForCorner(summary?: FightCheckSummary) {
  if (!summary || summary.hiddenTotal === 0) {
    return undefined;
  }

  return {
    hiddenPassed: summary.hiddenPassed,
    hiddenTotal: summary.hiddenTotal
  };
}

export function buildCapabilityProfile(
  agentId: string,
  fights: ComputedFightReplay[],
  taskMap: Map<string, TaskCard>
): CapabilityProfileEntry[] {
  const buckets = new Map<CapabilityFamily, CapabilityAccumulator>();

  for (const fight of fights) {
    const corner = fight.blue.agentId === agentId ? "blue" : fight.red.agentId === agentId ? "red" : undefined;
    if (!corner) {
      continue;
    }

    const task = taskMap.get(fight.taskId);
    const family = capabilityFamilyForTask(task);
    if (!family) {
      continue;
    }

    const bucket = buckets.get(family) ?? createAccumulator(family);
    const capture = fight[corner].capture;
    const hiddenSummary = summaryForCorner(capture?.checkSummary);

    bucket.testedFights += 1;
    bucket.scoreTotal += scoreForCorner(fight, corner);
    bucket.taskNames.add(task?.name ?? fight.taskId);

    if (fight.winnerId === agentId) {
      bucket.wins += 1;
    } else {
      bucket.losses += 1;
    }

    if (hiddenSummary) {
      bucket.hiddenPassed += hiddenSummary.hiddenPassed;
      bucket.hiddenTotal += hiddenSummary.hiddenTotal;
    }

    if (typeof capture?.robustnessScore === "number") {
      bucket.robustnessTotal += capture.robustnessScore;
      bucket.robustnessCount += 1;
    }

    buckets.set(family, bucket);
  }

  return Array.from(buckets.values())
    .map((bucket) => ({
      avgRobustness:
        bucket.robustnessCount > 0 ? roundTo(bucket.robustnessTotal / bucket.robustnessCount) : null,
      avgScore: roundTo(bucket.scoreTotal / Math.max(1, bucket.testedFights), 1),
      family: bucket.family,
      hiddenPassRate:
        bucket.hiddenTotal > 0 ? roundTo((bucket.hiddenPassed / bucket.hiddenTotal) * 100) : null,
      label: bucket.label,
      losses: bucket.losses,
      summary: bucket.summary,
      taskNames: Array.from(bucket.taskNames),
      testedFights: bucket.testedFights,
      wins: bucket.wins
    }))
    .sort(
      (left, right) =>
        right.testedFights - left.testedFights ||
        right.avgScore - left.avgScore ||
        left.label.localeCompare(right.label)
    );
}
