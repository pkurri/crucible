import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

// Server-side auth helper for Route Handlers (src/app/api/**/route.ts).
// Mirrors the cookie-reading pattern already used in src/app/auth/callback/route.ts
// (the only place in this app that previously talked to Supabase auth from the
// server) — no prior reusable helper existed for API routes, so this is new.

/** Returns the authenticated user for the current request, or null if there
 * is no valid session cookie. Route handlers should treat null as 401. */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
