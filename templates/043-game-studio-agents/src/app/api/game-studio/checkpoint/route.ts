// ═══════════════════════════════════════════════════════
// POST /api/game-studio/checkpoint
// Approve or reject a human-in-the-loop checkpoint.
// When approved, resumes the pipeline from where it paused.
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { jobId, decision } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }
    if (!['approve', 'reject'].includes(decision)) {
      return NextResponse.json({ error: 'decision must be "approve" or "reject"' }, { status: 400 });
    }

    const { data: job } = await supabase
      .from('pipeline_jobs')
      .select('id, status, game_idea, target_platform, target_genre, current_agent')
      .eq('id', jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.status !== 'PAUSED_CHECKPOINT') {
      return NextResponse.json({ error: `Job is not at a checkpoint (status: ${job.status})` }, { status: 409 });
    }

    if (decision === 'reject') {
      // User rejected — fail the pipeline
      await supabase
        .from('pipeline_jobs')
        .update({ status: 'FAILED', error_message: `Rejected at ${job.current_agent} checkpoint by user` })
        .eq('id', jobId);

      await supabase.from('pipeline_logs').insert({
        job_id:  jobId,
        agent:   'MAINFRAME',
        level:   'warn',
        message: `🛑 Pipeline rejected at ${job.current_agent} checkpoint`,
      });

      return NextResponse.json({ success: true, status: 'FAILED', reason: 'rejected_by_user' });
    }

    // Approved — log and resume the worker
    await supabase.from('pipeline_logs').insert({
      job_id:  jobId,
      agent:   'MAINFRAME',
      level:   'info',
      message: `✅ Checkpoint approved — resuming pipeline after ${job.current_agent}`,
    });

    // Resume: fire-and-forget the worker with a resume flag
    const workerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/game-studio/worker`;
    fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId:          job.id,
        gameIdea:       job.game_idea,
        targetPlatform: job.target_platform,
        targetGenre:    job.target_genre,
        resume:         true,
        resumeAfter:    job.current_agent,
        secret:         process.env.PIPELINE_WORKER_SECRET,
      }),
    }).catch(console.error);

    return NextResponse.json({ success: true, status: 'RUNNING', resumedAfter: job.current_agent });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
