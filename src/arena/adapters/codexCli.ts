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
      throw new Error(`Codex CLI timed out after ${timeoutMs}ms.\n${tail(stdout || stderr)}`);
    }

    if (exitCode !== 0) {
      throw new Error(`Codex CLI exited with code ${exitCode}.\n${tail(`${stdout}\n${stderr}`)}`);
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
    run(context) {
      return runCodexExec(context, profile, options);
    }
  };
}
