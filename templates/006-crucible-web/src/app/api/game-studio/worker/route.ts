// ═══════════════════════════════════════════════════════
// POST /api/game-studio/worker
// Executes the pipeline — one Groq call per agent, in order.
//
// Designed to be called as a fire-and-forget from /pipeline.
// On Vercel Hobby: use as an async background call
// On Vercel Pro:   enable maxDuration = 300 (Fluid compute)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

// Vercel Fluid Compute — increase timeout to 300s on Pro plan
export const maxDuration = 300;

const supabase = getSupabaseAdmin();

// ─── Groq LLM call ──────────────────────────────────────

async function callGroq(system: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:       process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens:  4096,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '{}';
}

// ─── Prompt loader ──────────────────────────────────────

function loadPrompt(filename: string): string {
  const promptPath = path.join(
    process.cwd(),
    'src', 'agents', 'prompts', filename
  );
  if (!fs.existsSync(promptPath)) {
    return `You are a specialized AI game development agent. Return valid JSON.`;
  }
  const text = fs.readFileSync(promptPath, 'utf-8');
  // Extract the ## System Prompt section
  const match = text.match(/## System Prompt\n([\s\S]*?)(?=\n## |\Z)/);
  return match ? match[1].trim() : text;
}

// ─── DB helpers ─────────────────────────────────────────

async function setAgent(jobId: string, agent: string, progress: number) {
  await supabase
    .from('pipeline_jobs')
    .update({ current_agent: agent, progress })
    .eq('id', jobId);
}

async function markAgentStart(jobId: string, agent: string) {
  await supabase
    .from('pipeline_agent_results')
    .update({ status: 'RUNNING', started_at: new Date().toISOString() })
    .eq('job_id', jobId)
    .eq('agent', agent);
}

async function markAgentDone(jobId: string, agent: string, result: unknown) {
  await supabase
    .from('pipeline_agent_results')
    .update({
      status:  'COMPLETE',
      result,
      ended_at: new Date().toISOString(),
    })
    .eq('job_id', jobId)
    .eq('agent', agent);
}

async function log(jobId: string, agent: string, message: string, level = 'info') {
  await supabase
    .from('pipeline_logs')
    .insert({ job_id: jobId, agent, message, level });
}

// ─── Agent step definitions ──────────────────────────────

const STEPS = [
  {
    agent:    'PULSE',
    progress: 10,
    prompt:   'pulse-market-analyst.md',
    buildInput: (ctx: Record<string, unknown>) => JSON.stringify({
      task: 'market_analysis',
      gameIdea: ctx.gameIdea,
      targetPlatform: ctx.targetPlatform,
      targetGenre: ctx.targetGenre,
    }),
  },
  {
    agent:    'SCHEMA',
    progress: 25,
    prompt:   'schema-requirement-vetter.md',
    buildInput: (ctx: Record<string, unknown>) => JSON.stringify({
      task: 'generate_prd',
      gameIdea: ctx.gameIdea,
      marketAnalysis: ctx.PULSE,
    }),
  },
  {
    agent:    'DISPATCH',
    progress: 42,
    prompt:   'dispatch-project-manager.md',
    buildInput: (ctx: Record<string, unknown>) => JSON.stringify({
      task: 'task_breakdown',
      prd: ctx.SCHEMA,
    }),
  },
  {
    agent:    'PIXEL',
    progress: 58,
    prompt:   'pixel-software-engineer.md',
    buildInput: (ctx: Record<string, unknown>) => JSON.stringify({
      task: 'implement_sprint_1',
      taskBreakdown: ctx.DISPATCH,
      engineChoice: (ctx.SCHEMA as any)?.technicalRequirements?.engine?.name || 'Phaser.io',
    }),
  },
  {
    agent:    'GLITCH',
    progress: 70,
    prompt:   'glitch-qa-debugger.md',
    buildInput: (ctx: Record<string, unknown>) => JSON.stringify({
      task: 'qa_review',
      codeOutput: ctx.PIXEL,
    }),
  },
  {
    agent:    'TURBO',
    progress: 83,
    prompt:   'turbo-performance-optimizer.md',
    buildInput: (ctx: Record<string, unknown>) => JSON.stringify({
      task: 'performance_analysis',
      codeOutput: ctx.PIXEL,
      testReport: ctx.GLITCH,
      performanceTargets: (ctx.SCHEMA as any)?.performanceTargets,
    }),
  },
  {
    agent:    'GATEWAY',
    progress: 95,
    prompt:   'gateway-store-policy-expert.md',
    buildInput: (ctx: Record<string, unknown>) => JSON.stringify({
      task: 'compliance_review',
      prd: ctx.SCHEMA,
      performanceReport: ctx.TURBO,
    }),
  },
] as const;

// ─── Main worker ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Validate internal secret to prevent public abuse
  const body = await req.json();
  if (body.secret !== process.env.PIPELINE_WORKER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId, gameIdea, targetPlatform = 'web', targetGenre } = body;

  // Mark job as running
  await supabase
    .from('pipeline_jobs')
    .update({ status: 'RUNNING', current_agent: 'MAINFRAME', progress: 5 })
    .eq('id', jobId);

  await log(jobId, 'MAINFRAME', `🚀 Pipeline started for: "${gameIdea}"`);

  // Context accumulates agent outputs so each agent sees prior results
  const ctx: Record<string, unknown> = { gameIdea, targetPlatform, targetGenre };

  try {
    for (const step of STEPS) {
      await setAgent(jobId, step.agent, step.progress);
      await markAgentStart(jobId, step.agent);
      await log(jobId, step.agent, `Starting ${step.agent}...`);

      const systemPrompt = loadPrompt(step.prompt);
      const userInput    = step.buildInput(ctx);

      const rawResult = await callGroq(systemPrompt, userInput);
      let parsed: unknown = {};
      try {
        parsed = JSON.parse(rawResult);
      } catch {
        parsed = { raw: rawResult };
      }

      ctx[step.agent] = parsed;
      await markAgentDone(jobId, step.agent, parsed);
      await log(jobId, step.agent, `✅ ${step.agent} complete`);

      // Human checkpoint after PULSE — pause and wait for approval
      // The UI calls /api/game-studio/checkpoint to resume
      if (step.agent === 'PULSE') {
        await supabase
          .from('pipeline_jobs')
          .update({ status: 'PAUSED_CHECKPOINT', current_agent: 'PULSE' })
          .eq('id', jobId);
        await log(jobId, 'MAINFRAME', '🔒 Checkpoint: awaiting human approval after PULSE');
        return NextResponse.json({ paused: true, agent: 'PULSE', jobId });
      }
    }

    // Pipeline complete
    await supabase
      .from('pipeline_jobs')
      .update({ status: 'COMPLETE', progress: 100, completed_at: new Date().toISOString() })
      .eq('id', jobId);

    await log(jobId, 'MAINFRAME', '🏁 Pipeline complete — game is release-ready!');

    return NextResponse.json({ success: true, jobId });

  } catch (err: any) {
    await supabase
      .from('pipeline_jobs')
      .update({ status: 'FAILED', error_message: err.message })
      .eq('id', jobId);
    await log(jobId, 'MAINFRAME', `❌ Pipeline failed: ${err.message}`, 'error');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
