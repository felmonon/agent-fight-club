import { describe, expect, it } from "vitest";
import {
  getMissingSecretsForPreset,
  getPublishPresetContract
} from "./publish-provider-contract.ts";

describe("publish provider contract", () => {
  it("treats scripted as a no-secret preset", () => {
    const contract = getPublishPresetContract("scripted");

    expect(contract.providers).toHaveLength(0);
    expect(getMissingSecretsForPreset("scripted", {})).toEqual([]);
  });

  it("maps versus to codex and gemini requirements", () => {
    const contract = getPublishPresetContract("versus");

    expect(contract.providers.map((provider) => provider.provider)).toEqual(["codex", "gemini"]);
    expect(getMissingSecretsForPreset("versus", { OPENAI_API_KEY: "x" })).toEqual(["GEMINI_API_KEY"]);
  });

  it("maps multiverse to all provider secrets", () => {
    const missing = getMissingSecretsForPreset("multiverse", {
      OPENAI_API_KEY: "x",
      ANTHROPIC_API_KEY: "y"
    });

    expect(missing).toEqual(["GEMINI_API_KEY"]);
  });
});
