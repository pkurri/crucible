# 002 — Conversational API

> Stateful conversation API backend. Manages multi-turn chat state, handles streaming, persists history.

## Stack

| Layer | Technology |
|---|---|
| Framework | Hono (Cloudflare Workers) |
| Database | Neon Postgres + Drizzle |
| Cache | Cloudflare KV |
| AI | Vercel AI SDK + Anthropic |
| Deployment | Cloudflare Workers |

## Get Started

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```
