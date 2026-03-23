# 🐉 Crucible Game Studio — AI Studio Hierarchy (v2.0)

> Ported and Modernized from Claude-Code-Game-Studios.
> A 48-agent studio architecture for professional game development on Godot, Unity, or Unreal.

## Architecture

This template defines a professional studio hierarchy where you are the **Chief Creative Officer (CCO)**. You direct the 3-Tier engine:

### Tier 1 — Directors (Opus/Strategists)
- **CREATIVE DIRECTOR**: Sets the vision and MDA (Mechanics, Dynamics, Aesthetics).
- **TECHNICAL DIRECTOR**: Owns the engineering standards and engine choice.
- **PRODUCER**: Manages the sprint plans and budget/scope.

### Tier 2 — Department Leads (Sonnet/Managers)
- **GAME DESIGN**: Documentation, systems, and balancing.
- **ART & AUDIO**: Visual identity and soundscapes.
- **QUALITY ASSURANCE**: Testing protocols and performance gates.
- **RELEASE MGMT**: Store compliance and packaging.

### Tier 3 — Specialists (Sonnet/Haiku/Workers)
- **ENGINE**: Unity, Unreal, and Godot Specialists.
- **DESIGN**: Levels, Narrative, Economy, UX.
- **ENGINEERING**: Mechanics, AI, UI, VFX, Networking.

## Mastery of Revenue (Free vs. Pro)

This template integrates the **Revenue Optimizer** directly into the Phase 1 workflow. All features are classified:

1.  **[FREE] — The Hook**: Core loop, initial levels, basic customization.
2.  **[PRO] — The Monetization**: Hardcore content, premium skips, exclusive VFX, and ad-free experience.

## Integrated Skills

Includes industry-standard slash commands:
- `/brainstorm`: Generate a high-concept with market feasibility.
- `/sprint-plan`: Convert a GDD into 20+ atomic tasks.
- `/revenue-opt`: Audit mechanics for ARPU/LTV optimization.
- `/gatekeeper`: Final compliance check before store submission.

## Directory Structure

```text
102-game-studio-crucible/
├── .agents/             # Agent definitions (48-agent hierarchy)
├── docs/                # Architecture, GDD, and PRD templates
│   ├── gdd_template.md
│   ├── revenue_plan.md
│   └── tdd_template.md
├── src/                 # Game source code (Assets, Core, UI)
├── tests/               # QA & Performance suites
├── public/              # Store assets and metadata
└── scripts/             # Build and optimization tools
```

## Getting Started

1.  Initialize with `/studio-init`.
2.  Run `/brainstorm` to define your genre.
3.  Let the **REVENUE_OPTIMIZER** generate your "Free vs Pro" feature-set.
4.  The **PRODUCER** will then create the Phase 1 PRD.

---
Part of the **Crucible** ecosystem. Professional Grade Game Development.
