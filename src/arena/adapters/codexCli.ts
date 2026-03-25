import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
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

export interface CodexCliAdapterOptions {
  binary?: string;
  binaryArgs?: string[];
  model?: string;
  timeoutMs?: number;
}

function tail(text: string, maxLength = 1200): string {
  return text.length <= maxLength ? text : text.slice(text.length - maxLength);
}

function formatCommand(binary: string, args: string[]): string {
  return [binary, ...args.map((arg) => (/\s/.test(arg) ? JSON.stringify(arg) : arg))].join(" ");
}

function buildCodexFailureMessage(args: {
  binary: string;
  commandArgs: string[];
  context: ArenaAgentContext;
  exitCode?: number | null;
  profile: AgentProfile;
  stderr: string;
  stdout: string;
  timeoutMs?: number;
}): string {
  const combined = `${args.stdout}\n${args.stderr}`;
  const lowerCombined = combined.toLowerCase();
  const hint = lowerCombined.includes("exhausted your capacity")
    ? "Hint: Codex reported quota exhaustion. Retry after the account reset window or switch models."
    : lowerCombined.includes("login") || lowerCombined.includes("auth")
      ? "Hint: Codex auth looks invalid on this runner. Rebuild the auth bundle or use OPENAI_API_KEY."
      : undefined;

  return [
    `Codex CLI failed for ${args.profile.name} on fight ${args.context.fightId} task ${args.context.task.card.id}.`,
    args.exitCode === undefined
      ? `Timeout: exceeded ${args.timeoutMs}ms.`
      : `Exit code: ${args.exitCode}.`,
    `Command: ${formatCommand(args.binary, args.commandArgs)}`,
    hint,
    args.stdout.trim() ? `Stdout tail:\n${tail(args.stdout)}` : undefined,
    args.stderr.trim() ? `Stderr tail:\n${tail(args.stderr)}` : undefined
  ]
    .filter(Boolean)
    .join("\n");
}

async function runCodexExec(
  context: ArenaAgentContext,
  profile: AgentProfile,
  options: CodexCliAdapterOptions
): Promise<ArenaAgentExecution> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "afc-codex-cli-"));
  const schemaPath = path.join(tempDir, "schema.json");
  const outputPath = path.join(tempDir, "result.json");
  const timeoutMs = options.timeoutMs ?? 300_000;
  const binary = options.binary ?? "codex";
  const binaryArgs = options.binaryArgs ?? [];
  const displayArgs = [
    ...binaryArgs,
    "exec",
    "--skip-git-repo-check",
    "--full-auto",
    "--ephemeral",
    ...(options.model ? ["--model", options.model] : [])
  ];

  await writeFile(schemaPath, `${JSON.stringify(OUTPUT_SCHEMA, null, 2)}\n`, "utf8");

  const args = [
    ...binaryArgs,
    "exec",
    "--skip-git-repo-check",
    "--full-auto",
    "--ephemeral",
    "--color",
    "never",
    "--cd",
    context.workspaceDir,
    "--output-schema",
    schemaPath,
    "-o",
    outputPath
  ];

  if (options.model) {
    args.push("--model", options.model);
  }

  args.push(buildArenaPrompt(profile, context.task));

  try {
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
      throw new Error(
        buildCodexFailureMessage({
          binary,
          commandArgs: [...displayArgs, "--cd", context.workspaceDir, "<arena-prompt>"],
          context,
          profile,
          stderr,
          stdout,
          timeoutMs
        })
      );
    }

    if (exitCode !== 0) {
      throw new Error(
        buildCodexFailureMessage({
          binary,
          commandArgs: [...displayArgs, "--cd", context.workspaceDir, "<arena-prompt>"],
          context,
          exitCode,
          profile,
          stderr,
          stdout
        })
      );
    }

    const raw = await readFile(outputPath, "utf8");
    const parsed = JSON.parse(raw) as ArenaAgentExecution;
    parsed.warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];
    parsed.capture = {
      provider: "codex",
      model: options.model,
      stdoutTail: stdout.trim() ? tail(stdout) : undefined,
      stderrTail: stderr.trim() ? tail(stderr) : undefined,
      transcript: [
        ...(stdout.trim()
          ? [{ channel: "stdout" as const, title: "Codex stdout", text: tail(stdout) }]
          : []),
        ...(stderr.trim()
          ? [{ channel: "stderr" as const, title: "Codex stderr", text: tail(stderr) }]
          : [])
      ]
    };
    return parsed;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function createCodexCliAdapter(
  profile: AgentProfile,
  options: CodexCliAdapterOptions = {}
): ArenaAgentAdapter {
  return {
    profile,
    provider: "codex",
    run(context) {
      return runCodexExec(context, profile, options);
    }
  };
}
