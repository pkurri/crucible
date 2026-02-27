---
name: neon
description: >
  Deep knowledge of Neon Postgres: serverless driver, connection pooling, 
  database branching, Drizzle ORM migrations, and production patterns.
triggers:
  - neon
  - neon postgres
  - neon database
  - postgres
  - database setup
  - drizzle
---

# Skill: Neon Postgres

Neon is serverless Postgres with branching — the right database for most AI-era applications. This skill gives you production-ready Neon patterns.

---

## Setup

### Installation
```bash
pnpm add @neondatabase/serverless drizzle-orm
pnpm add -D drizzle-kit
```

### Environment
```bash
# .env.local
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://[user]:[password]@[endpoint-unpooled].neon.tech/[dbname]?sslmode=require
```

Use **pooled** for application queries. Use **unpooled** for migrations only.

---

## Database Client

```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema, logger: process.env.NODE_ENV === 'development' })
```

---

## Schema Patterns

```typescript
// src/db/schema.ts
import {
  pgTable, pgEnum, text, timestamp, uuid, integer, boolean, index, uniqueIndex
} from 'drizzle-orm/pg-core'

// Enums
export const planEnum = pgEnum('plan', ['free', 'pro', 'enterprise'])
export const roleEnum = pgEnum('role', ['owner', 'admin', 'member'])

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  plan: planEnum('plan').default('free').notNull(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // soft delete
}, (table) => ({
  clerkIdx: uniqueIndex('users_clerk_id_idx').on(table.clerkId),
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}))

// Organizations (multi-tenant)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: planEnum('plan').default('free').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Memberships
export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  role: roleEnum('role').default('member').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userOrgIdx: uniqueIndex('memberships_user_org_idx').on(table.userId, table.orgId),
  orgIdx: index('memberships_org_idx').on(table.orgId),
}))
```

---

## Migrations

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!, // Use unpooled for migrations
  },
})
```

```bash
# Generate migration
pnpm drizzle-kit generate

# Apply migration (development)
pnpm drizzle-kit push

# Apply migration (production — use migrate, not push)
pnpm drizzle-kit migrate
```

### Migration in CI/CD
```typescript
// scripts/migrate.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

const sql = neon(process.env.DATABASE_URL_UNPOOLED!)
const db = drizzle(sql)

await migrate(db, { migrationsFolder: './drizzle' })
console.log('✅ Migrations complete')
process.exit(0)
```

---

## Neon Branching (Killer Feature)

Neon lets you branch your database like git. Use this for:
- **Feature branches**: test DB changes without affecting production
- **Preview environments**: each PR gets its own DB branch
- **Testing**: branch from prod data for realistic tests

```bash
# Install Neon CLI
npm i -g neonctl
neonctl auth

# Create a branch for your feature
neonctl branches create --name feature/add-teams --parent main

# Get connection string for the branch
neonctl branches get feature/add-teams --output json | jq '.connection_string'

# Delete branch after merge
neonctl branches delete feature/add-teams
```

### Vercel + Neon Branching (Automated)
Install the Neon Vercel Integration — preview deployments automatically get their own DB branch.

---

## Query Patterns

```typescript
// Basic CRUD
const user = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.clerkId, clerkId),
})

// With relations
const userWithOrgs = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, userId),
  with: {
    memberships: {
      with: { organization: true },
    },
  },
})

// Transactions
const result = await db.transaction(async (tx) => {
  const [org] = await tx.insert(organizations).values({ name, slug }).returning()
  await tx.insert(memberships).values({ userId, orgId: org.id, role: 'owner' })
  return org
})

// Soft delete
await db.update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, userId))

// Query excluding soft-deleted
const activeUsers = await db.query.users.findMany({
  where: (users, { isNull }) => isNull(users.deletedAt),
})
```

---

## Performance

```typescript
// Index columns you filter/sort on
// Avoid SELECT * — only select needed columns
const emails = await db
  .select({ email: users.email })
  .from(users)
  .where(isNull(users.deletedAt))

// Batch inserts
await db.insert(users).values([user1, user2, user3]) // one query

// Pagination (cursor-based is better than offset at scale)
const page = await db.query.users.findMany({
  where: (users, { gt }) => gt(users.createdAt, cursor),
  orderBy: (users, { asc }) => [asc(users.createdAt)],
  limit: 20,
})
```
