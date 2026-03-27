import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { agents as seedAgents } from "../data/season.ts";
import type { AgentProfile } from "../lib/types.ts";
import type { ArenaAgentAdapter, ArenaAgentContext, ArenaAgentExecution } from "./types.ts";

type PatchHandler = (context: ArenaAgentContext) => Promise<ArenaAgentExecution>;

function requireProfile(id: string): AgentProfile {
  const profile = seedAgents.find((candidate) => candidate.id === id);
  if (!profile) {
    throw new Error(`Unknown agent profile: ${id}`);
  }
  return profile;
}

async function rewriteFile(
  workspaceDir: string,
  relativePath: string,
  transform: (source: string) => string
): Promise<string> {
  const targetPath = path.join(workspaceDir, relativePath);
  const source = await readFile(targetPath, "utf8");
  const next = transform(source);
  await writeFile(targetPath, next, "utf8");
  return next;
}

function scriptedAgent(profileId: string, handlers: Record<string, PatchHandler>): ArenaAgentAdapter {
  return {
    profile: requireProfile(profileId),
    provider: "scripted",
    async run(context) {
      const handler = handlers[context.task.card.id];
      if (!handler) {
        return {
          promptStyle: "Walk the repo carefully and refuse a bad swing.",
          diffSummary: "No meaningful patch landed.",
          notableMove: "declined to force a change without a clear path",
          tokenEstimateK: 22,
          warnings: ["no patch applied"]
        };
      }

      return handler(context);
    }
  };
}

const ghostwire = scriptedAgent("ghostwire", {
  async "checkout-guard"(context) {
    await rewriteFile(context.workspaceDir, "cart.mjs", (source) =>
      source.replace(
        '    return Number(Math.max(0, subtotal * (1 - coupon.value) + shipping * (1 - coupon.value)).toFixed(2));',
        '    const discountedSubtotal = subtotal * (1 - coupon.value);\n    return Number(Math.max(0, discountedSubtotal + shipping).toFixed(2));'
      )
    );

    return {
      promptStyle: "Find the failing path, touch one seam, leave the rest alone.",
      diffSummary: "Surgical subtotal-only discount fix with the helper contract untouched.",
      notableMove: "kept shipping outside the coupon math and avoided a wider refactor",
      tokenEstimateK: 34,
      warnings: []
    };
  },
  async "session-shield"(context) {
    await rewriteFile(context.workspaceDir, "session.mjs", (source) =>
      source.replace(
        `export function createSessionResponse(user, token) {
  const scopes = ["read:projects", ...user.extraScopes];

  return {
    userId: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    token,
    session: {
      tokenPreview: token,
      scopes
    }
  };
}
`,
        `export function createSessionResponse(user, token) {
  const scopes = ["read:projects"];

  return {
    userId: user.id,
    email: user.email,
    session: {
      tokenPreview: "***" + token.slice(-4),
      scopes
    }
  };
}
`
      )
    );

    return {
      promptStyle: "Close the leak at the boundary and expose nothing extra.",
      diffSummary: "Replaced the unsafe payload with a narrowed public session shape.",
      notableMove: "removed the secret-bearing fields instead of masking them in-place",
      tokenEstimateK: 39,
      warnings: []
    };
  },
  async "dedupe-dojo"(context) {
    await rewriteFile(context.workspaceDir, "dedupe.mjs", () =>
      `export function dedupeRecords(records) {
  const seen = new Set();
  const unique = [];

  for (const record of records) {
    if (seen.has(record.id)) {
      continue;
    }

    seen.add(record.id);
    unique.push(record);
  }

  return unique;
}
`
    );

    return {
      promptStyle: "Trade no review trust for the speedup. Delete the hot loop cleanly.",
      diffSummary: "Single-pass set-backed dedupe that preserves first-seen order.",
      notableMove: "deleted the post-dedupe sort to preserve behavior and recover speed",
      tokenEstimateK: 41,
      warnings: []
    };
  }
});

const ironclad = scriptedAgent("ironclad", {
  async "checkout-guard"(context) {
    await rewriteFile(context.workspaceDir, "cart.mjs", () =>
      `function applyCouponToSubtotal(subtotal, coupon) {
  if (!coupon) {
    return subtotal;
  }

  if (coupon.type === "percent") {
    return subtotal * (1 - coupon.value);
  }

  return Math.max(0, subtotal - coupon.value);
}

export function calculateCheckoutTotal(items, coupon) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 7.5;
  const discountedSubtotal = applyCouponToSubtotal(subtotal, coupon);
  return Number(Math.max(0, discountedSubtotal + shipping).toFixed(2));
}

export function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}
`
    );

    return {
      promptStyle: "Win the incident and make the next reviewer faster.",
      diffSummary: "Extracted coupon logic into a safe helper and guarded the public output.",
      notableMove: "isolated the risky math behind one helper instead of repeating branches",
      tokenEstimateK: 57,
      warnings: []
    };
  },
  async "session-shield"(context) {
    await rewriteFile(context.workspaceDir, "session.mjs", () =>
      `function sanitizeScopes(extraScopes) {
  return Array.from(new Set(["read:projects", ...extraScopes])).filter(
    (scope) => scope === "read:projects"
  );
}

export function createSessionResponse(user, token) {
  return {
    userId: user.id,
    email: user.email,
    session: {
      tokenPreview: "***" + token.slice(-4),
      scopes: sanitizeScopes(user.extraScopes)
    }
  };
}
`
    );

    return {
      promptStyle: "Tighten the payload and leave an audit-friendly shape behind.",
      diffSummary: "Added explicit scope sanitization and removed all secret-bearing fields.",
      notableMove: "converted the leak into an allowlisted response path",
      tokenEstimateK: 63,
      warnings: []
    };
  },
  async "dedupe-dojo"(context) {
    await rewriteFile(context.workspaceDir, "dedupe.mjs", () =>
      `export function dedupeRecords(records) {
  const seen = new Map();
  const unique = [];

  for (const record of records) {
    if (seen.has(record.id)) {
      continue;
    }

    seen.set(record.id, true);
    unique.push(record);
  }

  return unique;
}
`
    );

    return {
      promptStyle: "Make the speedup obvious and the code handoff safe.",
      diffSummary: "Map-backed dedupe with first-seen order preserved and no sorting pass.",
      notableMove: "replaced the nested scan with a predictable gate while staying explicit",
      tokenEstimateK: 58,
      warnings: []
    };
  }
});

const blackboxer = scriptedAgent("blackboxer", {
  async "checkout-guard"(context) {
    await rewriteFile(context.workspaceDir, "cart.mjs", () =>
      `export function calculateCheckoutTotal(items, coupon) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 7.5;
  const gross = subtotal + shipping;

  if (!coupon) {
    return Number(gross.toFixed(2));
  }

  if (coupon.type === "percent") {
    return Number(Math.max(0, gross * (1 - coupon.value)).toFixed(2));
  }

  return Number(Math.max(0, gross - coupon.value).toFixed(2));
}

export function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}
`
    );

    return {
      promptStyle: "Flatten the flow, go straight for the visible bug, ask forgiveness later.",
      diffSummary: "Aggressive rewrite of the checkout total path into one compressed branch.",
      notableMove: "collapsed the computation into a single gross-total path",
      tokenEstimateK: 79,
      warnings: ["wide rewrite for a hotfix"]
    };
  },
  async "session-shield"(context) {
    await rewriteFile(context.workspaceDir, "session.mjs", () =>
      `export function createSessionResponse(user, token) {
  const scopes = Array.from(new Set(["read:projects", ...user.extraScopes]));

  return {
    userId: user.id,
    email: user.email,
    session: {
      tokenPreview: token,
      scopes
    }
  };
}
`
    );

    return {
      promptStyle: "Cut the obvious leak and keep the patch moving.",
      diffSummary: "Removed some sensitive fields but left the preview path dangerously exposed.",
      notableMove: "trimmed the payload fast but stopped short of a full security closure",
      tokenEstimateK: 71,
      warnings: ["security patch leaves risky preview semantics"]
    };
  },
  async "dedupe-dojo"(context) {
    await rewriteFile(context.workspaceDir, "dedupe.mjs", () =>
      `export function dedupeRecords(records) {
  const seen = Object.create(null);
  const unique = [];

  for (const record of records) {
    if (seen[record.id]) {
      continue;
    }

    seen[record.id] = true;
    unique.push(record);
  }

  return unique;
}
`
    );

    return {
      promptStyle: "If the profiler shows blood in the water, swing hard.",
      diffSummary: "Object-backed single-pass dedupe with the order-preserving sort removed.",
      notableMove: "ripped out the quadratic loop and kept the hot path brutally flat",
      tokenEstimateK: 68,
      warnings: ["uses a less explicit sentinel map for speed"]
    };
  }
});

const cinder = scriptedAgent("cinder", {
  async "checkout-guard"(context) {
    await rewriteFile(context.workspaceDir, "cart.mjs", () =>
      `export function calculateCheckoutTotal(items, coupon) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 7.5;
  const couponValue =
    coupon?.type === "percent"
      ? subtotal * coupon.value
      : coupon?.value ?? 0;

  return Number(Math.max(0, subtotal - couponValue + shipping).toFixed(2));
}

export function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}
`
    );

    return {
      promptStyle: "Model the math once, then shave the overhead without losing the contract.",
      diffSummary: "Condensed the coupon path into one derived value and preserved the export surface.",
      notableMove: "turned coupon branching into one derived scalar before assembling the total",
      tokenEstimateK: 55,
      warnings: []
    };
  },
  async "session-shield"(context) {
    await rewriteFile(context.workspaceDir, "session.mjs", () =>
      `export function createSessionResponse(user, token) {
  const scopes = Array.from(new Set(["read:projects", ...user.extraScopes]));

  return {
    userId: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    session: {
      tokenPreview: "***" + token.slice(-4),
      scopes
    }
  };
}
`
    );

    return {
      promptStyle: "Close the visible exploit, then tidy the surrounding shape.",
      diffSummary: "Masked the token preview and deduped scopes, but left one secret field behind.",
      notableMove: "secured the preview path while still carrying an avoidable payload leak",
      tokenEstimateK: 59,
      warnings: ["payload still carries a sensitive field"]
    };
  },
  async "dedupe-dojo"(context) {
    await rewriteFile(context.workspaceDir, "dedupe.mjs", () =>
      `export function dedupeRecords(records) {
  const seen = new Map();
  const unique = [];

  for (const record of records) {
    if (seen.has(record.id)) {
      continue;
    }

    seen.set(record.id, record);
    unique.push(record);
  }

  return unique;
}
`
    );

    return {
      promptStyle: "Treat the benchmark like an operations incident and remove the waste.",
      diffSummary: "Map-backed linear dedupe with first-seen order preserved and no final sort.",
      notableMove: "kept the gate explicit while deleting the benchmark killer",
      tokenEstimateK: 53,
      warnings: []
    };
  }
});

export const scriptedAgents = [ghostwire, ironclad, blackboxer, cinder];

export const scriptedAgentMap = new Map(scriptedAgents.map((agent) => [agent.profile.id, agent] as const));
