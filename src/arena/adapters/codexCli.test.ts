import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { agents } from "../../data/season.ts";
import { createCodexCliAdapter } from "./codexCli.ts";
import type { ArenaTaskDefinition } from "../types.ts";

const cleanupDirs: string[] = [];

afterEach(async () => {
  await Promise.all(cleanupDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("codex cli adapter", () => {
  it("runs through a CLI contract and returns parsed arena output", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "afc-codex-adapter-test-"));
    cleanupDirs.push(tempDir);

    const workspaceDir = path.join(tempDir, "workspace");
    const stubPath = path.join(tempDir, "codex-stub.mjs");
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(path.join(workspaceDir, "fixture.mjs"), "export const score = 1;\n", "utf8");
    await writeFile(stubPath, STUB_SOURCE, "utf8");
    await chmod(stubPath, 0o755);

    const adapter = createCodexCliAdapter(agents[0], {
      binary: process.execPath,
      binaryArgs: [stubPath],
      timeoutMs: 5000
    });

    const task: ArenaTaskDefinition = {
      card: {
        id: "stub-task",
        name: "Stub Task",
        repo: "fixtures/stub",
        category: "Hotfix",
        stakes: "Test the adapter contract.",
        description: "No-op fixture for the Codex CLI adapter test.",
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

    expect(source).toContain("// codex stub edit");
    expect(result.promptStyle).toBe("Stub pressure style");
    expect(result.tokenEstimateK).toBe(17);
    expect(result.warnings).toEqual([]);
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

const workspaceDir = take("--cd");
const outputPath = take("-o");
const fixturePath = path.join(workspaceDir, "fixture.mjs");
const source = await readFile(fixturePath, "utf8");
await writeFile(fixturePath, source + "// codex stub edit\\n", "utf8");
await writeFile(
  outputPath,
  JSON.stringify({
    promptStyle: "Stub pressure style",
    diffSummary: "Stubbed a real codex exec response",
    notableMove: "edited the fixture file and returned structured JSON",
    tokenEstimateK: 17,
    warnings: []
  }),
  "utf8"
);
`;
