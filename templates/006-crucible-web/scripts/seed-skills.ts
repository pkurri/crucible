import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
    const skillsPath = path.resolve(process.cwd(), 'src/data/skills.json');
    const skillsData = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));

    const skillsToInsert = skillsData.map((s: any) => ({
      skill_id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      triggers: s.triggers || [],
    }));

    console.log(`Seeding ${skillsToInsert.length} skills into forge_skills...`);

    const { data, error } = await supabase
      .from('forge_skills')
      .upsert(skillsToInsert, { onConflict: 'skill_id' });

    if (error) {
      console.error('Error seeding skills:', error);
    } else {
      console.log('Successfully seeded forge_skills');
    }
  } catch (error) {
    console.error('Exception during seeding:', error);
  }
}

seed();
