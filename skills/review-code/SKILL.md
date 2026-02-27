---
name: review-code
description: >
  Thorough code review covering functionality, security (CWE), readability,
  and performance. Outputs findings as CRITICAL / SUGGESTION / NITPICK.
  Use when reviewing PRs, auditing code quality, or before merging.
triggers:
  - "review this code"
  - "review my code"
  - "code review"
  - "check this code"
  - "is this code good"
  - "review the PR"
  - "audit this"
---

# Skill: Code Review

Structured, thorough code review. Output findings as CRITICAL / SUGGESTION / NITPICK.

---

## Review Checklist

### 1. Functionality & Logic
- [ ] Does the code solve the stated problem?
- [ ] Are there obvious bugs or logic errors?
- [ ] Are edge cases handled? (null inputs, empty arrays, negative numbers, zero)
- [ ] Are race conditions possible in async code?
- [ ] Are error paths handled (not just the happy path)?

### 2. Security (CWE Focus)
- [ ] **SQL Injection** — Are queries parameterized? No string interpolation in SQL?
- [ ] **Secrets** — No hardcoded API keys, passwords, or tokens?
- [ ] **Input Validation** — Is all user input validated before use?
- [ ] **XSS** — Is user content sanitized before rendering?
- [ ] **Auth** — Are protected endpoints actually protected?
- [ ] **Error Exposure** — Do error messages leak internal details?

### 3. Readability & Maintainability
- [ ] Variable/function names are descriptive (`userId` not `u`)
- [ ] Functions do one thing (Single Responsibility)
- [ ] Public functions/methods have docstrings/JSDoc
- [ ] No magic numbers — use named constants
- [ ] Dead code removed

### 4. Performance
- [ ] No N+1 queries (queries inside loops)
- [ ] No expensive operations inside loops
- [ ] `async/await` used correctly for I/O (no blocking calls)
- [ ] Large datasets paginated
- [ ] Caching used where appropriate

### 5. TypeScript/Python Specific
**TypeScript:**
- [ ] No `any` types
- [ ] Proper error typing in catch blocks
- [ ] Zod validation on API inputs

**Python:**
- [ ] Pydantic models for request/response
- [ ] All I/O is `async`
- [ ] No blocking calls in async functions

---

## Output Format

Always structure findings as:

```
## Code Review: [filename or PR title]

### [CRITICAL] Must Fix Before Merge
**Issue**: [What the problem is]
**Location**: `file.ts:42`
**Risk**: [Why it matters]
**Fix**:
```code
// Fixed version
```

### [SUGGESTION] Improvements
**Issue**: [What could be better]
**Location**: `file.ts:15`
**Why**: [Performance/maintainability reason]
**Suggestion**:
```code
// Better version
```

### [NITPICK] Style/Polish
- `file.ts:8` — Variable name `d` → rename to `document`
- `file.ts:23` — Missing JSDoc on public function

### Summary
- Criticals: X (must fix)
- Suggestions: X (should fix)
- Nitpicks: X (optional)
- **Verdict**: ✅ Approve | 🔄 Request Changes | ❌ Block
```

---

## Common Patterns to Flag

```typescript
// ❌ CRITICAL — N+1 query
for (const user of users) {
  const posts = await db.query(`SELECT * FROM posts WHERE user_id = ${user.id}`)
}

// ✅ Fix — batch query
const posts = await db.select().from(postsTable).where(inArray(postsTable.userId, userIds))

// ❌ CRITICAL — SQL injection
const result = await db.query(`SELECT * FROM users WHERE email = ${email}`)

// ✅ Fix — parameterized
const result = await db.select().from(users).where(eq(users.email, email))

// ❌ SUGGESTION — Swallowed error
try {
  await doSomething()
} catch (e) {}  // Silent failure

// ✅ Fix — log and rethrow or handle
try {
  await doSomething()
} catch (e) {
  logger.error("doSomething failed", { error: e })
  throw e
}
```
