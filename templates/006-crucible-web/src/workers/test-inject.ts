import IORedis from 'ioredis';

async function test() {
  const redis = new IORedis();
  try {
    const jobId = `manual-test-${Date.now()}`;
    await redis.lpush('bull:crucible-agents:wait', jobId);
    
    // Minimal job record to satisfy queue
    await redis.set(`bull:crucible-agents:${jobId}`, JSON.stringify({
      name: 'run-analyst',
      data: JSON.stringify({ agentType: 'analyst' }),
      opts: { removeOnComplete: true },
      status: 'waiting',
      addedTime: Date.now()
    }));
    
    console.log('✅ Job injected into BullMQ local queue.');
  } catch (err) {
    console.error('❌ Injection failed:', err);
  } finally {
    await redis.quit();
  }
}

test();
