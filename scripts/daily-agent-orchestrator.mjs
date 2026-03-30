import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { loadMemory, saveMemory, syncScriptsToMemory, syncAgentsToMemory, getStatusReport, getEvolutionCandidates, recordResult } from './skill-memory.mjs';
import { generateEvolutionReport } from './agent-evolution-loop.mjs';

/**
 * 🔄 DAILY AGENT ORCHESTRATOR
 * 
 * The master daily loop that ties everything together:
 * 
 * 1. SYNC    — Discover all scripts/agents, rebuild skill memory
 * 2. ANALYZE — Identify underperforming skills and failure patterns
 * 3. HEAL    — Auto-fix known issues (retry failed uploads, reset stuck states)
 * 4. ENHANCE — Generate improvement suggestions for low-scoring skills
 * 5. REPORT  — Output daily status summary + commit to git
 * 
 * Run: node scripts/daily-agent-orchestrator.mjs
 * Schedule: GitHub Actions runs this daily at 6 AM UTC
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const DAILY_LOG_DIR = path.join(DATA_DIR, 'daily-logs');
const STATES_DIR = path.join(process.cwd(), 'scripts', 'agent-states');

// ═══════════════════════════════════════════════════════════════════════════
// Phase 1: SYNC — Rebuild skill memory from filesystem
// ═══════════════════════════════════════════════════════════════════════════

async function phaseSYNC() {
  console.log('\n' + '═'.repeat(60));
  console.log('📡 PHASE 1: SYNC — Discovering all skills and agents');
  console.log('═'.repeat(60));
  
  syncScriptsToMemory();
  syncAgentsToMemory();
  
  const memory = loadMemory();
  const skillCount = Object.keys(memory.skills).length;
  const agentCount = Object.keys(memory.agents).length;
  
  console.log(`   ✅ Found ${skillCount} skills, ${agentCount} agents`);
  
  return { skillCount, agentCount };
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase 2: ANALYZE — Check which skills are struggling
// ═══════════════════════════════════════════════════════════════════════════

async function phaseANALYZE() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 PHASE 2: ANALYZE — Checking skill health');
  console.log('═'.repeat(60));
  
  const memory = loadMemory();
  const candidates = getEvolutionCandidates(1); // lower threshold for daily check
  
  // Calculate health metrics
  const skills = Object.values(memory.skills);
  const withRuns = skills.filter(s => s.runs > 0);
  const healthy = skills.filter(s => s.utilityScore >= 50);
  const degraded = skills.filter(s => s.utilityScore > 20 && s.utilityScore < 50);
  const critical = skills.filter(s => s.utilityScore <= 20 && s.runs > 0);
  
  console.log(`   📊 Health breakdown:`);
  console.log(`      ✅ Healthy (50+):  ${healthy.length} skills`);
  console.log(`      ⚠️  Degraded (20-50): ${degraded.length} skills`);
  console.log(`      🔴 Critical (<20):  ${critical.length} skills`);
  console.log(`      📈 Active (has runs): ${withRuns.length} skills`);
  
  // Check for stale agents (no runs in 7+ days)
  const staleAgents = [];
  for (const [name, agent] of Object.entries(memory.agents)) {
    const skill = memory.skills[name];
    if (skill?.lastUsed) {
      const daysSinceRun = (Date.now() - new Date(skill.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceRun > 7) {
        staleAgents.push({ name, daysSinceRun: Math.round(daysSinceRun) });
      }
    }
  }
  
  if (staleAgents.length > 0) {
    console.log(`\n   🕸️  Stale agents (no runs in 7+ days):`);
    staleAgents.forEach(a => console.log(`      • ${a.name} (${a.daysSinceRun} days idle)`));
  }
  
  return { candidates, healthy: healthy.length, degraded: degraded.length, critical: critical.length, staleAgents };
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase 3: HEAL — Auto-fix known issues
// ═══════════════════════════════════════════════════════════════════════════

async function phaseHEAL() {
  console.log('\n' + '═'.repeat(60));
  console.log('🩹 PHASE 3: HEAL — Auto-fixing known issues');
  console.log('═'.repeat(60));
  
  let fixes = 0;
  
  // Fix 1: Reset stuck agent states (lastRun is today but uploadsToday > maxUploads)
  if (fs.existsSync(STATES_DIR)) {
    for (const file of fs.readdirSync(STATES_DIR)) {
      if (!file.endsWith('-state.json')) continue;
      try {
        const statePath = path.join(STATES_DIR, file);
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        const today = new Date().toISOString().split('T')[0];
        
        // Reset states from previous days
        if (state.lastUploadDate && state.lastUploadDate !== today && state.uploadsToday > 0) {
          state.lastUploadDate = today;
          state.uploadsToday = 0;
          fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
          console.log(`   🔧 Reset quota for ${file.replace('-state.json', '')}`);
          fixes++;
        }
      } catch {}
    }
  }
  
  // Fix 2: Clean evolution runs older than 30 days
  const evoDir = path.join(DATA_DIR, 'evolution-runs');
  if (fs.existsSync(evoDir)) {
    const runs = fs.readdirSync(evoDir).filter(d => d.startsWith('run_')).sort();
    const toRemove = runs.slice(0, Math.max(0, runs.length - 30));
    for (const run of toRemove) {
      fs.rmSync(path.join(evoDir, run), { recursive: true, force: true });
      fixes++;
    }
    if (toRemove.length > 0) {
      console.log(`   🧹 Cleaned ${toRemove.length} old evolution runs`);
    }
  }
  
  // Fix 3: Trim reflection log (keep last 500 entries)
  const reflectionLog = path.join(DATA_DIR, 'evolution-reflection.jsonl');
  if (fs.existsSync(reflectionLog)) {
    const lines = fs.readFileSync(reflectionLog, 'utf8').trim().split('\n');
    if (lines.length > 500) {
      const trimmed = lines.slice(-500).join('\n') + '\n';
      fs.writeFileSync(reflectionLog, trimmed);
      console.log(`   📋 Trimmed reflection log from ${lines.length} to 500 entries`);
      fixes++;
    }
  }
  
  if (fixes === 0) {
    console.log('   ✅ No issues found. Everything is healthy.');
  } else {
    console.log(`   🩹 Applied ${fixes} auto-fixes`);
  }
  
  return { fixes };
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase 4: ENHANCE — Generate improvement suggestions
// ═══════════════════════════════════════════════════════════════════════════

async function phaseENHANCE() {
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 PHASE 4: ENHANCE — Generating improvement plans');
  console.log('═'.repeat(60));
  
  const candidates = getEvolutionCandidates(2);
  const suggestions = [];
  
  if (candidates.length === 0) {
    console.log('   ✅ All skills performing well. No enhancements needed.');
    return { suggestions };
  }
  
  for (const candidate of candidates) {
    const suggestion = {
      skill: candidate.name,
      action: candidate.recommendation,
      score: candidate.utilityScore,
      reason: '',
      steps: [],
    };
    
    // Analyze failure patterns for specific suggestions
    if (candidate.topErrors.length > 0) {
      const errors = candidate.topErrors.join(' ').toLowerCase();
      
      if (errors.includes('rate limit') || errors.includes('429') || errors.includes('too many')) {
        suggestion.reason = 'Rate limiting detected';
        suggestion.steps = [
          'Add exponential backoff to API calls',
          'Implement request queuing with delays',
          'Consider reducing batch size',
        ];
      } else if (errors.includes('auth') || errors.includes('token') || errors.includes('401') || errors.includes('credential')) {
        suggestion.reason = 'Authentication failures';
        suggestion.steps = [
          'Verify API tokens are valid and not expired',
          'Check GitHub Secrets are correctly configured',
          'Implement token refresh logic',
        ];
      } else if (errors.includes('timeout') || errors.includes('ETIMEDOUT') || errors.includes('ECONNRESET')) {
        suggestion.reason = 'Network timeout issues';
        suggestion.steps = [
          'Add retry logic with timeout escalation',
          'Check if target API has uptime issues',
          'Implement circuit breaker pattern',
        ];
      } else if (errors.includes('json') || errors.includes('parse') || errors.includes('undefined')) {
        suggestion.reason = 'Data parsing errors';
        suggestion.steps = [
          'Add input validation before processing',
          'Implement safer JSON.parse with try/catch',
          'Add null checks for optional fields',
        ];
      } else {
        suggestion.reason = 'Multiple failure patterns';
        suggestion.steps = [
          'Review recent error logs for this skill',
          'Add comprehensive error handling',
          'Consider rebuilding with simpler logic',
        ];
      }
    }
    
    suggestions.push(suggestion);
    console.log(`\n   📛 ${suggestion.skill} — ${suggestion.action}`);
    console.log(`      Score: ${suggestion.score}/100 | Reason: ${suggestion.reason}`);
    suggestion.steps.forEach(s => console.log(`      → ${s}`));
  }
  
  return { suggestions };
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase 6: FORGE — Automated Simulations
// ═══════════════════════════════════════════════════════════════════════════

async function phaseFORGE() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔥 PHASE 6: FORGE — Running automated simulations');
  console.log('═'.repeat(60));
  
  const targetFile = path.join(process.cwd(), 'data', 'daily-forge-targets.json');
  if (!fs.existsSync(targetFile)) {
    console.log('   ℹ️ No daily forge targets found. Skipping phase.');
    return { simulations: [] };
  }

  let targets = [];
  try {
    targets = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  } catch (err) {
    console.error(`   ❌ Failed to parse targets: ${err.message}`);
    return { error: 'Parse Error', simulations: [] };
  }

  // Import runForge dynamically to avoid circular or missing dependencies
  let runForge;
  try {
     const forgeModule = await import('../skills/forge-simulator/scripts/run-simulation.mjs');
     runForge = forgeModule.runForge;
  } catch (err) {
    console.error(`   ❌ Could not load Forge Simulator: ${err.message}`);
    return { error: 'Module Load Error', simulations: [] };
  }

  const results = [];
  for (const target of targets) {
    console.log(`\n   🛠️  Simulating: ${target.name}`);
    try {
      // Resolve ore: if it's a file path that exists, pass it as such, else pass as string
      let ore = target.ore;
      if (typeof ore === 'string' && ore.startsWith('data/') && fs.existsSync(path.join(process.cwd(), ore))) {
        ore = path.join(process.cwd(), ore);
      } else if (!fs.existsSync(ore) && typeof ore === 'string' && ore.includes('/')) {
        // Handle absolute paths if they don't start with data/
         if (fs.existsSync(ore)) {
            // ore is already absolute or relative to cwd
         } else {
            console.warn(`      ⚠️  Ore file not found: ${ore}. Using as raw string.`);
         }
      }

      const sim = await runForge({
        domain: target.domain || 'generic',
        ore: ore,
        question: target.question,
        rounds: target.rounds || 10
      });

      results.push({ ...target, success: true, worldId: sim.worldId, confidence: sim.confidence });
      console.log(`      ✅ Complete: Confidence ${sim.confidence}%`);
    } catch (err) {
      console.error(`      ❌ Simulation failed: ${err.message.slice(0, 100)}`);
      results.push({ ...target, success: false, error: err.message });
    }
  }

  return { simulations: results };
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase 5: REPORT — Generate daily summary
// ═══════════════════════════════════════════════════════════════════════════

async function phaseREPORT(results) {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 PHASE 5: REPORT — Daily Summary');
  console.log('═'.repeat(60));
  
  const today = new Date().toISOString().split('T')[0];
  const report = getStatusReport();
  
  const dailyReport = {
    date: today,
    timestamp: new Date().toISOString(),
    sync: results.sync,
    analysis: {
      healthy: results.analyze.healthy,
      degraded: results.analyze.degraded,
      critical: results.analyze.critical,
      staleAgents: results.analyze.staleAgents.length,
      evolutionCandidates: results.analyze.candidates.length,
    },
    healing: results.heal,
    enhancements: results.enhance.suggestions.length,
    forge: results.forge,
    globalStats: report,
  };
  
  // Save daily report
  fs.mkdirSync(DAILY_LOG_DIR, { recursive: true });
  const reportFile = path.join(DAILY_LOG_DIR, `${today}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(dailyReport, null, 2));
  
  // Generate markdown summary
  const mdReport = `# 🧠 Daily Agent Report — ${today}

## System Health
- **Skills**: ${results.sync.skillCount} total | ✅ ${results.analyze.healthy} healthy | ⚠️ ${results.analyze.degraded} degraded | 🔴 ${results.analyze.critical} critical
- **Agents**: ${results.sync.agentCount} registered
- **Success Rate**: ${report.successRate}
- **Total Runs**: ${report.totalRuns}

## Auto-Fixes Applied
${results.heal.fixes > 0 ? `- Applied **${results.heal.fixes}** auto-fixes` : '- No fixes needed ✅'}

## Evolution Candidates
${results.enhance.suggestions.length > 0
  ? results.enhance.suggestions.map(s => `- **${s.skill}**: ${s.action} (score ${s.score}) — ${s.reason}`).join('\n')
  : '- All skills performing well ✅'}

## Forge Daily Simulations
${results.forge.simulations && results.forge.simulations.length > 0
  ? results.forge.simulations.map(s => s.success 
      ? `- **${s.name}**: ✅ Success (Confidence ${s.confidence}%, World: ${s.worldId})` 
      : `- **${s.name}**: ❌ Failed (${s.error?.slice(0, 40)}...)`).join('\n')
  : '- No simulations run today'}

## Top Skills
${report.topSkills.length > 0
  ? report.topSkills.map((s, i) => `${i + 1}. ${s.name} (${s.score}/100, ${s.runs} runs)`).join('\n')
  : '- No runs recorded yet'}
`;
  
  const mdFile = path.join(DAILY_LOG_DIR, `${today}.md`);
  fs.writeFileSync(mdFile, mdReport);
  
  console.log(`\n   📄 Report saved: data/daily-logs/${today}.json`);
  console.log(`   📄 Summary saved: data/daily-logs/${today}.md`);
  console.log('\n' + report.summary);
  
  return dailyReport;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN — Run all phases
// ═══════════════════════════════════════════════════════════════════════════

async function runDailyOrchestrator() {
  const startTime = Date.now();
  
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       🧠 CRUCIBLE DAILY AGENT ORCHESTRATOR              ║');
  console.log('║       ' + new Date().toLocaleString().padEnd(45) + '  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  const results = {};
  
  try {
    results.sync = await phaseSYNC();
    results.analyze = await phaseANALYZE();
    results.heal = await phaseHEAL();
    results.enhance = await phaseENHANCE();
    results.forge = await phaseFORGE();
    
    const report = await phaseREPORT(results);
    
    const durationMs = Date.now() - startTime;
    console.log('\n' + '═'.repeat(60));
    console.log(`🏁 Daily orchestration complete in ${(durationMs / 1000).toFixed(1)}s`);
    console.log('═'.repeat(60) + '\n');
    
    // Track our own execution
    recordResult('daily-agent-orchestrator', `daily_${Date.now()}`, true, {
      durationMs,
      context: {
        skills: results.sync.skillCount,
        agents: results.sync.agentCount,
        fixes: results.heal.fixes,
        enhancements: results.enhance.suggestions.length,
      },
    });
    
    return report;
    
  } catch (error) {
    console.error(`\n❌ Orchestration failed: ${error.message}`);
    console.error(error.stack);
    
    recordResult('daily-agent-orchestrator', `daily_${Date.now()}`, false, {
      durationMs: Date.now() - startTime,
      error: error.message,
    });
    
    process.exit(1);
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const command = process.argv[2];

if (command === 'full' || !command) {
  runDailyOrchestrator().catch(console.error);
  
} else if (command === 'sync-only') {
  phaseSYNC().then(() => console.log('\n✅ Sync complete.'));
  
} else if (command === 'analyze-only') {
  phaseSYNC().then(() => phaseANALYZE()).then(() => console.log('\n✅ Analysis complete.'));
  
} else if (command === 'heal-only') {
  phaseHEAL().then(() => console.log('\n✅ Healing complete.'));
  
} else if (command === 'history') {
  // Show recent daily reports
  if (fs.existsSync(DAILY_LOG_DIR)) {
    const files = fs.readdirSync(DAILY_LOG_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 7);
    
    console.log('\n📅 Recent Daily Reports:\n');
    for (const file of files) {
      try {
        const report = JSON.parse(fs.readFileSync(path.join(DAILY_LOG_DIR, file), 'utf8'));
        const a = report.analysis;
        console.log(`  ${report.date}: ✅${a.healthy} ⚠️${a.degraded} 🔴${a.critical} | Fixes: ${report.healing.fixes} | Evolve: ${a.evolutionCandidates}`);
      } catch {}
    }
  } else {
    console.log('No daily reports yet. Run: node scripts/daily-agent-orchestrator.mjs');
  }
  
} else {
  console.log(`
🔄 Daily Agent Orchestrator

Commands:
  (default)      Run full daily cycle (sync → analyze → heal → enhance → report)
  sync-only      Just sync scripts and agents
  analyze-only   Sync + analyze health
  heal-only      Just run auto-fixes
  history        Show recent daily reports

Usage:
  node scripts/daily-agent-orchestrator.mjs           # Full daily cycle
  node scripts/daily-agent-orchestrator.mjs sync-only  
  node scripts/daily-agent-orchestrator.mjs history    # Last 7 days
  `);
}
