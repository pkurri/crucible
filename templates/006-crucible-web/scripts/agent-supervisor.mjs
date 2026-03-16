import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../');

/**
 * Crucible Agent Supervisor
 * This script ensures the Agent Orchestrator stays running 24/7.
 * It handles automatic restarts on crashes and logs output to a central file.
 */

const CMD = 'npx';
const ARGS = ['tsx', 'src/workers/agent-orchestrator.ts'];


function startWorker() {
  console.log('🚀 [SUPERVISOR] Starting Agent Orchestrator...');
  
  const worker = spawn(CMD, ARGS, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, SUPPRESS_SUPPORT_DOCS: 'true' },
    shell: true
  });


  worker.on('exit', (code) => {
    console.log(`⚠️ [SUPERVISOR] Worker exited with code ${code}. Restarting in 5s...`);
    setTimeout(startWorker, 5000);
  });

  worker.on('error', (err) => {
    console.error('❌ [SUPERVISOR] Failed to start worker:', err);
    setTimeout(startWorker, 10000);
  });
}

console.log('══════════════════════════════════════════════');
console.log('  CRUCIBLE INDUSTRIAL AGENT SUPERVISOR v1.0   ');
console.log('══════════════════════════════════════════════');

startWorker();
