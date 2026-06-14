# Game And Web Development Rules

This guide collects the default rules Crucible agents should apply when helping
with games, browser games, interactive 3D, PWAs, and full-stack web products.

## Default Workflow

1. Start with the structured prompt gate.
2. Scan the repo before editing: scripts, framework, tests, design system,
   routing, asset folders, deployment, and agent/skill docs.
3. Choose the smallest viable skill chain.
4. Build a vertical slice before broad content.
5. Verify with the repo's checks and at least one manual browser or gameplay
   pass when a UI/game surface changes.

## Skill Chain

| Task                     | Skills                                             |
| ------------------------ | -------------------------------------------------- |
| Full game or web product | `workflow-game-web-production`                     |
| Game concept to release  | `gaming-studio`, `game-engine-helper`              |
| 2D browser game          | `phaser-game-builder`, `game-qa-playtesting`       |
| 3D browser scene         | `three-js-game`, `frontend-performance-a11y`       |
| Multiplayer              | `multiplayer-game-networking`, `review-security`   |
| Assets                   | `game-asset-pipeline`                              |
| Web app feature          | `web-app-builder`, `review-react-best-practices`   |
| PWA/offline              | `pwa-builder`, `testing`                           |
| Release gate             | `game-qa-playtesting`, `frontend-performance-a11y` |

## Game Rules

- Prioritize a playable core loop over menus, cosmetics, and large content sets.
- Keep rules, state, and tuning data testable outside the renderer.
- Use existing engines and libraries for physics, networking, animation, and
  pathfinding unless the project explicitly requires custom implementations.
- Support pause, restart, mute, settings, and a clear first-run flow.
- Treat saves, purchases, progression, and scores as trust-sensitive.
- Measure performance during the busiest expected gameplay moment.

## Web Rules

- Match the existing framework and component conventions before adding new ones.
- Ship full UI states: loading, empty, error, unauthorized, success, and
  validation.
- Use typed server contracts and schema validation at trust boundaries.
- Keep secrets server-side and document required environment variables.
- Build responsive layouts with stable dimensions so text and controls do not
  overlap at mobile, tablet, desktop, and wide desktop widths.
- Prefer accessible native controls and clear focus behavior.

## Agent Rules

- Assign one owner per lane: product, game, frontend, backend, assets, QA,
  performance, accessibility, release.
- Agents must report changed files, verification, risks, and follow-ups.
- Agents may consult across lanes, but final decisions belong to the lane owner
  or the technical/product director.
- Shared artifacts live under `docs/game-web/` unless the target template has a
  more specific convention.

## Verification Baseline

Run what exists in the repo:

- `npm run validate`
- `npm run format:check`
- `npm run lint:markdown`
- `npm run build`
- Template-specific `test`, `typecheck`, `lint`, and `e2e` scripts

For UI and games, also verify:

- 360px, 768px, 1280px, and wide desktop layouts
- Keyboard access and visible focus
- No major console errors
- No blank canvas or missing core assets
- Reasonable load time and frame rate for the target device
