import { agents as seedAgents } from "../data/season.ts";
import type { AgentProfile } from "../lib/types.ts";
import { createClaudeCliAdapter, type ClaudeCliAdapterOptions } from "./adapters/claudeCli.ts";
import { createCodexCliAdapter, type CodexCliAdapterOptions } from "./adapters/codexCli.ts";
import { createGeminiCliAdapter, type GeminiCliAdapterOptions } from "./adapters/geminiCli.ts";
import { scriptedAgentMap, scriptedAgents } from "./scriptedAgents.ts";
import type { ArenaAgentAdapter } from "./types.ts";

function requireProfile(id: string): AgentProfile {
  const profile = seedAgents.find((candidate) => candidate.id === id);
  if (!profile) {
    throw new Error(`Unknown agent profile: ${id}`);
  }
  return profile;
}

export interface LiveAgentRegistry {
  agents: ArenaAgentAdapter[];
  notes: string[];
}

function parseCsv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function claudeOptionsFromEnv(env: Record<string, string | undefined>): ClaudeCliAdapterOptions {
  return {
    binary: env.AFC_CLAUDE_BIN || "claude",
    binaryArgs: parseCsv(env.AFC_CLAUDE_BIN_ARGS),
    model: env.AFC_CLAUDE_MODEL,
    timeoutMs: env.AFC_CLAUDE_TIMEOUT_MS ? Number(env.AFC_CLAUDE_TIMEOUT_MS) : undefined
  };
}

function codexOptionsFromEnv(env: Record<string, string | undefined>): CodexCliAdapterOptions {
  return {
    binary: env.AFC_CODEX_BIN || "codex",
    binaryArgs: parseCsv(env.AFC_CODEX_BIN_ARGS),
    model: env.AFC_CODEX_MODEL,
    timeoutMs: env.AFC_CODEX_TIMEOUT_MS ? Number(env.AFC_CODEX_TIMEOUT_MS) : undefined
  };
}

function geminiOptionsFromEnv(env: Record<string, string | undefined>): GeminiCliAdapterOptions {
  return {
    binary: env.AFC_GEMINI_BIN || "gemini",
    binaryArgs: parseCsv(env.AFC_GEMINI_BIN_ARGS),
    model: env.AFC_GEMINI_MODEL,
    timeoutMs: env.AFC_GEMINI_TIMEOUT_MS ? Number(env.AFC_GEMINI_TIMEOUT_MS) : undefined
  };
}

interface ProviderRegistration {
  createAdapter: (id: string) => ArenaAgentAdapter;
  ids: string[];
  label: string;
  note: string;
}

const LIVE_AGENT_IDS = ["ghostwire", "ironclad", "blackboxer", "cinder"] as const;
const LIVE_AGENT_ID_SET = new Set<string>(LIVE_AGENT_IDS);

function requireLiveArenaAgent(id: string) {
  if (!LIVE_AGENT_ID_SET.has(id)) {
    throw new Error(
      `Unknown live arena agent: ${id}. Valid ids: ${LIVE_AGENT_IDS.join(", ")}.`
    );
  }
}

export function getLiveAgentRegistry(
  env: Record<string, string | undefined> = process.env
): LiveAgentRegistry {
  const registrations: ProviderRegistration[] = [];
  const selectedCodexIds = parseCsv(env.AFC_CODEX_AGENT_IDS);
  const selectedClaudeIds = parseCsv(env.AFC_CLAUDE_AGENT_IDS);
  const selectedGeminiIds = parseCsv(env.AFC_GEMINI_AGENT_IDS);

  if (selectedCodexIds.length > 0) {
    const codexOptions = codexOptionsFromEnv(env);
    const modelNote = codexOptions.model ? ` model ${codexOptions.model}` : "";
    registrations.push({
      ids: selectedCodexIds,
      label: "Codex CLI",
      createAdapter: (id) => createCodexCliAdapter(requireProfile(id), codexOptions),
      note: `Codex CLI enabled for: ${selectedCodexIds.join(", ")} using ${codexOptions.binary}${modelNote}.`
    });
  }

  if (selectedClaudeIds.length > 0) {
    const claudeOptions = claudeOptionsFromEnv(env);
    const modelNote = claudeOptions.model ? ` model ${claudeOptions.model}` : "";
    registrations.push({
      ids: selectedClaudeIds,
      label: "Claude CLI",
      createAdapter: (id) => createClaudeCliAdapter(requireProfile(id), claudeOptions),
      note: `Claude CLI enabled for: ${selectedClaudeIds.join(", ")} using ${claudeOptions.binary}${modelNote}.`
    });
  }

  if (selectedGeminiIds.length > 0) {
    const geminiOptions = geminiOptionsFromEnv(env);
    const modelNote = geminiOptions.model ? ` model ${geminiOptions.model}` : "";
    registrations.push({
      ids: selectedGeminiIds,
      label: "Gemini CLI",
      createAdapter: (id) => createGeminiCliAdapter(requireProfile(id), geminiOptions),
      note: `Gemini CLI enabled for: ${selectedGeminiIds.join(", ")} using ${geminiOptions.binary}${modelNote}.`
    });
  }

  const agentMap = new Map<string, ArenaAgentAdapter>(
    LIVE_AGENT_IDS.map((id) => [id, scriptedAgentMap.get(id)!] as const)
  );
  const claimedAgents = new Map<string, string>();

  for (const registration of registrations) {
    for (const id of registration.ids) {
      requireProfile(id);
      requireLiveArenaAgent(id);
      const existingProvider = claimedAgents.get(id);
      if (existingProvider) {
        throw new Error(`${id} cannot be assigned to both ${existingProvider} and ${registration.label}.`);
      }
      claimedAgents.set(id, registration.label);
      agentMap.set(id, registration.createAdapter(id));
    }
  }

  return {
    agents: LIVE_AGENT_IDS.map((id) => agentMap.get(id)!),
    notes: registrations.map((registration) => registration.note)
  };
}

export const liveAgents: ArenaAgentAdapter[] = scriptedAgents;
