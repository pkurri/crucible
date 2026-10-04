import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireCompanyRole } from '@/lib/linkedin/access';
import { VALID_LINKEDIN_JOB_TYPES } from '@/lib/linkedin/types';

// GET /api/linkedin/schedules?companyId=...
export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(req.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor', 'approver']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { data: schedules, error } = await supabase
    .from('company_schedules')
    .select('*')
    .eq('company_id', companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedules });
}

// POST /api/linkedin/schedules — { companyId, jobType, cronPattern, pillarMix?, enabled? }
// Upserts by (companyId, jobType). The linkedin-worker's syncCompanySchedules
// picks up changes within its 5-minute reconciliation interval — no
// direct BullMQ call needed here, keeping this route worker-agnostic.
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const companyId = typeof body?.companyId === 'string' ? body.companyId : null;
  const jobType = typeof body?.jobType === 'string' ? body.jobType : null;
  const cronPattern = typeof body?.cronPattern === 'string' ? body.cronPattern : null;
  if (!companyId || !jobType || !cronPattern) {
    return NextResponse.json({ error: 'companyId, jobType, and cronPattern are required' }, { status: 400 });
  }
  if (!VALID_LINKEDIN_JOB_TYPES.includes(jobType as (typeof VALID_LINKEDIN_JOB_TYPES)[number])) {
    return NextResponse.json({ error: `jobType must be one of ${VALID_LINKEDIN_JOB_TYPES.join(', ')}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { data: existing } = await supabase
    .from('company_schedules')
    .select('id')
    .eq('company_id', companyId)
    .eq('job_type', jobType)
    .maybeSingle();

  const row = {
    company_id: companyId,
    job_type: jobType,
    cron_pattern: cronPattern,
    pillar_mix: body.pillarMix ?? null,
    enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
  };

  const { error } = existing
    ? await supabase.from('company_schedules').update(row).eq('id', existing.id)
    : await supabase.from('company_schedules').insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
