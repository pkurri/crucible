// ═══════════════════════════════════════════════════════
// POST /api/game-studio/pipeline
// Starts a new Neon Arcade pipeline job
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const supabase = getSupabaseAdmin();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameIdea, targetPlatform = 'web', targetGenre, targetAudience } = body;

    if (!gameIdea || typeof gameIdea !== 'string' || gameIdea.trim().length < 10) {
      return NextResponse.json(
        { error: 'gameIdea must be at least 10 characters.' },
        { status: 400 }
      );
    }

    // 1. Create the pipeline job record
    const { data: job, error } = await supabase
      .from('pipeline_jobs')
      .insert({
        game_idea:       gameIdea.trim(),
        target_platform: targetPlatform,
        target_genre:    targetGenre || null,
        status:          'QUEUED',
        progress:        0,
      })
      .select('id, status, created_at')
      .single();

    if (error || !job) {
      throw new Error(error?.message || 'Failed to create pipeline job');
    }

    // 2. Seed per-agent result rows (so UI can show all agents from the start)
    const AGENTS = [
      'VANGUARD', 'ORACLE', 'PULSE', 'SCHEMA', 
      'DISPATCH', 
      'PIXEL', 'GLITCH', 'TURBO', 'DOPAMINE', 'SENSORY', 'SPECTRA', 
      'GATEWAY', 'GLITCH_MOD', 
      'VIRAL', 'UA_PRO', 
      'CHRONOS'
    ];
    const PHASES = {
      VANGUARD:   'MARKET_FEASIBILITY',
      ORACLE:     'MARKET_FEASIBILITY',
      PULSE:      'MARKET_FEASIBILITY',
      SCHEMA:     'MARKET_FEASIBILITY',
      DISPATCH:   'TASK_ARCHITECTURE',
      PIXEL:      'DEV_ITERATION',
      GLITCH:     'DEV_ITERATION',
      TURBO:      'DEV_ITERATION',
      DOPAMINE:   'DEV_ITERATION',
      SENSORY:    'DEV_ITERATION',
      SPECTRA:    'DEV_ITERATION',
      GATEWAY:    'DEPLOYMENT_COMPLIANCE',
      GLITCH_MOD: 'DEPLOYMENT_COMPLIANCE',
      VIRAL:      'HYPER_GROWTH',
      UA_PRO:     'HYPER_GROWTH',
      CHRONOS:    'POST_LAUNCH_OPS',
    } as const;

    await supabase.from('pipeline_agent_results').insert(
      AGENTS.map(agent => ({
        job_id: job.id,
        agent,
        phase:  PHASES[agent as keyof typeof PHASES],
        status: 'PENDING',
      }))
    );

    // 3. Trigger the worker (non-blocking fire-and-forget)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const workerUrl = `${baseUrl}/api/game-studio/worker`;
    fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        gameIdea: gameIdea.trim(),
        targetPlatform,
        targetGenre,
        targetAudience,
        secret: process.env.PIPELINE_WORKER_SECRET,
      }),
    }).catch(err => {
      // Log but don't fail — job is queued and can be retried
      console.error('[pipeline/start] Worker trigger failed:', err.message);
    });

    return NextResponse.json({
      success:   true,
      jobId:     job.id,
      status:    job.status,
      createdAt: job.created_at,
      trackUrl:  `/api/game-studio/pipeline?jobId=${job.id}`,
    });

  } catch (err: any) {
    console.error('[pipeline/start]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/game-studio/pipeline?jobId=xxx — poll job status
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const [jobRes, agentsRes, logsRes] = await Promise.all([
    supabase
      .from('pipeline_jobs')
      .select('id, status, current_agent, progress, created_at, updated_at, completed_at, error_message')
      .eq('id', jobId)
      .single(),
    supabase
      .from('pipeline_agent_results')
      .select('agent, phase, status, result, started_at, ended_at')
      .eq('job_id', jobId)
      .order('started_at', { ascending: true }),
    supabase
      .from('pipeline_logs')
      .select('agent, level, message, created_at')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (jobRes.error || !jobRes.data) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    job:    jobRes.data,
    agents: agentsRes.data || [],
    logs:   logsRes.data  || [],
  });
}
