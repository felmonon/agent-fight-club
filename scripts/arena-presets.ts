export type ArenaPreset = {
  description: string;
  env: Record<string, string>;
  name: string;
};

export const ARENA_PRESETS: Record<string, ArenaPreset> = {
  scripted: {
    name: "Scripted season",
    description: "Deterministic built-in agents only.",
    env: {}
  },
  codex: {
    name: "All Codex",
    description: "All four fighters use real Codex corners.",
    env: {
      AFC_CODEX_AGENT_IDS: "ghostwire,ironclad,blackboxer,cinder",
      AFC_CODEX_TIMEOUT_MS: "300000"
    }
  },
  claude: {
    name: "All Claude",
    description: "All four fighters use real Claude corners.",
    env: {
      AFC_CLAUDE_AGENT_IDS: "ghostwire,ironclad,blackboxer,cinder",
      AFC_CLAUDE_TIMEOUT_MS: "300000"
    }
  },
  gemini: {
    name: "All Gemini",
    description: "All four fighters use real Gemini corners.",
    env: {
      AFC_GEMINI_AGENT_IDS: "ghostwire,ironclad,blackboxer,cinder",
      AFC_GEMINI_TIMEOUT_MS: "300000"
    }
  },
  versus: {
    name: "Codex vs Gemini",
    description: "Ghostwire and Ironclad run on Codex. Blackboxer and Cinder run on Gemini.",
    env: {
      AFC_CODEX_AGENT_IDS: "ghostwire,ironclad",
      AFC_GEMINI_AGENT_IDS: "blackboxer,cinder",
      AFC_CODEX_TIMEOUT_MS: "300000",
      AFC_GEMINI_TIMEOUT_MS: "300000"
    }
  },
  multiverse: {
    name: "Multiverse Main Card",
    description: "Ghostwire runs on Codex, Ironclad on Claude, Blackboxer on Gemini, and Cinder stays scripted.",
    env: {
      AFC_CODEX_AGENT_IDS: "ghostwire",
      AFC_CLAUDE_AGENT_IDS: "ironclad",
      AFC_GEMINI_AGENT_IDS: "blackboxer",
      AFC_CODEX_TIMEOUT_MS: "300000",
      AFC_CLAUDE_TIMEOUT_MS: "300000",
      AFC_GEMINI_TIMEOUT_MS: "300000"
    }
  }
};

export function getArenaPreset(presetKey: string) {
  return ARENA_PRESETS[presetKey];
}

export function formatArenaPresetUsage() {
  const lines = [
    "Usage: node --experimental-strip-types scripts/run-arena-preset.ts <preset>",
    "",
    "Available presets:"
  ];

  for (const [key, preset] of Object.entries(ARENA_PRESETS)) {
    lines.push(`- ${key}: ${preset.description}`);
  }

  return lines.join("\n");
}
