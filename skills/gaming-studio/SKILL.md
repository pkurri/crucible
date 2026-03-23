---
name: gaming-studio
description: 'Generic Game Studio Workflow Skill.
  Orchestrates professional game development using a 3-tier hierarchy:
  1. Directors (Vision/Ops)
  2. Leads (Domain Authority)
  3. Specialists (Execution)
  Built for 4-Phase execution: Concept -> Architecture -> Iteration -> Compliance.'
license: 'MIT'
triggers:
  - "When initiating a game development cycle"
  - "When delegating game design or engineering tasks"
  - "When performing a studio-wide audit"
---

# Game Studio Orchestrator

This skill provides a structured framework for building games, from inception to launch, using a hierarchy of specialized AI agents.

## Hierarchy Model

### Tier 1: Directors (Strategy)
- **Creative Director**: Guardian of the "Fun" and the "Vision".
- **Technical Director**: Architect of systems and performance.
- **Producer**: Manager of scope and schedule.

### Tier 2: Leads (Management)
- **Leads**: Art, Audio, Design, Narrative, QA, Programming, Release.

### Tier 3: Specialists (Tactical)
- **Engine Specialists**: Unity, Godot, Unreal Experts.
- **Design Specialists**: Level, Systems, Economy, UX.
- **Engineering Specialists**: AI, Gameplay, Network, UI, DevOps.

## Execution Phases

1.  **Concept & Feasibility (Phase 1)**
    - *Revenue Optimizer* defines Free vs. Pro features.
    - *Market Analyst* (PULSE) identifies trends.
2.  **Architecture & Planning (Phase 2)**
    - *Technical Director* selects engine and infrastructure.
    - *Producer* (DISPATCH) generates the sprint plan.
3.  **Development & Iteration (Phase 3)**
    - *Specialists* build assets and code.
    - *QA* (GLITCH) and *Performance* (TURBO) audit every block.
4.  **Compliance & Release (Phase 4)**
    - *Store Policy Expert* (GATEWAY) checks Apple/Google rules.
    - *Release Manager* packages the build.

## Output Standards

Every step must produce a **resumable artifact**:
- `PHASE_1_PRD.md` (Product Requirements Document)
- `PHASE_2_SPRINT_PLAN.md` (Task breakdown)
- `REVENUE_OPTIMIZATION_PLAN.md` (Monetization strategy)
- `TECHNICAL_ARCHITECTURE_DOC.md` (Engine & Framework)

## Rules for Agents

- **Horizontal Consultation**: Specialists can consult each other but cannot finalize changes outside their domain.
- **Vertical Escalation**: Disagreements escalate to Department Leads, then to Directors.
- **Revenue Integration**: All features must be tagged as [FREE] or [PRO].
