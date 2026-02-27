---
name: testing
description: >
  Testing strategy and patterns: Vitest for unit/integration, Playwright for
  E2E, pytest for Python services. Covers setup, patterns, and CI integration.
triggers:
  - "test"
  - "testing"
  - "vitest"
  - "playwright"
  - "unit test"
  - "e2e"
  - "write tests"
---

# Service: Testing

## Stack

| Tool | Type | Use for |
|---|---|---|
| Vitest | Unit + Integration | Business logic, utilities, API routes |
| Playwright | E2E | Critical user journeys |
| MSW | API Mocking | Frontend tests without backend |

## Vitest Setup

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

## Unit Test Patterns

```typescript
// src/lib/__tests__/pricing.test.ts
import { describe, it, expect } from 'vitest'
import { calculateDiscount, isEligibleForTrial } from '../pricing'

describe('calculateDiscount', () => {
  it('applies 20% for annual plan', () => {
    expect(calculateDiscount(100, 'annual')).toBe(80)
  })

  it('applies no discount for monthly plan', () => {
    expect(calculateDiscount(100, 'monthly')).toBe(100)
  })
})

describe('isEligibleForTrial', () => {
  it('returns false if user already had trial', () => {
    const user = { trialUsed: true, createdAt: new Date() }
    expect(isEligibleForTrial(user)).toBe(false)
  })
})
```

## Integration Test (API Route)

```typescript
// src/app/api/users/__tests__/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { GET } from '../route'

describe('GET /api/users', () => {
  it('returns 401 without auth', async () => {
    const req = new Request('http://localhost/api/users')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns user list when authenticated', async () => {
    const req = new Request('http://localhost/api/users', {
      headers: { Authorization: 'Bearer test-token' }
    })
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.users)).toBe(true)
  })
})
```

## Playwright E2E Setup

```bash
pnpm add -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## E2E Test — Critical Journey

```typescript
// e2e/signup-to-dashboard.spec.ts
import { test, expect } from '@playwright/test'

test('user can sign up and reach dashboard', async ({ page }) => {
  await page.goto('/signup')

  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'SecurePass123!')
  await page.click('button[type=submit]')

  await expect(page).toHaveURL('/onboarding')
  await page.fill('[name=name]', 'Test User')
  await page.click('button:has-text("Continue")')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Welcome')
})
```

## Package.json Scripts

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

## What to Test

| Priority | What | Tool |
|---|---|---|
| ⭐⭐⭐ | Payment flows | Playwright |
| ⭐⭐⭐ | Auth signup/login | Playwright |
| ⭐⭐⭐ | Core business logic | Vitest |
| ⭐⭐ | API route validation | Vitest |
| ⭐⭐ | Data transformation | Vitest |
| ⭐ | UI component rendering | Vitest + Testing Library |
