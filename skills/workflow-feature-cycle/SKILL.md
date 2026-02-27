---
name: workflow-feature-cycle
description: >
  Manages the full lifecycle of a single feature: spec writing, implementation,
  code review, and shipping. Use when adding a feature to an existing codebase.
  Loads review-architecture and review-security automatically before shipping.
triggers:
  - "add a feature"
  - "implement"
  - "build the"
  - "add support for"
  - "i need a"
---

# Workflow: Feature Cycle

You are the **Feature Owner**. Your job is to take a feature request from fuzzy idea to shipped code using a structured four-stage cycle. You load review skills automatically before shipping.

---

## Stage 1: Spec

Before writing a line of code, produce a Feature Spec:

```markdown
## Feature Spec: [Feature Name]

### Problem
[What user problem does this solve? One paragraph.]

### Proposed Solution
[How it works, from the user's perspective. No implementation details yet.]

### Acceptance Criteria
- [ ] [Concrete, testable criterion]
- [ ] [Concrete, testable criterion]
- [ ] ...

### Out of Scope
- [Explicitly excluded — prevents scope creep]

### Technical Approach
[High-level: which files change, what APIs are called, what DB changes needed]

### Estimated Complexity
- [ ] Simple (< 2 hours)
- [ ] Medium (half day)
- [ ] Complex (1–3 days)
- [ ] Epic (needs breakdown into sub-features)
```

**Gate:** If EPIC, break into sub-features and run each through this cycle separately.

---

## Stage 2: Implementation

### Pre-flight checks
```bash
git checkout -b feature/[feature-name]   # always branch
pnpm test                                 # confirm green baseline
```

### Implementation order
1. **Types first** — define TypeScript interfaces for new data shapes
2. **Database** — schema changes + migration file
3. **Backend logic** — service functions, API routes
4. **Frontend** — components, pages, client hooks
5. **Tests** — unit tests alongside implementation, not after

### Coding standards (non-negotiable)
- Match the existing code style exactly — check neighbouring files
- No `console.log` in committed code — use structured logger
- Every new DB query uses parameterized statements
- New API routes need input validation (zod schema)
- Loading + error states for every async UI interaction

---

## Stage 3: Review

Automatically invoke architecture and security checks:

**Architecture check** (from `review-architecture`):
- Does this feature introduce tight coupling?
- Does it respect existing module boundaries?
- Are there scalability concerns at 10x load?

**Security check** (from `review-security`):
- Is user input sanitized?
- Are endpoints protected by auth?
- Any secrets accidentally exposed?

**Self-review checklist before marking ready:**
- [ ] All acceptance criteria met
- [ ] Tests pass locally (`pnpm test`)
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Migration file created if schema changed
- [ ] `.env.example` updated if new env vars added
- [ ] Feature works in a fresh incognito session

---

## Stage 4: Ship

```bash
# Final checks
pnpm test && pnpm tsc --noEmit && pnpm lint

# Merge
git checkout main && git merge feature/[feature-name]

# Deploy
pnpm dlx vercel --prod   # or wrangler deploy, railway up, etc.

# Run migrations in production
pnpm db:migrate:prod

# Verify
# Open production URL, test the feature manually
# Check Sentry for any new errors in the last 5 minutes
# Check PostHog to confirm event tracking firing
```

### Rollback plan
```bash
# If something goes wrong
git revert HEAD --no-edit
pnpm dlx vercel --prod
# Rollback migration if needed (have rollback SQL ready before shipping)
```
