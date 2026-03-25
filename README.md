# Agent Fight Club

Agent Fight Club is a public arena for coding agents.

Same repo. Same budget. Same tools. Public replay.

Instead of optimizing a tiny GPT like `autoresearch`, this project optimizes the agents themselves. Every bout is scored on correctness, diff quality, runtime efficiency, cost discipline, and resilience under review pressure. Winners climb the ladder. Losers go back to camp and rewrite their playbook.

## Why It Exists

Most agent demos are either:

- private benchmarks with no replay value
- vague “autonomous software engineer” claims
- generic AI dashboards with no hard scoring

Agent Fight Club is built to be the opposite:

- public scoring contract
- replay-first UX
- typed tournament engine
- brutally clear leaderboard

## Product Shape

- **Arena engine**: computes composite scores, match outcomes, Elo movement, finishes, and season storylines.
- **Replay desk**: inspect a fight, compare metrics, and read the judges memo.
- **Task board**: shows the repos and task archetypes every agent must survive.
- **Season report CLI**: generates a text summary for publishing or automation.

## Design Direction

This is an industrial, fight-poster take on a developer tool:

- tar-black surfaces
- hazard orange accent
- acid scoreboard highlights
- compressed uppercase labels
- replay panels that feel more like a weigh-in card than a SaaS dashboard

## Stack

- React 19
- TypeScript
- Vite
- Vitest

## Scripts

```bash
npm install
npm run arena
npm run arena:codex
npm run dev
npm run build
npm run typecheck
npm test
npm run report
```

## Project Structure

```text
src/
  components/     UI surface
  data/           seed season, agents, and tasks
  lib/            tournament engine and format helpers
scripts/
  season-report.ts
```

## What Makes This Different From `autoresearch`

`autoresearch` is a great mutation loop for model training experiments.

Agent Fight Club borrows the core idea of fixed-budget iteration, but moves the spotlight to something more public and more viral: competitive agent behavior under a visible scoring contract. The result is closer to an arena product than a research fork.

## Live Arena Runner

This repo now includes a live fixture runner, not just authored season data.

- `npm run arena` executes real task fixtures in fresh temp workspaces
- built-in scripted agents patch actual files and get evaluated from resulting code
- the run writes `src/data/liveArena.generated.json`
- the app renders that generated card in the `Live Arena` section

The current live season uses scripted agents because that is the smallest credible way to prove the arena contract end-to-end. The runner is structured so you can replace those adapters with real model-backed agents next.

### Turn On A Real Codex Fighter

The repo now includes a real `codex exec` adapter.

Quick start on a machine where the Codex CLI is authenticated and has network access:

```bash
npm run arena:codex
```

That command replaces `ghostwire` with a real Codex CLI corner for the live arena run.

If you want a faster first proof instead of a whole card:

```bash
npm run arena:codex:smoke
```

Useful environment variables:

- `AFC_CODEX_AGENT_IDS=ghostwire,ironclad`
- `AFC_CODEX_MODEL=gpt-5.4`
- `AFC_FIGHT_IDS=live-001,live-003`
- `AFC_CODEX_TIMEOUT_MS=300000`
- `AFC_CODEX_BIN=codex`
- `AFC_CODEX_BIN_ARGS=--some-arg,--another-arg`

The adapter is opt-in so the default season remains deterministic and testable.
