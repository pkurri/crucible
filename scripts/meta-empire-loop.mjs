import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 📸 CRUCIBLE DYNAMIC META EMPIRE LOOP
 * Automates content generation and posting for Instagram & Facebook.
 * Loads dynamic niches from data/viral-niches.json and prioritizes them.
 */

const MAX_UPLOADS_PER_DAY = 5; 
const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');
const BASE = path.join(process.cwd(), 'data', 'meta-empire', 'AAK-Nation', 'topics');

function getStateFile(target) {
  // ✅ SEPARATE STATE PER PLATFORM to prevent FB/IG quota sharing
  const suffix = target === 'fb' ? 'fb' : 'insta';
  return path.join(process.cwd(), 'scripts', `meta-empire-state-${suffix}.json`);
}

function loadState(stateFile) {
  if (fs.existsSync(stateFile)) {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  }
  return { lastUploadDate: '', uploadsToday: 0, history: [] };
}

function saveState(stateFile, state) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

async function runMetaCycle() {
  const getArg = (key) => {
    const idx = process.argv.indexOf(key);
    return idx !== -1 ? process.argv[idx + 1] : null;
  };
  const target = getArg('--target') || 'insta';
  const platformName = target === 'insta' ? 'instagram' : target === 'fb' ? 'facebook' : 'meta';

  const STATE_FILE = getStateFile(target);
  const state = loadState(STATE_FILE);
  const today = getToday();

  if (state.lastUploadDate !== today) {
    state.lastUploadDate = today;
    state.uploadsToday = 0;
  }

  const remaining = MAX_UPLOADS_PER_DAY - state.uploadsToday;
  console.log(`\n📸 AAK NATION DYNAMIC META CYCLE (${target.toUpperCase()}) — ${new Date().toLocaleString()}`);
  
  // 📥 Load Dynamic Niches
  if (!fs.existsSync(NICHES_FILE)) {
    console.error('❌ No dynamic niches found. Run node scripts/niche-strategist.mjs first.');
    return;
  }
  
  const registry = JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8'));
  const metaNiches = registry.niches
    .filter(n => n.platforms?.includes('meta'))
    .sort((a,b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0)); // Priority first

  console.log(`📊 Quota: ${state.uploadsToday}/${MAX_UPLOADS_PER_DAY} used today. Found ${metaNiches.length} identified niches.`);
  console.log('═'.repeat(60));

  if (remaining <= 0) {
    console.log('⚠️ Daily Meta upload quota reached. Skipping loop.');
    return;
  }

  let produced = 0, uploaded = 0;

  for (const registryNiche of metaNiches) {
    if (state.uploadsToday >= MAX_UPLOADS_PER_DAY) break;

    const topic = registryNiche.name;
    const topicDir = path.join(BASE, topic);
    const assetDir = path.join(topicDir, 'assets');
    const logFile = path.join(topicDir, 'uploaded', `${platformName}.json`);

    // 🛡️ [GUARDRAIL] MULTI-LAYER DUPLICATE PREVENTION
    const alreadyUploaded = state.history.some(h => h.topic === topic && h.platform === platformName && h.date.split('T')[0] === today);
    if (fs.existsSync(logFile) || alreadyUploaded) {
      console.log(`⏭️ [${topic}] Already posted today on ${target} (History/File Check). Skipping.`);
      continue;
    }

    // 🧹 [GUARDRAIL] FRESH START: Clear old assets to prevent mixed/black screens
    if (fs.existsSync(assetDir)) {
      console.log(`🧹 [${topic}] Cleaning old assets for fresh render...`);
      fs.rmSync(assetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(assetDir, { recursive: true });
    fs.mkdirSync(path.join(topicDir, 'uploaded'), { recursive: true });

    console.log(`🎨 [${topic}] Architecting high-fidelity assets (Priority: ${registryNiche.priority || false})...`);
    try {
      execSync(`node scripts/autonomous-asset-generator.mjs --topic "${topic}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ [${topic}] Asset generation failed.`);
      continue; // Skip if assets failed to prevent black screens
    }

    console.log(`🎬 [${topic}] Producing Premium Reel...`);
    try {
      execSync(`node scripts/empire-4k-producer.mjs --topic "${topic}" --platform meta`, { stdio: 'inherit' });
      produced++;
    } catch (e) {
      console.error(`❌ [${topic}] Production aborted or failed.`);
      continue;
    }

    console.log(`🚀 [${topic}] Dispatching unique render to ${target.toUpperCase()}...`);
    try {
      execSync(`node scripts/meta-official-uploader.mjs --topic "${topic}" --target ${target}`, { stdio: 'inherit' });
      
      // Update state IMMEDIATELY to prevent race conditions
      const freshState = loadState(STATE_FILE);
      freshState.uploadsToday++;
      freshState.history.push({ topic, date: new Date().toISOString(), platform: platformName });
      saveState(STATE_FILE, freshState);
      
      uploaded++;
    } catch (e) {
      console.error(`❌ [${topic}] Upload dispatch failed: ${e.message}`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏆 DYNAMIC META CYCLE (${target.toUpperCase()}) COMPLETE: ${produced} produced, ${uploaded} uploaded.`);
}

runMetaCycle().catch(err => {
  console.error('Fatal meta-empire loop error:', err);
  process.exit(1);
});
