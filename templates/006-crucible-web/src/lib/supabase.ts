import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
