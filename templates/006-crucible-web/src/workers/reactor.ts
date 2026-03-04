import { generateWithYield } from './ai-router.js';
import { supabase } from '../lib/supabase.js';
import fs from 'fs';
import path from 'path';

/**
 * Reactor Agent - Core loop for self-maintenance
 */
async function maintenanceLoop() {
  console.log('[REACTOR] Starting autonomous maintenance loop...');
  
  while (true) {
    try {
      // 1. Scan for errors
      const { data: errors } = await supabase.from('forge_events').select('*').eq('event_type', 'ERROR').limit(10);
      
      if (errors && errors.length > 0) {
        console.log(`[REACTOR] Found ${errors.length} issues. Repairing...`);
        const repairPrompt = `System instability detected:\n${JSON.stringify(errors)}\n\nPropose a fix in JSON format: { "filepath": "string", "content": "string" }`;
        const result = await generateWithYield(repairPrompt);
        const fix = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
        
        if (fix.filepath && fix.content) {
          const absPath = path.resolve(process.cwd(), '../../', fix.filepath);
          fs.writeFileSync(absPath, fix.content);
          console.log(`[REACTOR] Fix deployed to ${fix.filepath}`);
          // Clear errors or mark as resolved
          await supabase.from('forge_events').insert({ event_type: 'FIX_APPLIED', message: `Fixed issues in ${fix.filepath}` });
        }
      }
      
      // 2. Evolution step: Improve existing prompts
      // (Future implementation: read src/workers/agent-definitions.ts and optimize)
      
    } catch (e) {
      console.error('[REACTOR] Loop error:', e);
    }
    
    // Wait for 1 hour between full system checks
    await new Promise(r => setTimeout(r, 60 * 60 * 1000));
  }
}

maintenanceLoop().catch(console.error);
