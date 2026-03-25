import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🏛️ EMPIRE CYCLE CORE — Shared Production Logic
 * Used by facebook-empire-loop, instagram-empire-loop, youtube-empire-loop.
 * Contains: state management, niche picking, asset generation, video production.
 * Upload logic stays platform-specific in each loop.
 */

const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');
const SIX_DAYS_MS = 1000 * 60 * 60 * 24 * 6;

// ── State Management ─────────────────────────────────────────────────────────

export function loadState(stateFile) {
  if (fs.existsSync(stateFile)) {
    try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch {}
  }
  return { lastUploadDate: '', uploadsToday: 0, history: [] };
}

export function saveState(stateFile, state) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

// ── Cleanup old uploaded markers ──────────────────────────────────────────────

export function cleanupOldVideos(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  for (const topicName of fs.readdirSync(baseDir)) {
    const uploadedDir = path.join(baseDir, topicName, 'uploaded');
    if (!fs.existsSync(uploadedDir)) continue;
    for (const file of fs.readdirSync(uploadedDir)) {
      const filePath = path.join(uploadedDir, file);
      if (Date.now() - fs.statSync(filePath).mtimeMs > SIX_DAYS_MS) {
        fs.unlinkSync(filePath);
      }
    }
  }
}

// ── Pick top niches via smart-niche-picker ────────────────────────────────────

export function pickTopNiches(platform = 'meta', count = 20) {
  if (!fs.existsSync(NICHES_FILE)) return [];
  try {
    const result = execSync(`node scripts/smart-niche-picker.mjs pick ${platform} ${count}`, { encoding: 'utf8' });
    const match = result.match(/JSON_OUTPUT: (\[.*\])/);
    const names = match ? JSON.parse(match[1]) : [];
    const registry = JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8'));
    return names.map(name => registry.niches.find(n => n.name === name)).filter(Boolean);
  } catch (e) {
    console.warn(`⚠️ [Core] Niche picker failed: ${e.message}. Falling back to registry order.`);
    const registry = JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8'));
    return (registry.niches || []).slice(0, count);
  }
}

// ── Main production cycle ─────────────────────────────────────────────────────
/**
 * @param {object} opts
 * @param {string}   opts.platform        - 'facebook' | 'instagram' | 'youtube'
 * @param {string}   opts.label           - display label e.g. '📘 Facebook'
 * @param {string}   opts.baseDir         - full path to topics dir
 * @param {string}   opts.stateFile       - full path to state JSON
 * @param {number}   opts.maxUploads      - daily upload cap
 * @param {string}   opts.nichePool       - picker platform key: 'meta' | 'youtube'
 * @param {string}   opts.producerPlatform - passed to --platform flag of producer
 * @param {Function} opts.uploadFn        - async (topic, topicDir, state, stateFile) => boolean
 * @param {string}   opts.uploadMarker    - filename inside uploaded/ e.g. 'facebook.json'
 */
export async function runProductionCycle(opts) {
  const {
    platform, label, baseDir, stateFile, maxUploads,
    nichePool, producerPlatform, uploadFn, uploadMarker,
  } = opts;

  const state = loadState(stateFile);
  const today = getToday();

  if (state.lastUploadDate !== today) {
    state.lastUploadDate = today;
    state.uploadsToday = 0;
  }

  const remaining = maxUploads - state.uploadsToday;
  console.log(`\n${label} EMPIRE CYCLE — ${new Date().toLocaleString()}`);

  if (!fs.existsSync(NICHES_FILE)) {
    console.error('❌ [Core] No niches found. Run niche-strategist.mjs first.');
    return;
  }

  const niches = pickTopNiches(nichePool, 20);
  console.log(`📊 Quota: ${state.uploadsToday}/${maxUploads} used today. Found ${niches.length} niches.`);
  console.log('═'.repeat(60));

  cleanupOldVideos(baseDir);

  if (remaining <= 0) {
    console.log(`⚠️ Daily ${platform} upload quota reached. Skipping.`);
    return;
  }

  let produced = 0, uploaded = 0;

  for (const niche of niches) {
    if (state.uploadsToday >= maxUploads) break;

    const topic = niche.name;
    const topicDir = path.join(baseDir, topic);
    const assetDir = path.join(topicDir, 'assets');
    const uploadedDir = path.join(topicDir, 'uploaded');
    const markerFile = path.join(uploadedDir, uploadMarker);

    // ── Duplicate guard ────────────────────────────────────────────────
    const alreadyUploaded = state.history.some(
      h => h.topic === topic && h.platform === platform && h.date?.split('T')[0] === today
    );
    if (fs.existsSync(markerFile) || alreadyUploaded) {
      console.log(`⏭️  [${topic}] Already posted today on ${platform}. Skipping.`);
      continue;
    }

    // ── Fresh asset dir ────────────────────────────────────────────────
    if (fs.existsSync(assetDir)) {
      console.log(`🧹 [${topic}] Clearing stale assets...`);
      fs.rmSync(assetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(assetDir, { recursive: true });
    fs.mkdirSync(uploadedDir, { recursive: true });

    // ── Step 1: Assets ─────────────────────────────────────────────────
    console.log(`🎨 [${topic}] Generating assets...`);
    try {
      execSync(`node scripts/autonomous-asset-generator.mjs --topic "${topic}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ [${topic}] Asset generation failed.`);
      continue;
    }

    // ── Step 2: Viral script ───────────────────────────────────────────
    console.log(`✍️  [${topic}] Generating viral script...`);
    try {
      execSync(`node scripts/viral-script-architect.mjs --topic "${topic}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ [${topic}] Script generation failed.`);
      continue;
    }

    // ── Step 3: Video production ───────────────────────────────────────
    console.log(`🎬 [${topic}] Producing video...`);
    try {
      execSync(
        `node scripts/empire-4k-producer.mjs --topic "${topic}" --platform ${producerPlatform} --basedir "${baseDir}"`,
        { stdio: 'inherit' }
      );
      produced++;
    } catch (e) {
      console.error(`❌ [${topic}] Production failed.`);
      continue;
    }

    // ── Step 4: Upload (platform-specific callback) ────────────────────
    console.log(`🚀 [${topic}] Uploading to ${platform}... (${state.uploadsToday + 1}/${maxUploads})`);
    const success = await uploadFn(topic, topicDir, state, stateFile);
    if (success) {
      const freshState = loadState(stateFile);
      freshState.uploadsToday++;
      freshState.history.push({ topic, platform, date: new Date().toISOString() });
      saveState(stateFile, freshState);
      state.uploadsToday = freshState.uploadsToday;
      uploaded++;
    }
  }

  saveState(stateFile, state);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏆 ${platform.toUpperCase()} CYCLE COMPLETE: ${produced} produced, ${uploaded} uploaded.`);
}
