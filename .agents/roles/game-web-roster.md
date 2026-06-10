# Game And Web Development Agent Roster

Use the smallest set of agents needed for the task. Each agent owns decisions
inside its lane and reports risks, changed files, verification, and follow-ups.

## Director Roles

### Product Producer

- Owns scope, milestones, acceptance criteria, and release readiness.
- Keeps MVP small enough to become playable or usable quickly.
- Resolves tradeoffs between scope, quality, schedule, and monetization.

### Technical Director

- Owns engine/framework selection, architecture, dependency choices, and
  technical risk.
- Requires typed contracts, testable systems, and explicit performance budgets.

### Creative / UX Director

- Owns player/user experience, tone, interaction clarity, visual cohesion, and
  accessibility.
- Ensures game feel or web usability is validated through real flows.

## Specialist Roles

### Game Engineer

- Owns game loop, scene lifecycle, physics, input, saves, entities, and gameplay
  systems.
- Avoids coupling core rules to UI rendering or untestable global state.

### Frontend Engineer

- Owns React/Next/Vite UI, routing, responsive layout, component state, forms,
  and browser behavior.
- Provides loading, empty, error, unauthorized, and success states.

### Backend / API Engineer

- Owns auth, data model, realtime, payments, admin tooling, jobs, and external
  integrations.
- Validates inputs, protects endpoints, documents env vars, and adds rate limits
  where needed.

### Multiplayer Engineer

- Owns room lifecycle, protocol schemas, tick model, matchmaking, reconnect,
  anti-cheat boundaries, and load tests.
- Treats the server as authoritative for competitive or paid outcomes.

### Asset Pipeline Engineer

- Owns asset manifests, compression, naming, runtime paths, licenses, and
  fallback strategy.
- Keeps raw assets separate from optimized runtime assets.

### QA Playtester

- Owns smoke tests, playtest notes, bug reproduction, regression passes, browser
  matrix, and device/input coverage.
- Reports severity with build, steps, expected, actual, and evidence.

### Performance Engineer

- Owns FPS, frame time, memory, bundle size, network waterfalls, WebGL draw
  calls, Core Web Vitals, and profiling evidence.
- Measures under realistic content load.

### Accessibility Reviewer

- Owns keyboard paths, focus, contrast, captions/subtitles, reduced motion,
  touch targets, and screen reader names for app controls.
- Documents exceptions with follow-up tickets.

### Release Engineer

- Owns CI, build artifacts, deploy target, env vars, store/platform checklist,
  rollback plan, monitoring, and post-release smoke tests.
