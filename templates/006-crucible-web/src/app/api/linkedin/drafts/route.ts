import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireCompanyRole } from '@/lib/linkedin/access';

// GET /api/linkedin/drafts?companyId=...&status=pending — the approval inbox listing.
export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  const status = url.searchParams.get('status') ?? 'pending';
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor', 'approver']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  let query = supabase
    .from('content_drafts')
    .select('id, skill_name, kind, preview_text, target_url, extra_context, status, created_at, reviewed_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (status !== 'all') query = query.eq('status', status);

  const { data: drafts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ drafts });
}
