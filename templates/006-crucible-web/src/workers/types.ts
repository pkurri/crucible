import { SupabaseClient } from '@supabase/supabase-js';

export interface AgentResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface IForgeAgent {
  name: string;
  type: string;
  execute(supabase: SupabaseClient): Promise<AgentResult>;
}
