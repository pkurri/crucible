# 005 — Realtime Collaboration

> Multi-user realtime collaboration with presence, live cursors, and conflict-free editing.

## Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 15 |
| Realtime | Liveblocks |
| Database | Neon Postgres + Drizzle |
| Auth | Clerk |
| Deployment | Vercel |

## Features
- Live cursors with user presence
- Conflict-free collaborative editing (CRDT)
- Room-based sessions
- Persistent document storage

## Get Started
```bash
cp .env.example .env.local
pnpm install && pnpm dev
```
