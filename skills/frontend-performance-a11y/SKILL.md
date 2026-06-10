---
name: frontend-performance-a11y
description: >
  Frontend performance and accessibility quality gate for web apps, games, and
  interactive experiences. Use when checking Core Web Vitals, FPS, bundle size,
  layout stability, keyboard access, contrast, motion, and responsive behavior.
triggers:
  - 'frontend performance'
  - 'accessibility'
  - 'Core Web Vitals'
  - 'WCAG'
  - 'Lighthouse'
  - 'responsive QA'
---

# Frontend Performance And Accessibility

Use this skill as a release gate for web interfaces and browser games.

## Performance Checks

- Measure on realistic content and a mid-range device profile.
- Track LCP, CLS, INP, bundle size, image weight, and network waterfalls.
- Cap animation and render loops; avoid layout work every frame.
- Lazy-load non-critical routes, panels, models, audio, and media.
- Use stable media dimensions to prevent layout shift.
- Prefer CSS transforms and opacity for animation.

## Accessibility Checks

- Keyboard can reach all menus, forms, dialogs, and critical commands.
- Visible focus state exists and is not hidden by custom styling.
- Text contrast meets WCAG AA unless explicitly documented as decorative.
- Motion-heavy effects respect reduced motion settings.
- Images, icons, canvas fallbacks, and controls have accessible names where
  appropriate.
- Errors are announced or placed near the related control.

## Browser Game Additions

- Provide pause, mute, and restart.
- Keep touch targets large enough for mobile.
- Avoid relying only on color for gameplay-critical state.
- Offer remapping or alternate input for non-twitch actions when feasible.
- Do not trap focus inside a canvas without an escape path.

## Output Format

```markdown
## Frontend Performance And Accessibility Report

- Build/URL:
- Viewports tested:
- Performance findings:
- Accessibility findings:
- Game/input findings:
- Required fixes:
- Follow-ups:
```
