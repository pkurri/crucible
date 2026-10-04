import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireCompanyRole } from '@/lib/linkedin/access';
import { decryptCompanyCredentials, type CompanyCredentialsRow } from '@/lib/crypto/secrets';

// POST /api/linkedin/credentials/test — { companyId }
// Lightweight REST call to Publora's platform-connections endpoint to verify
// the stored API key actually works, without spinning up a full Agent SDK
// session just to validate a key (per the plan's onboarding-UI design note).
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const companyId = typeof body?.companyId === 'string' ? body.companyId : null;
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { data: row, error } = await supabase
    .from('company_credentials')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();
  if (error || !row) return NextResponse.json({ error: 'No credentials found' }, { status: 404 });

  const creds = decryptCompanyCredentials(row as CompanyCredentialsRow);
  if (!creds.publoraApiKey) {
    return NextResponse.json({ ok: false, error: 'No Publora API key set yet' }, { status: 422 });
  }

  try {
    const res = await fetch('https://api.publora.com/api/v1/platform-connections', {
      headers: { 'x-publora-key': creds.publoraApiKey },
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `Publora returned HTTP ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const connections: Array<{ platformId: string; username?: string }> = data?.connections ?? [];
    const matched = creds.linkedinPlatformId
      ? connections.find((c) => c.platformId === creds.linkedinPlatformId)
      : connections.find((c) => c.platformId?.startsWith('linkedin-'));

    await supabase
      .from('company_credentials')
      .update({ verified_at: matched ? new Date().toISOString() : null })
      .eq('company_id', companyId);

    return NextResponse.json({
      ok: Boolean(matched),
      connections: connections.map((c) => ({ platformId: c.platformId, username: c.username })),
      matched: matched ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 502 });
  }
}
