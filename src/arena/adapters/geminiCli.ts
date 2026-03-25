import { spawn } from "node:child_process";
import type { AgentProfile } from "../../lib/types.ts";
import { buildArenaPrompt } from "../prompt.ts";
import type { ArenaAgentAdapter, ArenaAgentContext, ArenaAgentExecution } from "../types.ts";

export interface GeminiCliAdapterOptions {
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

  for (const key of ["response", "text", "content", "output", "message", "result"]) {
    if (key in value) {
      texts.push(...collectText(value[key]));
    }
  }

  return texts;
}

function extractJsonCandidates(value: string): string[] {
  const trimmed = value.trim();
  const candidates = [trimmed];
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const objectMatch = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

  if (fencedMatch?.[1]) {
    candidates.push(fencedMatch[1].trim());
  }

  if (objectMatch?.[1]) {
    candidates.push(objectMatch[1].trim());
  }

  return Array.from(new Set(candidates.filter(Boolean)));
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

function estimateTokensFromStats(value: unknown): number | null {
  if (!isRecord(value) || !isRecord(value.stats) || !isRecord(value.stats.models)) {
    return null;
  }

  let totalTokens = 0;

  for (const modelStats of Object.values(value.stats.models)) {
    if (!isRecord(modelStats) || !isRecord(modelStats.tokens)) {
      continue;
    }

    if (typeof modelStats.tokens.total === "number") {
      totalTokens += modelStats.tokens.total;
    }
  }

  return totalTokens > 0 ? Number((totalTokens / 1000).toFixed(1)) : null;
}

function deriveFallbackExecution(value: unknown): ArenaAgentExecution | null {
  if (!isRecord(value)) {
    return null;
  }

  const responseText = collectText(
    value.response ?? value.message ?? value.output ?? value.content ?? value.result
  )
    .join("\n")
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  if (!responseText) {
    return null;
  }

  const lines = responseText
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[-*]\s+/, ""))
    .filter(Boolean);

  return {
    promptStyle: lines[0] ?? "Gemini live corner",
    diffSummary:
      lines.find((line) => line !== lines[0]) ??
      "Gemini CLI completed the bout without returning strict arena JSON.",
    notableMove:
      lines.find((line) => line !== lines[0] && line !== lines[1]) ??
      "Applied a live workspace patch and preserved the raw replay log.",
    tokenEstimateK: estimateTokensFromStats(value) ?? 1,
    warnings: ["gemini returned unstructured arena metadata"]
  };
}

function parseJsonResult(raw: string): ArenaAgentExecution {
  const queue: unknown[] = [raw.trim()];
  const visited = new Set<unknown>();
  let fallbackExecution: ArenaAgentExecution | null = null;

  while (queue.length > 0) {
    const current = queue.shift();

    if (typeof current === "string") {
      if (current.length === 0) {
        continue;
      }

      for (const candidate of extractJsonCandidates(current)) {
        try {
          queue.push(JSON.parse(candidate));
        } catch {
          // Keep scanning.
        }
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

    fallbackExecution ??= deriveFallbackExecution(current);

    for (const key of ["response", "text", "content", "output", "message", "result"]) {
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

  if (fallbackExecution) {
    return fallbackExecution;
  }

  throw new Error(`Gemini CLI did not return a valid arena JSON payload.\n${tail(raw)}`);
}

async function runGeminiCli(
  context: ArenaAgentContext,
  profile: AgentProfile,
  options: GeminiCliAdapterOptions
): Promise<ArenaAgentExecution> {
  const timeoutMs = options.timeoutMs ?? 300_000;
  const binary = options.binary ?? "gemini";
  const binaryArgs = options.binaryArgs ?? [];
  const prompt = buildArenaPrompt(profile, context.task);

  const args = [
    ...binaryArgs,
    "--prompt",
    prompt,
    "--output-format",
    "json",
    "--approval-mode",
    "yolo"
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
    throw new Error(`Gemini CLI timed out after ${timeoutMs}ms.\n${tail(stdout || stderr)}`);
  }

  if (exitCode !== 0) {
    throw new Error(`Gemini CLI exited with code ${exitCode}.\n${tail(`${stdout}\n${stderr}`)}`);
  }

  const parsed = parseJsonResult(stdout);
  parsed.capture = {
    provider: "gemini",
    model: options.model,
    stdoutTail: stdout.trim() ? tail(stdout) : undefined,
    stderrTail: stderr.trim() ? tail(stderr) : undefined,
    transcript: [
      ...(stdout.trim()
        ? [{ channel: "stdout" as const, title: "Gemini stdout", text: tail(stdout) }]
        : []),
      ...(stderr.trim()
        ? [{ channel: "stderr" as const, title: "Gemini stderr", text: tail(stderr) }]
        : [])
    ]
  };
  return parsed;
}

export function createGeminiCliAdapter(
  profile: AgentProfile,
  options: GeminiCliAdapterOptions = {}
): ArenaAgentAdapter {
  return {
    profile,
    run(context) {
      return runGeminiCli(context, profile, options);
    }
  };
}
