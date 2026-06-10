---
name: game-engine-helper
description: >
  Game engine decision and architecture helper for browser games, Phaser,
  Three.js, Unity, Godot, Unreal, and native exports. Use when choosing an
  engine, structuring game systems, or integrating gameplay with web platforms.
triggers:
  - 'choose a game engine'
  - 'game architecture'
  - 'Unity'
  - 'Godot'
  - 'Unreal'
  - 'browser game engine'
---

# Game Engine Helper

Use this skill to select an engine and design the first stable architecture for
a game or interactive experience.

## Engine Selection Matrix

| Need                                            | Prefer             |
| ----------------------------------------------- | ------------------ |
| 2D browser arcade, small bundle, fast iteration | Phaser             |
| 3D browser scene, product viewer, WebGL game    | Three.js           |
| Rich React app with small game widgets          | React + Canvas/SVG |
| Cross-platform 2D/3D indie game                 | Godot              |
| Mobile/desktop commercial production            | Unity              |
| High-end 3D, cinematic, multiplayer shooter     | Unreal             |

## Architecture Checklist

- Keep the game loop separate from UI shell and backend concerns
- Define scene/state transitions before implementing content
- Centralize input mapping for keyboard, touch, pointer, and controller
- Use data files for levels, tuning, items, achievements, and dialogue
- Wrap platform APIs such as saves, ads, payments, and analytics
- Add deterministic seams for tests: seeded RNG, fixed timesteps, fake clocks
- Track performance budgets for FPS, memory, draw calls, bundle size, and load

## Required Artifacts

- `ENGINE_DECISION.md`: engine choice, rejected options, constraints
- `GAME_SYSTEMS.md`: loop, states, input, physics, persistence, content
- `TECHNICAL_RISKS.md`: network, assets, browser/mobile, platform compliance

## Common Guardrails

- Do not build a custom physics, pathfinding, networking, or animation engine
  when a maintained library already fits.
- Do not tie core game rules directly to React component lifecycle or DOM state.
- Keep game data serializable so save/load, replay, debugging, and balancing are
  possible.
- Favor a playable vertical slice before building broad content.
