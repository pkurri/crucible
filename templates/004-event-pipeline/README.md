# 004 — Event Pipeline

> Edge-native event ingestion and processing. Handles high-throughput event streams at Cloudflare's edge.

## Stack
| Layer | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| Queue | Cloudflare Queues |
| Storage | Cloudflare R2 + D1 |
| Deployment | Wrangler |

## Architecture
1. **Ingest** — Workers receive events at the edge globally
2. **Queue** — Events buffered in Cloudflare Queues
3. **Process** — Consumer Worker processes batches
4. **Store** — Raw events in R2, aggregates in D1
