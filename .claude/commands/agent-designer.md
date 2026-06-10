---
name: agent-designer
description: >
  Let Agents Design Agents. This Crucible meta-agent analyzes a task
  description, decomposes it into capabilities, and generates fully-formed
  crucible-style agent skills with SKILL.md, scripts/, references/, and
  proper manifest entries. It evaluates existing skills, identifies gaps,
  and either composes existing skills into new workflows or creates
  entirely new ones from scratch.
license: 'MIT (see repo LICENSE)'
triggers:
  - 'create a new agent'
  - 'design an agent for'
  - 'I need an agent that can'
  - 'build a specialized agent'
  - 'generate a new skill agent'
  - 'spawn a new agent'
  - 'agent designer'
  - 'let agents design agents'
---

# Agent Designer — Let Agents Design Agents

A Crucible meta-agent that designs and generates new specialized agents
based on task requirements, using the adaptive Read→Execute→Reflect→Write
loop for self-evolving agent architectures.

## Core Philosophy

> "The point is not merely to add more tools. The point is to learn
> better skills through task experience."

This agent doesn't just scaffold empty skills — it **analyzes the problem
domain**, discovers which existing skills can be composed, identifies gaps,
and generates production-ready agents that integrate seamlessly with the
Crucible ecosystem.

## How It Works

```
User Task Description
       │
       ▼
┌─────────────────┐
│  1. ANALYZE      │ ← Parse intent, extract required capabilities
│     INTENT       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. DISCOVER     │ ← Scan skills/manifest.json for existing matches
│     EXISTING     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. GAP          │ ← What's missing? What needs composition?
│     ANALYSIS     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. DESIGN       │ ← Generate skill architecture + I/O contracts
│     BLUEPRINT    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. GENERATE     │ ← Create SKILL.md, scripts/, references/
│     ARTIFACTS    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  6. VALIDATE     │ ← Run quick_validate.py, check manifest
│     & REGISTER   │
└─────────────────┘
```

## Design Process

### Step 1: Analyze Intent

Decompose the task into atomic capabilities:

```json
{
  "task": "Build an agent that monitors my YouTube channels and auto-generates content ideas",
  "capabilities_needed": [
    "youtube_api_read",
    "analytics_parsing",
    "trend_detection",
    "content_ideation",
    "scheduling"
  ],
  "agent_type": "workflow",
  "complexity": "medium"
}
```

### Step 2: Discover Existing Skills

Scan the skills manifest for reusable components:

```bash
python scripts/discover_skills.py --capabilities "youtube_api,analytics,content" --manifest skills/manifest.json
```

### Step 3: Gap Analysis

Identify what needs to be built vs. composed:

- **Reuse**: `tool-youtube-api`, `deep-research`
- **Compose**: `workflow-youtube-industry` + `analytics-tracker`
- **Build New**: `youtube-channel-monitor`, `content-idea-generator`

### Step 4: Design Blueprint

Generate the agent architecture document:

```markdown
## Agent: youtube-content-strategist
- **Type**: workflow
- **Stage**: workflow
- **Composed From**: tool-youtube-api, deep-research, analytics-tracker
- **New Components**: channel-monitor (script), idea-generator (script)
- **I/O Contract**:
  - Input: channel_ids[], date_range, niche_keywords[]
  - Output: content-strategy.md, ideas-backlog.json, analytics-report.md
```

### Step 5: Generate Artifacts

Create the full skill folder structure:

```
skills/<agent-name>/
├── SKILL.md                    # Routing + safety + I/O + output contract
├── scripts/
│   ├── init_agent.py           # Bootstrap the agent
│   ├── run_agent.py            # Execute the agent's main loop
│   └── validate_agent.py       # Self-test
├── references/
│   ├── architecture.md         # Deep design docs
│   ├── capability-map.md       # What this agent can do
│   └── evolution-log.md        # Track improvements over time
└── assets/
    └── blueprint.json          # Machine-readable agent definition
```

### Step 6: Validate & Register

```bash
# Validate the new skill
python skills/skill-creator/scripts/quick_validate.py skills/<agent-name>

# Add to manifest
python scripts/register_agent.py --name <agent-name> --manifest skills/manifest.json
```

## Agent Blueprint Schema

Every agent designed by this skill produces a `blueprint.json`:

```json
{
  "schema_version": 2,
  "agent": {
    "name": "example-agent",
    "type": "workflow|tool|review|meta|service",
    "stage": "workflow|tool|review|meta|service",
    "description": "...",
    "triggers": ["..."],
    "capabilities": ["..."],
    "composed_from": ["skill-a", "skill-b"],
    "new_components": ["component-a"],
    "io_contract": {
      "inputs": [{"name": "...", "type": "...", "required": true}],
      "outputs": [{"name": "...", "type": "...", "format": "..."}]
    },
    "resource_requirements": {
      "memory": "low|medium|high",
      "compute": "low|medium|high",
      "api_keys": ["OPENAI_API_KEY"]
    },
    "evolution": {
      "utility_score": 0,
      "runs": 0,
      "last_improved": null,
      "failure_patterns": []
    }
  }
}
```

## Scripts

### Discover reusable skills

```bash
python scripts/discover_skills.py --capabilities "cap1,cap2" --manifest skills/manifest.json
```

### Generate a new agent from a task description

```bash
python scripts/generate_agent.py --task "Description of what the agent should do" --output skills/
```

### Register a new agent in the manifest

```bash
python scripts/register_agent.py --name agent-name --manifest skills/manifest.json
```

## Crucible Adaptive Skills Integration

| Concept | Implementation |
|---------|----------------|
| Skill Library | `skills/manifest.json` + `skills/*/SKILL.md` |
| Skill Router | `agent-designer` intent analysis + manifest scan |
| Skill Creator | `agent-designer` generation pipeline |
| Utility Score | `blueprint.json` → `evolution.utility_score` |
| Read→Execute→Reflect→Write | `agent-evolution-loop.mjs` |
| Skill Memory | `data/skill-memory.json` |

## Notes

- Prefer prefix naming: `agent-`, `tool-`, `workflow-`, `review-`
- Always produce a blueprint.json for machine consumption
- Never auto-deploy: generate → validate → human review → register
- Track evolution metrics from day 1

## Deep References

- Crucible adaptive architecture: [`references/memento-architecture.md`](references/memento-architecture.md)
- Agent design patterns: [`references/agent-patterns.md`](references/agent-patterns.md)
- Evolution tracking: [`references/evolution-guide.md`](references/evolution-guide.md)
