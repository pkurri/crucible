---
name: cloudflare
description: >
  Cloudflare platform patterns: Workers, R2 object storage, KV for edge cache,
  Durable Objects for stateful edge, Queues for background jobs. Use when
  building edge-native or globally distributed applications.
triggers:
  - "cloudflare"
  - "workers"
  - "edge"
  - "r2"
  - "durable objects"
  - "cloudflare kv"
---

# Service: Cloudflare Platform

Build globally distributed applications that run at the edge.

## Workers Setup (Hono)

```bash
pnpm create hono@latest my-api --template cloudflare-workers
pnpm add hono
```

```typescript
// src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

app.get('/health', (c) => c.json({ ok: true }))

app.post('/items',
  zValidator('json', z.object({ name: z.string(), content: z.string() })),
  async (c) => {
    const { name, content } = c.req.valid('json')
    await c.env.DB.prepare('INSERT INTO items (name, content) VALUES (?, ?)')
      .bind(name, content).run()
    return c.json({ ok: true }, 201)
  }
)

export default app
```

## wrangler.toml

```toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "xxxx"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "my-bucket"

[[kv_namespaces]]
binding = "KV"
id = "xxxx"
```

## R2 — Object Storage

```typescript
// Upload a file
await c.env.BUCKET.put(`uploads/${userId}/${filename}`, file, {
  httpMetadata: { contentType: file.type },
  customMetadata: { uploadedBy: userId },
})

// Get a file
const object = await c.env.BUCKET.get(`uploads/${userId}/${filename}`)
if (!object) return c.notFound()
return new Response(object.body, {
  headers: { 'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream' }
})

// Generate signed URL (temporary access)
const url = await c.env.BUCKET.createMultipartUpload(`uploads/${key}`)
```

## KV — Edge Cache

```typescript
// Cache expensive computation at the edge
const cacheKey = `user:${userId}:profile`
const cached = await c.env.KV.get(cacheKey, 'json')
if (cached) return c.json(cached)

const profile = await fetchProfileFromDB(userId)
await c.env.KV.put(cacheKey, JSON.stringify(profile), {
  expirationTtl: 300  // 5 minutes
})
return c.json(profile)
```

## Queues — Background Jobs

```typescript
// Producer: enqueue a job
await c.env.QUEUE.send({ type: 'send-email', to: email, template: 'welcome' })

// Consumer: process jobs
export default {
  async queue(batch: MessageBatch, env: Env) {
    for (const msg of batch.messages) {
      const job = msg.body as { type: string; to: string; template: string }
      if (job.type === 'send-email') {
        await sendEmail(job.to, job.template)
        msg.ack()
      }
    }
  }
}
```

## Deployment

```bash
# Deploy to production
pnpm dlx wrangler deploy

# Set secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put STRIPE_SECRET_KEY

# Tail logs in real-time
wrangler tail
```
