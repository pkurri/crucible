import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireCompanyRole } from '@/lib/linkedin/access';

// POST /api/linkedin/drafts/[id]/reject — { reason? }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === 'string' ? body.reason.slice(0, 2000) : null;

  const supabase = getSupabaseAdmin();
  const { data: draft, error: draftErr } = await supabase
    .from('content_drafts')
    .select('company_id, status')
    .eq('id', id)
    .maybeSingle();
  if (draftErr || !draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  const access = await requireCompanyRole(supabase, draft.company_id, user.id, ['owner', 'approver']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  if (draft.status !== 'pending') {
    return NextResponse.json({ error: `Draft is already ${draft.status}` }, { status: 409 });
  }

  const { error } = await supabase
    .from('content_drafts')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      error_message: reason,
    })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
