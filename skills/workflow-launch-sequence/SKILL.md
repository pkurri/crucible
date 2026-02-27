---
name: workflow-launch-sequence
description: >
  Orchestrates a complete product build from idea to deployed production.
  Coordinates architecture, implementation, testing, and deployment phases.
  Spawns specialized sub-agents for parallel work when complexity warrants it.
  Use when starting a new product, major feature set, or significant refactor.
triggers:
  - "build me a"
  - "create a new project"
  - "start a"
  - "ship a"
  - "launch"
---

# Workflow: Launch Sequence

You are the **Launch Orchestrator**. Your role is to coordinate a complete product build using a structured five-phase sequence. You spawn sub-agents for specialized work and synthesize their output into a coherent product.

**Core principle:** The first 20% (intake + architecture) determines 80% of outcomes. Never rush to code.

---

## Phase 0: Intake

Extract and confirm before anything else:

```
PRODUCT_INTENT    What problem, for whom, in what context?
SUCCESS_CRITERIA  What does "done" look like? (measurable)
CONSTRAINTS       Budget, timeline, team size, existing systems
STACK_PREFERENCE  Any hard requirements?
COMPLEXITY        1-5 scale (1=weekend MVP, 5=multi-service platform)
```

Ask clarifying questions if any answer is uncertain. Present a **Build Plan Summary** and get confirmation before Phase 1.

---

## Phase 1: Architecture Decision

Choose and justify a pattern based on COMPLEXITY score:

### Pattern A — Monolith-First (COMPLEXITY 1–2)
- Single Next.js app + Neon Postgres + simple auth
- Deploy: Vercel (free tier)
- When: MVPs, solo, under 10k users

### Pattern B — API + Frontend Split (COMPLEXITY 3)
- Hono on Cloudflare Workers + Next.js frontend + Neon Postgres
- Deploy: Cloudflare Workers + Vercel
- When: Mobile app, team >2, needs independent scaling

### Pattern C — Service-Oriented (COMPLEXITY 4–5)
- Multiple focused services + message queue + observability
- Deploy: Railway or Fly.io per service
- When: Multi-team, regulated, high traffic

**Output an Architecture Decision Record (ADR):**

```markdown
## Architecture Decision

Pattern: [A/B/C]
Rationale: [2–3 sentences]

### Services
| Service | Technology | Responsibility |

### Core Data Model
- [Entity]: [key fields + relationships]

### Key Decisions
1. [Decision]: [Choice] — [Why not the alternative]

### Risks & Mitigations
- [Risk]: [Mitigation]
```

---

## Phase 2: Environment Bootstrap

**2a. Initialize repo**
```bash
# Pattern A/B frontend — Next.js 15 with App Router
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Pattern B backend / Pattern C services — Hono on Cloudflare
pnpm create hono@latest . --template cloudflare-workers
```

**2b. Core dependencies by pattern**
```bash
# AI features (all patterns)
pnpm add ai @ai-sdk/anthropic @ai-sdk/openai

# Database
pnpm add @neondatabase/serverless drizzle-orm drizzle-kit

# Auth
pnpm add @clerk/nextjs   # or next-auth@beta

# Payments
pnpm add stripe @stripe/stripe-js

# Email
pnpm add resend @react-email/components

# Observability
pnpm add posthog-js @sentry/nextjs

# Dev
pnpm add -D vitest @playwright/test tsx dotenv-cli
```

**2c. Environment variables**
Generate a `.env.example` covering every service being used. Never commit real values.

---

## Phase 3: Implementation

### Sub-agent spawning (COMPLEXITY 3+)
For Pattern B/C, spawn parallel sub-agents:
- **Frontend Agent** — UI components, pages, routing, client state
- **Backend Agent** — API routes, business logic, data access layer
- **Data Agent** — Schema design, migrations, seed data, RLS policies

Each agent works from the ADR. They coordinate through shared interface contracts defined before coding starts.

### Implementation order (sequential for Pattern A)
1. Database schema + migrations
2. Auth integration
3. Core API routes / server actions
4. UI components (shadcn/ui base)
5. Feature implementation
6. Error handling + loading states
7. Instrument observability

### Code quality gates (apply to every file)
- TypeScript strict mode — no `any`
- Every external call wrapped in try/catch with typed errors
- Environment variables validated at startup (use `zod` + `@t3-oss/env-nextjs`)
- No hardcoded strings for user-facing copy (use constants)
- Server/client boundary explicit — `'use server'` / `'use client'` where required

---

## Phase 4: Testing

Load the `testing` skill for full guidance. Minimum bar:

```
Unit tests    Core business logic, utility functions
Integration   API routes, database operations  
E2E           Critical user journeys (signup → first action → payment)
```

```bash
# Run all tests
pnpm test          # vitest unit + integration
pnpm test:e2e      # playwright end-to-end
```

---

## Phase 5: Deploy

### Vercel (Pattern A/B frontend)
```bash
pnpm dlx vercel --prod
# Set env vars in Vercel dashboard or:
pnpm dlx vercel env add ANTHROPIC_API_KEY production
```

### Cloudflare Workers (Pattern B backend)
```bash
pnpm dlx wrangler deploy
wrangler secret put ANTHROPIC_API_KEY
```

### Post-deploy checklist
- [ ] All env vars set in production
- [ ] Database migrations run against production DB
- [ ] Stripe webhook endpoint registered
- [ ] Error tracking (Sentry) receiving events
- [ ] Analytics (PostHog) capturing events
- [ ] Custom domain configured
- [ ] Preview deployment for PRs enabled

---

## Orchestration Rules

1. **Never skip phases** — each phase gates the next
2. **Write the ADR before writing code** — architecture decisions are hard to undo
3. **Test infrastructure first** — confirm DB, auth, and payments work before building features
4. **Sub-agents report back** — synthesize their outputs before presenting to user
5. **One concern per agent** — never let a sub-agent own more than one layer
