import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🔱 CRUCIBLE DYNAMIC YOUTUBE EMPIRE LOOP
 * Automates content generation and posting for YouTube Shorts.
 * Respects YouTube API quota: MAX 6 uploads per day.
 */

const MAX_UPLOADS_PER_DAY = 6;
const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');
const BASE = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics');
const STATE_FILE = path.join(process.cwd(), 'scripts', 'yt-empire-state.json');

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

async function runEmpireCycle() {
  const state = loadState();
  const today = getToday();

  if (state.lastUploadDate !== today) {
    state.lastUploadDate = today;
    state.uploadsToday = 0;
  }

  const remaining = MAX_UPLOADS_PER_DAY - state.uploadsToday;
  console.log(`\n🔱 AAK NATION DYNAMIC YOUTUBE CYCLE — ${new Date().toLocaleString()}`);
  
  if (!fs.existsSync(NICHES_FILE)) {
    console.error('❌ No dynamic niches found. Run node scripts/niche-strategist.mjs first.');
    return;
  }

  const registry = JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8'));
  const ytNiches = registry.niches
    .filter(n => n.platforms?.includes('youtube'))
    .sort((a,b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0));

  console.log(`📊 Quota: ${state.uploadsToday}/${MAX_UPLOADS_PER_DAY} used today. ${remaining} uploads remaining.`);
  console.log('═'.repeat(60));

  cleanupOldVideos();

  if (remaining <= 0) {
    console.log('⚠️ Daily YouTube upload quota reached. Skipping loop.');
    return;
  }

  let produced = 0, uploaded = 0;

  for (const registryNiche of ytNiches) {
    if (state.uploadsToday >= MAX_UPLOADS_PER_DAY) break;

    const topic = registryNiche.name;
    const topicDir = path.join(BASE, topic);
    const assetDir = path.join(topicDir, 'assets');
    const finalRender = path.join(topicDir, 'final-render.mp4');

    fs.mkdirSync(assetDir, { recursive: true });
    fs.mkdirSync(path.join(topicDir, 'uploaded'), { recursive: true });

    // 🛡️ [GUARDRAIL] MULTI-LAYER DUPLICATE PREVENTION
    const alreadyUploaded = state.history.some(h => h.topic === topic && h.status === 'uploaded' && h.date.split('T')[0] === today);
    if (alreadyUploaded || fs.existsSync(path.join(topicDir, 'uploaded', 'youtube.json'))) {
      console.log(`⏭️ [${topic}] Already posted today on YouTube Shorts (History/File Check). Skipping.`);
      continue;
    }

    // 🧹 [GUARDRAIL] FRESH START: Clear old assets to prevent mixed/black screens
    if (fs.existsSync(assetDir)) {
      console.log(`🧹 [${topic}] Cleaning old assets for fresh render...`);
      fs.rmSync(assetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(assetDir, { recursive: true });
    fs.mkdirSync(path.join(topicDir, 'uploaded'), { recursive: true });

    // Step 1: Ensure Assets & Script exist
    console.log(`🎨 [${topic}] Architecting high-fidelity assets & viral script...`);
    try {
      execSync(`node scripts/autonomous-asset-generator.mjs --topic "${topic}"`, { stdio: 'inherit' });
      execSync(`node scripts/viral-script-architect.mjs --topic "${topic}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ [${topic}] Prep failed. Skipping to prevent black screens.`);
      continue;
    }

    // Step 2: Produce video
    console.log(`🎬 [${topic}] Producing Premium Shorts video...`);
    try {
      execSync(`node scripts/empire-4k-producer.mjs --topic "${topic}" --platform youtube`, { stdio: 'inherit' });
      produced++;
    } catch (e) {
      console.error(`❌ [${topic}] Production failed.`);
      continue;
    }

    // Step 3: Upload
    if (fs.existsSync(finalRender)) {
      console.log(`🚀 [${topic}] Dispatching unique render to YouTube Shorts... (${state.uploadsToday + 1}/${MAX_UPLOADS_PER_DAY})`);
      try {
        const output = execSync(`node scripts/youtube-official-uploader.mjs --topic "${topic}"`, { encoding: 'utf8' });
        console.log(output);

        if (output.includes('exceeded the number of videos')) {
          console.log('🛑 QUOTA REACHED [API Level]. Stopping.');
          state.uploadsToday = MAX_UPLOADS_PER_DAY;
          saveState(state);
          break;
        }

        // Update state IMMEDIATELY to prevent race conditions
        const freshState = loadState();
        freshState.uploadsToday++;
        freshState.history.push({ topic, date: new Date().toISOString(), status: 'uploaded' });
        saveState(freshState);
        
        uploaded++;
      } catch (e) {
        console.error(`❌ [${topic}] Upload failed: ${e.message}`);
      }
    }
  }

  saveState(state);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏆 YOUTUBE CYCLE COMPLETE: ${produced} produced, ${uploaded} uploaded.`);
}

function cleanupOldVideos() {
  const SIX_DAYS_MS = 1000 * 60 * 60 * 24 * 6;
  for (const topicDir of fs.readdirSync(BASE)) {
    const uploadedDir = path.join(BASE, topicDir, 'uploaded');
    if (!fs.existsSync(uploadedDir)) continue;

    const files = fs.readdirSync(uploadedDir);
    for (const file of files) {
      const filePath = path.join(uploadedDir, file);
      const stat = fs.statSync(filePath);
      if (Date.now() - stat.mtimeMs > SIX_DAYS_MS) {
        fs.unlinkSync(filePath);
      }
    }
  }
}

if (!process.env.GITHUB_ACTIONS && !process.env.CI) {
  runEmpireCycle();
  setInterval(runEmpireCycle, 1000 * 60 * 60 * 4);
} else {
  runEmpireCycle().catch(err => {
    console.error('Fatal production error:', err);
    process.exit(1);
  });
}
