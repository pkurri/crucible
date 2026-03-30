# Crucible Adaptive Skills — Architecture Reference

## Core Concept

Crucible's agent system uses **deployment-time learning**: instead of
retraining models, the system accumulates experience in an external
**skill memory**, enabling continual adaptation at zero retraining cost.

## Architecture (Read → Execute → Reflect → Write)

```
┌──────────────────────────────────────────────────┐
│            Crucible Adaptive Agent                 │
│                                                    │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐      │
│  │  READ    │──▶│ EXECUTE  │──▶│ REFLECT  │      │
│  │ (route   │   │ (run the │   │ (analyze │      │
│  │  to best │   │  skill)  │   │  result) │      │
│  │  skill)  │   │          │   │          │      │
│  └──────────┘   └──────────┘   └────┬─────┘      │
│       ▲                             │             │
│       │         ┌──────────┐        │             │
│       └─────────│  WRITE   │◀───────┘             │
│                 │ (update  │                      │
│                 │  skill   │                      │
│                 │  library)│                      │
│                 └──────────┘                      │
└──────────────────────────────────────────────────┘
```

## Key Components

| Component | Purpose |
|-----------|---------|
| `scripts/skill-memory.mjs` | Persistent skill library with utility scores |
| `scripts/agent-evolution-loop.mjs` | Read→Execute→Reflect→Write cycle |
| `scripts/agent-spawner.mjs` | Auto-create new agents from task descriptions |
| `skills/agent-designer/` | Meta-skill for designing agent architectures |
| `scripts/agents/*.json` | Agent definitions and registry |
| `scripts/agent-states/*.json` | Live agent state tracking |

## Utility Score System

Each skill has a utility score that evolves:
- **Success**: +2 (skill worked, reinforce)
- **Failure**: -5 (create improvement pressure)
- **Repair**: Score adjusts based on fix quality

## Integration Points

| Concept | Implementation |
|---------|----------------|
| Skill Library | `skills/manifest.json` + `skills/*/SKILL.md` |
| Skill Router | `scripts/skill-memory.mjs` → `routeToSkill()` |
| Execution Engine | `scripts/empire-cycle-core.mjs` production loop |
| Agent State | `scripts/agent-states/*.json` |
| Agent Registry | `scripts/agents/registry.json` + Supabase |
| Evolution Loop | `scripts/agent-evolution-loop.mjs` |
| Skill Memory | `data/skill-memory.json` |
