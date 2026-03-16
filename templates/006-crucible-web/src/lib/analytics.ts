import { getSupabase } from '@/lib/supabase';

export async function logConversionEvent(eventType: 'page_view' | 'click' | 'checkout_start', metadata: any = {}) {
  const supabase = getSupabase();
  
  // We try to log to a 'conversions' table. If it doesn't exist, we just console log for now.
  // In a real setup, you'd run a migration: CREATE TABLE conversions (id uuid primary key, event_type text, metadata jsonb, created_at timestamptz default now());
  try {
    const { error } = await supabase
      .from('conversions')
      .insert([
        { 
          event_type: eventType, 
          metadata: {
            ...metadata,
            url: typeof window !== 'undefined' ? window.location.href : 'server',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
          } 
        }
      ]);
      
    if (error) {
      console.warn('Analytics logging failed (table might not exist):', error.message);
    }
  } catch (err) {
    console.error('Analytics error:', err);
  }
}
