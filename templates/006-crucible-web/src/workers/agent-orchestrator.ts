import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
import {
  MarketAnalystAgent,
  ContentWriterAgent,
  TrendScoutAgent,
  AgentSpawnerAgent,
  BuilderAgent,
  IForgeAgent,
} from './agent-definitions.js';

// ─────────────────────────────────────────────────────────
// CRUCIBLE — Unified Agent Orchestrator
// Runs all agents in a continuous loop with telemetry.
// Start with: npm run agents:start
// ─────────────────────────────────────────────────────────

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Built-in agents
const AGENTS: IForgeAgent[] = [
  new MarketAnalystAgent(),
  new ContentWriterAgent(),
  new TrendScoutAgent(),
  new AgentSpawnerAgent(),
  new BuilderAgent(),
];

let cycleCount = 0;

async function updateAgentStatus(agentType: string, status: string) {
  try {
    await supabase
      .from('agents_registry')
      .update({ status, last_active_at: new Date().toISOString() })
      .eq('type', agentType);
  } catch { /* non-critical */ }
}

async function incrementTasksCompleted(agentType: string) {
  try {
    // Use raw rpc or just re-read and update
    const { data } = await supabase
      .from('agents_registry')
      .select('tasks_completed')
      .eq('type', agentType)
      .single();

    if (data) {
      await supabase
        .from('agents_registry')
        .update({ tasks_completed: (data.tasks_completed || 0) + 1 })
        .eq('type', agentType);
    }
  } catch { /* non-critical */ }
}

async function runCycle() {
  cycleCount++;
  console.log(`\n\x1b[38;2;255;140;0m══════════════════════════════════════════════\x1b[0m`);
  console.log(`\x1b[1m\x1b[38;2;255;140;0m  FORGE CYCLE #${cycleCount} — ${new Date().toISOString()}\x1b[0m`);
  console.log(`\x1b[38;2;255;140;0m══════════════════════════════════════════════\x1b[0m\n`);

  for (const agent of AGENTS) {
    console.log(`\n\x1b[33m▶ Activating: ${agent.name}\x1b[0m`);

    await updateAgentStatus(agent.type, 'busy');

    try {
      const result = await agent.execute(supabase);

      if (result.success) {
        console.log(`\x1b[32m✓ ${agent.name}: ${result.message}\x1b[0m`);
        await incrementTasksCompleted(agent.type);
      } else {
        console.log(`\x1b[31m✗ ${agent.name}: ${result.message}\x1b[0m`);
      }
    } catch (err: any) {
      console.error(`\x1b[31m✗ ${agent.name} crashed: ${err.message}\x1b[0m`);
    }

    await updateAgentStatus(agent.type, 'idle');

    // Brief pause between agents to avoid rate limits
    await sleep(3000);
  }

  // Cooldown between cycles
  const cooldown = Math.floor(Math.random() * 20) + 15; // 15-35 seconds
  console.log(`\n\x1b[90m⏳ Reactor cooling for ${cooldown}s before next cycle...\x1b[0m`);
  await sleep(cooldown * 1000);
}

async function boot() {
  console.log(`\x1b[38;2;255;140;0m`);
  console.log(`   ██████╗██████╗ ██╗   ██╗ ██████╗██╗██████╗ ██╗     ███████╗`);
  console.log(`  ██╔════╝██╔══██╗██║   ██║██╔════╝██║██╔══██╗██║     ██╔════╝`);
  console.log(`  ██║     ██████╔╝██║   ██║██║     ██║██████╔╝██║     █████╗  `);
  console.log(`  ██║     ██╔══██╗██║   ██║██║     ██║██╔══██╗██║     ██╔══╝  `);
  console.log(`  ╚██████╗██║  ██║╚██████╔╝╚██████╗██║██████╔╝███████╗███████╗`);
  console.log(`   ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝╚═════╝ ╚══════╝╚══════╝`);
  console.log(`\x1b[0m`);
  console.log(`\x1b[1m\x1b[38;2;0;255;136m[ORCHESTRATOR ONLINE]\x1b[0m Agent Orchestrator v2.0`);
  console.log(`\x1b[90mRunning ${AGENTS.length} agents in continuous loop...\x1b[0m\n`);

  // Set all agents to active on boot
  for (const agent of AGENTS) {
    await updateAgentStatus(agent.type, 'active');
  }

  // Continuous loop
  while (true) {
    try {
      await runCycle();
    } catch (err: any) {
      console.error(`\x1b[31m[ORCHESTRATOR ERROR] ${err.message}\x1b[0m`);
      await sleep(10000);
    }
  }
}

boot().catch(console.error);
