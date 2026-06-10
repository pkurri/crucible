# Crucible Skills & Workflows

This project contains 94 skills, workflows, and agents available as slash commands.
They are located in `skills/` and installed as `/commands` in `.claude/commands/`.

## Categories

### Workflows
- `/workflow-crucible` — End-to-end Next.js web app: idea → design → features → deploy → SEO
- `/workflow-project-intake` — Project intake + routing to the right workflow
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
- `/review-quality` — Unified quality review (merge readiness + maintainability + docs)
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
```
/workflow-crucible build a SaaS habit tracker
/review-quality
/deep-research how does auth work in this project
```
