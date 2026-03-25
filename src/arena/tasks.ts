import { performance } from "node:perf_hooks";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { checkoutFixture, performanceFixture, securityFixture } from "./fixtures.ts";
import type { ArenaEvaluation, ArenaTaskDefinition } from "./types.ts";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

async function importFresh(modulePath: string) {
  return import(`${pathToFileURL(modulePath).href}?t=${Date.now()}-${Math.random()}`);
}

function approxEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.001;
}

async function evaluateCheckout(workspaceDir: string): Promise<ArenaEvaluation> {
  const modulePath = path.join(workspaceDir, "cart.mjs");
  const source = await readFile(modulePath, "utf8");
  const cartModule = await importFresh(modulePath);
  const items = [
    { price: 12.5, quantity: 2 },
    { price: 15, quantity: 1 }
  ];
  const checks = [
    approxEqual(cartModule.calculateCheckoutTotal(items, null), 47.5),
    approxEqual(cartModule.calculateCheckoutTotal(items, { type: "percent", value: 0.25 }), 37.5),
    approxEqual(cartModule.calculateCheckoutTotal(items, { type: "fixed", value: 99 }), 0),
    cartModule.formatCurrency(12.5) === "$12.50"
  ];
  const reviewFlags: string[] = [];

  if (/shipping \* \(1 - coupon\.value\)/.test(source)) {
    reviewFlags.push("still discounts shipping on percent coupons");
  }
  if (/console\.log/.test(source)) {
    reviewFlags.push("debug logging left in hotfix");
  }

  return {
    passedChecks: checks.filter(Boolean).length,
    totalChecks: checks.length,
    performanceScore: source.includes("discountedSubtotal") ? 92 : source.includes("applyCoupon") ? 88 : 80,
    reviewFlags,
    notes: [
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

  const checks = [
    !("passwordHash" in result),
    !("token" in result),
    result.session?.tokenPreview === "***2619",
    JSON.stringify(result).includes(token) === false,
    Array.isArray(result.session?.scopes) &&
      result.session.scopes.length === 1 &&
      result.session.scopes[0] === "read:projects"
  ];

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
    passedChecks: checks.filter(Boolean).length,
    totalChecks: checks.length,
    performanceScore: source.includes("new Set") ? 90 : 84,
    reviewFlags,
    notes: [
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
  const large = Array.from({ length: 12000 }, (_, index) => ({
    id: `id-${index % 250}`,
    value: index
  }));

  const smallResult = dedupeModule.dedupeRecords(sample);
  const correctOrder =
    Array.isArray(smallResult) &&
    smallResult.map((record: { id: string }) => record.id).join(",") === "b,a,c";

  const startedAt = performance.now();
  for (let index = 0; index < 5; index += 1) {
    dedupeModule.dedupeRecords(large);
  }
  const elapsedMs = performance.now() - startedAt;

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

  return {
    passedChecks: [correctOrder, smallResult.length === 3, elapsedMs < 220].filter(Boolean).length,
    totalChecks: 3,
    performanceScore: Math.round(heuristicScore),
    reviewFlags,
    notes: [
      `Benchmark loop completed in ${elapsedMs.toFixed(1)}ms across 5 passes.`,
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
