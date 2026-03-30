# Forge Simulator — Quick Start & Evolution Guide

This guide covers how to operationalize the **Forge Simulator** across your empire and how to keep it sharp as your requirements evolve.

---

## 🚀 How to Utilize

### 1. Simple CLI Simulation (One-Offs)
The fastest way to test a hypothesis or get an AI "second opinion" on a decision.

```bash
node skills/forge-simulator/scripts/run-simulation.mjs \
  --domain market \
  --ore "Competitor X just raised $50M in Series B." \
  --question "Will they use it for price wars or feature velocity?" \
  --rounds 20
```

### 2. Integration into Other Skills (Composition)
You can import the simulation engine into your existing automation. For example, in a `niche-strategist` skill:

```javascript
import { runForge } from '../forge-simulator/scripts/run-simulation.mjs';

const prediction = await runForge({
  domain: 'social-media',
  ore: nicheData,
  question: "Is this niche too saturated for a new faceless channel?",
  rounds: 15
});

if (prediction.confidence > 75) {
  // Proceed with niche launch
}
```

### 3. "Smelt & Forget" (Daily Intelligence)
Plug simulation into your `daily-agent-orchestrator.mjs` to have it automatically model the day's market signals or tech news while you sleep.

### 4. Continuous Inspection
After a simulation finishes, it saves a `world_UUID.json` file in `data/forge-worlds/`. Use this to interrogate specific agents:
```bash
# How does the 'senior_dev' agent feel about the prediction?
node skills/forge-simulator/scripts/run-simulation.mjs --inspect world_17115500 agent_senior_dev_0 "Why were you so skeptical of the migration timeline?"
```

---

## 🛠️ How to Update & Evolve

### 1. Adding New Domains (Archetypes)
If you need a specialized simulation (e.g., "Legal Compliance" or "Medical Research"), simply create a new JSON file:
1.  Navigate to `skills/forge-simulator/templates/archetypes/`.
2.  Create `my-new-domain.json` (copy `generic.json` as a base).
3.  Define 4-6 archetypes with specific `behavior_templates` and `traits`.
4.  The skill will automatically recognize it via the `--domain my-new-domain` flag.

### 2. Tuning LLM Strategy
Crucible is designed for **free/low-cost** operation. If Gemini free tier (1500 req/day) isn't enough, or if you need smarter agents:
- Edit `skills/forge-simulator/scripts/lib/llm.mjs`.
- Update the model list to include powerful paid models (GPT-4o, Claude 3.5 Sonnet) OR switch to even faster free models via OpenRouter.
- The `callLLM` function handles all the fallback logic.

### 3. Evolving via Skill Memory
This skill is "Self-Improving." Every run is recorded in `data/skill-memory.json`.
- When a simulation makes a prediction that later comes true (or fails), use `skill-memory.mjs` to record the outcome.
- The `agent-evolution-loop.mjs` can then analyze which archetypes are "hallucinating" or being too optimistic, and you can tweak their templates accordingly.

---

## 💎 Branding Philosophy (Crucible Style)
When expanding the skill, maintain the metallurgical metaphor:
- **Ore:** Raw input data.
- **Smelt:** Knowledge extraction.
- **Cast:** Creating agent personas.
- **Forge:** The simulation loop.
- **Assay:** The final report/audit.
- **Furnace:** The underlying compute power.

This keeps the terminology consistent across the Crucible framework and avoids generic "Agent AI" branding.
