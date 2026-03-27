import { spawn } from "node:child_process";
import type { AgentProfile } from "../../lib/types.ts";
import { buildArenaPrompt } from "../prompt.ts";
import type { ArenaAgentAdapter, ArenaAgentContext, ArenaAgentExecution } from "../types.ts";

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    promptStyle: { type: "string" },
    diffSummary: { type: "string" },
    notableMove: { type: "string" },
    tokenEstimateK: { type: "number" },
    warnings: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["promptStyle", "diffSummary", "notableMove", "tokenEstimateK", "warnings"],
  additionalProperties: false
} as const;

export interface ClaudeCliAdapterOptions {
  binary?: string;
  binaryArgs?: string[];
  model?: string;
  timeoutMs?: number;
}

function tail(text: string, maxLength = 1200): string {
  return text.length <= maxLength ? text : text.slice(text.length - maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function collectText(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectText(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  const texts: string[] = [];

  for (const key of ["text", "content", "output", "message", "result"]) {
    if (key in value) {
      texts.push(...collectText(value[key]));
    }
  }

  return texts;
}

function coerceExecution(value: unknown): ArenaAgentExecution | null {
  if (!isRecord(value)) {
    return null;
  }

  const promptStyle = value.promptStyle;
  const diffSummary = value.diffSummary;
  const notableMove = value.notableMove;
  const tokenEstimateK = value.tokenEstimateK;
  const warnings = value.warnings;

  if (
    typeof promptStyle !== "string" ||
    typeof diffSummary !== "string" ||
    typeof notableMove !== "string" ||
    typeof tokenEstimateK !== "number"
  ) {
    return null;
  }

  return {
    promptStyle,
    diffSummary,
    notableMove,
    tokenEstimateK,
    warnings: Array.isArray(warnings) ? warnings.filter((item): item is string => typeof item === "string") : []
  };
}

function parseExecutionPayload(raw: string): ArenaAgentExecution {
  const queue: unknown[] = [raw.trim()];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (typeof current === "string") {
      if (current.length === 0) {
        continue;
      }

      try {
        queue.push(JSON.parse(current));
      } catch {
        continue;
      }

      continue;
    }

    if (!isRecord(current) || visited.has(current)) {
      continue;
    }

    visited.add(current);

    const direct = coerceExecution(current);
    if (direct) {
      return direct;
    }

    for (const key of ["structured_output", "result", "output", "message", "text", "content"]) {
      if (!(key in current)) {
        continue;
      }

      const next = current[key];
      if (typeof next === "string") {
        queue.push(next);
      } else if (Array.isArray(next)) {
        queue.push(...collectText(next));
      } else if (isRecord(next)) {
        queue.push(next);
      }
    }
  }

  throw new Error(`Claude CLI did not return a valid arena JSON payload.\n${tail(raw)}`);
}

function extractClaudeError(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.is_error === true && typeof parsed.result === "string") {
      return parsed.result;
    }
    if (typeof parsed.error === "string") {
      return parsed.error;
    }
  } catch {
    // Keep the generic tail fallback below.
  }

  return null;
}

async function runClaudeExec(
  context: ArenaAgentContext,
  profile: AgentProfile,
  options: ClaudeCliAdapterOptions
): Promise<ArenaAgentExecution> {
  const timeoutMs = options.timeoutMs ?? 300_000;
  const binary = options.binary ?? "claude";
  const binaryArgs = options.binaryArgs ?? [];
  const prompt = buildArenaPrompt(profile, context.task);

  const args = [
    ...binaryArgs,
    "-p",
    prompt,
    "--output-format",
    "json",
    "--json-schema",
    JSON.stringify(OUTPUT_SCHEMA),
    "--add-dir",
    context.workspaceDir,
    "--dangerously-skip-permissions",
    "--permission-mode",
    "bypassPermissions",
    "--no-session-persistence",
    "--tools",
    "default"
  ];

  if (options.model) {
    args.push("--model", options.model);
  }

  const child = spawn(binary, args, {
    cwd: context.workspaceDir,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stdout = "";
  let stderr = "";
  let timedOut = false;

  child.stdout.on("data", (chunk: Buffer | string) => {
    stdout += chunk.toString();
  });

  child.stderr.on("data", (chunk: Buffer | string) => {
    stderr += chunk.toString();
  });

  const timeoutHandle = setTimeout(() => {
    timedOut = true;
    child.kill("SIGTERM");
  }, timeoutMs);

  const exitCode = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  }).finally(() => {
    clearTimeout(timeoutHandle);
  });

  if (timedOut) {
    throw new Error(`Claude CLI timed out after ${timeoutMs}ms.\n${tail(stdout || stderr)}`);
  }

  if (exitCode !== 0) {
    const providerError = extractClaudeError(stdout) ?? extractClaudeError(stderr);
    throw new Error(
      providerError
        ? `Claude CLI exited with code ${exitCode}: ${providerError}`
        : `Claude CLI exited with code ${exitCode}.\n${tail(`${stdout}\n${stderr}`)}`
    );
  }

  const parsed = parseExecutionPayload(stdout);
  parsed.capture = {
    provider: "claude",
    model: options.model,
    stdoutTail: stdout.trim() ? tail(stdout) : undefined,
    stderrTail: stderr.trim() ? tail(stderr) : undefined,
    transcript: [
      ...(stdout.trim()
        ? [{ channel: "stdout" as const, title: "Claude stdout", text: tail(stdout) }]
        : []),
      ...(stderr.trim()
        ? [{ channel: "stderr" as const, title: "Claude stderr", text: tail(stderr) }]
        : [])
    ]
  };
  return parsed;
}

export function createClaudeCliAdapter(
  profile: AgentProfile,
  options: ClaudeCliAdapterOptions = {}
): ArenaAgentAdapter {
  return {
    profile,
    provider: "claude",
    run(context) {
      return runClaudeExec(context, profile, options);
    }
  };
}
