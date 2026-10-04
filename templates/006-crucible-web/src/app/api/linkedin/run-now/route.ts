import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireCompanyRole } from '@/lib/linkedin/access';
import { getLinkedinQueue } from '@/lib/linkedin/queue';
import { VALID_LINKEDIN_JOB_TYPES, type LinkedinJobData } from '@/lib/linkedin/types';

// POST /api/linkedin/run-now — { companyId, jobType }
// Enqueues a one-off job (not a recurring scheduler) for the "Run now" button
// on the company overview page — same linkedin-jobs queue/worker the
// recurring schedules use, just a single ad-hoc job.add() instead of
// upsertJobScheduler().
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const companyId = typeof body?.companyId === 'string' ? body.companyId : null;
  const jobType = typeof body?.jobType === 'string' ? body.jobType : null;
  if (!companyId || !jobType) {
    return NextResponse.json({ error: 'companyId and jobType are required' }, { status: 400 });
  }
  if (!VALID_LINKEDIN_JOB_TYPES.includes(jobType as LinkedinJobData['jobType'])) {
    return NextResponse.json({ error: `jobType must be one of ${VALID_LINKEDIN_JOB_TYPES.join(', ')}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { data: creds } = await supabase
    .from('company_credentials')
    .select('publora_api_key_enc, linkedin_platform_id')
    .eq('company_id', companyId)
    .maybeSingle();
  if (!creds?.publora_api_key_enc || !creds?.linkedin_platform_id) {
    return NextResponse.json(
      { error: 'Company has no Publora credentials configured yet — finish onboarding first' },
      { status: 422 }
    );
  }

  const jobData: LinkedinJobData = { companyId, jobType: jobType as LinkedinJobData['jobType'] };
  const job = await getLinkedinQueue().add(`run-now-${jobType}`, jobData);

  return NextResponse.json({ ok: true, jobId: job.id });
}
