# 🔥 Crucible

> **Where ideas get forged into production.**

[![Skills](https://img.shields.io/badge/skills-300+-blue)](./skills/)
[![Templates](https://img.shields.io/badge/templates-200-green)](./templates/)
[![CI](https://github.com/pkurri/crucible/workflows/CI/badge.svg)](https://github.com/pkurri/crucible/actions)
[![License](https://img.shields.io/badge/license-MIT-gray)](./LICENSE)

Crucible is a **production-grade Claude Code skill pack** built for engineers
who ship real products. It goes far beyond starter templates — every skill
encodes real production wisdom, multi-agent orchestration patterns, and
composable workflows that chain together intelligently.

Most "crucible" kits give you files. **Crucible gives you judgment** — Claude
learns your stack, your constraints, and how to make the right architectural
decisions with you.

---

## 📖 Essential Reading
- **[Full User Guide](./docs/USER_GUIDE.md)**: How to run the orchestrator, industrial workers, and manage subscriptions.
- **[Sentinel & Auditor Guide](./docs/SENTINEL_AUDITOR_GUIDE.md)**: Real-time steering, semantic tracing, and agent evaluation (Forge Pro).
- **[Monetization Strategy](./docs/MONETIZATION.md)**: Deep dive into the tiered Pro model.

---

## Why Crucible Beats the Alternatives

|                     | crucible / clones      | Crucible                                        |
| ------------------- | ---------------------- | ----------------------------------------------- |
| Architecture        | Flat CLAUDE.md files   | Composable, layered skill system                |
| Agent patterns      | Single-agent only      | Multi-agent orchestration built-in              |
| Templates           | Niche SaaS boilerplate | Universal AI-native starting points             |
| Stack coverage      | Supabase + basic auth  | Neon, Resend, Vercel AI SDK, Stripe, Cloudflare |
| Observability       | ❌ None                | ✅ Semantic Traces (Sentinel & Auditor)          |
| Testing             | ❌ None                | ✅ Vitest + Playwright + pytest                 |
| Review skills       | ❌ None                | ✅ Architecture + Security review               |
| Cross-agent support | Claude Code only       | Claude Code + Codex CLI + OpenCode              |

---

## 🏢 The Forge Roster (Autonomous Agent Divisions)

Crucible operates through specialized AI "Divisions" that handle distinct
aspects of the software and product lifecycle autonomously.

### 🧠 Intel Division

_Market analysis, intelligence gathering, and competitive synthesis._

- **Market Analyst:** Monitors competitor moves and market sentiment.
- **Content Writer:** Drafts tailored social media strategies and documentation.
- **Deep Researcher:** Digs into technical docs, whitepapers, and APIs to
  synthesize capabilities.
- **Repo Analyst:** Scans and analyzes public GitHub repositories for tech
  stack, origin, and code quality.
- **Strategy Synthesizer:** Connects data points into cohesive action plans.

### 📡 Radar Division

_Real-time signal processing and early-warning systems._

- **Trend Spotter:** Identifies emerging technologies and shifts in user
  behavior.
- **Signal Processor:** Filters noise from high-value alerts securely.
- **Alert Triage:** Categorizes incoming events for immediate action or
  long-term tracking.

### 🏭 Foundry Division

_The core engine for blueprint creation and automated architecture parsing._

- **Blueprint Architect:** Designs optimal systems based on requirements and
  Intel.
- **Dependency Mapper:** Ensures no broken packages or out-of-date
  configurations are proposed.
- **Code Generator:** Produces clean, typed Next.js/React/Node boilerplate to
  match blueprints.

### 🎛️ Hub Division

_Central command and orchestration for all deployed agents._

- **Orchestrator Configurator:** Sets the rules of engagement and agent
  permissions.
- **Swarm Manager:** Scales instances of agents up or down depending on workload
  (e.g., high intelligence gathering periods).
- **Log Aggregator:** Synthesizes the actions of all autonomous agents into a
  digestible timeline.
- **Sentinel (Pro):** Intercepts and validates tool calls in real-time to prevent hallucinations.
- **Auditor (Pro):** Performs post-run evaluation and calculates ROI/reliability metrics.

### 🎭 Stage Division

_Real-time presentation, engagement, and user interfacing._

- **UI Presenter:** Renders the dynamic dashboards in real-time as agents work.
- **Client Liaison:** Communicates status, errors, and approvals back to the
  human operator safely.
- **Showrunner:** Ensures that all background work transitions smoothly to the
  active frontend view.

---

## 🎯 Real-World Use Cases

### Scenario 1: Market Analysis & Product Strategy

1. You identify a new target market and tell the **Intel Division**.
2. **Radar** agents begin scraping for current news, competitor launches, and
   sentiment.
3. The **Intel Strategy Synthesizer** creates a gap analysis and proposes a
   feature set.
4. **Stage** presents the finished interactive report.

### Scenario 2: Autonomous Launch Strategy Generation (E.g., LinkedIn)

1. You input your product URL and launch date into the **Hub**.
2. **Intel** and **Stage** agents collaborate to write tailored, optimized posts
   for different social networks.
3. The **Hub** schedules and coordinates the content release timeline securely.

### Scenario 3: Open-Source Competitive Intelligence

1. Provide a list of competitor public GitHub URLs to the **Hub**.
2. The **Repo Analyst** scans the repositories, evaluating the tech stack,
   commit velocity, and open issues.
3. The **Strategy Synthesizer** builds a report comparing their velocity and
   architecture to yours, displayed on the **Stage**.

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

**🎯 IDE Auto-Setup**: The installer automatically detects your IDE (Windsurf,
Cursor, Cascade, VS Code) and generates appropriate configuration files. See
[IDE Integration Guide](./docs/ide-integration.md) for details.

### Install individual skills only

```bash
# Copy just the skills you need
cp -r ~/.clone/crucible/skills/workflow-launch-sequence ~/.claude/skills/
cp -r ~/.clone/crucible/skills/neon ~/.claude/skills/
```

---

## Skills

Skills are organized into four capability layers. They compose — use any
combination.

### 🚀 Workflow Skills — Orchestration brains

| Skill                                                                | What it does                                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`workflow-launch-sequence`](./skills/workflow-launch-sequence/)     | Full product build: intake → architect → build → test → deploy         |
| [`workflow-feature-cycle`](./skills/workflow-feature-cycle/)         | Feature lifecycle: spec → implement → review → ship                    |
| [`workflow-multi-agent-build`](./skills/workflow-multi-agent-build/) | Spawns parallel sub-agents for frontend, backend, tests simultaneously |

### 🔧 Tool Skills — Tactical power tools

| Skill                                              | What it does                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| [`tool-git-intel`](./skills/tool-git-intel/)       | Deep git analysis: blame, hotspots, complexity trends, refactor candidates |
| [`tool-stack-doctor`](./skills/tool-stack-doctor/) | Diagnoses your stack, flags risks, recommends upgrades with rationale      |

### 🔍 Review Skills — Quality gatekeepers

| Skill                                                  | What it does                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| [`review-architecture`](./skills/review-architecture/) | System design, coupling analysis, scalability, ADR generation      |
| [`review-security`](./skills/review-security/)         | OWASP Top 10, secrets scanning, dependency audit, threat modelling |

### 🤖 Agent Framework Skills — Autonomous AI systems

| Skill                                                                    | Description                                                                         |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [`openclaw`](./skills/openclaw/)                                         | OpenClaw agent framework: 6-stage pipeline, lane queues, production reliability     |
| [`picoclaw`](./skills/picoclaw/)                                         | PicoClaw lightweight agents: <10MB RAM, edge deployment, $10 hardware               |
| [`workflow-agent-orchestration`](./skills/workflow-agent-orchestration/) | Multi-agent coordination: team building, communication protocols, hybrid deployment |

### 🛠 Service Skills — Deep integration knowledge

| Skill                                | Description                                                 |
| ------------------------------------ | ----------------------------------------------------------- |
| [`neon`](./skills/neon/)             | Neon Postgres: branching, pooling, migrations, RLS patterns |
| [`resend`](./skills/resend/)         | Transactional email with React Email templates              |
| [`vercel-ai`](./skills/vercel-ai/)   | Vercel AI SDK: streaming, tool calls, multi-model routing   |
| [`stripe`](./skills/stripe/)         | Payments: subscriptions, webhooks, metered billing, portal  |
| [`cloudflare`](./skills/cloudflare/) | Workers, R2, KV, Durable Objects, Queue patterns            |
| [`observe`](./skills/observe/)       | PostHog + Sentry + Axiom: events, errors, structured logs   |
| [`testing`](./skills/testing/)       | Vitest + Playwright + pytest: unit, e2e, API, load testing  |

---

## Templates

**200 production-ready templates** across 25 categories. Not "hello world" —
real architectural decisions already made.

> [!IMPORTANT]
> **Crucible Pro**: Templates indexed above `050` require an active Crucible Pro subscription. These include enterprise-grade security, high-scale analytics, and multi-agent DevOps.

```bash
cd templates/031-ai-code-reviewer
cp .env.example .env.local
npm install && npm run dev
```

### Featured Templates

| #                                                  | Template           | Category                               | Description                            |
| -------------------------------------------------- | ------------------ | -------------------------------------- | -------------------------------------- |
| [031](./templates/031-ai-code-reviewer/)           | `ai-code-reviewer` | AI/ML                                  | Automated code review with AI analysis |
| [046](./templates/046-subscription-management/)    | SaaS               | Complete subscription billing platform |
| [061](./templates/061-security-audit-platform/)    | Security           | Automated security scanning tool       |
| [071](./templates/071-real-time-analytics-engine/) | Analytics          | Stream processing platform             |
| [081](./templates/081-ci-cd-orchestrator/)         | DevOps             | Multi-cloud CI/CD automation           |
| [094](./templates/094-e-commerce-platform/)        | Web                | Full-featured online store             |

**📚 [View All 200 Templates →](./templates/CATALOG.md)** |
**[Extended Catalog (101-200) →](./templates/EXTENDED_CATALOG.md)**

### Template Categories

- 🤖 **AI & Machine Learning** (15) - Code review, ML deployment, chatbots,
  vision
- 💼 **SaaS & Business** (15) - CRM, project management, invoicing, HR
- 🛡️ **Security & Compliance** (10) - Auditing, compliance, access control
- 📊 **Analytics & Data** (10) - Real-time analytics, data warehouses, A/B
  testing
- 🚀 **DevOps & Infrastructure** (10) - CI/CD, IaC, K8s, monitoring
- 🌐 **Web & Mobile** (10) - PWAs, e-commerce, CMS, streaming

### 🛡️ Autonomous Governance Division (The Guardian Fleet)

_Self-healing, revenue optimization, and automated growth swarms._

- **Self-Heal Guardian:** Monitors platform health and revives crashed agents/jobs.
- **Revenue Optimizer:** Calculates ROI and updates dynamic pricing strategies.
- **Growth Marketeer:** Mines success data to generate viral social proof.
- **Visual Architect:** Converts market trends into structured infographics.

---

**📊 [View All 300+ Skills →](./skills/EXTENDED_CATALOG.md)**

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

**New: AI Agent Systems**

```
You: "Build an autonomous deployment pipeline with edge monitoring"

Claude with Crucible:
  1. workflow-agent-orchestration → designs multi-agent system
  2. openclaw                     → coordinator + deployment agents (cloud)
  3. picoclaw                     → monitoring agents (Raspberry Pi edge devices)
  4. neon                         → stores agent state and execution history
  5. observe                      → tracks agent performance metrics
  6. review-security              → validates agent allowlists and sandboxing
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
├── docs/                    # Architecture decisions, guides
│   ├── skill-authoring-guide.md
│   ├── ide-integration.md   # IDE setup and usage
│   └── architecture-decisions.md
├── setup-ide.js             # Auto-generates IDE configs
├── install.sh / install.ps1 # Installation scripts
└── .github/workflows/       # CI: lint, validate skill YAML, test templates
```

---

## Skill Naming Convention

| Prefix      | Type          | Auto-triggered when            |
| ----------- | ------------- | ------------------------------ |
| `workflow-` | Orchestration | Asked to build, ship, plan     |
| `tool-`     | Point tool    | Specific diagnostic needed     |
| `review-`   | Quality check | Code review or audit requested |
| `<service>` | Integration   | Service detected or mentioned  |

---

## Contributing

The bar for inclusion: **would this save an experienced engineer 30+ minutes on
a real project?**

See [CONTRIBUTING.md](./CONTRIBUTING.md).

### Quick Development Setup

```bash
# Clone the repository
git clone https://github.com/pkurri/crucible.git
cd crucible

# Install Node.js (uses .nvmrc)
nvm install
nvm use

# Install development dependencies
npm install

# Run validation locally
npm run validate

# Format code
npm run format

# Run all checks
npm run check
```

---

## Security

🔒 This project takes security seriously. Report vulnerabilities privately at
`security@crucible.dev`.

See [SECURITY.md](./SECURITY.md) for our security policy and responsible
disclosure process.

---

## License

MIT
