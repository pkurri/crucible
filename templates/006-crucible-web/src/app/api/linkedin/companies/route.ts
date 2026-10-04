import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// GET /api/linkedin/companies — list companies the current user belongs to
export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: memberships, error: memberErr } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id);
  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 });

  const companyIds = (memberships ?? []).map((m) => m.company_id);
  if (companyIds.length === 0) return NextResponse.json({ companies: [] });

  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, slug, plan_tier, status, created_at')
    .in('id', companyIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ companies });
}

// POST /api/linkedin/companies — create a new company, current user becomes owner
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 200) {
    return NextResponse.json({ error: 'name is required (max 200 chars)' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const baseSlug = slugify(name) || 'company';
  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase.from('companies').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: company, error } = await supabase
    .from('companies')
    .insert({ name, slug, owner_id: user.id, status: 'pending_setup' })
    .select('id, name, slug, plan_tier, status, created_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { error: memberErr } = await supabase
    .from('company_members')
    .insert({ company_id: company.id, user_id: user.id, role: 'owner' });
  if (memberErr) {
    // Roll back the orphaned company row rather than leave a company with no owner.
    await supabase.from('companies').delete().eq('id', company.id);
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  // Seed empty credentials + voice profile rows so onboarding forms have
  // something to UPDATE rather than needing separate create-vs-update logic.
  await supabase.from('company_credentials').insert({ company_id: company.id });
  await supabase.from('company_voice_profiles').insert({ company_id: company.id, filled: false });

  return NextResponse.json({ company }, { status: 201 });
}
