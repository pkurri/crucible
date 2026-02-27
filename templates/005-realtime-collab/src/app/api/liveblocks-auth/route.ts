import { Liveblocks } from '@liveblocks/node'
import { auth, currentUser } from '@clerk/nextjs/server'

const liveblocks = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await currentUser()

  const { room } = await req.json()
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: user?.fullName ?? 'Anonymous',
      avatar: user?.imageUrl,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }
  })

  session.allow(room, session.FULL_ACCESS)

  const { status, body } = await session.authorize()
  return new Response(body, { status })
}
