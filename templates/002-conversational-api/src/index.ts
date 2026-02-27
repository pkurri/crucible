import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bearerAuth } from 'hono/bearer-auth'
import { zValidator } from '@hono/zod-validator'
import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

type Bindings = { ANTHROPIC_API_KEY: string; API_SECRET: string; KV: KVNamespace }

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())
app.use('/api/*', async (c, next) => {
  const auth = bearerAuth({ token: c.env.API_SECRET })
  return auth(c, next)
})

app.post('/api/chat',
  zValidator('json', z.object({
    sessionId: z.string(),
    message: z.string().min(1).max(10000),
    systemPrompt: z.string().optional(),
  })),
  async (c) => {
    const { sessionId, message, systemPrompt } = c.req.valid('json')

    // Load conversation history from KV
    const historyRaw = await c.env.KV.get(`session:${sessionId}`, 'json') as any[] | null
    const history = historyRaw ?? []

    const messages = [
      ...history,
      { role: 'user' as const, content: message }
    ]

    const anthropic = createAnthropic({ apiKey: c.env.ANTHROPIC_API_KEY })

    const result = streamText({
      model: anthropic('claude-sonnet-4-5'),
      system: systemPrompt ?? 'You are a helpful assistant.',
      messages,
      onFinish: async ({ text }) => {
        // Persist updated history
        const updated = [...messages, { role: 'assistant', content: text }]
        // Keep last 50 messages
        const trimmed = updated.slice(-50)
        await c.env.KV.put(`session:${sessionId}`, JSON.stringify(trimmed), {
          expirationTtl: 60 * 60 * 24 * 7 // 7 days
        })
      }
    })

    return result.toDataStreamResponse()
  }
)

app.delete('/api/sessions/:sessionId', async (c) => {
  await c.env.KV.delete(`session:${c.req.param('sessionId')}`)
  return c.json({ ok: true })
})

export default app
