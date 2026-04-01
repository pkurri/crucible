#!/usr/bin/env node

/**
 * cinematic-ig-loop.mjs
 * 
 * NEXT-GEN CINEMATIC PIPELINE (Instagram Edition):
 * This is a SEPARATE AUTOMATION for CognitiveShadows Instagram.
 * It strictly adheres to Meta/Instagram uploading constraints and its own timeframe schedule
 * completely isolated from the YouTube loop.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration specific for IG to prevent overlap with YouTube
const STATE_FILE = join(__dirname, 'cinematic-ig-state.json');
const LTX_CREDS = join(__dirname, 'ltx-credentials.json');
const MIN_HOURS_BETWEEN_UPLOADS = 5; // Slightly longer for Instagram algorithm matching
const MAX_DAILY_UPLOADS = 2; // Keep Instagram feed highly curated
const IG_ACCOUNT = "CognitiveShadows-IG";

// Simulated topics geared towards IG audiences
const TOPICS = [
  "Shadow Work Fundamentals",
  "Cognitive Empathy in AI",
  "The Dark Triad Code",
  "Hypnotic UI Patterns",
  "Digital Ascendance",
  "Neural Manipulation Tactics"
];

// --- State Management ---
function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  return { lastUploadTime: null, uploadsToday: 0, lastDate: null, history: [] };
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

const TRENDING_AESTHETICS = [
  "Dark Academia, volumetric fog, moody lighting",
  "Cyberpunk Dystopia, high-contrast neon, glitch elements",
  "Hyper-Realistic Corporate Noir, deep shadows, cinematic",
  "Ethereal Vaporwave, soft pastels, dreamlike state",
  "Gritty Cinematic Realism, 35mm film grain, muted colors",
  "Liminal Space, unsettling calm, fluorescent lighting, minimalist"
];

// --- Next-Gen Generators ---

async function generateOpenArtAssets(topic, aesthetic) {
  console.log(`\n🎨 [OpenArt] Generating high-contrast consistent assets for IG: ${topic}`);
  console.log(`   ✅ Dynamic Trend Applied: ${aesthetic}`);
  return [`/mock/openart/ig_base_1.png`];
}

async function generateLTXVideo(topic, baseImages, aesthetic) {
  console.log(`\n🎬 [LTX Studio] Rendering Instagram Reel sequence for: ${topic}`);
  let ltxKey = "MISSING_KEY";
  if (existsSync(LTX_CREDS)) {
    ltxKey = JSON.parse(readFileSync(LTX_CREDS, 'utf-8')).api_key;
  } else {
    console.error("   ❌ Missing ltx-credentials.json.");
    return false;
  }

  console.log(`   🎥 Payload: Applying specific visual style: [${aesthetic}]`);
  // Simulating LTX generation targeted for 9:16 vertical fast-paced reels
  await new Promise(r => setTimeout(r, 2000));
  console.log(`   ✅ IG-Optimized Video Render Complete.`);
  return true;
}

// --- Final Build & Meta Upload ---

async function composeAndUpload(topic) {
  const baseDir = join(process.cwd(), 'data', 'cinematic-empire', IG_ACCOUNT, 'topics', topic.replace(/\s+/g, ''));
  mkdirSync(baseDir, { recursive: true });

  const finalVideoPath = join(baseDir, 'final-render.mp4');

  console.log(`\n🎞️ [FFmpeg] Formatting Reel audio/video for IG algorithms...`);
  // Creating dummy file for testing the pipeline
  writeFileSync(finalVideoPath, "MOCK_VIDEO_DATA");
  
  console.log(`\n🚢 [Meta Distribution] Handing over to existing Meta Uploader...`);
  try {
    // Calls the existing Meta script, enforcing INSTAGRAM ONLY uploads on the separate data directory
    execSync(`node scripts/meta-official-uploader.mjs --topic "${topic.replace(/\s+/g, '')}" --target insta --basedir "data/cinematic-empire/${IG_ACCOUNT}/topics"`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error(`   ❌ Instagram Upload failed: ${err.message}`);
    return false;
  }
}

// --- Main Execution ---

async function main() {
  console.log('==================================================');
  console.log('🌌 Cinematic Empire | Instagram Edition (LTX/OpenArt)');
  console.log('==================================================\n');

  const state = loadState();
  const today = getTodayString();

  if (state.lastDate !== today) {
    state.uploadsToday = 0;
    state.lastDate = today;
  }

  if (state.uploadsToday >= MAX_DAILY_UPLOADS) {
    console.log(`✅ Daily Quota Reached (${MAX_DAILY_UPLOADS}/${MAX_DAILY_UPLOADS}). Holding until tomorrow.`);
    process.exit(0);
  }

  if (state.lastUploadTime) {
    const hoursSince = (Date.now() - new Date(state.lastUploadTime).getTime()) / (1000 * 60 * 60);
    if (hoursSince < MIN_HOURS_BETWEEN_UPLOADS) {
      console.log(`⏳ Timeframe Check: Only ${hoursSince.toFixed(2)}h elapsed since last IG upload.`);
      console.log(`   Waiting for the full ${MIN_HOURS_BETWEEN_UPLOADS}h gap. Safely exiting.`);
      process.exit(0);
    }
  }

  console.log(`✅ Timeframe cleared. Uploads today: ${state.uploadsToday}/${MAX_DAILY_UPLOADS}.`);

  const shift = (Date.now() + state.uploadsToday) % TOPICS.length;
  const targetTopic = TOPICS[shift];

  const aesthetic = TRENDING_AESTHETICS[(Date.now() + shift) % TRENDING_AESTHETICS.length];

  const openArtImages = await generateOpenArtAssets(targetTopic, aesthetic);
  const ltxSuccess = await generateLTXVideo(targetTopic, openArtImages, aesthetic);

  if (!ltxSuccess) {
    console.log('❌ Generative pipeline failed. Aborting schedule.');
    process.exit(1);
  }

  const uploadSuccess = await composeAndUpload(targetTopic);

  if (uploadSuccess) {
    state.lastUploadTime = new Date().toISOString();
    state.uploadsToday += 1;
    state.history.push({
      topic: targetTopic,
      date: state.lastUploadTime,
      type: "IG Reel"
    });
    
    if (state.history.length > 50) state.history.shift();
    saveState(state);
    console.log('\n✅ Pipeline complete & IG state synced.');
  }
}

main().catch(console.error);
