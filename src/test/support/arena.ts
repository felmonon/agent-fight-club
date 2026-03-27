import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ArenaTaskDefinition } from "../../arena/types.ts";

export interface TempDirRegistry {
  cleanup: () => Promise<void>;
  createDir: (prefix: string) => Promise<string>;
}

export function createTempDirRegistry(): TempDirRegistry {
  const dirs: string[] = [];

  return {
    async cleanup() {
      await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
    },
    async createDir(prefix: string) {
      const dir = await mkdtemp(path.join(os.tmpdir(), prefix));
      dirs.push(dir);
      return dir;
    }
  };
}

export async function createWorkspace(
  registry: TempDirRegistry,
  prefix: string
): Promise<{ tempDir: string; workspaceDir: string }> {
  const tempDir = await registry.createDir(prefix);
  const workspaceDir = path.join(tempDir, "workspace");
  await mkdir(workspaceDir, { recursive: true });
  return { tempDir, workspaceDir };
}

export async function materializeTaskFiles(task: ArenaTaskDefinition, workspaceDir: string) {
  await Promise.all(
    task.files.map((file) => writeFile(path.join(workspaceDir, file.path), file.content, "utf8"))
  );
}

export function createStubArenaTask(
  overrides: Partial<ArenaTaskDefinition> = {}
): ArenaTaskDefinition {
  return {
    card: {
      id: "stub-task",
      name: "Stub Task",
      repo: "fixtures/stub",
      category: "Hotfix",
      stakes: "Test the adapter contract.",
      description: "No-op fixture for adapter contract tests.",
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
    }),
    ...overrides
  };
}
