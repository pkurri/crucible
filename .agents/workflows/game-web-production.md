---
description: Production workflow for game and rich web development.
---

# Game And Web Production Workflow

Use this workflow when the task involves a game, browser game, interactive 3D
experience, PWA, dashboard, SaaS app, or full-stack web product.

## Phase 1: Discovery

1. Confirm the structured prompt and identify target platform.
2. Scan repo structure, package scripts, existing engine/framework, design
   system, tests, deployment, and asset folders.
3. Produce or update a short brief with objective, core loop/user journey,
   non-goals, acceptance criteria, and risk list.

## Phase 2: Architecture

1. Select the smallest viable stack using existing project conventions.
2. Define routes/scenes, state, persistence, assets, APIs, auth, and deploy
   path.
3. Choose agent roles from `.agents/roles/game-web-roster.md`.
4. Create a vertical-slice task plan with verification for each slice.

## Phase 3: Implementation

1. Build a runnable shell first.
2. Add the core loop or core workflow.
3. Add polish, assets, telemetry, and edge states.
4. Keep generated assets, docs, tests, and source changes in predictable
   folders.

## Phase 4: Verification

1. Run available project checks: lint, typecheck, unit tests, E2E, build.
2. Manually verify key screens or scenes at desktop and mobile sizes.
3. For games, verify pause/restart, save/load, input devices, and peak-load FPS.
4. For web apps, verify auth, forms, API errors, loading, empty, and
   unauthorized states.

## Phase 5: Release

1. Prepare release checklist with build command, artifact, env vars, known
   issues, and rollback path.
2. Run security and accessibility gates.
3. Document follow-up work separately from release blockers.
