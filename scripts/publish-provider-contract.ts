import { pathToFileURL } from "node:url";
import { ARENA_PRESETS } from "./arena-presets.ts";

export type ProviderKey = "claude" | "codex" | "gemini";

export interface ProviderContract {
  provider: ProviderKey;
  binary: string;
  ciInstallCommand: string;
  requiredSecrets: string[];
  optionalEnv: string[];
}

export interface PublishPresetContract {
  presetKey: string;
  presetName: string;
  providers: ProviderContract[];
}

const PROVIDER_CONTRACTS: Record<ProviderKey, ProviderContract> = {
  codex: {
    provider: "codex",
    binary: "codex",
    ciInstallCommand: "npm install -g @openai/codex",
    requiredSecrets: ["OPENAI_API_KEY"],
    optionalEnv: [
      "AFC_CODEX_MODEL",
      "AFC_CODEX_TIMEOUT_MS",
      "AFC_CODEX_BIN",
      "AFC_CODEX_BIN_ARGS",
      "AFC_CODEX_AGENT_IDS"
    ]
  },
  claude: {
    provider: "claude",
    binary: "claude",
    ciInstallCommand: "npm install -g @anthropic-ai/claude-code",
    requiredSecrets: ["ANTHROPIC_API_KEY"],
    optionalEnv: [
      "AFC_CLAUDE_MODEL",
      "AFC_CLAUDE_TIMEOUT_MS",
      "AFC_CLAUDE_BIN",
      "AFC_CLAUDE_BIN_ARGS",
      "AFC_CLAUDE_AGENT_IDS"
    ]
  },
  gemini: {
    provider: "gemini",
    binary: "gemini",
    ciInstallCommand: "npm install -g @google/gemini-cli",
    requiredSecrets: ["GEMINI_API_KEY"],
    optionalEnv: [
      "AFC_GEMINI_MODEL",
      "AFC_GEMINI_TIMEOUT_MS",
      "AFC_GEMINI_BIN",
      "AFC_GEMINI_BIN_ARGS",
      "AFC_GEMINI_AGENT_IDS"
    ]
  }
};

function inferProvidersFromPresetEnv(env: Record<string, string>): ProviderKey[] {
  const providers: ProviderKey[] = [];

  if (env.AFC_CODEX_AGENT_IDS) {
    providers.push("codex");
  }

  if (env.AFC_CLAUDE_AGENT_IDS) {
    providers.push("claude");
  }

  if (env.AFC_GEMINI_AGENT_IDS) {
    providers.push("gemini");
  }

  return providers;
}

export function getPublishPresetContract(presetKey: string): PublishPresetContract {
  const preset = ARENA_PRESETS[presetKey];
  if (!preset) {
    throw new Error(`Unknown publish preset: ${presetKey}`);
  }

  const providers = inferProvidersFromPresetEnv(preset.env).map((provider) => PROVIDER_CONTRACTS[provider]);

  return {
    presetKey,
    presetName: preset.name,
    providers
  };
}

export function getMissingSecretsForPreset(
  presetKey: string,
  env: Record<string, string | undefined> = process.env
): string[] {
  const contract = getPublishPresetContract(presetKey);
  return contract.providers
    .flatMap((provider) => provider.requiredSecrets)
    .filter((secretName) => !env[secretName]);
}

function printUsage() {
  console.log(
    [
      "Usage: node --experimental-strip-types scripts/publish-provider-contract.ts <preset> [--json] [--check-secrets]",
      "",
      "Examples:",
      "  node --experimental-strip-types scripts/publish-provider-contract.ts scripted",
      "  node --experimental-strip-types scripts/publish-provider-contract.ts versus --json",
      "  node --experimental-strip-types scripts/publish-provider-contract.ts multiverse --check-secrets"
    ].join("\n")
  );
}

function formatContract(contract: PublishPresetContract) {
  if (contract.providers.length === 0) {
    return `${contract.presetName}: scripted only, no provider secrets required.`;
  }

  const lines = [`${contract.presetName}:`];
  for (const provider of contract.providers) {
    lines.push(`- ${provider.provider}: ${provider.binary}`);
    lines.push(`  install: ${provider.ciInstallCommand}`);
    lines.push(`  required secrets: ${provider.requiredSecrets.join(", ")}`);
  }
  return lines.join("\n");
}

function isCliEntrypoint() {
  return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isCliEntrypoint()) {
  const presetKey = process.argv[2];
  const outputJson = process.argv.includes("--json");
  const checkSecrets = process.argv.includes("--check-secrets");

  if (!presetKey) {
    printUsage();
    process.exitCode = 1;
    process.exit();
  }

  const contract = getPublishPresetContract(presetKey);
  const missingSecrets = getMissingSecretsForPreset(presetKey);

  if (outputJson) {
    console.log(
      JSON.stringify(
        {
          ...contract,
          missingSecrets
        },
        null,
        2
      )
    );
  } else {
    console.log(formatContract(contract));
    if (missingSecrets.length > 0) {
      console.log(`Missing secrets: ${missingSecrets.join(", ")}`);
    }
  }

  if (checkSecrets && missingSecrets.length > 0) {
    console.error(`Missing required secrets for preset ${presetKey}: ${missingSecrets.join(", ")}`);
    process.exitCode = 1;
  }
}
