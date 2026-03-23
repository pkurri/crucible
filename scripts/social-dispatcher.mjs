import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🔱 AAK NATION: GLOBAL SOCIAL DISPATCHER
 * One trigger = 4 platform uploads simultaneously.
 * YouTube + Instagram + Facebook + X + Threads = EMPIRE
 *
 * Usage:
 *   node scripts/social-dispatcher.mjs --topic SuccessCodes
 *   node scripts/social-dispatcher.mjs --all   (dispatch all rendered topics)
 */

const TOPICS = [
  'SuccessCodes', 'WealthWizards', 'MysteryArchive', 'PlayfulPixels',
  'ZenGarden', 'FutureTech', 'DailyStoic', 'CookingCzar',
  'TravelTrek', 'AutoArena', 'GamingGuru', 'NatureNook',
  'PulsePolitics', 'CinemaScope', 'LifeHacks', 'MindfulMinutes',
  'GadgetGrab', 'PetParade', 'HistoryHub', 'ForgeCore', 'BioHarmonize'
];

const BASE = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics');
const STATE_FILE = path.join(process.cwd(), 'scripts', 'yt-empire-state.json');
const MAX_YT_UPLOADS = 6;

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// ═══════════════════════════════════════════════════════
// 📊 STATE HELPERS
// ═══════════════════════════════════════════════════════
function loadState() {
  const defaults = { lastUploadDate: '', uploadsToday: 0, history: [], dispatched: {} };
  if (fs.existsSync(STATE_FILE)) {
    const loaded = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return { ...defaults, ...loaded };
  }
  return defaults;
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

// ═══════════════════════════════════════════════════════
// 🚀 DISPATCH ONE TOPIC TO ALL PLATFORMS
// ═══════════════════════════════════════════════════════
function dispatchTopic(topic, state) {
  const topicDir = path.join(BASE, topic);
  const render = path.join(topicDir, 'final-render.mp4');
  const results = { topic, youtube: false, instagram: false, facebook: false, x: false, threads: false };

  if (!fs.existsSync(render)) {
    console.log(`[SKIP] ${topic}: No video ready.`);
    return results;
  }

  console.log(`\n${'='.repeat(55)}`);
  console.log(`[DISPATCH] ${topic}`);
  console.log(`${'='.repeat(55)}`);

  const today = getToday();
  if (state.lastUploadDate !== today) { state.lastUploadDate = today; state.uploadsToday = 0; }

  // 1. YOUTUBE (quota-aware)
  if (state.uploadsToday < MAX_YT_UPLOADS) {
    try {
      const out = execSync(`node scripts/youtube-official-uploader.mjs --topic "${topic}"`, { encoding: 'utf8' });
      if (out.includes('exceeded the number of videos')) {
        console.log('[YT] Quota reached for today.');
        state.uploadsToday = MAX_YT_UPLOADS;
      } else {
        state.uploadsToday++;
        if (!Array.isArray(state.history)) state.history = [];
        state.history.push({ topic, date: new Date().toISOString(), platform: 'youtube' });
        results.youtube = true;
        console.log(`[YT] Uploaded (${state.uploadsToday}/${MAX_YT_UPLOADS} today)`);
      }
    } catch (e) {
      const msg = e.stdout || e.message || '';
      if (msg.includes('exceeded')) { console.log('[YT] Quota reached for today.'); state.uploadsToday = MAX_YT_UPLOADS; }
      else { console.log(`[YT] Failed: ${String(msg).slice(0, 100)}`); }
    }
  } else {
    console.log(`[YT] Quota full for today. Queued.`);
  }

  // 2. INSTAGRAM + FACEBOOK (Meta)
  if (process.env.META_ACCESS_TOKEN) {
    try {
      execSync(`node scripts/meta-official-uploader.mjs --topic "${topic}"`, { encoding: 'utf8', stdio: 'inherit' });
      results.instagram = true; results.facebook = true;
    } catch (e) { console.log(`[META] Failed: ${e.message.slice(0, 80)}`); }
  } else { console.log('[META] Skipped: META_ACCESS_TOKEN not set.'); }

  // 3. X (TWITTER) THREAD
  if (process.env.X_API_KEY) {
    try {
      execSync(`node scripts/x-twitter-uploader.mjs --topic "${topic}"`, { encoding: 'utf8', stdio: 'inherit' });
      results.x = true;
    } catch (e) { console.log(`[X] Failed: ${e.message.slice(0, 80)}`); }
  } else { console.log('[X] Skipped: X_API_KEY not set.'); }

  // 4. THREADS (skipped - using IG auto-share instead)
  if (process.env.THREADS_ACCESS_TOKEN && process.env.THREADS_ACCESS_TOKEN !== 'your_threads_user_token_here') {
    try {
      execSync(`node scripts/threads-uploader.mjs --topic "${topic}"`, { encoding: 'utf8', stdio: 'inherit' });
      results.threads = true;
    } catch (e) { console.log(`[Threads] Failed: ${e.message.slice(0, 80)}`); }
  } else { console.log('[Threads] Skipped: Using Instagram auto-share to Threads.'); }

  // Mark dispatched
  if (!state.dispatched) state.dispatched = {};
  state.dispatched[topic] = new Date().toISOString();
  saveState(state);

  console.log(`\n[RESULT] ${topic}: YT=${results.youtube} | IG=${results.instagram} | X=${results.x} | Threads=${results.threads}`);
  return results;
}

// ═══════════════════════════════════════════════════════
// 🔱 MAIN
// ═══════════════════════════════════════════════════════
async function main() {
  const state = loadState();
  const singleTopic = getArg('--topic');
  const dispatchAll = process.argv.includes('--all');

  console.log('\n====================================================');
  console.log('  AAK NATION GLOBAL SOCIAL DISPATCHER');
  console.log('====================================================');
  console.log(`  YouTube Quota: ${state.uploadsToday}/${MAX_YT_UPLOADS} used today`);
  console.log(`  Meta: ${process.env.META_ACCESS_TOKEN ? 'CONNECTED' : 'NOT SET'}`);
  console.log(`  X:    ${process.env.X_API_KEY ? 'CONNECTED' : 'NOT SET'}`);
  console.log(`  Threads: ${process.env.THREADS_ACCESS_TOKEN ? 'CONNECTED' : 'NOT SET'}`);
  console.log('====================================================\n');

  if (singleTopic) {
    dispatchTopic(singleTopic, state);
  } else if (dispatchAll) {
    let total = 0;
    for (const topic of TOPICS) {
      const render = path.join(BASE, topic, 'final-render.mp4');
      if (fs.existsSync(render)) {
        dispatchTopic(topic, state);
        total++;
        await new Promise(r => setTimeout(r, 3000)); // 3s between dispatches
      }
    }
    console.log(`\n[DONE] Dispatched ${total} topics across all connected platforms.`);
  } else {
    console.log('Usage:');
    console.log('  node scripts/social-dispatcher.mjs --topic <TopicName>');
    console.log('  node scripts/social-dispatcher.mjs --all');
  }
}

main();
