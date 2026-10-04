import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireCompanyRole } from '@/lib/linkedin/access';
import {
  decryptCompanyCredentials,
  encryptCompanyCredentials,
  maskSecret,
  type CompanyCredentialsRow,
} from '@/lib/crypto/secrets';

// GET /api/linkedin/credentials?companyId=... — masked values only, never
// full plaintext. Full decryption happens only inside the worker
// (linkedin-skill-runner.ts, not yet built) via the service-role client.
export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(req.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor', 'approver']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { data: row, error } = await supabase
    .from('company_credentials')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!row) return NextResponse.json({ credentials: null });

  const plain = decryptCompanyCredentials(row as CompanyCredentialsRow);
  return NextResponse.json({
    credentials: {
      publoraApiKey: maskSecret(plain.publoraApiKey),
      linkedinPlatformId: plain.linkedinPlatformId, // not secret, shown in full
      apifyToken: maskSecret(plain.apifyToken),
      pixfaroToken: maskSecret(plain.pixfaroToken),
      hasPublora: Boolean(plain.publoraApiKey),
      hasApify: Boolean(plain.apifyToken),
      hasPixfaro: Boolean(plain.pixfaroToken),
      verifiedAt: row.verified_at,
    },
  });
}

// POST /api/linkedin/credentials — { companyId, publoraApiKey?, linkedinPlatformId?, apifyToken?, pixfaroToken? }
// Only owner/editor can write credentials (approvers are read/approve-only).
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const companyId = typeof body?.companyId === 'string' ? body.companyId : null;
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const access = await requireCompanyRole(supabase, companyId, user.id, ['owner', 'editor']);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  // Undefined fields are left untouched; pass an empty string to explicitly clear one.
  const update = encryptCompanyCredentials({
    publoraApiKey: body.publoraApiKey,
    linkedinPlatformId: body.linkedinPlatformId,
    apifyToken: body.apifyToken,
    pixfaroToken: body.pixfaroToken,
  });

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No credential fields provided' }, { status: 400 });
  }

  const { error } = await supabase
    .from('company_credentials')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('company_id', companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
