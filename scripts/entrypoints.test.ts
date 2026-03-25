import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("package script entrypoints", () => {
  it("references script files that exist on disk", async () => {
    const packagePath = path.resolve("package.json");
    const raw = await readFile(packagePath, "utf8");
    const packageJson = JSON.parse(raw) as {
      scripts?: Record<string, string>;
    };

    const entrypoints = Array.from(
      new Set(
        Object.values(packageJson.scripts ?? {})
          .flatMap((script) => script.match(/scripts\/[A-Za-z0-9._/-]+\.ts/g) ?? [])
      )
    );

    expect(entrypoints).toContain("scripts/run-arena-preset.ts");
    expect(entrypoints.length).toBeGreaterThan(0);

    for (const entrypoint of entrypoints) {
      await expect(access(path.resolve(entrypoint))).resolves.toBeUndefined();
    }
  });
});
