---
name: web-app-builder
description: >
  Modern web app builder for React, Next.js, Vite, APIs, routing, state, forms,
  auth, databases, deployment, and production UX. Use when creating or extending
  web applications, dashboards, tools, and frontend/backend features.
triggers:
  - 'build a web app'
  - 'Next.js app'
  - 'React app'
  - 'dashboard'
  - 'frontend'
  - 'full stack web'
---

# Web App Builder

Use this skill for production web applications and tools.

## Build Order

1. Map routes, user journeys, data entities, and permissions
2. Define typed contracts for API inputs, outputs, errors, and env vars
3. Build the smallest complete vertical slice
4. Add loading, empty, error, offline, unauthorized, and success states
5. Add tests around business logic and critical journeys
6. Verify accessibility, responsive layout, performance, and security

## Frontend Rules

- Prefer existing design system components and local style conventions.
- Keep operational tools dense, scannable, and calm.
- Use real controls for real actions: buttons, forms, menus, tabs, toggles.
- Prevent layout shifts with stable dimensions for media, cards, tables, and
  controls.
- Do not ship async UI without loading and error states.
- Validate forms on the client for UX and on the server for trust.

## Backend Rules

- Validate every external input with a schema.
- Enforce auth and authorization at the server boundary.
- Use parameterized queries or ORM-safe APIs.
- Return typed, predictable errors.
- Add rate limits for public, auth, payment, upload, and AI endpoints.
- Keep secrets server-side and document required env vars.

## Recommended Skill Chain

- `tool-design-style-selector` for visual direction
- `review-react-best-practices` for React/Next.js performance
- `testing` and `unit-test-code` for verification
- `review-security` for auth, API, secrets, and payment surfaces
- `pwa-builder` when offline or installability matters
