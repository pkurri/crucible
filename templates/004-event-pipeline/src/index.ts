import { Hono } from 'hono'

type Bindings = {
  QUEUE: Queue
  BUCKET: R2Bucket
  DB: D1Database
  INGEST_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Event ingestion endpoint
app.post('/events', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (authHeader !== `Bearer ${c.env.INGEST_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json()
  const events = Array.isArray(body) ? body : [body]

  // Validate basic shape
  const valid = events.filter(e => e.type && e.userId && e.timestamp)
  if (valid.length === 0) return c.json({ error: 'No valid events' }, 400)

  // Enqueue for processing
  await Promise.all(valid.map(event => c.env.QUEUE.send({
    ...event,
    receivedAt: new Date().toISOString(),
  })))

  return c.json({ accepted: valid.length }, 202)
})

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))

// Queue consumer — processes events in batches
export const queueConsumer = {
  async queue(batch: MessageBatch, env: Bindings) {
    const events = batch.messages.map(m => m.body)

    // Store raw events in R2
    const key = `events/${new Date().toISOString().slice(0, 10)}/${Date.now()}.json`
    await env.BUCKET.put(key, JSON.stringify(events), {
      httpMetadata: { contentType: 'application/json' }
    })

    // Write aggregates to D1
    const stmt = env.DB.prepare(
      'INSERT INTO events (id, type, user_id, data, received_at) VALUES (?, ?, ?, ?, ?)'
    )
    await env.DB.batch(
      events.map((e: any) =>
        stmt.bind(crypto.randomUUID(), e.type, e.userId, JSON.stringify(e), e.receivedAt)
      )
    )

    batch.ackAll()
  }
}

export default app
