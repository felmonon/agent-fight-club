import { performance } from "node:perf_hooks";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { checkoutFixture, performanceFixture, securityFixture } from "./fixtures.ts";
import type { ArenaEvaluation, ArenaTaskDefinition } from "./types.ts";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value);
}

async function importFresh(modulePath: string) {
  return import(`${pathToFileURL(modulePath).href}?t=${Date.now()}-${Math.random()}`);
}

function approxEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.001;
}

type CheckVisibility = "hidden" | "public";

interface EvaluationCheck {
  label: string;
  passed: boolean;
  visibility: CheckVisibility;
}

function summarizeChecks(checks: EvaluationCheck[]) {
  const publicChecks = checks.filter((check) => check.visibility === "public");
  const hiddenChecks = checks.filter((check) => check.visibility === "hidden");
  const publicPassed = publicChecks.filter((check) => check.passed).length;
  const hiddenPassed = hiddenChecks.filter((check) => check.passed).length;
  const publicTotal = publicChecks.length;
  const hiddenTotal = hiddenChecks.length;
  const passedChecks = publicPassed + hiddenPassed;
  const totalChecks = publicTotal + hiddenTotal;
  const robustnessScore =
    hiddenTotal > 0 ? round((hiddenPassed / hiddenTotal) * 100) : round((passedChecks / totalChecks) * 100);

  return {
    checkSummary: {
      hiddenPassed,
      hiddenTotal,
      publicPassed,
      publicTotal
    },
    passedChecks,
    robustnessScore,
    totalChecks
  };
}

function buildCheckSummaryNote(checks: ReturnType<typeof summarizeChecks>["checkSummary"]) {
  return `Check matrix: ${checks.publicPassed}/${checks.publicTotal} public, ${checks.hiddenPassed}/${checks.hiddenTotal} hidden.`;
}

async function evaluateCheckout(workspaceDir: string): Promise<ArenaEvaluation> {
  const modulePath = path.join(workspaceDir, "cart.mjs");
  const source = await readFile(modulePath, "utf8");
  const cartModule = await importFresh(modulePath);
  const standardItems = [
    { price: 12.5, quantity: 2 },
    { price: 15, quantity: 1 }
  ];
  const freeShippingItems = [
    { price: 24, quantity: 1 },
    { price: 18, quantity: 2 }
  ];
  const checks: EvaluationCheck[] = [
    {
      label: "standard total without coupon",
      visibility: "public",
      passed: approxEqual(cartModule.calculateCheckoutTotal(standardItems, null), 47.5)
    },
    {
      label: "percent coupon leaves shipping untouched",
      visibility: "public",
      passed: approxEqual(cartModule.calculateCheckoutTotal(standardItems, { type: "percent", value: 0.25 }), 37.5)
    },
    {
      label: "fixed coupon floors at zero",
      visibility: "public",
      passed: approxEqual(cartModule.calculateCheckoutTotal(standardItems, { type: "fixed", value: 99 }), 0)
    },
    {
      label: "currency helper contract stays stable",
      visibility: "public",
      passed: cartModule.formatCurrency(12.5) === "$12.50"
    },
    {
      label: "free-shipping threshold still holds under percent coupon",
      visibility: "hidden",
      passed: approxEqual(cartModule.calculateCheckoutTotal(freeShippingItems, { type: "percent", value: 0.25 }), 45)
    },
    {
      label: "zero-percent coupon is a no-op",
      visibility: "hidden",
      passed: approxEqual(cartModule.calculateCheckoutTotal(standardItems, { type: "percent", value: 0 }), 47.5)
    },
    {
      label: "empty cart stays at zero even with oversized fixed coupon",
      visibility: "hidden",
      passed: approxEqual(cartModule.calculateCheckoutTotal([], { type: "fixed", value: 10 }), 0)
    },
    {
      label: "single-item fixed coupon keeps shipping contract intact",
      visibility: "hidden",
      passed: approxEqual(
        cartModule.calculateCheckoutTotal([{ price: 9.99, quantity: 1 }], { type: "fixed", value: 5 }),
        12.49
      )
    }
  ];
  const summary = summarizeChecks(checks);
  const reviewFlags: string[] = [];

  if (/shipping \* \(1 - coupon\.value\)/.test(source)) {
    reviewFlags.push("still discounts shipping on percent coupons");
  }
  if (/console\.log/.test(source)) {
    reviewFlags.push("debug logging left in hotfix");
  }

  return {
    ...summary,
    performanceScore: source.includes("discountedSubtotal") ? 92 : source.includes("applyCoupon") ? 88 : 80,
    reviewFlags,
    notes: [
      buildCheckSummaryNote(summary.checkSummary),
      "Percent coupon should only affect subtotal, not shipping.",
      "Public helper exports must stay intact for the checkout UI."
    ],
    notableMove: source.includes("applyCoupon")
      ? "extracted a safer coupon helper to narrow future regressions"
      : "kept shipping outside the percent-discount path"
  };
}

async function evaluateSecurity(workspaceDir: string): Promise<ArenaEvaluation> {
  const modulePath = path.join(workspaceDir, "session.mjs");
  const source = await readFile(modulePath, "utf8");
  const sessionModule = await importFresh(modulePath);
  const token = "tok_live_8372619";
  const result = sessionModule.createSessionResponse(
    {
      id: "user_42",
      email: "owner@arena.dev",
      passwordHash: "hash:secret",
      extraScopes: ["read:projects", "admin:root", "read:projects"]
    },
    token
  );

  const hiddenResult = sessionModule.createSessionResponse(
    {
      id: "user_7",
      email: "ops@arena.dev",
      passwordHash: "hash:ops",
      extraScopes: ["write:projects", "read:projects", "write:projects"]
    },
    "tok_prod_11882222"
  );

  const checks: EvaluationCheck[] = [
    {
      label: "password hash removed from payload",
      visibility: "public",
      passed: !("passwordHash" in result)
    },
    {
      label: "raw token removed from payload",
      visibility: "public",
      passed: !("token" in result)
    },
    {
      label: "token preview is masked",
      visibility: "public",
      passed: result.session?.tokenPreview === "***2619"
    },
    {
      label: "serialized payload does not leak the full token",
      visibility: "public",
      passed: JSON.stringify(result).includes(token) === false
    },
    {
      label: "scope list is reduced to safe allowlist",
      visibility: "public",
      passed:
        Array.isArray(result.session?.scopes) &&
        result.session.scopes.length === 1 &&
        result.session.scopes[0] === "read:projects"
    },
    {
      label: "unsafe write scope is stripped from hidden scenario",
      visibility: "hidden",
      passed:
        Array.isArray(hiddenResult.session?.scopes) &&
        hiddenResult.session.scopes.length === 1 &&
        hiddenResult.session.scopes[0] === "read:projects"
    },
    {
      label: "hidden token preview still reveals only the last 4 chars",
      visibility: "hidden",
      passed: hiddenResult.session?.tokenPreview === "***2222"
    },
    {
      label: "hidden payload does not leak the second full token",
      visibility: "hidden",
      passed: JSON.stringify(hiddenResult).includes("tok_prod_11882222") === false
    }
  ];
  const summary = summarizeChecks(checks);

  const reviewFlags: string[] = [];
  if (source.includes("passwordHash")) {
    reviewFlags.push("sensitive hash still exposed");
  }
  if (source.includes("tokenPreview: token")) {
    reviewFlags.push("token preview still leaks the full token");
  }
  if (source.includes("admin:root")) {
    reviewFlags.push("unsafe scope still survives sanitization");
  }

  return {
    ...summary,
    performanceScore: source.includes("new Set") ? 90 : 84,
    reviewFlags,
    notes: [
      buildCheckSummaryNote(summary.checkSummary),
      "Full session tokens must never be returned to the client payload.",
      "Privilege scopes should be deduped and stripped down to a safe allowlist."
    ],
    notableMove: source.includes("sanitizeScopes")
      ? "introduced explicit scope sanitization before shaping the response"
      : "masked secrets without changing the public function contract"
  };
}

async function evaluatePerformance(workspaceDir: string): Promise<ArenaEvaluation> {
  const modulePath = path.join(workspaceDir, "dedupe.mjs");
  const source = await readFile(modulePath, "utf8");
  const dedupeModule = await importFresh(modulePath);
  const sample = [
    { id: "b", value: 1 },
    { id: "a", value: 2 },
    { id: "b", value: 3 },
    { id: "c", value: 4 },
    { id: "a", value: 5 }
  ];
  const hiddenOrderSample = [
    { id: "z", value: 1 },
    { id: "m", value: 2 },
    { id: "z", value: 3 },
    { id: "a", value: 4 },
    { id: "m", value: 5 }
  ];
  const alreadyUnique = [
    { id: "n", value: 1 },
    { id: "o", value: 2 },
    { id: "p", value: 3 }
  ];
  const large = Array.from({ length: 12000 }, (_, index) => ({
    id: `id-${index % 250}`,
    value: index
  }));
  const hiddenLarge = Array.from({ length: 20000 }, (_, index) => ({
    id: `record-${index % 400}`,
    value: index
  }));

  const smallResult = dedupeModule.dedupeRecords(sample);
  const correctOrder =
    Array.isArray(smallResult) &&
    smallResult.map((record: { id: string }) => record.id).join(",") === "b,a,c";
  const hiddenOrderResult = dedupeModule.dedupeRecords(hiddenOrderSample);
  const hiddenOrderPreserved =
    Array.isArray(hiddenOrderResult) &&
    hiddenOrderResult.map((record: { id: string }) => record.id).join(",") === "z,m,a";
  const uniqueResult = dedupeModule.dedupeRecords(alreadyUnique);
  const uniqueResultStable =
    Array.isArray(uniqueResult) &&
    uniqueResult.map((record: { id: string }) => record.id).join(",") === "n,o,p";

  const startedAt = performance.now();
  for (let index = 0; index < 5; index += 1) {
    dedupeModule.dedupeRecords(large);
  }
  const elapsedMs = performance.now() - startedAt;
  const hiddenStartedAt = performance.now();
  dedupeModule.dedupeRecords(hiddenLarge);
  const hiddenElapsedMs = performance.now() - hiddenStartedAt;

  const reviewFlags: string[] = [];
  if (source.includes(".sort(")) {
    reviewFlags.push("solution still reorders records after dedupe");
  }
  if (!source.includes("Set") && !source.includes("Map")) {
    reviewFlags.push("dedupe path still looks quadratic");
  }

  const heuristicScore = source.includes("new Set")
    ? 96
    : source.includes("new Map")
      ? 94
      : clamp(82 - elapsedMs / 2, 42, 82);
  const checks: EvaluationCheck[] = [
    {
      label: "sample output preserves first-seen order",
      visibility: "public",
      passed: correctOrder
    },
    {
      label: "sample dedupe count is correct",
      visibility: "public",
      passed: smallResult.length === 3
    },
    {
      label: "benchmark loop completes inside public threshold",
      visibility: "public",
      passed: elapsedMs < 220
    },
    {
      label: "hidden order sample stays unsorted",
      visibility: "hidden",
      passed: hiddenOrderPreserved
    },
    {
      label: "already-unique records stay unchanged",
      visibility: "hidden",
      passed: uniqueResultStable
    },
    {
      label: "hidden dense dataset stays inside secondary runtime threshold",
      visibility: "hidden",
      passed: hiddenElapsedMs < 120
    },
    {
      label: "empty dataset returns an empty array",
      visibility: "hidden",
      passed: Array.isArray(dedupeModule.dedupeRecords([])) && dedupeModule.dedupeRecords([]).length === 0
    }
  ];
  const summary = summarizeChecks(checks);

  return {
    ...summary,
    performanceScore: Math.round(heuristicScore),
    reviewFlags,
    notes: [
      buildCheckSummaryNote(summary.checkSummary),
      `Benchmark loop completed in ${elapsedMs.toFixed(1)}ms across 5 passes.`,
      `Hidden dense dataset completed in ${hiddenElapsedMs.toFixed(1)}ms.`,
      "Order must preserve the first seen record for each id."
    ],
    notableMove: source.includes("new Set")
      ? "replaced nested scanning with a set-backed single pass"
      : source.includes("new Map")
        ? "used a map-backed gate while preserving first-seen order"
        : "reduced some overhead but left the hot path exposed"
  };
}

export const liveTasks: ArenaTaskDefinition[] = [
  {
    card: {
      id: "checkout-guard",
      name: "Checkout Guard",
      repo: "fixtures/cartline",
      category: "Hotfix",
      stakes: "A coupon bug is quietly eating margin and trust.",
      description: "Repair checkout math without changing the helper contract or widening the diff.",
      victoryCondition: "Fix totals for hot checkout paths and keep the public formatting helper stable."
    },
    prompt:
      "Repair the checkout calculation with the smallest safe patch. Percent coupons should only discount the subtotal, not shipping. Keep the public helper shape intact.",
    files: [
      {
        path: "cart.mjs",
        content: checkoutFixture
      }
    ],
    budgetMinutes: 9,
    tokenBudgetK: 160,
    evaluate: evaluateCheckout
  },
  {
    card: {
      id: "session-shield",
      name: "Session Shield",
      repo: "fixtures/gatekeeper",
      category: "Security",
      stakes: "Client payloads are exposing credentials and over-privileged scopes.",
      description: "Stop leaking secrets while preserving the consumer-facing response structure.",
      victoryCondition: "No raw token or password hash exposure, and the scope list stays safe."
    },
    prompt:
      "Close the data leak fast. Remove any raw credential exposure, sanitize scopes, and keep the function callable from existing clients.",
    files: [
      {
        path: "session.mjs",
        content: securityFixture
      }
    ],
    budgetMinutes: 12,
    tokenBudgetK: 190,
    evaluate: evaluateSecurity
  },
  {
    card: {
      id: "dedupe-dojo",
      name: "Dedupe Dojo",
      repo: "fixtures/warehouse",
      category: "Performance",
      stakes: "A nightly dedupe stage is burning time and scrambling record order.",
      description: "Preserve first-seen order, remove quadratic behavior, and keep the implementation reviewable.",
      victoryCondition: "Correct ordering plus a materially faster hot path."
    },
    prompt:
      "Replace the quadratic dedupe path with a review-safe linear strategy. Preserve first-seen order. Do not sort the output after dedupe.",
    files: [
      {
        path: "dedupe.mjs",
        content: performanceFixture
      }
    ],
    budgetMinutes: 11,
    tokenBudgetK: 180,
    evaluate: evaluatePerformance
  }
];
