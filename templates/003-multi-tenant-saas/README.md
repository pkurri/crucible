# 003 — Multi-Tenant SaaS

> Organization-scoped multi-tenant app with proper data isolation using Postgres Row Level Security.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Neon Postgres + Drizzle + RLS |
| Auth | Clerk (org-aware) |
| Payments | Stripe (per-org billing) |
| Deployment | Vercel |

## Key Design Decisions

- **Data isolation via RLS** — org_id filter enforced at DB level, not application level
- **Clerk Organizations** — org membership and roles managed by Clerk
- **Per-org Stripe customers** — each organization has its own Stripe customer

## Get Started

```bash
cp .env.example .env.local
pnpm install
pnpm db:push
pnpm dev
```
