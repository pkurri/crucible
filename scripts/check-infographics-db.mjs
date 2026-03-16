import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../templates/006-crucible-web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInfographics() {
  console.log('Checking forge_infographics table...');
  const { data, error } = await supabase
    .from('forge_infographics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching infographics:', error);
  } else {
    console.log(`Found ${data.length} recent infographics.`);
    data.forEach(inf => {
      console.log(`- [${inf.created_at}] ${inf.title} (${inf.domain})`);
    });
  }

  console.log('\nChecking forge_events for infographic errors...');
  const { data: events, error: eventError } = await supabase
    .from('forge_events')
    .select('*')
    .ilike('event_type', '%INFOGRAPHIC%')
    .order('created_at', { ascending: false })
    .limit(20);

  if (eventError) {
    console.error('Error fetching events:', eventError);
  } else {
    events.forEach(ev => {
      console.log(`- [${ev.created_at}] [${ev.event_type}] ${ev.message}`);
    });
  }
}

checkInfographics();
