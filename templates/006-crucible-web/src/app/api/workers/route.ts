import { NextResponse } from 'next/server';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export async function GET() {
  try {
    const redis = new IORedis(REDIS_URL);
    
    // BullMQ stores queue info in these keys
    const agentJobs = await redis.hgetall('bull:crucible-agents:meta');
    const revenueJobs = await redis.hgetall('bull:crucible-revenue:meta');
    
    // Get counts
    const activeAgents = await redis.llen('bull:crucible-agents:active');
    const waitingAgents = await redis.llen('bull:crucible-agents:wait');
    const completedAgents = await redis.get('bull:crucible-agents:id');
    
    await redis.quit();

    return NextResponse.json({
      success: true,
      stats: {
        agents: {
          active: activeAgents,
          waiting: waitingAgents,
          total_runs: parseInt(completedAgents || '0'),
        },
        revenue: {
          last_run: revenueJobs?.last_run || 'Never',
        }
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

export async function POST(req: Request) {
  try {
    const { action, agentType } = await req.json();
    const redis = new IORedis(REDIS_URL);
    
    if (action === 'trigger_agent' && agentType) {
      // Manual push to BullMQ queue
      const jobId = `${agentType}-${Date.now()}`;
      const jobData = JSON.stringify({ agentType });
      
      // Basic BullMQ job structure (Simplified for manual push)
      await redis.lpush('bull:crucible-agents:wait', jobId);
      await redis.set(`bull:crucible-agents:${jobId}`, JSON.stringify({
        name: `run-${agentType}`,
        data: jobData,
        opts: { removeOnComplete: true },
        status: 'waiting',
        addedTime: Date.now(),
      }));
      
      await redis.quit();
      return NextResponse.json({ success: true, message: `Triggered ${agentType}` });
    }

    await redis.quit();
    return NextResponse.json({ success: false, error: 'Invalid action' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
