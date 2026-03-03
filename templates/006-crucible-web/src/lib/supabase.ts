import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton pattern — ensures only ONE GoTrueClient instance exists in the browser
let _client: SupabaseClient | null = null;
let _adminClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace('.supabase.com', '.supabase.co') || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

    if (!url || !key) {
      console.warn('⚠️ Supabase credentials missing! URL:', !!url, 'Key:', !!key);
    } else {
      const keyPrefix = key.substring(0, 10);
      const keySuffix = key.substring(key.length - 5);
      console.log(`🔌 Initializing Supabase client.
         Project: ${url.split('//')[1]?.split('.')[0]}
         Key Length: ${key.length}
         Key Pattern: ${keyPrefix}...${keySuffix}
         Environment: ${process.env.NODE_ENV}`);
    }

    _client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-client-info': 'crucible-web-forge'
        }
      }
    });
  }
  return _client;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace('.supabase.com', '.supabase.co') || '';
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim() || '';
    _adminClient = createClient(url, key);
  }
  return _adminClient;
}

// Named export with Lazy Initialization via Proxy
// This ensures that the client is only created when first used,
// preventing issues with environment variables not being ready during module load.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    return (client as any)[prop];
  }
});

export type Transmission = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  source_type: 'human' | 'agent';
  author_name: string;
  agent_id: string | null;
  tags: string[];
  published_at: string;
};
