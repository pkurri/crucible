---
name: gaming-studio
description:
  'Generic Game Studio Workflow Skill. Orchestrates professional game
  development using a 3-tier hierarchy: 1. Directors (Vision/Ops) 2. Leads
  (Domain Authority) 3. Specialists (Execution) Built for 4-Phase execution:
  Concept -> Architecture -> Iteration -> Compliance.'
license: 'MIT'
triggers:
  - 'When initiating a game development cycle'
  - 'When delegating game design or engineering tasks'
  - 'When performing a studio-wide audit'
---

This skill transforms the workspace into a professional game development studio
powered by **49 specialized agents** and **72 dedicated workflow skills**. It
implements a full coordination system mirroring real studio hierarchy.

## Hierarchy Model

### Tier 1: Directors (Strategy)

- **Creative Director**: Guardian of the "Fun" and the "Vision".
- **Technical Director**: Architect of systems and performance.
- **Producer**: Manager of scope and schedule.

### Tier 2: Leads (Management)

- **Leads**: Art, Audio, Design, Narrative, QA, Programming, Release.

### Tier 3: Specialists (Tactical)

- **Engine Specialists**: [Godot](file:///Users/aak/CascadeProjects/crucible/skills/gaming-studio/references/engines/SETS.md), Unity, Unreal.
- **Design Specialists**: Level, Systems, Economy, UX, World-builder, Writer.
- **Engineering Specialists**: AI, Gameplay, Network, UI, DevOps, Analytics.
- **Support Specialists**: Technical Artist, QA Tester, Accessibility, Live Ops.

Full Roster: [Studio Hierarchy](file:///Users/aak/CascadeProjects/crucible/skills/gaming-studio/references/agents/HIERARCHY.md)

## Execution Phases

1. **Concept & Feasibility (Phase 1)**
   - _Revenue Optimizer_ defines Free vs. Pro features.
   - _Market Analyst_ (PULSE) identifies trends.
2. **Architecture & Planning (Phase 2)**
   - _Technical Director_ selects engine and infrastructure.
   - _Producer_ (DISPATCH) generates the sprint plan.
3. **Development & Iteration (Phase 3)**
   - _Specialists_ build assets and code.
   - _QA_ (GLITCH) and _Performance_ (TURBO) audit every block.
4. **Compliance & Release (Phase 4)**
   - _Store Policy Expert_ (GATEWAY) checks Apple/Google rules.
   - _Release Manager_ packages the build.

## Recommended Companion Skills

- `workflow-game-web-production`: end-to-end production gates for games and
  interactive web apps.
- `game-engine-helper`: engine/framework selection and system boundaries.
- `phaser-game-builder`: Phaser 3 browser game implementation.
- `three-js-game`: WebGL and React Three Fiber implementation.
- `multiplayer-game-networking`: realtime protocols, rooms, and trust
  boundaries.
- `game-asset-pipeline`: runtime assets, compression, manifests, and licenses.
- `game-qa-playtesting`: playtest reports, bug triage, compatibility, balance.
- `frontend-performance-a11y`: FPS, Core Web Vitals, responsive QA, WCAG.

## Output Standards

Every step must produce a **resumable artifact**:

- `PHASE_1_PRD.md` (Product Requirements Document)
- `PHASE_2_SPRINT_PLAN.md` (Task breakdown)
- `REVENUE_OPTIMIZATION_PLAN.md` (Monetization strategy)
- `TECHNICAL_ARCHITECTURE_DOC.md` (Engine & Framework)

## Rules for Agents

- **Horizontal Consultation**: Specialists can consult each other but cannot
  finalize changes outside their domain.
- **Vertical Escalation**: Disagreements escalate to Department Leads, then to
  Directors.
- **Revenue Integration**: All features must be tagged as [FREE] or [PRO].
- **Playable First**: Ship a thin playable slice before expanding content.
- **Measured Release**: Performance, accessibility, save/load, input, and
  compatibility checks must run before release.
