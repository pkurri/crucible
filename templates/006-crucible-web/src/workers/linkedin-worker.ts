import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import path from 'path';
import dotenv from 'dotenv';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getLinkedinQueue } from '@/lib/linkedin/queue';
import type { LinkedinJobData } from '@/lib/linkedin/types';
import { runSkillForCompany } from './linkedin-skill-runner';

// Recurring per-tenant LinkedIn automation. Deliberately a SEPARATE queue
// from `industrial-worker.ts` (crucible-agents) — that queue runs Crucible's
// own internal growth bots against a single shared credential set; this one
// runs the linkedin-* skill pack against N companies' own Publora/Apify/
// Pixfaro credentials via linkedin-skill-runner.ts. Coupling them would mean
// one tenant's job accidentally touching another system's credential model.
//
// Extends the exact `repeat`/scheduler pattern already proven in
// industrial-worker.ts, but keyed per company instead of one global job per
// agent type, and reconciled from the `company_schedules` table instead of a
// hardcoded `Object.keys(agents)` loop — see
// /Users/aak/.claude/plans/can-we-make-this-snappy-adleman.md §"Recurring automation".
//
// Uses BullMQ's current (non-deprecated) Job Scheduler API
// (upsertJobScheduler/getJobSchedulers/removeJobScheduler) rather than the
// `add({ repeat })`/removeRepeatableByKey pattern industrial-worker.ts still
// uses — that older API is marked deprecated-for-removal-in-v6 in this
// bullmq version (5.71).

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

const linkedinQueue = getLinkedinQueue();

const JOB_TYPE_TO_SKILL: Record<LinkedinJobData['jobType'], string> = {
  weekly_content_batch: 'linkedin-content-planner',
  daily_comment_check: 'linkedin-thread-monitor',
  thread_monitor: 'linkedin-thread-monitor',
};

const JOB_TYPE_TO_INPUT: Record<LinkedinJobData['jobType'], string> = {
  weekly_content_batch:
    'Generate this week\'s content plan and draft each post. Stop before publishing any of them.',
  daily_comment_check: 'Check for new comments on recent posts and draft replies to the substantive ones.',
  thread_monitor: 'Check which of the account\'s own comments on other posts have new author replies.',
};

async function recordJobRun(
  companyId: string,
  skillName: string,
  jobType: string,
  bullmqJobId: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('skill_job_runs')
    .insert({ company_id: companyId, skill_name: skillName, job_type: jobType, status: 'running', bullmq_job_id: bullmqJobId })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to record job run: ${error.message}`);
  return data.id;
}

export const linkedinWorker = new Worker(
  'linkedin-jobs',
  async (job: Job<LinkedinJobData>) => {
    const { companyId, jobType } = job.data;
    const skillName = JOB_TYPE_TO_SKILL[jobType];
    const supabase = getSupabaseAdmin();

    const runId = await recordJobRun(companyId, skillName, jobType, job.id ?? 'unknown');
    console.log(`[LINKEDIN_JOB] Starting ${skillName} for company ${companyId} (run ${runId})`);

    try {
      const result = await runSkillForCompany(companyId, skillName, JOB_TYPE_TO_INPUT[jobType]);

      if (result.draftJson) {
        const draft = result.draftJson as {
          kind?: string;
          draft_text?: string;
          target_url?: string;
          kwargs?: unknown;
        };
        await supabase.from('content_drafts').insert({
          company_id: companyId,
          skill_name: skillName,
          kind: draft.kind ?? 'post',
          preview_text: draft.draft_text ?? result.resultText,
          target_url: draft.target_url ?? null,
          extra_context: { jobType, kwargs: draft.kwargs ?? null },
          status: 'pending',
          publish_payload: draft.kwargs ?? null,
        });
      }

      await supabase
        .from('skill_job_runs')
        .update({
          status: result.ok ? 'succeeded' : 'failed',
          finished_at: new Date().toISOString(),
          cost_usd: result.totalCostUsd,
          error_message: result.ok ? null : result.resultText.slice(0, 2000),
        })
        .eq('id', runId);

      console.log(`[LINKEDIN_JOB] Finished ${skillName} for company ${companyId}: ok=${result.ok}, cost=$${result.totalCostUsd}`);
      return { ok: result.ok, draftCreated: Boolean(result.draftJson) };
    } catch (err: any) {
      await supabase
        .from('skill_job_runs')
        .update({ status: 'failed', finished_at: new Date().toISOString(), error_message: String(err?.message ?? err).slice(0, 2000) })
        .eq('id', runId);
      throw err;
    }
  },
  {
    connection: connection as any,
    // Conservative default — one tenant's batch job (several skill
    // invocations, each a real Claude session) must not starve others or
    // blow a shared Anthropic rate-limit tier. Tune once real usage data
    // exists (flagged as an open risk in the plan).
    concurrency: 3,
  }
);

/** Reconciles BullMQ's job schedulers against the `company_schedules` table:
 * adds new/changed schedules, removes ones that were disabled or deleted.
 * Run on an interval so a cadence change in the dashboard takes effect
 * without a worker restart. */
export async function syncCompanySchedules(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: schedules, error } = await supabase
    .from('company_schedules')
    .select('id, company_id, job_type, cron_pattern, enabled')
    .eq('enabled', true);
  if (error) {
    console.error('[LINKEDIN_SCHEDULER] Failed to load company_schedules:', error.message);
    return;
  }

  const desiredKeys = new Set((schedules ?? []).map((s) => `${s.company_id}:${s.job_type}`));

  for (const schedule of schedules ?? []) {
    const key = `${schedule.company_id}:${schedule.job_type}`;
    await linkedinQueue.upsertJobScheduler(
      key,
      { pattern: schedule.cron_pattern },
      { name: schedule.job_type, data: { companyId: schedule.company_id, jobType: schedule.job_type } }
    );
  }

  const existing = await linkedinQueue.getJobSchedulers();
  for (const scheduler of existing) {
    if (scheduler.key && !desiredKeys.has(scheduler.key)) {
      await linkedinQueue.removeJobScheduler(scheduler.key);
      console.log(`[LINKEDIN_SCHEDULER] Removed stale scheduler: ${scheduler.key}`);
    }
  }
}

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

console.log('🔗 LinkedIn Automation Worker Online');
syncCompanySchedules().catch((err) => console.error('[LINKEDIN_SCHEDULER] Initial sync failed:', err));
setInterval(() => {
  syncCompanySchedules().catch((err) => console.error('[LINKEDIN_SCHEDULER] Sync failed:', err));
}, SYNC_INTERVAL_MS);

linkedinWorker.on('failed', (job, err) => console.error(`[LINKEDIN_WORKER_FAILED] Job ${job?.id}:`, err));
