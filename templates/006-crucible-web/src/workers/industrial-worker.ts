import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import path from 'path';
import dotenv from 'dotenv';
import { SupabaseClient } from '@supabase/supabase-js';

// Resolve environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

import { getSupabaseAdmin } from '../lib/supabase';
import {
  MarketAnalystAgent,
  ContentWriterAgent,
  TrendScoutAgent,
  AgentSpawnerAgent,
  BuilderAgent,
  TemplateArchitectAgent,
  BlueprintSpawnerAgent,
  IntelManagerAgent,
  ForgeOverseerAgent,
  StageManagerAgent,
  SkillHarvesterAgent,
  MarketReporterAgent,
  RevenueAgent,
  VisualArchitectAgent,
  SelfHealAgent,
  GrowthMarketeerAgent,
  IForgeAgent,
} from './agent-definitions';

import { getCompetitorContext } from './market-researcher';

// 1. Initialize Redis Connection
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

// 2. Define Queues
const agentQueue = new Queue('crucible-agents', { connection: connection as any });
const revenueQueue = new Queue('crucible-revenue', { connection: connection as any });

// 3. Agent Registry for workers
const agents: Record<string, IForgeAgent> = {
  analyst: new MarketAnalystAgent(),
  scout: new TrendScoutAgent(),
  architect: new TemplateArchitectAgent(),
  spawner_v2: new BlueprintSpawnerAgent(),
  builder: new BuilderAgent(),
  writer: new ContentWriterAgent(),
  spawner: new AgentSpawnerAgent(),
  intel_manager: new IntelManagerAgent(),
  overseer: new ForgeOverseerAgent(),
  stage_manager: new StageManagerAgent(),
  harvester: new SkillHarvesterAgent(),
  reporter: new MarketReporterAgent(),
  revenue: new RevenueAgent(),
  graphics: new VisualArchitectAgent(),
  healer: new SelfHealAgent(),
  marketeer: new GrowthMarketeerAgent(),
};

// 4. Helper to update Supabase status
async function updateAgentStatus(supabase: SupabaseClient, agentType: string, status: string) {
  try {
    await supabase
      .from('agents_registry')
      .update({ status, last_active_at: new Date().toISOString() })
      .eq('type', agentType);
  } catch (e) {
    console.error(`[STATUS_UPDATE_ERROR] ${agentType}:`, e);
  }
}

// 5. Initialize General Agent Worker
const agentWorker = new Worker(
  'crucible-agents',
  async (job: Job) => {
    const { agentType } = job.data;
    const agent = agents[agentType];
    
    if (!agent) throw new Error(`Agent type ${agentType} not found.`);

    console.log(`[JOB] Starting ${agent.name} (${job.id})`);
    const supabase = getSupabaseAdmin();

    await updateAgentStatus(supabase, agentType, 'busy');
    try {
      const result = await agent.execute(supabase);
      console.log(`[JOB] Finished ${agent.name}:`, result.message);
      return result;
    } finally {
      await updateAgentStatus(supabase, agentType, 'idle');
    }
  },
  { connection: connection as any, concurrency: 3 }
);

// 6. Initialize Revenue / Monetization Worker
const revenueWorker = new Worker(
  'crucible-revenue',
  async (job: Job) => {
    console.log('[JOB] Starting Revenue Optimization...');
    const fs = await import('fs');
    const path = await import('path');
    const { generateWithYield } = await import('./ai-router');
    
    const DATA_DIR = path.join(process.cwd(), 'data');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const siteContext = `Crucible AI Agent Orchestration, templates and automated workers.`;

    // Perform research
    const competitors = await getCompetitorContext();
    
    // Generate pricing
    const pricingPrompt = `CRO Agent: Generate pricing JSON based on these competitors: ${JSON.stringify(competitors)}`;
    const pricingRaw = await generateWithYield(pricingPrompt, 'reasoning');
    
    // Clean up potential MD blocks
    const cleaned = pricingRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    fs.writeFileSync(path.join(DATA_DIR, 'pricing.json'), cleaned);

    console.log('[JOB] Revenue Optimization Complete.');
    return { success: true };
  },
  { connection: connection as any }
);

// 7. Scheduler (Self-Requeueing)
async function scheduleNextAgentRuns() {
  console.log('📅 Scheduling periodic agent jobs...');
  
  // Every 30 minutes, push the whole fleet into the queue
  for (const type of Object.keys(agents)) {
    await agentQueue.add(`run-${type}`, { agentType: type }, {
      repeat: { pattern: '*/30 * * * *' },
      removeOnComplete: true,
    });
  }

  // Revenue agent runs once a day
  await revenueQueue.add('optimize-monetization', {}, {
    repeat: { pattern: '0 0 * * *' },
    removeOnComplete: true,
  });
}

console.log('🚀 Crucible Industrial Worker System Online');
scheduleNextAgentRuns().catch(console.error);

agentWorker.on('failed', (job, err) => console.error(`[WORKER_FAILED] Job ${job?.id}:`, err));
revenueWorker.on('failed', (job, err) => console.error(`[REVENUE_FAILED] Job ${job?.id}:`, err));
