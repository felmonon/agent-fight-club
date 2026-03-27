import type { ComputedFightReplay } from "../../lib/types.ts";

export interface ConsistencyProfile {
  bouts: number;
  confidence: number;
  confidenceLabel: "Early" | "Solid" | "High" | "Elite";
  consistency: number;
  hiddenPassRate: number | null;
  scoreSpread: number;
  seriesCount: number;
  summary: string;
}

function roundTo(value: number, decimals = 0): number {
  return Number(value.toFixed(decimals));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function standardDeviation(values: number[]): number {
  if (values.length <= 1) {
    return 0;
  }

  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

function confidenceLabelForScore(confidence: number): ConsistencyProfile["confidenceLabel"] {
  if (confidence >= 85) {
    return "Elite";
  }
  if (confidence >= 70) {
    return "High";
  }
  if (confidence >= 55) {
    return "Solid";
  }
  return "Early";
}

function summaryForProfile(
  confidenceLabel: ConsistencyProfile["confidenceLabel"],
  bouts: number,
  seriesCount: number,
  hiddenPassRate: number | null,
  scoreSpread: number
): string {
  const fightText = `${bouts} scored fight${bouts === 1 ? "" : "s"}`;
  const seriesText = seriesCount > 1 ? ` across ${seriesCount} series` : "";

  if (hiddenPassRate != null) {
    return `${confidenceLabel} confidence from ${fightText}${seriesText}, ${hiddenPassRate}% hidden-check coverage, and a ${scoreSpread.toFixed(1)} point score spread.`;
  }

  return `${confidenceLabel} confidence from ${fightText}${seriesText}. Hidden checks are not available in this card, so the score leans on sample size and variance.`;
}

export function buildConsistencyProfile(
  agentId: string,
  fights: ComputedFightReplay[]
): ConsistencyProfile {
  const relevantFights = fights.filter(
    (fight) => fight.blue.agentId === agentId || fight.red.agentId === agentId
  );

  if (relevantFights.length === 0) {
    return {
      bouts: 0,
      confidence: 0,
      confidenceLabel: "Early",
      consistency: 0,
      hiddenPassRate: null,
      scoreSpread: 0,
      seriesCount: 0,
      summary: "No scored fights yet."
    };
  }

  const scores = relevantFights.map((fight) =>
    fight.blue.agentId === agentId ? fight.blueScore : fight.redScore
  );
  const scoreSpread = roundTo(standardDeviation(scores), 1);
  const consistency = clamp(roundTo(100 - scoreSpread * 6), 42, 99);

  let hiddenPassed = 0;
  let hiddenTotal = 0;
  const seriesIds = new Set<string>();

  for (const fight of relevantFights) {
    const capture = fight.blue.agentId === agentId ? fight.blue.capture : fight.red.capture;
    if (capture?.checkSummary) {
      hiddenPassed += capture.checkSummary.hiddenPassed;
      hiddenTotal += capture.checkSummary.hiddenTotal;
    }
    seriesIds.add(fight.seriesId ?? fight.id);
  }

  const hiddenPassRate =
    hiddenTotal > 0 ? roundTo((hiddenPassed / hiddenTotal) * 100) : null;
  const sampleStrength = Math.min(1, relevantFights.length / 6) * 35;
  const seriesStrength = Math.min(1, seriesIds.size / 3) * 15;
  const consistencyStrength = consistency * 0.3;
  const hiddenStrength = (hiddenPassRate ?? Math.max(55, consistency - 10)) * 0.2;
  const confidence = roundTo(sampleStrength + seriesStrength + consistencyStrength + hiddenStrength);
  const confidenceLabel = confidenceLabelForScore(confidence);

  return {
    bouts: relevantFights.length,
    confidence,
    confidenceLabel,
    consistency,
    hiddenPassRate,
    scoreSpread,
    seriesCount: seriesIds.size,
    summary: summaryForProfile(confidenceLabel, relevantFights.length, seriesIds.size, hiddenPassRate, scoreSpread)
  };
}
