---
name: forge-simulator
description: >
  Crucible's multi-agent simulation engine. Feed it any seed data and a
  question — it spawns autonomous agents that model outcomes, surface
  hidden risks, and generate prediction reports. Domain-agnostic: works
  for market analysis, content strategy, architecture decisions, crisis
  simulation, product launches, game balancing, and more. Runs entirely
  on existing Crucible infra (Gemini, Supabase, GitHub Actions) with
  zero paid add-ons.
license: 'MIT (see repo LICENSE)'
triggers:
  - 'simulate'
  - 'predict what happens if'
  - 'run a simulation'
  - 'forge a scenario'
  - 'what would happen if'
  - 'stress test this decision'
  - 'scenario planning'
  - 'swarm analysis'
  - 'multi-agent prediction'
  - 'monte carlo'
---

# Forge Simulator — Multi-Agent Prediction Engine

> _"Feed raw intelligence into the Furnace. Watch agents forge the future."_

A **domain-agnostic swarm simulation skill** that creates autonomous agent
populations to model outcomes for any question. Built entirely on Crucible's
existing infrastructure — no new paid services required.

---

## Existing Infrastructure Used

| What | Already In Crucible | How Forge Simulator Uses It |
|------|--------------------|-----------------------------|
| **LLM** | `GEMINI_API_KEY` (free tier: 1500 req/day) | Powers agent reasoning, persona generation, and report writing |
| **Fallback LLM** | `OPENROUTER_API_KEY` (free models: Llama 3, Mistral) | Fallback when Gemini rate-limits; bulk agent chatter |
| **Database** | `SUPABASE_URL` + `SUPABASE_KEY` (free tier: 500MB) | Stores simulation worlds, agent states, and knowledge graphs |
| **Memory** | `data/skill-memory.json` + `skill-memory.mjs` | Tracks simulation accuracy, archetype performance, evolution |
| **Orchestrator** | `daily-agent-orchestrator.mjs` | Schedules automated simulation runs |
| **CI/CD** | `.github/workflows/` | Trigger simulations on events (PR, deploy, market signal) |
| **Agent Framework** | `agent-spawner.mjs` + `agent-evolution-loop.mjs` | Manage agent lifecycle and self-improvement |
| **File Storage** | Local `data/forge-worlds/` | Zero-cost simulation persistence |

### Free Tools Stack

| Tool | Free Tier | Role |
|------|-----------|------|
| **Gemini API** | 1500 req/day, 1M tokens/min | Primary LLM for agent reasoning |
| **OpenRouter** | Free models (Llama 3.1, Mistral 7B) | High-volume agent conversation at $0 |
| **Supabase** | 500MB DB, 1GB storage, 50K MAU | Simulation state + knowledge graph storage |
| **GitHub Actions** | 2000 min/month (free) | Automated simulation triggers |
| **Node.js** | Free | Simulation runtime (already in Crucible) |
| **Local JSON** | Free | Agent memory + graph storage (no-DB mode) |

---

## Why This Exists

Most decisions are made with gut feeling or spreadsheets. Neither can model
**emergent behavior** — the cascading second and third-order effects that
happen when many actors interact. This skill fills that gap by:

1. Building a knowledge graph from your seed data
2. Spawning agents with personas, goals, and memory
3. Running a simulation where agents act independently
4. Producing a structured prediction report
5. Letting you interrogate any agent or outcome

---

## Application Domains

The same 5-stage pipeline works across every domain below. Only the
**archetype template** changes.

### 1. Market & Competitive Intelligence
```
Ore:       Competitor announcements, pricing data, market reports
Agents:    Competitor CEO, Customer Segment A/B/C, Regulator, Investor
Question:  "What happens to our market share if competitor X drops price 20%?"
Output:    Market shift prediction, customer migration map, pricing strategy
```

### 2. Content & Social Media Strategy
```
Ore:       Trending topics, engagement data, audience demographics
Agents:    Creator, Viewer (by demographic), Algorithm, Advertiser, Competitor
Question:  "Which content angle gets the most organic reach for tech niche?"
Output:    Content calendar, predicted engagement rates, viral probability
```

### 3. Product Launch Simulation
```
Ore:       Product spec, target market data, competitor landscape
Agents:    Early Adopter, Skeptic, Influencer, Press, Support Team
Question:  "How does launch reception change with $29 vs $49 price point?"
Output:    Adoption curve, churn prediction, support ticket forecast
```

### 4. Architecture & Technical Decisions
```
Ore:       Codebase metrics, team velocity, dependency graph
Agents:    Senior Dev, Junior Dev, DevOps, Product Manager, End User
Question:  "What breaks if we migrate from monolith to microservices?"
Output:    Risk matrix, migration timeline, team capacity model
```

### 5. Crisis & Reputation Management
```
Ore:       Incident report, social media sentiment, press coverage
Agents:    Customer, Journalist, Regulator, Internal PR, Competitor
Question:  "How does public sentiment evolve over 7 days with/without apology?"
Output:    Sentiment trajectory, recommended response timing, recovery forecast
```

### 6. Financial & Investment Modeling
```
Ore:       Financial signals, earnings reports, macro indicators
Agents:    Bull Investor, Bear Investor, Analyst, Market Maker, Regulator
Question:  "What happens to this sector if interest rates rise 50bps?"
Output:    Price movement predictions, sector rotation map, risk exposure
```

### 7. Game Design & Balancing
```
Ore:       Game rules, player data, meta statistics
Agents:    Casual Player, Competitive Player, Whale, Free-to-Play, Streamer
Question:  "Does this new hero break the meta or does counter-play emerge?"
Output:    Balance assessment, player satisfaction prediction, monetization impact
```

### 8. YouTube / Social Empire Optimization
```
Ore:       Channel analytics (from youtube-intel-fetcher.mjs), niche data
Agents:    Subscriber, Non-subscriber Viewer, Algorithm, Competitor Creator
Question:  "Should I pivot this niche or double down on current content?"
Output:    Growth trajectory, optimal posting schedule, niche risk assessment
```

---

## The 5-Stage Forge Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FORGE SIMULATOR                              │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │  SMELT   │→ │  CAST    │→ │  FORGE   │→ │  ASSAY   │→ │INSPECT│ │
│  │          │  │          │  │          │  │          │  │      │ │
│  │ Extract  │  │ Generate │  │ Run sim  │  │ Generate │  │ Chat │ │
│  │ graph    │  │ personas │  │ rounds   │  │ report   │  │ with │ │
│  │ from ore │  │ & memory │  │          │  │ & assay  │  │agents│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Stage 1: SMELT — Knowledge Extraction

Uses Gemini to extract entities, relationships, and key facts from seed data.
Stores the knowledge graph in Supabase (or local JSON fallback).

```javascript
import { callGemini } from './lib/llm.mjs';

export async function smelt(ore) {
  // Extract entities using Gemini (free tier)
  const extraction = await callGemini({
    prompt: `Extract all key entities, relationships, and facts from this data.
             Return as JSON: { entities: [...], relationships: [...], facts: [...] }`,
    input: ore.seedData,
    model: 'gemini-2.0-flash'  // free, fast, good for extraction
  });

  // Store graph — Supabase if available, local JSON fallback
  const graph = await storeGraph(extraction, {
    storage: process.env.SUPABASE_URL ? 'supabase' : 'local',
    worldId: ore.worldId || `world_${Date.now()}`
  });

  return { entities: extraction.entities, graph, worldId: graph.worldId };
}
```

### Stage 2: CAST — Agent Generation

Generates agent personas using archetype templates + Gemini.
Uses the cheapest model since persona generation is templated.

```javascript
import { callGemini } from './lib/llm.mjs';
import { loadArchetypes } from './templates/archetypes/index.mjs';

export async function cast(smeltResult, config) {
  const archetypes = loadArchetypes(config.domain || 'generic');
  const agents = [];

  for (const archetype of archetypes) {
    const count = config.agentCounts?.[archetype.role] || archetype.defaultCount;

    for (let i = 0; i < count; i++) {
      // Gemini generates unique persona from archetype + graph context
      const persona = await callGemini({
        prompt: `Create a unique agent persona based on this archetype and context.
                 Archetype: ${JSON.stringify(archetype)}
                 World Context: ${smeltResult.entities.slice(0, 10).map(e => e.name).join(', ')}
                 Return JSON: { name, personality, goals, biases, knowledge }`,
        model: 'gemini-2.0-flash'
      });

      agents.push({
        id: `${archetype.role}_${i}`,
        ...persona,
        archetype: archetype.role,
        memory: [],        // Grows during simulation
        traits: archetype.traits
      });
    }
  }

  return { agents, graph: smeltResult.graph, worldId: smeltResult.worldId };
}
```

### Stage 3: FORGE — Simulation Execution

The core loop: agents take turns acting based on their persona + memory.
Uses OpenRouter free models for high-volume agent chatter to save Gemini quota.

```javascript
import { callLLM } from './lib/llm.mjs';

export async function forge(castResult, scenario) {
  const { agents, graph } = castResult;
  const timeline = [];

  for (let round = 1; round <= (scenario.rounds || 20); round++) {
    const roundEvents = [];

    for (const agent of agents) {
      // Use OpenRouter free models for bulk agent actions
      const action = await callLLM({
        prompt: `You are ${agent.name}. ${agent.personality}
                 Your goals: ${agent.goals.join(', ')}
                 Current situation: ${JSON.stringify(timeline.slice(-3))}
                 Question being simulated: "${scenario.question}"
                 What do you do or say this round? Reply as JSON:
                 { action, reasoning, opinion_shift }`,
        provider: 'openrouter',  // Free tier
        model: 'meta-llama/llama-3.1-8b-instruct:free'
      });

      agent.memory.push({ round, action: action.action });
      roundEvents.push({ agent: agent.id, ...action, round });
    }

    timeline.push({ round, events: roundEvents });

    // Emit progress for real-time UI
    if (scenario.onProgress) {
      scenario.onProgress({ round, total: scenario.rounds, events: roundEvents.length });
    }
  }

  return { timeline, agents, worldId: castResult.worldId };
}
```

### Stage 4: ASSAY — Report Generation

Uses Gemini (better reasoning) to synthesize the simulation into a report.

```javascript
import { callGemini } from './lib/llm.mjs';

export async function assay(forgeResult, question) {
  // Compress timeline for context window
  const summary = compressTimeline(forgeResult.timeline);

  const report = await callGemini({
    prompt: `You are a senior analyst. Based on this multi-agent simulation,
             write a prediction report answering: "${question}"

             Simulation data: ${JSON.stringify(summary)}
             Agent final states: ${JSON.stringify(forgeResult.agents.map(a => ({
               name: a.name, role: a.archetype, finalMemory: a.memory.slice(-3)
             })))}

             Structure your report as:
             ## Executive Summary
             ## Key Predictions (with confidence %)
             ## Risk Factors
             ## Agent Consensus vs. Minority Opinions
             ## Recommended Actions
             ## Confidence Score (0-100)`,
    model: 'gemini-2.0-flash'
  });

  // Record to skill-memory for evolution tracking
  const { recordResult } = await import('../../scripts/skill-memory.mjs');
  recordResult('forge-simulator', `sim_${Date.now()}`, true, {
    durationMs: Date.now() - forgeResult._startTime,
    context: { domain: forgeResult.domain, question, agentCount: forgeResult.agents.length }
  });

  return { report, worldId: forgeResult.worldId };
}
```

### Stage 5: INSPECT — Deep Interaction

Chat with any agent from the completed simulation. Uses their accumulated
memory to maintain consistency.

```javascript
import { callGemini } from './lib/llm.mjs';

export async function inspect(forgeWorld, agentId, message) {
  const agent = forgeWorld.agents.find(a => a.id === agentId);
  if (!agent) throw new Error(`Agent ${agentId} not found`);

  const response = await callGemini({
    prompt: `You are ${agent.name}. ${agent.personality}
             Your simulation memory: ${JSON.stringify(agent.memory)}
             A human asks you: "${message}"
             Respond in character, referencing your simulation experience.`,
    model: 'gemini-2.0-flash'
  });

  return { agentId, agentName: agent.name, response };
}
```

---

## LLM Cost Strategy (Stay Free)

```
┌────────────────────────────────────────────────────────────────┐
│ Task                     │ Provider      │ Model              │
│──────────────────────────│───────────────│────────────────────│
│ Entity extraction        │ Gemini        │ gemini-2.0-flash   │
│ Persona generation       │ Gemini        │ gemini-2.0-flash   │
│ Agent actions (bulk)     │ OpenRouter    │ llama-3.1-8b:free  │
│ Report synthesis         │ Gemini        │ gemini-2.0-flash   │
│ Agent chat (inspect)     │ Gemini        │ gemini-2.0-flash   │
│ Fallback (rate limited)  │ OpenRouter    │ mistral-7b:free    │
└────────────────────────────────────────────────────────────────┘

Budget per simulation (20 agents, 20 rounds):
  Smelt:    ~2 Gemini calls       = 2 / 1500 daily quota
  Cast:     ~20 Gemini calls      = 20 / 1500
  Forge:    ~400 OpenRouter calls  = FREE (llama-3.1-8b)
  Assay:    ~1 Gemini call        = 1 / 1500
  Inspect:  ~5 Gemini calls       = 5 / 1500

  Total: ~28 Gemini calls + ~400 free OpenRouter calls
  Daily capacity: ~50 full simulations on free tier
```

---

## Integration with Existing Crucible Scripts

### Compose with YouTube Empire
```javascript
// In youtube-empire-automation.mjs — add pre-publish niche validation
import { runForge } from '../skills/forge-simulator/index.mjs';

const prediction = await runForge({
  domain: 'social-media',
  ore: { seedData: nicheAnalytics },
  question: `Will "${nicheName}" content reach 10K views in 30 days?`,
  rounds: 15
});

if (prediction.confidence < 50) {
  console.log('⚠️ Low-confidence niche — skipping');
}
```

### Compose with Daily Agent Orchestrator
```javascript
// In daily-agent-orchestrator.mjs — add market simulation to daily cycle
{
  name: 'forge-market-sim',
  schedule: '0 8 * * *',  // Daily at 8 AM
  script: 'skills/forge-simulator/scripts/daily-sim.mjs',
  args: ['--domain', 'market', '--ore', 'data/daily-intel.json']
}
```

### Compose with Skill Memory
```javascript
// Forge simulator auto-registers with skill-memory.mjs
// Every run records: success/failure, duration, domain, accuracy
// Evolution loop can then improve archetype templates based on data
```

### GitHub Actions Trigger
```yaml
# .github/workflows/forge-simulation.yml
name: Forge Simulation
on:
  workflow_dispatch:
    inputs:
      domain:
        description: 'Simulation domain'
        default: 'market'
      question:
        description: 'Question to simulate'
        required: true
      ore_file:
        description: 'Path to seed data file'
        default: 'data/daily-intel.json'

jobs:
  simulate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: |
          node skills/forge-simulator/scripts/run-simulation.mjs \
            --domain "${{ inputs.domain }}" \
            --question "${{ inputs.question }}" \
            --ore "${{ inputs.ore_file }}"
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

---

## Supabase Schema (Uses Existing Free Instance)

```sql
-- Add to existing Supabase instance
CREATE TABLE forge_worlds (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  question TEXT NOT NULL,
  ore_summary TEXT,
  status TEXT DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE forge_agents (
  id TEXT PRIMARY KEY,
  world_id TEXT REFERENCES forge_worlds(id),
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  persona JSONB NOT NULL,
  final_state JSONB,
  memory JSONB DEFAULT '[]'
);

CREATE TABLE forge_events (
  id SERIAL PRIMARY KEY,
  world_id TEXT REFERENCES forge_worlds(id),
  round INT NOT NULL,
  agent_id TEXT,
  action TEXT,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forge_reports (
  world_id TEXT PRIMARY KEY REFERENCES forge_worlds(id),
  report TEXT NOT NULL,
  confidence INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Local-Only Mode (Zero External Dependencies)

For offline or zero-cost operation, everything can run locally:

```javascript
// config.mjs
export const FORGE_CONFIG = {
  // Storage: local JSON files instead of Supabase
  storage: process.env.SUPABASE_URL ? 'supabase' : 'local',
  localDir: 'data/forge-worlds/',

  // LLM: falls through providers
  llm: {
    primary: { provider: 'gemini', model: 'gemini-2.0-flash', key: process.env.GEMINI_API_KEY },
    bulk: { provider: 'openrouter', model: 'meta-llama/llama-3.1-8b-instruct:free', key: process.env.OPENROUTER_API_KEY },
    fallback: { provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free', key: process.env.OPENROUTER_API_KEY }
  },

  defaults: {
    rounds: 20,
    maxAgents: 50,
    parallelWorlds: 1
  }
};
```

---

## Composability with Other Crucible Skills

| Compose With | How |
|-------------|-----|
| `deep-research` | Auto-gather ore from web for simulation |
| `tool-youtube-api` | Pull channel analytics as simulation ore |
| `youtube-intel-fetcher` | Feed YT analytics into content strategy sim |
| `niche-strategist` | Validate niche picks with agent simulation |
| `review-architecture` | Feed architecture review into engineering sim |
| `revenue-optimizer` | Feed pricing data into market simulation |
| `agent-designer` | Auto-design new archetype templates |
| `workflow-launch-sequence` | Add pre-launch simulation gate |
| `sentinel` | Validate simulation outputs for hallucination |
| `empire-cycle-core` | Plug sims into the daily empire automation |

---

## Evolution & Self-Improvement

Integrates directly with `skill-memory.mjs` and `agent-evolution-loop.mjs`:

```javascript
// After every simulation completes:
import { recordResult } from '../../scripts/skill-memory.mjs';
import { recordEvolution } from '../../scripts/skill-memory.mjs';

// Track accuracy when outcomes are later verified
recordResult('forge-simulator', runId, wasAccurate, {
  durationMs,
  context: { domain, question, agentCount, confidence }
});

// If accuracy drops below threshold, flag for archetype improvement
if (accuracyRate < 0.6) {
  recordEvolution('forge-simulator', {
    type: 'archetype-retune',
    description: `${domain} archetypes underperforming — needs human review`,
    trigger: 'accuracy-drop'
  });
}
```

---

## Quick Start

```bash
# Run a simulation from CLI
node skills/forge-simulator/scripts/run-simulation.mjs \
  --domain market \
  --ore "Our competitor just launched a free tier" \
  --question "How does this affect our paid conversion?" \
  --rounds 20

# Run from daily orchestrator
npm run agent:daily  # Includes forge-sim if configured

# Check simulation history
node skills/forge-simulator/scripts/run-simulation.mjs --history
```

---

## Notes

- Prefer `gemini-2.0-flash` over `gemini-pro` — 10x cheaper, fast enough for agents
- Use OpenRouter free models for agent chatter, save Gemini quota for analysis
- Start with `local` storage mode — switch to Supabase only when you need history
- The `generic.json` archetype template works for any domain as a starting point
- All reports include confidence scores — never trust a low-confidence prediction
- Works with existing `skill-memory.mjs` — no new tracking infrastructure needed
