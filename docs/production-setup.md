# Production Setup

This repo now has two production workflows:

- `.github/workflows/publish-live-arena.yml`
- `.github/workflows/deploy-vercel.yml`

The first one generates and archives a live card. The second one deploys the site to Vercel.

## Vercel Setup

One-time steps:

1. Import the repository into Vercel.
2. Confirm the framework is detected as Vite.
3. Keep the project rooted at the repo root.
4. Add these GitHub repository secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

`vercel.json` is already configured to:

- build the Vite app from `dist`
- rewrite SPA routes like `/live`, `/replay`, `/fight/:id`, and `/archive` to `index.html`
- preserve static report files under `/reports/...`
- disable caching for the mutable latest-card artifacts

## Publish Preset Contract

Use this command to see the exact provider contract for any preset:

```bash
node --experimental-strip-types scripts/publish-provider-contract.ts scripted
node --experimental-strip-types scripts/publish-provider-contract.ts versus
node --experimental-strip-types scripts/publish-provider-contract.ts multiverse --check-secrets
```

Preset to provider mapping:

- `scripted`: no external provider secrets required
- `codex`: `OPENAI_API_KEY` or `CODEX_AUTH_JSON_B64`
- `claude`: `ANTHROPIC_API_KEY`
- `gemini`: `GEMINI_API_KEY` or `GEMINI_OAUTH_CREDS_JSON_B64`
- `versus`: `OPENAI_API_KEY` or `CODEX_AUTH_JSON_B64`, plus `GEMINI_API_KEY` or `GEMINI_OAUTH_CREDS_JSON_B64`
- `multiverse`: `OPENAI_API_KEY` or `CODEX_AUTH_JSON_B64`, `ANTHROPIC_API_KEY`, and `GEMINI_API_KEY` or `GEMINI_OAUTH_CREDS_JSON_B64`

Optional GitHub repository variables for model and timeout control:

- `AFC_CODEX_MODEL`
- `AFC_CODEX_TIMEOUT_MS`
- `AFC_CLAUDE_MODEL`
- `AFC_CLAUDE_TIMEOUT_MS`
- `AFC_GEMINI_MODEL`
- `AFC_GEMINI_TIMEOUT_MS`
- `AFC_ARENA_HEARTBEAT_MS`

The publish workflow installs provider CLIs only when the selected preset needs them. It also enables arena lifecycle logs in CI and emits a heartbeat every `AFC_ARENA_HEARTBEAT_MS` milliseconds while live corners are still running.

## Recommended First Real Publish

Start with `versus`.

Why:

- it exercises two real providers without requiring all three
- it keeps the contract smaller than `multiverse`
- it gives you a credible public card faster than waiting for full-provider coverage

Suggested workflow order:

1. Add either `OPENAI_API_KEY` or `CODEX_AUTH_JSON_B64`, and either `GEMINI_API_KEY` or `GEMINI_OAUTH_CREDS_JSON_B64`.
2. Set optional model vars if you want to pin models.
3. Run `Publish Live Arena` manually with preset `versus`.
4. Check the committed artifacts under `public/reports/archive/`.
5. Let the push to `main` trigger `Deploy Vercel`.

## Notes About CI Auth

The workflows support either API-key auth or base64-encoded auth bundles for Codex and Gemini.

- Codex CLI is installed in CI via `npm install -g @openai/codex`
- Claude Code is installed in CI via `npm install -g @anthropic-ai/claude-code`
- Gemini CLI is installed in CI via `npm install -g @google/gemini-cli`
- `CODEX_AUTH_JSON_B64` should be the base64-encoded contents of `~/.codex/auth.json`
- `GEMINI_OAUTH_CREDS_JSON_B64` should be the base64-encoded contents of `~/.gemini/oauth_creds.json`

If those bundle secrets are present, the publish workflow restores them to the same home-directory paths before running the provider CLIs. For Gemini OAuth, the workflow also writes a minimal `~/.gemini/settings.json` with `oauth-personal` selected so the CLI uses the restored bundle non-interactively.

## Workflow Guardrails

- `Publish Live Arena` has a 60-minute job timeout.
- The `Publish live arena` step itself has a 40-minute timeout.
- Long-running provider bouts log fight start, corner start, heartbeat, corner completion, and fight result lines into the GitHub Actions log.
