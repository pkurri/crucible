import fs from 'fs';
import path from 'path';

/**
 * 🧠 SKILL MEMORY — Crucible Adaptive Persistent Skill Store
 * 
 * Tracks skill usage, utility scores, failure patterns, and evolution history.
 * Integrates with the existing agent-states system and empire-cycle-core.
 * 
 * Uses the Read→Execute→Reflect→Write loop for self-improving agents.
 */

const MEMORY_FILE = path.join(process.cwd(), 'data', 'skill-memory.json');
const AGENTS_DIR = path.join(process.cwd(), 'scripts', 'agents');
const STATES_DIR = path.join(process.cwd(), 'scripts', 'agent-states');

// ── Schema ──────────────────────────────────────────────────────────────────

function createEmptyMemory() {
  return {
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skills: {},
    agents: {},
    globalStats: {
      totalRuns: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      topSkills: [],
      recentActivity: [],
    },
  };
}

function createSkillEntry(name, type = 'tool') {
  return {
    name,
    type,
    utilityScore: 50, // Start at 50/100
    runs: 0,
    successes: 0,
    failures: 0,
    avgDurationMs: 0,
    lastUsed: null,
    lastSuccess: null,
    lastFailure: null,
    failurePatterns: [],
    evolutionHistory: [],
    composedFrom: [],
    usedBy: [],
    tags: [],
  };
}

// ── Core Operations ─────────────────────────────────────────────────────────

export function loadMemory() {
  if (fs.existsSync(MEMORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    } catch {
      console.warn('⚠️ [SkillMemory] Corrupt memory file, creating fresh.');
    }
  }
  const fresh = createEmptyMemory();
  saveMemory(fresh);
  return fresh;
}

export function saveMemory(memory) {
  memory.updatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(MEMORY_FILE), { recursive: true });
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// ── READ: Route to best skill ───────────────────────────────────────────────

export function routeToSkill(taskDescription, memory = null) {
  if (!memory) memory = loadMemory();
  
  const keywords = taskDescription.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const candidates = [];

  for (const [name, skill] of Object.entries(memory.skills)) {
    let score = 0;
    const searchText = `${name} ${skill.tags.join(' ')} ${skill.type}`.toLowerCase();
    
    // Keyword matching
    for (const kw of keywords) {
      if (searchText.includes(kw)) score += 10;
      if (name.includes(kw)) score += 20; // Name match is stronger
    }
    
    // Utility score bonus (prefer battle-tested skills)
    score += skill.utilityScore * 0.3;
    
    // Recency bonus (prefer recently successful skills)
    if (skill.lastSuccess) {
      const hoursSinceSuccess = (Date.now() - new Date(skill.lastSuccess).getTime()) / 3600000;
      if (hoursSinceSuccess < 24) score += 15;
      else if (hoursSinceSuccess < 168) score += 5;
    }
    
    // Penalty for high failure rate
    if (skill.runs > 3) {
      const failRate = skill.failures / skill.runs;
      if (failRate > 0.5) score -= 20;
    }
    
    if (score > 0) {
      candidates.push({ name, score, skill });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 5);
}

// ── EXECUTE: Record execution start ─────────────────────────────────────────

export function recordExecutionStart(skillName, context = {}) {
  const memory = loadMemory();
  
  if (!memory.skills[skillName]) {
    memory.skills[skillName] = createSkillEntry(skillName);
  }
  
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  // Track in global activity
  memory.globalStats.recentActivity.push({
    runId,
    skill: skillName,
    action: 'start',
    timestamp: new Date().toISOString(),
    context,
  });
  
  // Keep only last 100 activities
  memory.globalStats.recentActivity = memory.globalStats.recentActivity.slice(-100);
  
  saveMemory(memory);
  return runId;
}

// ── REFLECT: Record result and update scores ────────────────────────────────

export function recordResult(skillName, runId, success, details = {}) {
  const memory = loadMemory();
  
  if (!memory.skills[skillName]) {
    memory.skills[skillName] = createSkillEntry(skillName);
  }
  
  const skill = memory.skills[skillName];
  const now = new Date().toISOString();
  
  skill.runs++;
  skill.lastUsed = now;
  memory.globalStats.totalRuns++;
  
  if (success) {
    skill.successes++;
    skill.lastSuccess = now;
    memory.globalStats.totalSuccesses++;
    
    // WRITE: Increase utility score (+2 on success)
    skill.utilityScore = Math.min(100, skill.utilityScore + 2);
    
  } else {
    skill.failures++;
    skill.lastFailure = now;
    memory.globalStats.totalFailures++;
    
    // WRITE: Decrease utility score with improvement pressure
    skill.utilityScore = Math.max(0, skill.utilityScore - 5);
    
    // Record failure pattern
    const pattern = {
      timestamp: now,
      runId,
      error: (details.error || 'Unknown error').slice(0, 300),
      context: details.context || {},
    };
    skill.failurePatterns.push(pattern);
    skill.failurePatterns = skill.failurePatterns.slice(-20); // Keep last 20
  }
  
  // Update duration tracking
  if (details.durationMs) {
    skill.avgDurationMs = skill.runs === 1
      ? details.durationMs
      : Math.round((skill.avgDurationMs * (skill.runs - 1) + details.durationMs) / skill.runs);
  }
  
  // Update global top skills
  const allSkills = Object.entries(memory.skills)
    .map(([n, s]) => ({ name: n, score: s.utilityScore, runs: s.runs }))
    .sort((a, b) => b.score - a.score);
  memory.globalStats.topSkills = allSkills.slice(0, 10);
  
  // Record in activity log
  memory.globalStats.recentActivity.push({
    runId,
    skill: skillName,
    action: success ? 'success' : 'failure',
    timestamp: now,
    details: { durationMs: details.durationMs, error: details.error?.slice(0, 100) },
  });
  memory.globalStats.recentActivity = memory.globalStats.recentActivity.slice(-100);
  
  saveMemory(memory);
  return skill;
}

// ── WRITE: Record evolution event ───────────────────────────────────────────

export function recordEvolution(skillName, change) {
  const memory = loadMemory();
  
  if (!memory.skills[skillName]) {
    memory.skills[skillName] = createSkillEntry(skillName);
  }
  
  memory.skills[skillName].evolutionHistory.push({
    timestamp: new Date().toISOString(),
    type: change.type || 'improvement',
    description: change.description || '',
    scoreBefore: change.scoreBefore,
    scoreAfter: change.scoreAfter,
    trigger: change.trigger || 'manual',
  });
  
  // Keep last 50 evolution events
  memory.skills[skillName].evolutionHistory = 
    memory.skills[skillName].evolutionHistory.slice(-50);
  
  saveMemory(memory);
}

// ── Register existing agents into memory ────────────────────────────────────

export function syncAgentsToMemory() {
  const memory = loadMemory();
  
  // Sync from scripts/agents/*.json
  if (fs.existsSync(AGENTS_DIR)) {
    for (const file of fs.readdirSync(AGENTS_DIR)) {
      if (file === 'registry.json' || !file.endsWith('.json')) continue;
      try {
        const agent = JSON.parse(fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8'));
        const name = agent.agent_name || path.basename(file, '.json');
        
        if (!memory.agents[name]) {
          memory.agents[name] = {
            name,
            description: agent.description || '',
            topics: agent.topics || [],
            submolts: agent.submolts || [],
            registeredAt: agent.registered_at || new Date().toISOString(),
            utilityScore: 50,
            runs: 0,
          };
        }
      } catch {}
    }
  }
  
  // Sync agent states
  if (fs.existsSync(STATES_DIR)) {
    for (const file of fs.readdirSync(STATES_DIR)) {
      if (!file.endsWith('-state.json')) continue;
      const agentName = file.replace('-state.json', '');
      try {
        const state = JSON.parse(fs.readFileSync(path.join(STATES_DIR, file), 'utf8'));
        if (memory.agents[agentName]) {
          memory.agents[agentName].lastState = state;
        }
      } catch {}
    }
  }
  
  saveMemory(memory);
  return memory;
}

// ── Register scripts as skills ──────────────────────────────────────────────

export function syncScriptsToMemory() {
  const memory = loadMemory();
  const scriptsDir = path.join(process.cwd(), 'scripts');
  
  const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.mjs') || f.endsWith('.js'));
  
  for (const file of scriptFiles) {
    const name = path.basename(file, path.extname(file));
    
    if (!memory.skills[name]) {
      // Categorize by naming convention
      let type = 'tool';
      if (name.includes('empire') || name.includes('loop') || name.includes('automation')) type = 'workflow';
      if (name.includes('producer') || name.includes('generator') || name.includes('architect')) type = 'generator';
      if (name.includes('uploader') || name.includes('dispatcher')) type = 'publisher';
      if (name.includes('test') || name.includes('check') || name.includes('validate')) type = 'validator';
      if (name.includes('intel') || name.includes('fetcher')) type = 'collector';
      
      // Extract tags from filename
      const tags = name.split(/[-_]/).filter(w => w.length > 2);
      
      memory.skills[name] = createSkillEntry(name, type);
      memory.skills[name].tags = tags;
      memory.skills[name].source = `scripts/${file}`;
    }
  }
  
  saveMemory(memory);
  return memory;
}

// ── Get evolution candidates ────────────────────────────────────────────────

export function getEvolutionCandidates(minFailures = 2) {
  const memory = loadMemory();
  const candidates = [];
  
  for (const [name, skill] of Object.entries(memory.skills)) {
    if (skill.failures >= minFailures && skill.utilityScore < 40) {
      candidates.push({
        name,
        utilityScore: skill.utilityScore,
        failures: skill.failures,
        successRate: skill.runs > 0 ? (skill.successes / skill.runs * 100).toFixed(1) + '%' : 'N/A',
        topErrors: skill.failurePatterns.slice(-3).map(p => p.error.slice(0, 80)),
        recommendation: skill.utilityScore < 20 ? 'REBUILD' : 'IMPROVE',
      });
    }
  }
  
  candidates.sort((a, b) => a.utilityScore - b.utilityScore);
  return candidates;
}

// ── Status report ───────────────────────────────────────────────────────────

export function getStatusReport() {
  const memory = loadMemory();
  const stats = memory.globalStats;
  
  const skillCount = Object.keys(memory.skills).length;
  const agentCount = Object.keys(memory.agents).length;
  const avgScore = skillCount > 0
    ? (Object.values(memory.skills).reduce((sum, s) => sum + s.utilityScore, 0) / skillCount).toFixed(1)
    : 0;
  
  return {
    summary: `📊 Skill Memory: ${skillCount} skills, ${agentCount} agents, avg score ${avgScore}/100`,
    totalRuns: stats.totalRuns,
    successRate: stats.totalRuns > 0 ? (stats.totalSuccesses / stats.totalRuns * 100).toFixed(1) + '%' : 'N/A',
    topSkills: stats.topSkills.slice(0, 5),
    evolutionCandidates: getEvolutionCandidates(),
    lastUpdated: memory.updatedAt,
  };
}

// ── CLI ─────────────────────────────────────────────────────────────────────

const command = process.argv[2];

if (command === 'sync') {
  console.log('🔄 Syncing agents and scripts to skill memory...');
  syncAgentsToMemory();
  syncScriptsToMemory();
  const report = getStatusReport();
  console.log(report.summary);
  console.log(`   Runs: ${report.totalRuns} | Success rate: ${report.successRate}`);
  if (report.evolutionCandidates.length > 0) {
    console.log(`   ⚠️ ${report.evolutionCandidates.length} skills need evolution`);
  }
  
} else if (command === 'route') {
  const task = process.argv.slice(3).join(' ');
  if (!task) { console.error('Usage: node skill-memory.mjs route <task description>'); process.exit(1); }
  const candidates = routeToSkill(task);
  console.log(`🧭 Best skills for "${task}":`);
  candidates.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.name} (score: ${c.score.toFixed(1)}, utility: ${c.skill.utilityScore})`);
  });
  
} else if (command === 'status') {
  const report = getStatusReport();
  console.log(report.summary);
  console.log(`   Total runs: ${report.totalRuns}`);
  console.log(`   Success rate: ${report.successRate}`);
  if (report.topSkills.length > 0) {
    console.log('\n   🏆 Top Skills:');
    report.topSkills.forEach((s, i) => console.log(`      ${i + 1}. ${s.name} (${s.score}/100, ${s.runs} runs)`));
  }
  if (report.evolutionCandidates.length > 0) {
    console.log('\n   🔧 Need Evolution:');
    report.evolutionCandidates.forEach(c => {
      console.log(`      • ${c.name}: ${c.recommendation} (score ${c.utilityScore}, ${c.failures} failures)`);
    });
  }
  
} else if (command === 'evolve') {
  const candidates = getEvolutionCandidates();
  if (candidates.length === 0) {
    console.log('✅ No skills need evolution right now.');
  } else {
    console.log(`🔧 ${candidates.length} skills flagged for evolution:\n`);
    candidates.forEach(c => {
      console.log(`   📛 ${c.name} — ${c.recommendation}`);
      console.log(`      Score: ${c.utilityScore}/100 | Success rate: ${c.successRate}`);
      console.log(`      Recent errors:`);
      c.topErrors.forEach(e => console.log(`        - ${e}`));
      console.log();
    });
  }
  
} else if (command === 'record') {
  const [, , , skillName, result, ...rest] = process.argv;
  if (!skillName || !result) {
    console.error('Usage: node skill-memory.mjs record <skill-name> success|failure [error-message]');
    process.exit(1);
  }
  const success = result === 'success';
  const error = rest.join(' ') || undefined;
  recordResult(skillName, `cli_${Date.now()}`, success, { error });
  console.log(`📝 Recorded ${result} for ${skillName}`);
  
} else {
  console.log(`
🧠 Skill Memory — Crucible Adaptive Persistent Store

Commands:
  sync      Discover and register all scripts/agents
  route     Route a task to the best skill
  status    Show memory status report
  evolve    Show skills that need improvement
  record    Record a skill execution result

Usage:
  node scripts/skill-memory.mjs sync
  node scripts/skill-memory.mjs route "generate youtube video"
  node scripts/skill-memory.mjs status
  node scripts/skill-memory.mjs evolve
  node scripts/skill-memory.mjs record empire-4k-producer success
  node scripts/skill-memory.mjs record meta-official-uploader failure "API rate limit"
  `);
}
