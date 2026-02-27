import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// All tenant data scoped to org_id — RLS enforces isolation
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkOrgId: text('clerk_org_id').notNull().unique(),
  name: text('name').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  plan: text('plan', { enum: ['free', 'pro', 'enterprise'] }).notNull().default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
