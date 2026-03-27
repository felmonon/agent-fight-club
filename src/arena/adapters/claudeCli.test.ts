import { chmod, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { agents } from "../../data/season.ts";
import { createStubArenaTask, createTempDirRegistry, createWorkspace } from "../../test/support/arena.ts";
import { createClaudeCliAdapter } from "./claudeCli.ts";

const tempDirs = createTempDirRegistry();

afterEach(async () => {
  await tempDirs.cleanup();
});

describe("claude cli adapter", () => {
  it("runs through a CLI contract and returns parsed arena output", async () => {
    const { tempDir, workspaceDir } = await createWorkspace(tempDirs, "afc-claude-adapter-test-");
    const stubPath = path.join(tempDir, "claude-stub.mjs");
    await writeFile(path.join(workspaceDir, "fixture.mjs"), "export const score = 1;\n", "utf8");
    await writeFile(stubPath, STUB_SOURCE, "utf8");
    await chmod(stubPath, 0o755);

    const adapter = createClaudeCliAdapter(agents[0], {
      binary: process.execPath,
      binaryArgs: [stubPath],
      model: "claude-sonnet-4-6",
      timeoutMs: 5000
    });

    const task = createStubArenaTask();

    const result = await adapter.run({ fightId: "live-test", task, workspaceDir });
    const source = await readFile(path.join(workspaceDir, "fixture.mjs"), "utf8");

    expect(source).toContain("// claude stub edit");
    expect(result.promptStyle).toBe("Claude pressure style");
    expect(result.diffSummary).toContain("claude-sonnet-4-6");
    expect(result.tokenEstimateK).toBe(19);
    expect(result.warnings).toEqual([]);
    expect(result.capture?.provider).toBe("claude");
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

const model = take("--model") ?? "unknown";
const fixturePath = path.join(process.cwd(), "fixture.mjs");
const source = await readFile(fixturePath, "utf8");
await writeFile(fixturePath, source + "// claude stub edit\\n", "utf8");
console.log(
  JSON.stringify({
    type: "result",
    result: {
      promptStyle: "Claude pressure style",
      diffSummary: \`Stubbed a real Claude response for \${model}\`,
      notableMove: "edited the fixture file and returned structured JSON",
      tokenEstimateK: 19,
      warnings: []
    }
  })
);
`;
