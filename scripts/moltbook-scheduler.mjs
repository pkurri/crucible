import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPT_PATH = join(__dirname, 'moltbook-full-automation.mjs');
const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

let isRunning = false;

function runAutomation() {
  if (isRunning) {
    console.log(`\n[${new Date().toLocaleString()}] ⚠️ Previous cycle still running. Skipping.`);
    return;
  }
  isRunning = true;
  console.log(`\n[${new Date().toLocaleString()}] 🔄 Starting Moltbook automation cycle...`);
  
  const child = spawn('node', [SCRIPT_PATH], { stdio: 'inherit' });
  
  child.on('close', (code) => {
    isRunning = false;
    console.log(`[${new Date().toLocaleString()}] ✅ Cycle complete (exit code ${code})`);
    console.log(`⏳ Waiting ${INTERVAL_MS / 60000} minutes for next cycle...`);
  });
}

// First run
runAutomation();

// Schedule
setInterval(runAutomation, INTERVAL_MS);

console.log(`🦞 Moltbook Internal Scheduler active. Press Ctrl+C to stop.`);
