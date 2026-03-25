import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { agents } from "../../data/season.ts";
import { createGeminiCliAdapter } from "./geminiCli.ts";
import type { ArenaTaskDefinition } from "../types.ts";

const cleanupDirs: string[] = [];
const originalArgsPath = process.env.AFC_GEMINI_ARGS_PATH;

afterEach(async () => {
  await Promise.all(cleanupDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));

  if (originalArgsPath === undefined) {
    delete process.env.AFC_GEMINI_ARGS_PATH;
  } else {
    process.env.AFC_GEMINI_ARGS_PATH = originalArgsPath;
  }
});

describe("gemini cli adapter", () => {
  it("runs through the Gemini CLI contract and returns parsed arena output", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "afc-gemini-adapter-test-"));
    cleanupDirs.push(tempDir);

    const workspaceDir = path.join(tempDir, "workspace");
    const stubPath = path.join(tempDir, "gemini-stub.mjs");
    const argsPath = path.join(tempDir, "args.json");
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(path.join(workspaceDir, "fixture.mjs"), "export const score = 1;\n", "utf8");
    await writeFile(stubPath, STUB_SOURCE, "utf8");
    await chmod(stubPath, 0o755);

    process.env.AFC_GEMINI_ARGS_PATH = argsPath;

    const adapter = createGeminiCliAdapter(agents[1], {
      binary: process.execPath,
      binaryArgs: [stubPath],
      timeoutMs: 5000,
      model: "gemini-test"
    });

    const task: ArenaTaskDefinition = {
      card: {
        id: "stub-task",
        name: "Stub Task",
        repo: "fixtures/stub",
        category: "Hotfix",
        stakes: "Test the adapter contract.",
        description: "No-op fixture for the Gemini CLI adapter test.",
        victoryCondition: "Modify fixture.mjs and return structured JSON."
      },
      prompt: "Append a comment to fixture.mjs",
      files: [{ path: "fixture.mjs", content: "export const score = 1;\n" }],
      budgetMinutes: 5,
      tokenBudgetK: 64,
      evaluate: async () => ({
        passedChecks: 1,
        totalChecks: 1,
        performanceScore: 90,
        reviewFlags: [],
        notes: [],
        notableMove: "stub"
      })
    };

    const result = await adapter.run({ task, workspaceDir });
    const source = await readFile(path.join(workspaceDir, "fixture.mjs"), "utf8");
    const args = JSON.parse(await readFile(argsPath, "utf8")) as {
      approvalMode: string;
      model?: string;
      prompt: string;
      outputFormat: string;
    };

    expect(source).toContain("// gemini stub edit");
    expect(result.promptStyle).toBe("Stub pressure style");
    expect(result.tokenEstimateK).toBe(19);
    expect(result.warnings).toEqual([]);
    expect(result.capture?.provider).toBe("gemini");
    expect(args.approvalMode).toBe("yolo");
    expect(args.outputFormat).toBe("json");
    expect(args.model).toBe("gemini-test");
    expect(args.prompt).toContain("You are Ironclad");
    expect(args.prompt).toContain("Task: Stub Task");
  });
});

const STUB_SOURCE = `#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

function take(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

const argsPath = process.env.AFC_GEMINI_ARGS_PATH;
const prompt = take("--prompt");
const outputFormat = take("--output-format");
const approvalMode = take("--approval-mode");
const model = take("--model");
const fixturePath = path.join(process.cwd(), "fixture.mjs");
const source = await readFile(fixturePath, "utf8");
await writeFile(fixturePath, source + "// gemini stub edit\\n", "utf8");
await writeFile(
  argsPath,
  JSON.stringify({ approvalMode, model, outputFormat, prompt }, null, 2),
  "utf8"
);
process.stdout.write(JSON.stringify({
  promptStyle: "Stub pressure style",
  diffSummary: "Stubbed a real Gemini CLI response",
  notableMove: "edited the fixture file and returned structured JSON",
  tokenEstimateK: 19,
  warnings: []
}));
`;
