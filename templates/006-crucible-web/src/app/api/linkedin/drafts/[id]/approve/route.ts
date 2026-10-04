import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireCompanyRole } from '@/lib/linkedin/access';
import { replayPublish } from '@/workers/linkedin-skill-runner';

// POST /api/linkedin/drafts/[id]/approve — the human-in-the-loop gate.
// Publishes exactly what the reviewer saw (publish_payload), never re-drafts.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: draft, error: draftErr } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (draftErr || !draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  const access = await requireCompanyRole(supabase, draft.company_id, user.id, ['owner', 'approver']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  if (draft.status !== 'pending') {
    return NextResponse.json({ error: `Draft is already ${draft.status}` }, { status: 409 });
  }
  if (!draft.publish_payload) {
    return NextResponse.json({ error: 'Draft has no captured publish payload to replay' }, { status: 422 });
  }

  const result = await replayPublish(draft.company_id, {
    kind: draft.kind,
    draft_text: draft.preview_text,
    target_url: draft.target_url ?? undefined,
    kwargs: draft.publish_payload,
  });

  await supabase
    .from('content_drafts')
    .update({
      status: result.ok ? 'published' : 'failed',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      error_message: result.ok ? null : result.error ?? 'Unknown publish error',
    })
    .eq('id', id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Publish failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, result: result.result });
}
