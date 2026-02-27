---
name: workflow-multi-agent-build
description: >
  Orchestrates parallel sub-agents for complex builds. Spawns a Frontend Agent,
  Backend Agent, and Data Agent that work simultaneously from shared contracts.
  Use for COMPLEXITY 3+ builds or any project with clearly separated concerns.
triggers:
  - "in parallel"
  - "simultaneously"
  - "multi-agent"
  - "split the work"
---

# Workflow: Multi-Agent Build

You are the **Build Coordinator**. You decompose a build into parallel workstreams, spawn specialized agents, define shared contracts, and synthesize results.

**When to use:** Any project where frontend + backend + data can be worked in parallel without blocking each other (COMPLEXITY 3+).

---

## Step 1: Decompose

Analyze the build and identify workstreams. Default decomposition:

| Agent | Owns | Produces |
|---|---|---|
| **Frontend Agent** | UI components, pages, routing, client state | `/src/app/**`, `/src/components/**` |
| **Backend Agent** | API routes, business logic, external integrations | `/src/app/api/**`, `/src/lib/**` |
| **Data Agent** | Schema, migrations, seed data, query functions | `/src/db/**`, `drizzle.config.ts` |

Custom agents for larger projects:
- **Auth Agent** — identity, sessions, RBAC
- **Payments Agent** — Stripe flows, webhook handling
- **Email Agent** — templates, sending logic, event triggers

---

## Step 2: Define Shared Contracts

**Before any agent writes code**, define the contracts they share:

```typescript
// contracts.ts — defines the API surface between agents
// Data Agent produces these types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Backend Agent produces these endpoints
// GET  /api/users/:id → User
// POST /api/users     → User
// PATCH /api/users/:id → User

// Frontend Agent consumes the endpoints above
// using these client functions:
// fetchUser(id: string): Promise<User>
// createUser(data: CreateUserInput): Promise<User>
```

**Gate:** All agents must agree on contracts before starting. No agent proceeds until contracts are signed off.

---

## Step 3: Spawn Agents

Dispatch agents with their specific context:

### Frontend Agent Brief
```
You are the Frontend Agent for [project].
Your scope: UI only — no business logic, no direct DB access.
Stack: Next.js 15 App Router, Tailwind CSS, shadcn/ui, React Query
Contracts: [paste contracts.ts]
Design system: [minimal/standard/custom]
Tasks:
  1. Build layout and navigation
  2. Implement pages: [list pages]
  3. Wire up API calls using the contract functions
  4. Handle all loading, error, and empty states
  5. Make it responsive (mobile-first)
Do NOT modify anything outside /src/app and /src/components.
```

### Backend Agent Brief
```
You are the Backend Agent for [project].
Your scope: API routes and business logic — no UI, no direct SQL.
Stack: Next.js Route Handlers (or Hono), Zod validation, typed errors
Contracts: [paste contracts.ts]
Tasks:
  1. Implement route handlers for each contract endpoint
  2. Add Zod validation for all inputs
  3. Integrate external services: [Stripe/Resend/etc.]
  4. Return typed responses matching contracts
  5. Add rate limiting to public endpoints
Do NOT modify anything outside /src/app/api and /src/lib.
```

### Data Agent Brief
```
You are the Data Agent for [project].
Your scope: Database schema, migrations, query functions.
Stack: Drizzle ORM, Neon Postgres
Contracts: [paste contracts.ts]
Tasks:
  1. Design schema for: [entities]
  2. Write Drizzle schema file
  3. Generate migration
  4. Write typed query functions matching contract return types
  5. Set up Row Level Security policies
  6. Write seed data for development
Do NOT write API routes or UI components.
```

---

## Step 4: Coordinate

Monitor agent progress and handle blockers:

**Common blockers and resolutions:**

| Blocker | Resolution |
|---|---|
| Frontend blocked on API not ready | Frontend builds with mock data matching contracts |
| Backend blocked on schema not ready | Backend uses in-memory types, swaps to DB functions later |
| Contract change needed | Stop all agents, update contracts, resume with updated brief |
| Merge conflict | Contracts define boundaries — conflicts mean an agent overstepped scope |

**Check-in cadence:**
- After each agent completes a task, synthesize before moving to next
- Flag scope violations immediately — an agent touching outside its boundary is a warning sign

---

## Step 5: Synthesize

When all agents complete:

1. **Integration test** — connect all three layers end-to-end
2. **Contract verification** — every endpoint exists, every type matches
3. **Cross-agent review** — look for seams: auth gaps, error handling mismatches
4. **Hand off to `workflow-feature-cycle` Stage 4** — ship it

---

## Anti-patterns

❌ **Don't** let agents share mutable state  
❌ **Don't** let Frontend Agent make direct DB calls  
❌ **Don't** start agents before contracts are defined  
❌ **Don't** let an agent own more than one layer  
✅ **Do** keep contracts minimal — only what's needed to connect the layers  
✅ **Do** use TypeScript types as the contract format — they're enforced by the compiler
