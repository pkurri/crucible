---
description: Generic Game Studio Workflow for 48-agent orchestration.
---

# Gaming Studio Workflow

This workflow orchestrates a full game studio hierarchy to take a concept to a released product.

## Phase 1: Market & Revenue
1.  **Trigger PULSE**: Analyze the market for the given game idea.
2.  **Trigger REVENUE_OPTIMIZER**:
    - Identify [FREE] vs [PRO] features.
    - Generate `REVENUE_PLAN.md`.
3.  **Creative Director Review**: Approve the vision and monetization strategy.

## Phase 2: Architecture & Planning
1.  **Trigger SCHEMA**: Generate the PRD (Product Requirements Document).
2.  **Trigger TECHNICAL_DIRECTOR**: High-level system design.
3.  **Trigger PRODUCER**: Generate the `SPRINT_PLAN.md` with 20+ atomic tasks.

## Phase 3: The Dev Loop (Parallelized)
1.  **Dispatch to Specialists**:
    - **Art/Audio**: Start generating style guides and assets.
    - **Engineering (PIXEL)**: Start core loop development.
    - **Design**: Level block-outs and economy balancing.
2.  **Continuous QA (GLITCH)**: Static analysis and unit testing of every PR.
3.  **Performance Check (TURBO)**: Audit every 3rd sprint for frame-time and memory.

## Phase 4: Release & Compliance
1.  **Trigger GATEWAY**: Validate against Apple/Google store policies.
2.  **Trigger RELEASE_MANAGER**: Package build and prepare changelogs.
3.  **Final Submission**: Handoff to USER for store upload.

---
// turbo-all
// This workflow is fully automated within the Gaming Studio environment.
