import type { AgentProfile } from "../lib/types.ts";
import type { ArenaTaskDefinition } from "./types.ts";

export function buildArenaPrompt(profile: AgentProfile, task: ArenaTaskDefinition): string {
  const allowedFiles = task.files.map((file) => `- ${file.path}`).join("\n");

  return [
    `You are ${profile.name}, fighting in Agent Fight Club for ${profile.lab}.`,
    "",
    "Your job is to edit the local files in this workspace to solve the fixture task.",
    "",
    `Task: ${task.card.name}`,
    `Category: ${task.card.category}`,
    `Repo: ${task.card.repo}`,
    `Stakes: ${task.card.stakes}`,
    `Victory condition: ${task.card.victoryCondition}`,
    `Time budget for the bout: ${task.budgetMinutes} minutes`,
    `Token budget target: ${task.tokenBudgetK}k`,
    "",
    "Task brief:",
    task.prompt,
    "",
    "You may modify only these files:",
    allowedFiles,
    "",
    "Rules:",
    "- Do not add dependencies.",
    "- Do not create extra files unless absolutely necessary.",
    "- Keep the solution reviewable and compact.",
    "- Preserve the public function/export contract unless the task explicitly requires otherwise.",
    "- Use ASCII only.",
    "",
    "Final response requirements:",
    "- Return only the final JSON object required by the output schema.",
    "- Keep `diffSummary` and `notableMove` concise and concrete.",
    "- Put any caveats in `warnings`.",
    "- Set `tokenEstimateK` to your best estimate for the run."
  ].join("\n");
}
