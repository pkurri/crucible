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
const STATE_FILE = path.join(process.cwd(), 'scripts', 'meta-empire-state.json');

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return { lastUploadDate: '', uploadsToday: 0, history: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

async function runMetaCycle() {
  const state = loadState();
  const today = getToday();

  if (state.lastUploadDate !== today) {
    state.lastUploadDate = today;
    state.uploadsToday = 0;
  }

  const remaining = MAX_UPLOADS_PER_DAY - state.uploadsToday;
  console.log(`\n📸 AAK NATION DYNAMIC META CYCLE — ${new Date().toLocaleString()}`);
  
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
    const logFile = path.join(topicDir, 'uploaded', 'instagram.json');

    // Skip if already posted today
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.mtime.toISOString().split('T')[0] === today) {
        console.log(`⏭️ [${topic}] Already posted today. Skipping.`);
        continue;
      }
    }

    fs.mkdirSync(assetDir, { recursive: true });
    fs.mkdirSync(path.join(topicDir, 'uploaded'), { recursive: true });

    console.log(`🎨 [${topic}] Architecting assets (Priority: ${registryNiche.priority || false})...`);
    try {
      // Pass niche details to generator if possible - for now we just run it
      execSync(`node scripts/autonomous-asset-generator.mjs`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ [${topic}] Asset generation failed.`);
    }

    console.log(`🎬 [${topic}] Producing Reel...`);
    try {
      execSync(`node scripts/empire-4k-producer.mjs --topic "${topic}"`, { stdio: 'inherit' });
      produced++;
    } catch (e) {
      console.error(`❌ [${topic}] Production failed.`);
      continue;
    }

    console.log(`🚀 [${topic}] Dispatching to Meta...`);
    try {
      execSync(`node scripts/meta-official-uploader.mjs --topic "${topic}"`, { stdio: 'inherit' });
      state.uploadsToday++;
      state.history.push({ topic, date: new Date().toISOString(), platform: 'meta' });
      saveState(state);
      uploaded++;
    } catch (e) {
      console.error(`❌ [${topic}] Upload dispatch failed: ${e.message}`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏆 DYNAMIC META CYCLE COMPLETE: ${produced} produced, ${uploaded} uploaded.`);
}

runMetaCycle().catch(err => {
  console.error('Fatal meta-empire loop error:', err);
  process.exit(1);
});
