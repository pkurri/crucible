import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireCompanyRole } from '@/lib/linkedin/access';

// GET /api/linkedin/voice-profile?companyId=...
export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(req.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor', 'approver']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { data: profile, error } = await supabase
    .from('company_voice_profiles')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile });
}

// POST /api/linkedin/voice-profile — { companyId, voiceFingerprint?, icp?, hardRules?, ctaStyle?, brandHandle?, brandColor?, brandLogoUrl? }
// Marks `filled: true` once saved — this is what flips linkedin-skill-runner.ts's
// generated voice-profile.md from the "filled: no" template state.
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const companyId = typeof body?.companyId === 'string' ? body.companyId : null;
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { error } = await supabase
    .from('company_voice_profiles')
    .update({
      filled: true,
      voice_fingerprint: body.voiceFingerprint ?? null,
      icp: body.icp ?? null,
      hard_rules: body.hardRules ?? null,
      cta_style: body.ctaStyle ?? null,
      brand_handle: body.brandHandle ?? null,
      brand_color: body.brandColor ?? null,
      brand_logo_url: body.brandLogoUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('company_id', companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
