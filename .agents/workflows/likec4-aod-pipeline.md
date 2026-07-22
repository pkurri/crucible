---
description: LikeC4 Architecture Overview Diagram (AOD) generation pipeline.
---

# LikeC4 AOD Pipeline

This workflow takes an architecture description to a committed, embedded diagram
using LikeC4.

## Phase 1: Intake

1. **Clarify Scope**: Confirm C4 level(s) needed (context/container/
   component/deployment) and audience.

## Phase 2: Model

1. **Trigger likec4-architect**: Query existing model (MCP
   `read-project-summary`/`search-element`), then update `model.c4`/ `views.c4`.

## Phase 3: Render & Validate

1. `likec4 validate` must exit `0`.
2. `likec4 export png|svg -o docs/architecture/`.

## Phase 4: Review

1. **Trigger likec4-architect (drift check)**: Compare the rendered view against
   real code structure.

## Phase 5: Publish

1. Commit sources + exported assets, embed in docs with a regeneration note.

---

// See skills/workflow-likec4-aod-pipeline/SKILL.md and
agents/likec4-architect.md for details.
