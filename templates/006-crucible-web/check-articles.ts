import { getSupabaseAdmin } from './src/lib/supabase.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('generated_articles')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error(error);
    } else {
        console.log('Latest Articles:');
        console.table(data);
    }
    process.exit(0);
}

check();
