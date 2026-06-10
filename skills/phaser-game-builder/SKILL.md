---
name: phaser-game-builder
description: >
  Phaser 3 browser game builder for 2D arcade, puzzle, platformer, card, and
  casual games. Use when creating scenes, sprites, input, physics, UI overlays,
  save data, build setup, or deployable web games.
triggers:
  - 'Phaser'
  - 'Phaser 3'
  - '2D browser game'
  - 'arcade game'
  - 'platformer'
  - 'puzzle game'
---

# Phaser Game Builder

Use Phaser for fast, production-friendly 2D browser games.

## Recommended Structure

```text
src/game/
├── config.ts
├── scenes/
│   ├── BootScene.ts
│   ├── PreloadScene.ts
│   ├── MenuScene.ts
│   ├── GameScene.ts
│   └── UIScene.ts
├── systems/
│   ├── input.ts
│   ├── save.ts
│   ├── audio.ts
│   └── analytics.ts
├── data/
│   ├── levels.json
│   └── tuning.json
└── types.ts
```

## Build Order

1. Boot and preload scenes with visible progress
2. One playable scene with placeholder assets
3. Input mapping for keyboard, pointer, touch, and pause
4. Collision/physics and lose/win conditions
5. Save/load, settings, audio mute, and responsive scaling
6. UI overlay or React shell integration
7. Tests for data validation and deterministic systems

## Phaser Rules

- Use `Phaser.Scale.FIT` or a deliberate fixed virtual resolution.
- Keep scene code thin; move scoring, inventory, economy, and spawning into
  systems that can be unit tested.
- Load assets in `PreloadScene`; never fetch large assets inside hot gameplay.
- Pool frequently spawned objects instead of creating/destroying every frame.
- Use sprite atlases and compressed audio for production builds.
- Keep UI text legible on mobile and avoid gameplay controls near browser
  chrome.

## Verification

- Check desktop and mobile viewports.
- Confirm pause/resume works after tab visibility changes.
- Test muted audio, failed asset load, save reset, and first-run flow.
- Profile FPS during peak entity count, not only an empty scene.
