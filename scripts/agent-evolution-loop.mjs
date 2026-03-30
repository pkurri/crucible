import fs from 'fs';
import path from 'path';
import { loadMemory, saveMemory, recordResult, recordEvolution, getEvolutionCandidates } from './skill-memory.mjs';

/**
 * 🔄 AGENT EVOLUTION LOOP — Self-Improving Agent System
 * 
 * Implements the Read→Execute→Reflect→Write cycle
 * for the Crucible app's existing automation scripts.
 * 
 * Hooks into empire-cycle-core.mjs to wrap production cycles
 * with automatic reflection and skill improvement.
 */

const EVOLUTION_DIR = path.join(process.cwd(), 'data', 'evolution-runs');
const REFLECTION_LOG = path.join(process.cwd(), 'data', 'evolution-reflection.jsonl');

// ── Create evolution run folder ─────────────────────────────────────────────

function createRunFolder() {
  const runId = `run_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
  const runDir = path.join(EVOLUTION_DIR, runId);
  fs.mkdirSync(path.join(runDir, 'logs'), { recursive: true });
  
  fs.writeFileSync(path.join(runDir, 'logs', 'state.json'), JSON.stringify({
    runId,
    startedAt: new Date().toISOString(),
    status: 'running',
    events: [],
  }, null, 2));
  
  // Store current run ID
  fs.writeFileSync(path.join(EVOLUTION_DIR, '.current'), runId);
  
  return { runId, runDir };
}

// ── Wrap a script execution with evolution tracking ─────────────────────────

export async function executeWithEvolution(skillName, executeFn, context = {}) {
  const { runId, runDir } = createRunFolder();
  const startTime = Date.now();
  
  console.log(`\n🧠 [Evolution] Starting tracked execution: ${skillName}`);
  console.log(`   Run ID: ${runId}`);
  
  // Log start event
  appendEvent(runDir, {
    type: 'execution_start',
    skill: skillName,
    timestamp: new Date().toISOString(),
    context,
  });
  
  let result = null;
  let error = null;
  let success = false;
  
  try {
    // ── EXECUTE ──
    result = await executeFn();
    success = true;
    
    appendEvent(runDir, {
      type: 'execution_success',
      skill: skillName,
      timestamp: new Date().toISOString(),
      result: typeof result === 'object' ? JSON.stringify(result).slice(0, 500) : String(result).slice(0, 500),
    });
    
  } catch (e) {
    error = e;
    
    appendEvent(runDir, {
      type: 'execution_failure',
      skill: skillName,
      timestamp: new Date().toISOString(),
      error: e.message,
      stack: e.stack?.slice(0, 500),
    });
  }
  
  const durationMs = Date.now() - startTime;
  
  // ── REFLECT ──
  const reflection = reflect(skillName, success, error, durationMs, context);
  
  appendEvent(runDir, {
    type: 'reflection',
    skill: skillName,
    timestamp: new Date().toISOString(),
    reflection,
  });
  
  // ── WRITE ── (update skill memory)
  recordResult(skillName, runId, success, {
    durationMs,
    error: error?.message,
    context,
  });
  
  // If reflection suggests evolution, record it
  if (reflection.shouldEvolve) {
    recordEvolution(skillName, {
      type: reflection.evolutionType,
      description: reflection.suggestion,
      scoreBefore: reflection.currentScore,
      trigger: 'auto-reflection',
    });
  }
  
  // Update run state
  const stateFile = path.join(runDir, 'logs', 'state.json');
  const runState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  runState.status = success ? 'completed' : 'failed';
  runState.completedAt = new Date().toISOString();
  runState.durationMs = durationMs;
  runState.reflection = reflection;
  fs.writeFileSync(stateFile, JSON.stringify(runState, null, 2));
  
  // Append to global reflection log
  appendReflection({
    runId,
    skill: skillName,
    success,
    durationMs,
    reflection,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`\n🧠 [Evolution] ${success ? '✅ Success' : '❌ Failure'} — ${skillName}`);
  console.log(`   Duration: ${(durationMs / 1000).toFixed(1)}s`);
  console.log(`   Utility: ${reflection.currentScore}${reflection.scoreChange >= 0 ? '+' : ''}${reflection.scoreChange}`);
  if (reflection.shouldEvolve) {
    console.log(`   ⚠️ Evolution suggested: ${reflection.suggestion}`);
  }
  
  return { success, result, error, runId, reflection };
}

// ── Reflection Engine ───────────────────────────────────────────────────────

function reflect(skillName, success, error, durationMs, context) {
  const memory = loadMemory();
  const skill = memory.skills[skillName];
  
  if (!skill) {
    return {
      shouldEvolve: false,
      currentScore: 50,
      scoreChange: 0,
      suggestion: 'New skill, no history to reflect on.',
    };
  }
  
  const currentScore = skill.utilityScore;
  const scoreChange = success ? 2 : -5;
  const newScore = Math.max(0, Math.min(100, currentScore + scoreChange));
  
  let shouldEvolve = false;
  let evolutionType = 'improvement';
  let suggestion = '';
  
  // Check for recurring failures
  if (!success && skill.failures > 2) {
    const recentErrors = skill.failurePatterns.slice(-5).map(p => p.error);
    const uniqueErrors = new Set(recentErrors);
    
    if (uniqueErrors.size <= 2 && recentErrors.length >= 3) {
      shouldEvolve = true;
      evolutionType = 'fix-recurring';
      suggestion = `Recurring failure pattern detected (${recentErrors.length} occurrences). Most common: "${recentErrors[recentErrors.length - 1]?.slice(0, 80)}"`;
    }
  }
  
  // Check for degrading performance
  if (skill.runs > 5 && newScore < 30) {
    shouldEvolve = true;
    evolutionType = 'rebuild';
    suggestion = `Utility score dropped to ${newScore}/100 after ${skill.runs} runs. Consider rebuilding this skill.`;
  }
  
  // Check for slow execution
  if (durationMs > 120000 && skill.avgDurationMs > 0 && durationMs > skill.avgDurationMs * 2) {
    shouldEvolve = true;
    evolutionType = 'optimize';
    suggestion = `Execution took ${(durationMs / 1000).toFixed(0)}s — 2x slower than average (${(skill.avgDurationMs / 1000).toFixed(0)}s). Optimize for speed.`;
  }
  
  // Success after failures = positive signal
  if (success && skill.failures > 0 && skill.failurePatterns.length > 0) {
    const lastFailure = new Date(skill.failurePatterns[skill.failurePatterns.length - 1].timestamp);
    const hoursSinceFailure = (Date.now() - lastFailure.getTime()) / 3600000;
    if (hoursSinceFailure < 1) {
      suggestion = `Recovered from recent failure. Previous fix appears effective.`;
    }
  }
  
  return {
    shouldEvolve,
    evolutionType,
    currentScore: newScore,
    scoreChange,
    suggestion,
    runs: skill.runs + 1,
    successRate: ((skill.successes + (success ? 1 : 0)) / (skill.runs + 1) * 100).toFixed(1) + '%',
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function appendEvent(runDir, event) {
  const eventsFile = path.join(runDir, 'logs', 'events.jsonl');
  fs.appendFileSync(eventsFile, JSON.stringify(event) + '\n');
}

function appendReflection(entry) {
  fs.mkdirSync(path.dirname(REFLECTION_LOG), { recursive: true });
  fs.appendFileSync(REFLECTION_LOG, JSON.stringify(entry) + '\n');
}

// ── Generate evolution candidates report ────────────────────────────────────

export function generateEvolutionReport() {
  const candidates = getEvolutionCandidates();
  
  if (candidates.length === 0) {
    return '✅ All skills are performing well. No evolution needed.';
  }
  
  let report = `# 🔧 Evolution Report — ${new Date().toISOString().split('T')[0]}\n\n`;
  report += `**${candidates.length} skills flagged for improvement**\n\n`;
  
  for (const c of candidates) {
    report += `## ${c.recommendation}: ${c.name}\n`;
    report += `- Utility Score: ${c.utilityScore}/100\n`;
    report += `- Success Rate: ${c.successRate}\n`;
    report += `- Failures: ${c.failures}\n`;
    if (c.topErrors.length > 0) {
      report += `- Recent errors:\n`;
      c.topErrors.forEach(e => report += `  - \`${e}\`\n`);
    }
    report += `\n`;
  }
  
  return report;
}

// ── CLI interface ───────────────────────────────────────────────────────────

const command = process.argv[2];

if (command === 'report') {
  console.log(generateEvolutionReport());

} else if (command === 'history') {
  if (fs.existsSync(REFLECTION_LOG)) {
    const lines = fs.readFileSync(REFLECTION_LOG, 'utf8').trim().split('\n').slice(-20);
    console.log('\n📜 Recent Evolution History (last 20 entries):\n');
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        const icon = entry.success ? '✅' : '❌';
        console.log(`  ${icon} ${entry.skill} — ${entry.reflection.currentScore}/100 — ${entry.timestamp.slice(0, 19)}`);
        if (entry.reflection.suggestion) {
          console.log(`     💡 ${entry.reflection.suggestion}`);
        }
      } catch {}
    }
  } else {
    console.log('No evolution history yet. Run some skills with tracking first.');
  }

} else if (command === 'clean') {
  // Clean old evolution runs (keep last 50)
  if (fs.existsSync(EVOLUTION_DIR)) {
    const runs = fs.readdirSync(EVOLUTION_DIR)
      .filter(d => d.startsWith('run_'))
      .sort()
      .reverse();
    
    let removed = 0;
    for (const run of runs.slice(50)) {
      fs.rmSync(path.join(EVOLUTION_DIR, run), { recursive: true, force: true });
      removed++;
    }
    console.log(`🧹 Cleaned ${removed} old evolution runs.`);
  }

} else {
  console.log(`
🔄 Agent Evolution Loop — Read→Execute→Reflect→Write

Commands:
  report    Show skills needing evolution
  history   Show recent evolution history
  clean     Clean old evolution run folders

Programmatic usage:
  import { executeWithEvolution } from './agent-evolution-loop.mjs';
  
  const result = await executeWithEvolution('my-skill', async () => {
    // Your skill execution code here
    return someResult;
  });
  `);
}
