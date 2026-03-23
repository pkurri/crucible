import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 📸 CRUCIBLE META EMPIRE: MASTER PRODUCTION LOOP
 * Automates content generation and posting for Instagram & Facebook.
 * Tracks daily uploads to stay within safe range (~5-10 per day).
 */

const MAX_UPLOADS_PER_DAY = 5; 
const TOPICS = [
  'BioHarmonize', 'StoicMindset', 'WealthBlueprint', 'FutureSapiens',
  'SuccessCodes', 'DailyStoic', 'ForgeCore'
];

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
  console.log(`\n📸 AAK NATION META CYCLE — ${new Date().toLocaleString()}`);
  console.log(`📊 Quota: ${state.uploadsToday}/${MAX_UPLOADS_PER_DAY} used today. ${remaining} Reels remaining.`);
  console.log('═'.repeat(60));

  if (remaining <= 0) {
    console.log('⚠️ Daily Meta upload quota reached. Skipping loop.');
    return;
  }

  let produced = 0, uploaded = 0, skipped = 0;

  for (const topic of TOPICS) {
    if (state.uploadsToday >= MAX_UPLOADS_PER_DAY) break;

    const topicDir = path.join(BASE, topic);
    const assetDir = path.join(topicDir, 'assets');
    const finalRender = path.join(topicDir, 'final-render.mp4');
    const logFile = path.join(topicDir, 'uploaded', 'instagram.json');

    // Skip if already uploaded today
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.mtime.toISOString().split('T')[0] === today) {
        console.log(`⏭️ [${topic}] Already posted today. Skipping.`);
        continue;
      }
    }

    // Ensure directory structure
    fs.mkdirSync(assetDir, { recursive: true });
    fs.mkdirSync(path.join(topicDir, 'uploaded'), { recursive: true });

    // Step 1: Generate Assets if missing or old
    console.log(`🎨 [${topic}] Ensuring assets ready...`);
    try {
      execSync(`node scripts/autonomous-asset-generator.mjs`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ [${topic}] Asset generation failed.`);
    }

    // Step 2: Produce Video
    console.log(`🎬 [${topic}] Producing 1080p Reel...`);
    try {
      execSync(`node scripts/empire-4k-producer.mjs --topic "${topic}"`, { stdio: 'inherit' });
      produced++;
    } catch (e) {
      console.error(`❌ [${topic}] Production failed.`);
      continue;
    }

    // Step 3: Upload
    console.log(`🚀 [${topic}] Dispatching to Instagram & Facebook...`);
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
  console.log(`🏆 META CYCLE COMPLETE: ${produced} produced, ${uploaded} uploaded.`);
}

// One-shot execution for CI or manual triggers
runMetaCycle().catch(err => {
  console.error('Fatal meta-empire loop error:', err);
  process.exit(1);
});
