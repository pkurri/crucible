---
name: observe
description: >
  Observability stack: PostHog for product analytics, Sentry for error tracking,
  Axiom for structured logs. Patterns for instrumenting a Next.js app from day 0.
triggers:
  - "analytics"
  - "error tracking"
  - "posthog"
  - "sentry"
  - "logging"
  - "observability"
  - "instrument"
---

# Service: Observability

Instrument your app on day 0, not after something breaks.

## Stack

| Tool | Purpose | What to capture |
|---|---|---|
| PostHog | Product analytics | User actions, feature flags, funnels |
| Sentry | Error tracking | Exceptions, performance, replay |
| Axiom | Structured logs | Server logs, background jobs, audit trail |

## PostHog Setup

```bash
pnpm add posthog-js posthog-node
```

```tsx
// src/providers/posthog.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',  // proxy through your domain
      capture_pageview: false,  // manual for SPA
    })
  }, [])
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

```typescript
// Track events anywhere
import { usePostHog } from 'posthog-js/react'

const posthog = usePostHog()
posthog.capture('feature_used', { feature: 'export', format: 'csv' })
```

## Sentry Setup

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// Capture errors explicitly in catch blocks
import * as Sentry from '@sentry/nextjs'

try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    extra: { userId, context: 'payment-processing' }
  })
  throw error  // re-throw after capturing
}
```

## Axiom Structured Logging

```bash
pnpm add @axiomhq/js
```

```typescript
// src/lib/logger.ts
import { Axiom } from '@axiomhq/js'

const axiom = new Axiom({ token: process.env.AXIOM_TOKEN! })

export const logger = {
  info: (message: string, data?: object) =>
    axiom.ingest(process.env.AXIOM_DATASET!, [{ level: 'info', message, ...data }]),
  error: (message: string, error?: unknown, data?: object) =>
    axiom.ingest(process.env.AXIOM_DATASET!, [{
      level: 'error', message,
      error: error instanceof Error ? error.message : String(error),
      ...data
    }]),
}

// Usage
logger.info('User subscribed', { userId, plan: 'pro' })
logger.error('Payment failed', error, { userId, amount: 4900 })
```

## Environment Variables

```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://xxxx@sentry.io/xxxx
AXIOM_TOKEN=xaat-xxxx
AXIOM_DATASET=production-logs
```

## Key Events to Track

```typescript
// Standard event taxonomy
type Events =
  | 'user_signed_up'
  | 'user_logged_in'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'feature_used'
  | 'export_completed'
  | 'onboarding_step_completed'
  | 'error_encountered'
```
