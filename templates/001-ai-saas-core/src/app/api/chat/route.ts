import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const FREE_TIER_LIMIT = 50

export async function POST(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response('Unauthorized', { status: 401 })

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId)
  })
  if (!user) return new Response('User not found', { status: 404 })

  // Enforce free tier limits
  if (user.plan === 'free' && user.aiCreditsUsed >= FREE_TIER_LIMIT) {
    return new Response('Upgrade required', { status: 402 })
  }

  const { messages } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: 'You are a helpful AI assistant.',
    messages,
    onFinish: async () => {
      // Increment usage counter
      await db.update(users)
        .set({ aiCreditsUsed: user.aiCreditsUsed + 1 })
        .where(eq(users.id, user.id))
    }
  })

  return result.toDataStreamResponse()
}
