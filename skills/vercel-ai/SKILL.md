---
name: vercel-ai
description: >
  Vercel AI SDK patterns: streaming text, structured output, tool calls,
  multi-model routing, and AI state management. Use for any AI feature.
triggers:
  - "vercel ai sdk"
  - "ai sdk"
  - "streaming"
  - "tool calls"
  - "ai feature"
  - "llm"
---

# Service: Vercel AI SDK

The Vercel AI SDK abstracts model providers behind a unified API with built-in streaming.

## Setup

```bash
pnpm add ai @ai-sdk/anthropic @ai-sdk/openai
```

## Streaming Text (Route Handler)

```typescript
// src/app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: 'You are a helpful assistant.',
    messages,
  })

  return result.toDataStreamResponse()
}
```

## Streaming Text (Frontend)

```tsx
// src/app/chat/page.tsx
'use client'
import { useChat } from 'ai/react'

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} disabled={isLoading} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  )
}
```

## Structured Output with Zod

```typescript
import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const { object } = await generateObject({
  model: anthropic('claude-sonnet-4-5'),
  schema: z.object({
    summary: z.string(),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    keyPoints: z.array(z.string()),
  }),
  prompt: 'Analyse this review: ' + reviewText,
})
// object is fully typed — no JSON.parse needed
```

## Tool Calls (Function Calling)

```typescript
import { streamText, tool } from 'ai'
import { z } from 'zod'

const result = streamText({
  model: anthropic('claude-sonnet-4-5'),
  tools: {
    getWeather: tool({
      description: 'Get current weather for a location',
      parameters: z.object({ city: z.string() }),
      execute: async ({ city }) => {
        const data = await fetchWeather(city)
        return data
      },
    }),
  },
  prompt: 'What is the weather in Tokyo?',
})
```

## Multi-model Routing

```typescript
// Route to different models based on task complexity
function selectModel(taskType: 'simple' | 'complex' | 'vision') {
  switch (taskType) {
    case 'simple':  return anthropic('claude-haiku-4-5')
    case 'complex': return anthropic('claude-sonnet-4-5')
    case 'vision':  return anthropic('claude-sonnet-4-5')
  }
}
```

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-xxxx
OPENAI_API_KEY=sk-xxxx  # if using OpenAI models
```
