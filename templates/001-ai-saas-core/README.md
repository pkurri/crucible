# 001 — AI SaaS Core

> Full SaaS product with AI as the core feature. Auth, payments, email, and streaming AI all wired up from day 0.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Neon Postgres + Drizzle ORM |
| Auth | Clerk |
| Payments | Stripe (subscriptions) |
| AI | Vercel AI SDK + Anthropic Claude |
| Email | Resend + React Email |
| Observability | PostHog + Sentry |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel |

## Get Started

```bash
cp .env.example .env.local
pnpm install
pnpm db:push
pnpm dev
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup (Clerk)
│   ├── (dashboard)/     # Protected app routes
│   │   ├── dashboard/
│   │   └── settings/
│   ├── api/
│   │   ├── chat/        # Streaming AI endpoint
│   │   ├── webhooks/
│   │   │   └── stripe/  # Stripe webhook handler
│   │   └── checkout/    # Stripe checkout session
│   └── layout.tsx
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── chat/            # AI chat components
│   └── billing/         # Pricing, upgrade prompts
├── db/
│   ├── schema.ts        # Drizzle schema
│   └── index.ts         # DB client
├── emails/              # React Email templates
├── lib/
│   ├── stripe.ts
│   └── auth.ts
└── middleware.ts         # Clerk auth middleware
```
