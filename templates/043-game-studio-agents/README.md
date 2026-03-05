# ⚡ Neon Arcade — AI Game Studio Agent Swarm

> Transform a game idea into a production-ready, App Store–compliant game using
> 7 specialized AI agents orchestrated by MAINFRAME.

## Architecture

```
╔══════════════════════════════════════════════════════════╗
║                🧠 MAINFRAME (Orchestrator)               ║
║                                                          ║
║  Phase 1: Market          Phase 2: Planning              ║
║  📊 PULSE → 📋 SCHEMA    📁 DISPATCH                    ║
║       ↓ 🔒 checkpoint          ↓                         ║
║                                                          ║
║  Phase 3: Dev Loop        Phase 4: Compliance            ║
║  💻 PIXEL ↔ 🐛 GLITCH    🏪 GATEWAY                    ║
║       ↓                        ↓ 🔒 checkpoint           ║
║  ⚡ TURBO                 ✅ RELEASE                     ║
╚══════════════════════════════════════════════════════════╝
```

## Agent Roster

| Codename         | Role                  | Phase                | Key Output                                                        |
| ---------------- | --------------------- | -------------------- | ----------------------------------------------------------------- |
| **📊 PULSE**     | Market Analyst        | Market & Feasibility | Blue Ocean analysis, competitor data, monetization recommendation |
| **📋 SCHEMA**    | Requirement Vetter    | Market & Feasibility | Technical PRD with asset lists, engine selection, timeline        |
| **📁 DISPATCH**  | Project Manager       | Task Architecture    | Epics → Features → Tasks with DoD, milestones, execution order    |
| **💻 PIXEL**     | Software Engineer     | Dev Iteration        | Clean modular game code (Phaser.io / Unity / Godot)               |
| **🐛 GLITCH**    | QA & Debugger         | Dev Iteration        | Static analysis, unit tests, Fix-it Logs                          |
| **⚡ TURBO**     | Performance Optimizer | Dev Iteration        | FPS, memory, compression, load-time scorecard                     |
| **🏪 GATEWAY**   | Store Policy Expert   | Deployment           | Apple & Google compliance report, submission checklist            |
| **🧠 MAINFRAME** | Orchestrator          | All                  | Pipeline coordination, checkpoints, status reports                |

## Quick Start

### Option A — CrewAI with Groq (🆓 Free, recommended)

```bash
# 1. Get a free API key at https://console.groq.com
pip install -r crew/requirements.txt
cp .env.example .env   # set GROQ_API_KEY

# 2. Run the full pipeline
python -m crew.main "A casual match-3 puzzle game with power-ups and daily challenges"
```

### Option B — CrewAI with Ollama (🆓 Fully local, zero cost)

```bash
# 1. Install Ollama: https://ollama.com  →  ollama pull llama3.2
pip install -r crew/requirements.txt

# Update .env:  LLM_PROVIDER=ollama  LLM_MODEL=ollama/llama3.2
python -m crew.main "Your game idea here"
```

### Option C — TypeScript Orchestrator (requires LLM provider)

```bash
npm install
cp .env.example .env   # add your API key

# Run the pipeline
npx tsx src/orchestrator.ts "A roguelike dungeon crawler with card-based combat"
```

## Directory Structure

```
043-game-studio-agents/
├── crew/                            # 🐍 Python CrewAI bridge (free tier)
│   ├── __init__.py
│   ├── agents.py                    # 7 CrewAI agent definitions
│   ├── tasks.py                     # Sequential 7-task pipeline
│   ├── main.py                      # MAINFRAME entry point (rich UI)
│   └── requirements.txt             # crewai, litellm, pydantic, rich
├── src/
│   ├── orchestrator.ts              # 🧠 MAINFRAME — TS pipeline coordinator
│   ├── agents/
│   │   ├── agent-definitions.ts     # Agent roster, pipeline order, checkpoints
│   │   └── prompts/
│   │       ├── pulse-market-analyst.md
│   │       ├── schema-requirement-vetter.md
│   │       ├── dispatch-project-manager.md
│   │       ├── pixel-software-engineer.md
│   │       ├── glitch-qa-debugger.md
│   │       ├── turbo-performance-optimizer.md
│   │       └── gateway-store-policy-expert.md
│   ├── schemas/
│   │   └── schemas.ts               # Zod inter-agent data contracts
│   ├── workspace/
│   │   └── workspace-manager.ts     # Shared read/write state
│   └── utils/
│       └── status-reporter.ts       # Markdown report generator
├── workspace/                       # Agent artifacts (auto-created)
├── package.json
├── tsconfig.json
└── .env.example
```

## Data Flow

Each agent consumes the previous agent's JSON output and produces its own typed
output:

```
GameIdea → PULSE(MarketAnalysis) → SCHEMA(PRD) → DISPATCH(TaskBreakdown)
  → [for each task]:
      PIXEL(CodeOutput) → GLITCH(TestReport)
        ↳ FAIL → back to PIXEL (max 3×)
        ↳ PASS → TURBO(PerformanceReport)
  → GATEWAY(ComplianceReport) → ✅ Release
```

All schemas are defined in `src/schemas/schemas.ts` using **Zod** for runtime
validation.

## Human-in-the-Loop Checkpoints

| After Agent | Description                                            | Required?   |
| ----------- | ------------------------------------------------------ | ----------- |
| PULSE       | Review market analysis before investing in development | ✅ Yes      |
| DISPATCH    | Review task breakdown before coding begins             | ⬜ Optional |
| GATEWAY     | Final compliance review before store submission        | ✅ Yes      |

## Integration

The orchestrator includes **clearly marked integration points** for connecting
your LLM provider. Look for `INTEGRATION POINT` comments in `orchestrator.ts`.
Examples:

- **OpenAI**: Direct API calls with `response_format: { type: 'json_object' }`
- **CrewAI**: Python agent framework with task delegation
- **LangChain**: Chain-based orchestration
- **AutoGPT**: Autonomous agent loops

## Sub-Prompt Files

Each agent has a comprehensive sub-prompt (`src/agents/prompts/*.md`)
containing:

1. **Agent Identity** — codename, role, phase, upstream/downstream
2. **System Prompt** — detailed instructions for the LLM
3. **Input/Output JSON Schema** — precisely typed data contracts
4. **Tools Available** — what tools the agent can use
5. **Guardrails** — constraints and safety rules
6. **Status Report Template** — markdown template for progress reports

## License

MIT — Part of the Crucible ecosystem.
