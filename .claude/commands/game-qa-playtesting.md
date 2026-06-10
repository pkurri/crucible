---
name: game-qa-playtesting
description: >
  Game QA, playtesting, accessibility, balance, and bug triage skill. Use when
  testing gameplay, levels, controls, saves, monetization, tutorials, browser
  compatibility, or release readiness.
triggers:
  - 'playtest'
  - 'game QA'
  - 'test gameplay'
  - 'balance pass'
  - 'bug bash'
  - 'release readiness'
---

# Game QA And Playtesting

Use this skill to turn a playable build into a shippable build.

## Test Passes

- **Smoke**: launches, menu works, first action succeeds, no console crashes
- **Core Loop**: start, progress, fail, retry, win, reward, quit
- **Controls**: keyboard, pointer, touch, controller where supported
- **Saves**: first run, save, reload, corrupted save, reset, migration
- **Balance**: difficulty curve, dominant strategies, grind, economy sinks
- **Accessibility**: remapping, subtitles/captions, contrast, motion settings
- **Compatibility**: viewport sizes, browsers, offline/slow network, low memory
- **Regression**: fixed bugs stay fixed

## Bug Report Format

```markdown
## Bug: [short title]

- Build:
- Platform/browser/device:
- Steps:
- Expected:
- Actual:
- Severity: blocker | major | minor | polish
- Evidence: screenshot, video, console log, save file, replay seed
```

## Playtest Report Format

```markdown
## Playtest Report

- Session length:
- Player profile:
- First confusion point:
- Most fun moment:
- Friction:
- Bugs:
- Balance notes:
- Top 3 changes:
```

## Release Gates

- No blocker bugs
- No data-loss save issues
- Tutorial or first-use flow is understandable without developer explanation
- Performance is measured under realistic content load
- Accessibility exceptions are documented with follow-up tickets
