import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn(`⚠️ Failed to initialize Supabase client: ${err.message}`);
  }
}

/**
 * 🧱 Database Manager for Forge Simulator
 * 
 * Seamlessly switches between Supabase (if configured) and null (local only).
 * Persistence to local JSON is handled by the caller, but this provides
 * cloud visibility.
 */

/**
 * Save simulation metadata to Supabase
 */
export async function saveWorldToCloud(worldData) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('forge_worlds')
      .upsert({
        id: worldData.worldId,
        domain: worldData.domain || 'generic',
        question: worldData.question,
        ore_summary: JSON.stringify(worldData.ore_summary || {}).slice(0, 1000),
        status: 'completed',
        created_at: worldData.createdAt || new Date().toISOString(),
        completed_at: new Date().toISOString()
      });

    if (error) throw error;
    
    // Also save report
    if (worldData.report) {
      await supabase.from('forge_reports').upsert({
        world_id: worldData.worldId,
        report: worldData.report,
        confidence: extractConfidence(worldData.report),
        created_at: new Date().toISOString()
      });
    }

    return true;
  } catch (err) {
    console.warn(`⚠️ Supabase save failed: ${err.message}. Skill will rely on local storage.`);
    return false;
  }
}

function extractConfidence(report) {
  const match = report.match(/[Cc]onfidence[:\s]*(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export function isCloudEnabled() {
  return !!supabase;
}
