---
name: tool-agent-logger
description: >
  Structured logging for multi-agent systems using Winston. Includes agent activity
  logging, GitHub API call tracking, performance metrics, and Sentry error capture
  with wrapAsync patterns. Use in any TypeScript/Node.js project needing structured logs.
triggers:
  - "add logging"
  - "structured logging"
  - "winston"
  - "agent logging"
  - "log agent activity"
  - "performance logging"
  - "error tracking node"
---

# Tool: Agent Logger

Structured logging for multi-agent TypeScript systems. Winston for logs, Sentry for errors, performance tracking built in.

---

## Setup

```bash
pnpm add winston @sentry/node
```

---

## Logger (Winston)

```typescript
// src/utils/logger.ts
import winston from 'winston'
import path from 'path'

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const NODE_ENV = process.env.NODE_ENV || 'development'

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'crucible' },
  transports: [],
})

// Dev: pretty console output
if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`
        if (Object.keys(meta).length > 0) msg += ` ${JSON.stringify(meta)}`
        return msg
      })
    )
  }))
}

// Prod: file output
if (NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error'
  }))
  logger.add(new winston.transports.File({
    filename: path.join('logs', 'combined.log')
  }))
}

// Typed helper methods
export const loggers = {
  // Log agent activity
  agent: (agentName: string, action: string, meta?: Record<string, unknown>) =>
    logger.info(`Agent: ${agentName} — ${action}`, { component: 'agent', agentName, ...meta }),

  // Log GitHub API calls
  github: (action: string, meta?: Record<string, unknown>) =>
    logger.info(`GitHub: ${action}`, { component: 'github', ...meta }),

  // Log performance metrics
  perf: (operation: string, durationMs: number, meta?: Record<string, unknown>) =>
    logger.info(`Perf: ${operation} took ${durationMs}ms`, { component: 'perf', durationMs, ...meta }),

  // Log issue/PR operations
  issue: (operation: string, issueNumber: number, meta?: Record<string, unknown>) =>
    logger.info(`Issue #${issueNumber}: ${operation}`, { component: 'issue', issueNumber, ...meta }),
}

export default logger
```

---

## Sentry Error Tracking

```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/node'
import logger from './logger'

const SENTRY_DSN = process.env.SENTRY_DSN
const NODE_ENV = process.env.NODE_ENV || 'development'

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    release: `app@${process.env.npm_package_version ?? '0.0.1'}`,
    tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}

// Capture exception — always logs, optionally sends to Sentry
export function captureException(error: Error, context?: Record<string, unknown>): void {
  logger.error('Exception captured', { error: error.message, stack: error.stack, ...context })
  if (SENTRY_DSN) {
    Sentry.captureException(error, { contexts: context ? { custom: context } : undefined })
  }
}

// Wrap async function with automatic error capture
export function wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureException(error as Error, { ...context, args })
      throw error
    }
  }) as T
}

// Add debug breadcrumb
export function breadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({ category, message, level: 'info', data })
  }
}

// Flush before process exit
export async function flushAndExit(code = 0): Promise<never> {
  if (SENTRY_DSN) await Sentry.flush(2000)
  process.exit(code)
}
```

---

## Usage Patterns

```typescript
import logger, { loggers } from '@/utils/logger'
import { captureException, wrapAsync, breadcrumb } from '@/utils/sentry'

// Agent activity log
loggers.agent('PM Agent', 'Generating epics', { feature: 'auth', complexity: 'medium' })

// Performance tracking
const start = Date.now()
await doExpensiveWork()
loggers.perf('issue-import', Date.now() - start, { count: 25 })

// GitHub API log
loggers.github('createIssue', { title: 'User Registration', repo: 'myapp' })

// Wrap risky async functions
const safeImport = wrapAsync(importIssues, { context: 'bulk-import' })
await safeImport(issues)

// Manual error capture
try {
  await riskyOperation()
} catch (error) {
  captureException(error as Error, { userId, operation: 'payment' })
  throw error
}

// Add breadcrumb trail for debugging
breadcrumb('agent', 'PM Agent started', { featureId: 'feat-123' })
breadcrumb('agent', 'Epics generated', { count: 5 })
breadcrumb('github', 'Issues created', { count: 25 })
```

---

## Environment Variables

```
LOG_LEVEL=info           # debug | info | warn | error
NODE_ENV=development     # development | production
SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

---

## Log Output Examples

**Development (colorized console):**
```
10:23:15 [info]: Agent: PM Agent — Generating epics {"component":"agent","agentName":"PM Agent","feature":"auth"}
10:23:16 [info]: Perf: epic-generation took 1243ms {"component":"perf","durationMs":1243}
10:23:17 [info]: GitHub: createIssue {"component":"github","title":"[EPIC] Auth System"}
```

**Production (JSON file):**
```json
{"level":"info","message":"Agent: PM Agent — Generating epics","component":"agent","agentName":"PM Agent","timestamp":"2025-02-26 10:23:15","service":"crucible"}
```
