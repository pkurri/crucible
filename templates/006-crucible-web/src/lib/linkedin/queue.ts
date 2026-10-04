import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// The `linkedin-jobs` Queue instance ONLY — safe to import from Next.js API
// routes (e.g. the Stripe webhook, to remove a job scheduler on
// cancellation) without pulling in a Worker or the scheduler's setInterval
// loop. Those live in src/workers/linkedin-worker.ts, a standalone process
// (`npm run linkedin:worker`) — importing that file from the Next.js app
// would start a second competing Worker/scheduler inside the request
// process, which is exactly the mistake this split avoids. The existing
// `src/app/api/workers/route.ts` sidesteps the same problem for
// industrial-worker.ts by talking to raw Redis keys instead; this is the
// cleaner fix for the linkedin queue since BullMQ's Queue class is itself
// side-effect-free to construct (no Worker attached to it).

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let _connection: IORedis | null = null;
let _queue: Queue | null = null;

function getConnection(): IORedis {
  if (!_connection) {
    _connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  }
  return _connection;
}

export function getLinkedinQueue(): Queue {
  if (!_queue) {
    _queue = new Queue('linkedin-jobs', { connection: getConnection() as any });
  }
  return _queue;
}
