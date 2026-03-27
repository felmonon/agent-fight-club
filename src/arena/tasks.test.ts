import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { scriptedAgentMap } from "./scriptedAgents.ts";
import { liveTasks } from "./tasks.ts";

const cleanupDirs: string[] = [];

afterEach(async () => {
  await Promise.all(cleanupDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function materializeTask(taskId: string) {
  const task = liveTasks.find((candidate) => candidate.card.id === taskId);
  if (!task) {
    throw new Error(`Unknown task: ${taskId}`);
  }

  const workspaceDir = await mkdtemp(path.join(os.tmpdir(), `afc-task-test-${taskId}-`));
  cleanupDirs.push(workspaceDir);

  await Promise.all(
    task.files.map((file) => writeFile(path.join(workspaceDir, file.path), file.content, "utf8"))
  );

  return { task, workspaceDir };
}

describe("arena task evaluation", () => {
  it("captures public and hidden coverage for a winning checkout fix", async () => {
    const { task, workspaceDir } = await materializeTask("checkout-guard");
    const ghostwire = scriptedAgentMap.get("ghostwire");

    if (!ghostwire) {
      throw new Error("Missing scripted Ghostwire agent.");
    }

    await ghostwire.run({ fightId: "test-checkout", task, workspaceDir });
    const evaluation = await task.evaluate(workspaceDir);

    expect(evaluation.checkSummary).toEqual({
      publicPassed: 4,
      publicTotal: 4,
      hiddenPassed: 4,
      hiddenTotal: 4
    });
    expect(evaluation.robustnessScore).toBe(100);
    expect(evaluation.notes[0]).toContain("4/4 public, 4/4 hidden");
  });

  it("uses hidden checks to catch the original performance fixture weakness", async () => {
    const { task, workspaceDir } = await materializeTask("dedupe-dojo");
    const evaluation = await task.evaluate(workspaceDir);

    expect(evaluation.checkSummary?.publicPassed).toBe(2);
    expect(evaluation.checkSummary?.publicTotal).toBe(3);
    expect(evaluation.checkSummary?.hiddenPassed).toBeLessThan(evaluation.checkSummary?.hiddenTotal ?? 0);
    expect(evaluation.robustnessScore).toBeLessThan(100);
    expect(evaluation.notes[0]).toContain("public");
    expect(evaluation.notes[0]).toContain("hidden");
  });
});
