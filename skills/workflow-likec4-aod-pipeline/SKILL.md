---
name: workflow-likec4-aod-pipeline
description:
  'End-to-end pipeline for producing and maintaining LikeC4 Architecture
  Overview Diagrams (AOD): intake architecture intent, draft/update the likec4
  model, render and validate diagrams, review for accuracy against the real
  codebase, then publish. Triggers: generate an architecture diagram, update the
  AOD, diagram the system architecture, refresh the container/component diagram.'
triggers:
  - 'When asked to produce or refresh an architecture/system/container diagram'
  - 'When onboarding docs need an up-to-date AOD'
  - 'When this workflow is referenced by another skill or agent'
---

# LikeC4 AOD Pipeline

Takes an architecture description from intent to a committed, embedded diagram
using [LikeC4](https://likec4.dev). Built on top of the
[likec4-diagrams](../likec4-diagrams/SKILL.md) skill and the
[likec4-architect](../../agents/likec4-architect.md) agent.

## Phase 1: Intake

1. **Clarify scope** — whole system vs. one subsystem.
2. **Clarify audience** — onboarding overview vs. deep technical reference.
3. **Clarify C4 level(s)** needed — context / container / component /
   deployment. This repo calls the resulting diagram set the "AOD"; confirm
   that's what's meant if the request is ambiguous.

## Phase 2: Model

1. Trigger the `likec4-architect` agent (or apply the `likec4-diagrams` skill
   directly) to update `architecture/specification.c4` and
   `architecture/model.c4`.
2. Query the existing model first — via the `@likec4/mcp` server
   (`read-project-summary`, `search-element`) if registered, else by reading
   `architecture/*.c4` — to avoid duplicating or contradicting existing
   elements.
3. Update `architecture/views.c4` so the new/changed elements are visible in the
   view(s) matching the requested audience/level.

## Phase 3: Render & Validate

1. `npx likec4 validate` — must exit `0`.
2. `npx likec4 start` for live review while iterating.
3. `npx likec4 export svg|png -o docs/architecture/` for the final assets.

## Phase 4: Review

1. Trigger `likec4-architect` in drift-check mode: compare the rendered view
   against real code structure (services, deployments, dependency direction).
2. Sanity-check that the diagram reads correctly to someone unfamiliar with the
   system (the actual test of an onboarding-grade AOD).

## Phase 5: Publish

1. Commit the `.c4` sources and exported assets together.
2. Embed the exported diagram(s) in the relevant README/ARCHITECTURE.md with a
   relative link.
3. Note the regeneration command (`npx likec4 export ...`) near the embed so the
   next person knows the image is generated, not hand-drawn.

## Companion Resources

- Skill: [likec4-diagrams](../likec4-diagrams/SKILL.md)
- Agent: [likec4-architect](../../agents/likec4-architect.md)
