import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🔱 CRUCIBLE YOUTUBE EMPIRE: MASTER PRODUCTION LOOP
 * Respects YouTube API quota: MAX 6 uploads per day.
 * Tracks uploads in yt-empire-state.json to avoid exceeding limits.
 */

const MAX_UPLOADS_PER_DAY = 6;
const TOPICS = [
  'SuccessCodes', 'WealthWizards', 'MysteryArchive', 'PlayfulPixels',
  'ZenGarden', 'FutureTech', 'DailyStoic', 'CookingCzar',
  'TravelTrek', 'AutoArena', 'GamingGuru', 'NatureNook',
  'PulsePolitics', 'CinemaScope', 'LifeHacks', 'MindfulMinutes',
  'GadgetGrab', 'PetParade', 'HistoryHub', 'ForgeCore'
];

const BASE = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics');
const STATE_FILE = path.join(process.cwd(), 'scripts', 'yt-empire-state.json');

// ═══════════════════════════════════════════════════════
// 📊 QUOTA TRACKER
// ═══════════════════════════════════════════════════════
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
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// ═══════════════════════════════════════════════════════
// 🚀 MAIN LOOP
// ═══════════════════════════════════════════════════════
async function runEmpireCycle() {
  const state = loadState();
  const today = getToday();

  // Reset counter if new day
  if (state.lastUploadDate !== today) {
    state.lastUploadDate = today;
    state.uploadsToday = 0;
  }

  const remaining = MAX_UPLOADS_PER_DAY - state.uploadsToday;
  console.log(`\n🔱 AAK NATION PRODUCTION CYCLE — ${new Date().toLocaleString()}`);
  console.log(`📊 Quota: ${state.uploadsToday}/${MAX_UPLOADS_PER_DAY} used today. ${remaining} uploads remaining.`);
  console.log('═'.repeat(60));

  // STEP 0: CLEANUP OLD VIDEOS (6 days)
  cleanupOldVideos();

  if (remaining <= 0) {
    console.log('⚠️ Daily upload quota reached. Videos will be produced but not uploaded until tomorrow.');
  }

  let produced = 0, uploaded = 0, skipped = 0, queued = 0;

  for (const topic of TOPICS) {
    const topicDir = path.join(BASE, topic);
    const assetDir = path.join(topicDir, 'assets');
    const finalRender = path.join(topicDir, 'final-render.mp4');

    const images = fs.existsSync(assetDir)
      ? fs.readdirSync(assetDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      : [];

    if (images.length === 0) { skipped++; continue; }

    // Step 1: Produce if not already rendered
    if (!fs.existsSync(finalRender)) {
      console.log(`\n🎬 [${topic}] Producing 4K video...`);
      try {
        execSync(`node scripts/empire-4k-producer.mjs --topic "${topic}"`, { stdio: 'inherit' });
        produced++;
      } catch (e) {
        console.error(`❌ [${topic}] Production failed.`);
        continue;
      }
    }

    // Step 2: Upload if quota allows
    if (fs.existsSync(finalRender) && state.uploadsToday < MAX_UPLOADS_PER_DAY) {
      console.log(`🚀 [${topic}] Uploading to AAK Nation... (${state.uploadsToday + 1}/${MAX_UPLOADS_PER_DAY})`);
      try {
        const output = execSync(`node scripts/youtube-official-uploader.mjs --topic "${topic}"`, { encoding: 'utf8' });
        console.log(output);

        if (output.includes('exceeded the number of videos')) {
          console.log('🛑 QUOTA REACHED [API Level]. Stopping uploads for today.');
          state.uploadsToday = MAX_UPLOADS_PER_DAY; // Max out for today
          saveState(state);
          break;
        }

        state.uploadsToday++;
        state.history.push({ topic, date: new Date().toISOString(), status: 'uploaded' });
        saveState(state);
        uploaded++;
      } catch (e) {
        if (e.stdout && e.stdout.includes('exceeded the number of videos')) {
          console.log('🛑 QUOTA REACHED [API Level]. Stopping uploads for today.');
          state.uploadsToday = MAX_UPLOADS_PER_DAY;
          saveState(state);
          break;
        }
        console.error(`❌ [${topic}] Upload failed: ${e.message}`);
      }
    } else if (fs.existsSync(finalRender)) {
      console.log(`📦 [${topic}] Video ready but quota reached. Queued for next cycle.`);
      queued++;
    }
  }

  saveState(state);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏆 CYCLE COMPLETE: ${produced} produced, ${uploaded} uploaded, ${queued} queued, ${skipped} no assets`);
  console.log(`📊 Quota: ${state.uploadsToday}/${MAX_UPLOADS_PER_DAY} used today.`);
}

function cleanupOldVideos() {
  const SIX_DAYS_MS = 1000 * 60 * 60 * 24 * 6;
  console.log('🧹 [Cleanup] Purging uploaded videos older than 6 days...');
  
  for (const topic of TOPICS) {
    const uploadedDir = path.join(BASE, topic, 'uploaded');
    if (!fs.existsSync(uploadedDir)) continue;

    const files = fs.readdirSync(uploadedDir);
    for (const file of files) {
      const filePath = path.join(uploadedDir, file);
      const stat = fs.statSync(filePath);
      const age = Date.now() - stat.mtimeMs;

      if (age > SIX_DAYS_MS) {
        console.log(`🗑️ Deleting aged video: ${topic}/${file}`);
        fs.unlinkSync(filePath);
      }
    }
  }
}

runEmpireCycle();
// Run every 4 hours (6 uploads spread across the day)
setInterval(runEmpireCycle, 1000 * 60 * 60 * 4);
