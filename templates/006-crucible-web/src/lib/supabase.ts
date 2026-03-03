import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton pattern — ensures only ONE GoTrueClient instance exists in the browser
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _client;
}

// Named export for convenience in server components / API routes
export const supabase = getSupabase();

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
