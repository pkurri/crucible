import type { SupabaseClient } from '@supabase/supabase-js';

// Shared membership/role check for the linkedin/* API routes. Mirrors the
// same role logic expressed in the RLS policies (supabase/migrations/
// 20260908000000_linkedin_multitenant.sql) — RLS is the real enforcement
// boundary since these routes use the service-role client (which bypasses
// RLS), so this check exists to fail fast with a clean 403 rather than to
// be the sole guard.

export type CompanyRole = 'owner' | 'editor' | 'approver';

/** Returns the caller's role on a company, or null if they're not a member. */
export async function getCompanyRole(
  supabase: SupabaseClient,
  companyId: string,
  userId: string
): Promise<CompanyRole | null> {
  const { data } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .maybeSingle();
  return (data?.role as CompanyRole | undefined) ?? null;
}

/** Throws-as-response helper: returns a 403 NextResponse if the role isn't
 * one of `allowed`, or null if access is granted (caller proceeds). */
export async function requireCompanyRole(
  supabase: SupabaseClient,
  companyId: string,
  userId: string,
  allowed: CompanyRole[]
): Promise<{ ok: true; role: CompanyRole } | { ok: false; status: number; error: string }> {
  const role = await getCompanyRole(supabase, companyId, userId);
  if (!role) return { ok: false, status: 404, error: 'Company not found' };
  if (!allowed.includes(role)) return { ok: false, status: 403, error: 'Insufficient role' };
  return { ok: true, role };
}
