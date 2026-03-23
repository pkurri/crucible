# 🧭 Studio Configuration — Crucible 102

This file manages the environment for the **102-game-studio-crucible** project.

## Master Hierarchy (48 Agents)

The 48-agent roster is defined in `agents/ROSTER.md`.

## Active Commands (Slash Commands)

Access these via `/` in any Crucible-standard environment:
- `/studio-init`: Start a new session and detect project stage.
- `/brainstorm`: Create a high-concept and GDD.
- `/revenue-opt`: Build the "Free vs Pro" monetization map.
- `/sprint-plan`: Create task arcs for specialists.

## Verification Hooks (Cross-Platform)

- `scripts/verify-assets.py`: Check mesh-counts, draw-calls, and compression.
- `scripts/validate-gdd.py`: Check for design-vs-code drift.
- `scripts/status-report.py`: Aggregate agent progress into a daily brief.

## Engine Specialization

Toggle your environment focus with these sub-commands:
- `/setup-engine godot`
- `/setup-engine unity`
- `/setup-engine unreal`
- `/setup-engine web-js`

## Safety & Guardrails

- No `force-push` without Producer approval.
- No third-party SDK integration without Tech Director audit.
- No breaking of `DOD` (Definition of Done) standards.

---
Part of the **Crucible** ecosystem. Professional Grade Game Development.
