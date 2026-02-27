# 🔥 Crucible

> **Where ideas get forged into production.**

[![Skills](https://img.shields.io/badge/skills-13-blue)](./skills/)
[![Templates](https://img.shields.io/badge/templates-5-green)](./templates/)
[![Compatible](https://img.shields.io/badge/Claude%20Code-compatible-purple)](https://docs.anthropic.com/en/docs/claude-code)
[![License](https://img.shields.io/badge/license-MIT-gray)](./LICENSE)

Crucible is a **production-grade Claude Code skill pack** built for engineers who ship real products. It goes far beyond starter templates — every skill encodes real production wisdom, multi-agent orchestration patterns, and composable workflows that chain together intelligently.

Most "ship faster" kits give you files. **Crucible gives you judgment** — Claude learns your stack, your constraints, and how to make the right architectural decisions with you.

---

## Why Crucible Beats the Alternatives

| | ship-faster / clones | Crucible |
|---|---|---|
| Architecture | Flat CLAUDE.md files | Composable, layered skill system |
| Agent patterns | Single-agent only | Multi-agent orchestration built-in |
| Templates | Niche SaaS boilerplate | Universal AI-native starting points |
| Stack coverage | Supabase + basic auth | Neon, Resend, Vercel AI SDK, Stripe, Cloudflare |
| Observability | ❌ None | ✅ PostHog + Sentry + Axiom baked in |
| Testing | ❌ None | ✅ Vitest + Playwright + pytest |
| Review skills | ❌ None | ✅ Architecture + Security review |
| Cross-agent support | Claude Code only | Claude Code + Codex CLI + OpenCode |

---

## Quick Install

### One-liner (macOS/Linux)
```bash
mkdir -p ~/.claude/skills && \
curl -L https://github.com/pkurri/crucible/archive/refs/heads/main.tar.gz \
  | tar -xz --strip-components=2 -C ~/.claude/skills crucible-main/skills/
echo "✅ Crucible installed to ~/.claude/skills"
```

### Windows (PowerShell)
```powershell
New-Item -ItemType Directory -Force "$HOME\.claude\skills" | Out-Null
$tmp = "$env:TEMP\crucible.zip"
Invoke-WebRequest "https://github.com/pkurri/crucible/archive/refs/heads/main.zip" -OutFile $tmp
Expand-Archive -Force $tmp "$env:TEMP\crucible"
Copy-Item -Recurse -Force "$env:TEMP\crucible\crucible-main\skills\*" "$HOME\.claude\skills\"
Write-Host "✅ Crucible installed"
```

### Install individual skills only
```bash
# Copy just the skills you need
cp -r ~/.clone/crucible/skills/workflow-launch-sequence ~/.claude/skills/
cp -r ~/.clone/crucible/skills/neon ~/.claude/skills/
```

---

## Skills

Skills are organized into four capability layers. They compose — use any combination.

### 🚀 Workflow Skills — Orchestration brains
| Skill | What it does |
|---|---|
| [`workflow-launch-sequence`](./skills/workflow-launch-sequence/) | Full product build: intake → architect → build → test → deploy |
| [`workflow-feature-cycle`](./skills/workflow-feature-cycle/) | Feature lifecycle: spec → implement → review → ship |
| [`workflow-multi-agent-build`](./skills/workflow-multi-agent-build/) | Spawns parallel sub-agents for frontend, backend, tests simultaneously |

### 🔧 Tool Skills — Tactical power tools
| Skill | What it does |
|---|---|
| [`tool-git-intel`](./skills/tool-git-intel/) | Deep git analysis: blame, hotspots, complexity trends, refactor candidates |
| [`tool-stack-doctor`](./skills/tool-stack-doctor/) | Diagnoses your stack, flags risks, recommends upgrades with rationale |

### 🔍 Review Skills — Quality gatekeepers
| Skill | What it does |
|---|---|
| [`review-architecture`](./skills/review-architecture/) | System design, coupling analysis, scalability, ADR generation |
| [`review-security`](./skills/review-security/) | OWASP Top 10, secrets scanning, dependency audit, threat modelling |

### 🛠 Service Skills — Deep integration knowledge
| Skill | Description |
|---|---|
| [`neon`](./skills/neon/) | Neon Postgres: branching, pooling, migrations, RLS patterns |
| [`resend`](./skills/resend/) | Transactional email with React Email templates |
| [`vercel-ai`](./skills/vercel-ai/) | Vercel AI SDK: streaming, tool calls, multi-model routing |
| [`stripe`](./skills/stripe/) | Payments: subscriptions, webhooks, metered billing, portal |
| [`cloudflare`](./skills/cloudflare/) | Workers, R2, KV, Durable Objects, Queue patterns |
| [`observe`](./skills/observe/) | PostHog + Sentry + Axiom: events, errors, structured logs |
| [`testing`](./skills/testing/) | Vitest + Playwright + pytest: unit, e2e, API, load testing |

---

## Templates

Five production-ready starting points. Not "hello world" — real architectural decisions already made.

```bash
cd templates/001-ai-saas-core
cp .env.example .env.local
pnpm install && pnpm dev
```

| # | Template | Stack | Best for |
|---|---|---|---|
| [001](./templates/001-ai-saas-core/) | `ai-saas-core` | Next.js 15, Neon, Stripe, Resend, Vercel AI SDK | AI as core product feature |
| [002](./templates/002-conversational-api/) | `conversational-api` | Hono, Neon, Redis, Vercel AI SDK | Stateful conversation API |
| [003](./templates/003-multi-tenant-saas/) | `multi-tenant-saas` | Next.js 15, Neon (RLS), Stripe, Clerk | Org-scoped multi-tenant apps |
| [004](./templates/004-event-pipeline/) | `event-pipeline` | Cloudflare Workers, R2, Queues, D1 | Edge-native event ingestion |
| [005](./templates/005-realtime-collab/) | `realtime-collab` | Next.js, Liveblocks, Neon, Clerk | Multi-user realtime collaboration |

---

## How Skills Compose

Claude discovers and chains skills automatically. Example:

```
You: "Build me a SaaS that lets teams track unit economics"

Claude with Crucible:
  1. workflow-launch-sequence  → orchestrates the full build
  2. workflow-multi-agent-build → spawns parallel frontend + backend agents
  3. neon                      → sets up DB branching per environment
  4. stripe                    → wires subscriptions + metered billing
  5. review-architecture       → validates decisions before code is written
  6. testing                   → generates full test suite on completion
  7. observe                   → instruments PostHog + Sentry from day 0
```

Skills are additive — install more skills, get smarter orchestration.

---

## Repository Structure

```
crucible/
├── skills/
│   ├── workflow-*/          # Multi-step orchestration (spawn sub-agents)
│   ├── tool-*/              # Point tools (invoked on demand)
│   ├── review-*/            # Quality review (auto-loaded during review)
│   └── <service>/           # Deep service knowledge (neon, stripe, etc.)
├── templates/
│   └── NNN-<slug>/          # Runnable production starting points
├── snippets/                # Reference implementations
├── docs/                    # Architecture decisions, skill authoring guide
└── .github/workflows/       # CI: lint, validate skill YAML, test templates
```

---

## Skill Naming Convention

| Prefix | Type | Auto-triggered when |
|---|---|---|
| `workflow-` | Orchestration | Asked to build, ship, plan |
| `tool-` | Point tool | Specific diagnostic needed |
| `review-` | Quality check | Code review or audit requested |
| `<service>` | Integration | Service detected or mentioned |

---

## Contributing

The bar for inclusion: **would this save an experienced engineer 30+ minutes on a real project?**

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT
