---
name: workflow-game-web-production
description: >
  End-to-end production workflow for games and interactive web apps. Use when
  turning a game, browser game, 3D experience, PWA, or rich web product from
  idea to shipped build with planning, agents, implementation, QA, performance,
  accessibility, and release gates.
triggers:
  - 'build a game'
  - 'web game'
  - 'interactive web app'
  - 'game production workflow'
  - 'ship a browser game'
---

# Workflow: Game And Web Production

You are the production owner for a game or rich web application. Move from idea
to release through gated artifacts so the project stays playable, testable, and
deployable.

## Stage 0: Intake

Capture the minimum viable brief before coding:

- Target: web app, Phaser game, Three.js scene, Unity/Godot export, or hybrid
- Audience, platform, input devices, accessibility needs, monetization
- Core user loop or game loop in one sentence
- Existing codebase constraints, engine, design system, deploy target
- Definition of done, including frame-rate, loading, and test expectations

## Stage 1: Concept And Feasibility

Produce `docs/game-web/00-brief.md` with:

- Genre or product category
- Core loop, fail states, win states, replay hook
- MVP scope and explicit out-of-scope list
- Risks: performance, multiplayer, content volume, art/audio, browser support
- Revenue or growth model when relevant

Use `gaming-studio` and `revenue-optimizer` for game concepts.

## Stage 2: Architecture

Produce `docs/game-web/01-architecture.md` with:

- Engine/framework decision and alternatives considered
- State model, persistence model, networking model, asset pipeline
- UI routes/screens/scenes and ownership boundaries
- Testing plan mapped to risk
- Release target: Vercel, Cloudflare, itch.io, Steam, mobile stores, or console

Use `game-engine-helper`, `web-app-builder`, `phaser-game-builder`,
`three-js-game`, and `multiplayer-game-networking` as needed.

## Stage 3: Build Loop

Implement in small vertical slices:

1. Playable or usable shell
2. Core loop with placeholder assets
3. UI flow, settings, saves, loading and error states
4. Real assets and polish
5. Tests, telemetry, accessibility, and performance hardening

Each slice must have:

- A runnable local command
- Manual verification notes
- Automated checks when the repo has test tooling
- A short rollback or disable path for risky features

## Stage 4: Quality Gates

Before release, run the relevant gates:

- `game-qa-playtesting`: fun, usability, balance, bugs, saves, input devices
- `frontend-performance-a11y`: Core Web Vitals, frame budget, WCAG basics
- `review-security`: auth, API, payments, secrets, rate limits
- `review-react-best-practices`: React or Next.js performance
- `testing`: unit, integration, E2E, visual smoke tests

Minimum browser game budgets:

- 60 FPS target for common gameplay; document exceptions
- First playable interaction under 3 seconds on a mid-range device when possible
- No layout overlap at 360px, 768px, 1280px, and wide desktop widths
- Keyboard path for menus and non-twitch interactions

## Stage 5: Release

Produce `docs/game-web/02-release-checklist.md` with:

- Build command and artifact location
- Environment variables and secrets inventory
- Asset licensing confirmation
- Browser/device matrix
- Known issues and support plan
- Store/platform compliance notes if applicable

## Agent Routing

Use the smallest team that covers the risk:

- Product/Producer for scope, milestones, and acceptance criteria
- Game Designer for mechanics, levels, economy, and feel
- Frontend Engineer for UI, routing, forms, state, and responsive layouts
- Game Engineer for loop, physics, input, save/load, and engine integration
- Backend/API Engineer for auth, realtime, persistence, payments, and admin
- Asset Pipeline Engineer for sprites, models, audio, compression, and licenses
- QA Playtester for bug finding, balance, accessibility, and regression passes
- Performance Engineer for bundle, memory, GPU, frame time, and network budgets
- Release Engineer for CI, deployment, stores, rollback, and monitoring
