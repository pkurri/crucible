# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Repository structure — two unrelated things share this git history

Know which one you're in before making changes; they have different
audiences, different risk profiles, and different commands.

1. **The Crucible skill pack product** — `skills/` (365+ skills), `agents/`
   (63 agent definitions), `templates/` (~114 project templates), installed
   as slash commands under `.claude/commands/`. This is the commercial
   deliverable described in the root `README.md` and sold via the Stripe
   integration in the web app below.
2. **A personal AI content-automation operation ("AAK Nation" / "empire")** —
   root-level `scripts/*.mjs`, `data/`, and the cron-scheduled
   `.github/workflows/*-empire-fleet.yml` / `*-empire-loop.yml` files. This
   produces and auto-uploads short-form video content to YouTube, Facebook,
   and Instagram, plus posts to moltbook.com (an AI-agent social network).
   Nothing here is part of the sellable skill pack.
3. **`templates/006-crucible-web/`** — the flagship Next.js 16 app. It's
   dual-purpose too: marketing/checkout site + agent-orchestration dashboard
   for the skill pack (Stripe checkout/webhook routes, `data/pricing.json`),
   *and* the deployed home of the one live Moltbook automation route (see
   below). Stack: App Router, TypeScript, Tailwind (custom
   `obsidian`/`molten`/`industrial` dark theme in `tailwind.config.ts`),
   Radix + shadcn-style components, Drizzle ORM + Postgres, Supabase,
   NextAuth v5, BullMQ/ioredis.

## Commands

### Root (skill-pack validation)

- `npm run validate` — validates skills + templates structure
  (`scripts/validate-skills.js`, `scripts/validate-templates.js`)
- `npm run format` / `npm run format:check` — Prettier over
  `**/*.{md,json,yml,yaml}`
- `npm run lint:markdown` — markdownlint over all docs (config:
  `.markdownlint.json`, 80-char line length)
- `npm run check` — runs validate + format:check + lint:markdown; run before
  committing skill/template/doc changes
- `npm run build` — installs deps and builds `templates/006-crucible-web`
  only (the only thing the root "build" script builds)

### Web app (`cd templates/006-crucible-web`)

- `npm run dev` / `npm run build` / `npm run start` — Next.js dev/build/serve
- `npm run lint` — `next lint`
- `npm run type-check` — `tsc --noEmit`
- `npm run db:generate` / `db:migrate` / `db:studio` — Drizzle ORM migrations
  against the Postgres/Supabase schema
- `npm run forge:start` / `npm run agents:start` — run the autonomous-forge /
  agent-orchestrator workers directly (`src/workers/`)

### Automation scripts (root `scripts/*.mjs`)

Run directly with `node scripts/<name>.mjs`; most accept `--topic`/`--basedir`
flags and read credentials from local JSON files or env vars (see
Credentials below). There's no test suite for these — verify behavior by
checking the matching `.github/workflows/*.yml` for the exact flags/env CI
uses, since that's the only place the "correct" invocation is guaranteed to
be current.

## Architecture: the "empire loop" pattern

Every platform loop (`youtube-empire-loop.mjs`, `facebook-empire-loop.mjs`,
`instagram-empire-loop.mjs`) follows the same pipeline, each wired to its own
`.github/workflows/*-empire-fleet.yml` cron job:

`niche-strategist.mjs` → `viral-script-architect.mjs` →
`autonomous-asset-generator.mjs` (image sourcing falls back Pexels → Stable
Horde → Picsum; Picsum retries 3x since it's the last resort) → platform
uploader (`youtube-official-uploader.mjs` / `meta-official-uploader.mjs`) →
state written to `scripts/<platform>-empire-state.json`.

Each workflow commits its own state file back to `main` with `[skip ci]`
(`git add -f data/... scripts/*-empire-state.json && git commit -m "chore:
update X upload cycle [skip ci]"`) — this is why `data/` is gitignored
broadly but specific state files are force-added in CI. Real
audience/eligibility metrics (subscribers, views, eligibility-threshold
progress) live in `data/monetization-status.json`, generated daily by
`scripts/monetization-status-report.mjs` — treat the `rev`/
`totalEmpireRevenue` fields still present in some older state files as
simulated placeholders, not real numbers.

## Architecture: Moltbook automation has 3 generations — only 1 is live

`scripts/moltbook-full-automation.mjs`, `moltbook-scheduler.mjs`,
`moltbook-heartbeat.mjs`, `moltbook-post.mjs`, and related root scripts are
legacy and **not scheduled by anything** — don't assume they run, and don't
trust their state files (`scripts/moltbook-state.json`,
`scripts/agent-states/*.json`) as current. The only live Moltbook path is
`templates/006-crucible-web/src/app/api/moltbook/automation/route.ts`,
deployed to forge-agents.space and cron-hit every 30 min by
`.github/workflows/moltbook-pinger.yml`. That workflow's `curl` has no
failure guard, so a green run in `gh run list` does not mean the automation
call actually succeeded — check moltbook.com directly to verify real
activity. When debugging or changing live Moltbook behavior, edit
`automation/route.ts`, not the root scripts.

## Credentials

Local credential files (`client_secret.json`, `youtube-token.json`,
`scripts/moltbook-credentials.json`, `scripts/agents/*.json`) are gitignored
and must exist locally for scripts to run standalone. In CI, workflows write
them from GitHub Secrets at runtime and delete them after (see the
`Setup YouTube Credentials` step in `.github/workflows/youtube-empire-fleet.yml`
for the pattern). This repo has had real keys committed to git before despite
`.gitignore` coverage (added after the fact, so history still carried them) —
always confirm a new credential file is actually untracked (`git status`)
after adding it to `.gitignore`, not just ignored going forward.

YouTube auth: `node scripts/youtube-auth-test.mjs` runs the local OAuth
consent flow and auto-syncs the resulting token to the `YOUTUBE_TOKEN_JSON`
GitHub secret via `gh secret set`. If the empire fleet starts failing with
`invalid_grant`, the refresh token has died (commonly because the Google
Cloud OAuth consent screen is still in "Testing" mode, which expires tokens
after 7 days) — re-run that script, and double check the Google account
picker lands on the intended channel before trusting the result, since a
stale browser session/tab can silently authorize the wrong channel.

## Skill/workflow categories

365+ skills and agents are available as slash commands
(`.claude/commands/`); the most commonly used are grouped below. Full list:
`ls skills/`.

### Workflows

- `/workflow-crucible` — End-to-end Next.js web app: idea → design →
  features → deploy → SEO
- `/workflow-project-intake` — Project intake + routing to the right
  workflow
- `/workflow-feature-cycle` — Feature planning and shipping cycle
- `/workflow-launch-sequence` — Launch readiness sequence
- `/workflow-multi-agent-build` — Multi-agent parallel build orchestration
- `/workflow-multi-agent-orchestrator` — Multi-agent orchestration framework
- `/workflow-agent-orchestration` — Agent orchestration patterns
- `/workflow-project-planner` — Project planning workflow
- `/workflow-game-web-production` — End-to-end game/web production
- `/workflow-youtube-industry` — YouTube content industry workflow
- `/gaming-studio` — Full-cycle 48-agent game studio orchestration

### Code Review

- `/review-quality` — Unified quality review (merge readiness +
  maintainability + docs)
- `/review-code` — General code review
- `/review-security` — Security review
- `/review-clean-code` — Clean Code principles analysis
- `/review-react-best-practices` — React/Next.js performance review
- `/review-merge-readiness` — Merge readiness verdict
- `/review-doc-consistency` — Docs vs code consistency
- `/review-seo-audit` — SEO audit
- `/review-architecture` — Architecture review
- `/frontend-performance-a11y` — Frontend performance & accessibility

### Services & Integrations

- `/supabase` — Database operations (query, write, migration)
- `/stripe` — Billing and payments
- `/cloudflare` — Workers, KV, R2, D1, observability
- `/github-integration` — GitHub operations
- `/neon` — Neon Postgres
- `/resend` — Email via Resend
- `/vercel-ai` — Vercel AI SDK

### Tools

- `/deep-research` — Thorough codebase research
- `/web-app-builder` — React/Next.js/Vite app builder
- `/security-audit` — Security audit
- `/tool-systematic-debugging` — Systematic debugging
- `/tool-better-auth` — Better Auth integration
- `/tool-git-intel` — Git intelligence
- `/tool-stack-doctor` — Stack health diagnostics
- `/tool-design-style-selector` — Design style selection
- `/tool-ui-ux-pro-max` — UI/UX design intelligence
- `/tool-ast-grep-rules` — AST-based code search/rewrite
- `/claude-token-saver` — Context window optimizer
- `/python-backend-expert` — Python backend guidance
- `/vector-database-search` — Vector DB search

### Gaming

- `/phaser-game-builder` — Phaser 3 browser game builder
- `/three-js-game` — Three.js/WebGL game builder
- `/multiplayer-game-networking` — Multiplayer networking
- `/game-asset-pipeline` — Game asset pipeline
- `/game-engine-helper` — Game engine selection/architecture
- `/game-qa-playtesting` — Game QA and playtesting

### Meta / Skill Management

- `/skill-creator` — Create new skills
- `/skill-evolution` — Evolve and improve skills
- `/skill-improver` — Improve skills from run artifacts

## Usage

Call any skill with its slash command, e.g.:

```text
/workflow-crucible build a SaaS habit tracker
/review-quality
/deep-research how does auth work in this project
```
