import * as dotenv from 'dotenv';
import { resolve } from 'path';
// Load environment variables before any other imports
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { IntelWatcher } from '../src/lib/intel/watcher';

async function main() {
  console.log('⚡ Starting World Sweep...');
  const result = await IntelWatcher.getInstance().sweep();
  console.log('DEBUG RES:', result);
  if (!result) {
    console.error('❌ Error: sweep() returned undefined');
    return;
  }
  const { signals, delta } = result;
  console.log(`✅ Sweep complete. ${signals.length} events processed. ${delta.new_signals_count} new.`);
}

main().catch(err => {
  console.error('❌ Execution failed:', err);
  process.exit(1);
});
