import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../templates/006-crucible-web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvents() {
  const { data: events, error: eventError } = await supabase
    .from('forge_events')
    .select('*')
    .ilike('event_type', '%INFOGRAPHIC%')
    .order('created_at', { ascending: false })
    .limit(50);

  if (eventError) {
    console.error('Error fetching events:', eventError);
  } else {
    events.forEach(ev => {
      console.log(`[${ev.created_at}] [${ev.event_type}] ${ev.message}`);
      if (ev.metadata) console.log(`  Metadata: ${JSON.stringify(ev.metadata)}`);
    });
  }
}

checkEvents();
