# 🛡️ Crucible | The Industrial AI Forge

> **A complete autonomous AI architecture at your fingertips — from real-time
> market analysis to automated blueprint deployment.**

Crucible Web is an advanced Next.js 14 platform that orchestrates specialized AI
agents across discrete "Divisions." Each division handles a crucial aspect of
the software and product lifecycle, working autonomously but synchronizing
perfectly to forge production-grade systems in real-time.

---

## 🏗️ The Forge Roster (Agent Divisions)

### 🧠 Intel Division

_Market analysis, intelligence gathering, and competitive synthesis._

- **Market Analyst:** Monitors competitor moves and market sentiment.
- **Deep Researcher:** Digs into technical docs, whitepapers, and APIs to
  synthesize capabilities.
- **Repo Analyst:** Scans and analyzes public GitHub repositories for tech
  stack, activity, and code quality.
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

### Scenario 4: Blueprint Generation to Production Code

1. You approve a finalized architecture pattern.
2. The **Foundry** agents convert the diagram into working, tested React
   components.
3. The agents register the new templates in the Armory for immediate deployment.

---

## ⚡ Quick Start

### 1. Requirements

- Node.js `18+` or `20+` (Recommended)
- npm or pnpm
- Supabase (For database schema and Drizzle ORM tracking)

### 2. Installation & Setup

Clone the repository and install dependencies:

```bash
npm install
```

Copy the example environment variables and fill them in:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` to access **The Stage** and **The Armory**.

---

## ⚙️ Tech Stack & Capabilities

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Database Layer:** Drizzle ORM + Supabase PostgreSQL
- **Agent Orchestration:** Vercel AI SDK integration with custom Agent loops.

## 🤝 Contributing

Contributions are welcome! Please follow the established Agent Divisional
structures when proposing new tools or autonomous roles. See the root
`CONTRIBUTING.md` for guidelines.

## 📄 License

MIT License. See `LICENSE` for details.
