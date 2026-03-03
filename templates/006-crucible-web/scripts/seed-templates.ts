import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  try {
    const templatesPath = path.resolve(process.cwd(), 'src/data/templates.json');
    const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));

    const templatesToInsert = templatesData.map((t: any) => {
      const templateNumber = parseInt(t.number);
      return {
        template_id: t.number,
        name: t.name,
        category: t.category,
        description: t.description,
        icon: t.icon || 'Bot',
        tier: t.tier || 'Standard',
        complexity: templateNumber % 3 === 0 ? 'High' : templateNumber % 2 === 0 ? 'Medium' : 'Low',
        estimated_setup: '2-5 minutes',
        included_agents: [
          { name: 'Architect Node', type: 'PLANNER', status: 'ready' },
          { name: 'Execution Node', type: 'WORKER', status: 'ready' },
        ],
        capabilities: ['Autonomous Execution', 'Self-Healing', 'API Integration', 'Data Persistence'],
        integrations: ['Supabase', 'Gemini', 'Vercel']
      };
    });

    console.log(`Seeding ${templatesToInsert.length} templates into forge_templates...`);

    const { data, error } = await supabase
      .from('forge_templates')
      .upsert(templatesToInsert, { onConflict: 'template_id' });

    if (error) {
      console.error('Error seeding templates:', error);
    } else {
      console.log('Successfully seeded forge_templates');
    }
  } catch (error) {
    console.error('Exception during seeding:', error);
  }
}

seed();
