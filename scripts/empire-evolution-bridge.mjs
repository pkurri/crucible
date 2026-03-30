import fs from 'fs';
import path from 'path';
import { loadMemory, recordResult, recordExecutionStart, getStatusReport } from './skill-memory.mjs';

/**
 * 🔌 EMPIRE EVOLUTION BRIDGE
 * 
 * Drop-in enhancement for empire-cycle-core.mjs that adds
 * adaptive evolution tracking to every production cycle.
 * 
 * Import this alongside empire-cycle-core to get:
 * - Automatic skill memory updates on upload success/failure
 * - Evolution tracking per platform + niche
 * - Daily status reports with utility scores
 * - Failure pattern detection across runs
 */

// ── Wrap the upload function with evolution tracking ─────────────────────────

export function withEvolutionTracking(platform, uploadFn) {
  return async function trackedUpload(topic, topicDir, state, stateFile) {
    const skillName = `${platform}-empire-loop`;
    const runId = recordExecutionStart(skillName, { topic, platform });
    const startTime = Date.now();
    
    try {
      const success = await uploadFn(topic, topicDir, state, stateFile);
      const durationMs = Date.now() - startTime;
      
      recordResult(skillName, runId, success, {
        durationMs,
        context: { topic, platform },
        error: success ? undefined : `Upload returned false for ${topic}`,
      });
      
      // Also track per-topic skill
      const topicSkillName = `${platform}-${topic.replace(/\s+/g, '-').toLowerCase()}`;
      recordResult(topicSkillName, runId, success, {
        durationMs,
        context: { topic, platform },
      });
      
      return success;
      
    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      recordResult(skillName, runId, false, {
        durationMs,
        error: error.message,
        context: { topic, platform },
      });
      
      throw error;
    }
  };
}

// ── Wrap production steps with tracking ──────────────────────────────────────

export function trackProductionStep(stepName, platform) {
  return function stepTracker(topic, success, durationMs = 0, error = null) {
    const skillName = `${platform}-${stepName}`;
    const runId = `step_${Date.now()}`;
    
    recordResult(skillName, runId, success, {
      durationMs,
      error: error?.message || error,
      context: { topic, platform, step: stepName },
    });
  };
}

// ── Daily evolution status ──────────────────────────────────────────────────

export function printEvolutionStatus() {
  const report = getStatusReport();
  
  console.log('\n' + '═'.repeat(60));
  console.log('🧠 CRUCIBLE ADAPTIVE SKILLS — STATUS');
  console.log('═'.repeat(60));
  console.log(report.summary);
  console.log(`   Total runs: ${report.totalRuns} | Success rate: ${report.successRate}`);
  
  if (report.topSkills.length > 0) {
    console.log('\n   🏆 Top Skills:');
    report.topSkills.forEach((s, i) => 
      console.log(`      ${i + 1}. ${s.name} (${s.score}/100, ${s.runs} runs)`)
    );
  }
  
  if (report.evolutionCandidates.length > 0) {
    console.log(`\n   ⚠️ ${report.evolutionCandidates.length} skills need evolution:`);
    report.evolutionCandidates.forEach(c => 
      console.log(`      • ${c.name}: ${c.recommendation} (score ${c.utilityScore})`)
    );
  }
  
  console.log('═'.repeat(60) + '\n');
}

// ── Export for use in empire loops ───────────────────────────────────────────

export const evolutionTrackers = {
  youtube: {
    wrapUpload: (fn) => withEvolutionTracking('youtube', fn),
    trackStep: (step) => trackProductionStep(step, 'youtube'),
  },
  instagram: {
    wrapUpload: (fn) => withEvolutionTracking('instagram', fn),
    trackStep: (step) => trackProductionStep(step, 'instagram'),
  },
  facebook: {
    wrapUpload: (fn) => withEvolutionTracking('facebook', fn),
    trackStep: (step) => trackProductionStep(step, 'facebook'),
  },
  moltbook: {
    wrapUpload: (fn) => withEvolutionTracking('moltbook', fn),
    trackStep: (step) => trackProductionStep(step, 'moltbook'),
  },
  meta: {
    wrapUpload: (fn) => withEvolutionTracking('meta', fn),
    trackStep: (step) => trackProductionStep(step, 'meta'),
  },
};

// ── CLI: Print status ───────────────────────────────────────────────────────

if (process.argv[2] === 'status') {
  printEvolutionStatus();
}
