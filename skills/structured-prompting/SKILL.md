---
name: structured-prompting
description: >
  "Draft First, Execute Second" workflow for high-precision AI coding tasks.
  When given a complex or ambiguous request, draft a structured prompt schema
  (Role, Objective, Context, Instructions) for user confirmation before executing.
  Reduces ambiguity and wasted work on large tasks.
triggers:
  - "draft a prompt"
  - "structure this request"
  - "before you start"
  - "plan before coding"
  - "structured prompt"
  - "clarify before implementing"
---

# Skill: Structured Prompting

**Draft First, Execute Second.** For complex or ambiguous requests, produce a structured prompt for confirmation before writing any code.

---

## When to Use This Workflow

**Use structured prompting when:**
- The request is ambiguous or underspecified
- The task will take more than 30 minutes
- Multiple files or services will be affected
- The user hasn't specified constraints (stack, style, scope)
- A wrong interpretation would waste significant effort

**Skip directly to execution when:**
- The request is simple and clear ("add a loading spinner to the button")
- The user already provides a structured prompt (starts with `# Role:`)
- The user says "just do it" or "go ahead"

---

## Step 1: Draft Structured Prompt

Present this to the user BEFORE writing code:

```markdown
# Role:
[Persona — e.g., "Senior Next.js Developer", "Database Architect", "DevOps Engineer"]

# Objective:
[One clear sentence — what will be built/fixed/changed]

# Context:
- **Project**: [Project name and brief description]
- **Current State**: [What exists now]
- **Stack**: [Relevant technologies]
- **Files Affected**: [Which files will change]

# Instructions:

## Instruction 1: [Step Name]
[Specific details, constraints, requirements]

## Instruction 2: [Step Name]
[Specific details]

## Instruction 3: [Step Name]
[Specific details]

# Constraints:
- [Constraint 1 — e.g., "Must not change the public API"]
- [Constraint 2 — e.g., "TypeScript strict mode, no any"]

# Acceptance Criteria:
- [ ] [Verifiable criterion 1]
- [ ] [Verifiable criterion 2]
- [ ] [Tests pass]
```

Then ask: **"Does this match your intent? Any changes before I proceed?"**

---

## Step 2: Execute After Confirmation

Only after the user confirms (or says "yes", "go", "looks good") — proceed with implementation.

If the user modifies the structured prompt, re-read the updated version fully before starting.

---

## Example

**User says:** "Refactor the auth system"

**Without structured prompting:** Start refactoring — might change the wrong things, break APIs, use wrong patterns.

**With structured prompting — draft first:**

```markdown
# Role:
Senior TypeScript Developer focused on authentication systems

# Objective:
Refactor the authentication system from JWT cookies to Clerk, preserving all existing route protections

# Context:
- **Project**: MyApp — Next.js 15 SaaS
- **Current State**: Custom JWT auth in `src/lib/auth.ts`, middleware in `src/middleware.ts`
- **Stack**: Next.js 15, TypeScript strict, Drizzle ORM
- **Files Affected**: src/middleware.ts, src/lib/auth.ts, src/app/api/auth/**, src/db/schema.ts (users table)

# Instructions:

## Instruction 1: Install Clerk
Install @clerk/nextjs, add env vars to .env.example

## Instruction 2: Replace Middleware
Swap custom JWT middleware with Clerk's clerkMiddleware() preserving all protected routes

## Instruction 3: Update User Schema
Add clerkId field to users table, create migration

## Instruction 4: Remove Old Auth
Delete src/lib/auth.ts, remove jsonwebtoken dependency

# Constraints:
- Do NOT change any API route signatures
- All existing protected routes must remain protected
- Must maintain TypeScript strict compliance

# Acceptance Criteria:
- [ ] Login/signup works via Clerk
- [ ] All /dashboard/* routes still protected
- [ ] Existing users table preserved with new clerkId column
- [ ] pnpm tsc --noEmit passes
```

**User:** "Yes, but keep the existing auth as fallback for 30 days"

**Then execute** with that updated constraint.

---

## IDE Config Files

Save the universal system prompt to your project:

```bash
# Creates rules for Cursor, Windsurf, Cline
cat > .cursorrules << 'EOF'
For EVERY complex request, draft a Structured Prompt first using:
# Role: / # Objective: / # Context: / # Instructions: / # Acceptance Criteria:
Present to user for confirmation BEFORE executing.
Skip only for simple/trivial requests or if user says "just do it".
EOF

cp .cursorrules .windsurfrules
cp .cursorrules .clinerules
```
