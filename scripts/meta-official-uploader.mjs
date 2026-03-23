import 'dotenv/config';
import fs from 'fs';
import path from 'path';

/**
 * 🔱 AAK NATION: META SOCIAL EMPIRE UPLOADER
 * Uploads 4K Reels to Instagram + Facebook automatically.
 *
 * SETUP (one-time):
 *   1. Go to https://developers.facebook.com/ → Create App → "Business" type
 *   2. Add "Instagram Graph API" and "Pages API" products
 *   3. Generate a Page Access Token (long-lived, 60-day)
 *   4. Add these to your .env or GitHub secrets:
 *      META_ACCESS_TOKEN=your_page_access_token
 *      META_IG_ACCOUNT_ID=your_instagram_business_account_id
 *      META_FB_PAGE_ID=your_facebook_page_id
 *
 * Usage: node scripts/meta-official-uploader.mjs --topic SuccessCodes
 */

const BASE = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics');
const META_API = 'https://graph.facebook.com/v19.0';

const ACCESS_TOKEN   = process.env.META_ACCESS_TOKEN;
const IG_ACCOUNT_ID  = process.env.META_IG_ACCOUNT_ID;
const FB_PAGE_ID     = process.env.META_FB_PAGE_ID;

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// ═══════════════════════════════════════════════════════
// 📜 TOPIC HOOKS — Platform-specific captions
// ═══════════════════════════════════════════════════════
const HOOKS = {
  SuccessCodes:   { ig: '🙏 Lord Ganesha removes every obstacle on your path to success. Ancient wisdom. Modern success. 🔱 Follow @AAKNation for daily codes. #GaneshaBlessings #SuccessMindset #Motivation #4K #AAKNation', fb: 'Lord Ganesha is not just a deity — He is the universal protocol for removing obstacles. Drop a 🙏 if you believe in his blessings. Follow AAK Nation for daily success codes.' },
  WealthWizards:  { ig: '💰 AI is rewriting the rules of finance RIGHT NOW. Are you keeping up? 🤖📈 Follow @AAKNation for wealth strategies. #WealthBuilding #AIFinance #Investing #Money #AAKNation', fb: 'The financial world is being completely disrupted by AI. Those who adapt will thrive. Those who don\'t will be left behind. Follow AAK Nation for the wealth codes that actually work.' },
  MysteryArchive: { ig: '🔍 Some cases were never meant to be solved... but the data tells a different story. 😱 Follow @AAKNation. #MysteryArchive #ColdCase #TrueCrime #UnsolvedMysteries #AAKNation', fb: 'Hidden in plain sight. The truth behind this unsolved case will shock you. Drop a 🔍 if you love digging for the truth. Follow AAK Nation for more.' },
  PlayfulPixels:  { ig: '🌈 Learning has NEVER looked this colorful! Watch your child\'s eyes light up! ✨ Follow @AAKNation. #KidsLearning #Educational #3DAnimation #PlayfulPixels #AAKNation', fb: 'Make learning FUN again! Our 3D animated lessons for kids are designed to spark curiosity and love for knowledge. Share this with a parent who needs this! 🌈' },
  ZenGarden:      { ig: '🧘 Close your eyes. Breathe in. Let the ambient frequencies restore your focus. 💎 Follow @AAKNation. #Meditation #Ambient #ZenGarden #Focus #AAKNation', fb: 'Stressed? Overwhelmed? Take 60 seconds to let this wash over you. Your nervous system will thank you. Follow AAK Nation for daily peace. 🧘' },
  FutureTech:     { ig: '⚡ The silicon revolution is ALREADY here. This chip will change everything. 🔬 Follow @AAKNation. #FutureTech #AI #Silicon #Hardware #AAKNation', fb: 'This tiny chip is more powerful than the computers that sent humans to the moon. The hardware revolution is here. Follow AAK Nation to stay ahead of the curve.' },
  DailyStoic:     { ig: '⚔️ You cannot control the storm. But you CAN build a mind that weathers anything. 🧠 Follow @AAKNation. #Stoicism #Mindset #Resilience #DailyStoic #AAKNation', fb: 'Stoic wisdom for a modern world. Marcus Aurelius had no idea we\'d be applying his philosophy in 2025 — but it works better than ever. Drop a ⚔️ if you agree.' },
  CookingCzar:    { ig: '🔬 What if your kitchen was a laboratory? Science you can actually taste. 🍽️ Follow @AAKNation. #MolecularGastronomy #CookingScience #FoodTech #CookingCzar #AAKNation', fb: 'Food science meets culinary art. This dish was engineered for maximum flavor at the molecular level. Share this with a foodie who\'ll appreciate it!' },
  TravelTrek:     { ig: '🌏 Some landscapes should NOT exist. Yet here they are in breathtaking 4K. 😮 Follow @AAKNation. #TravelTrek #8K #Nature #Wanderlust #AAKNation', fb: 'This place feels like it\'s from another planet. But it\'s right here on Earth. Tag someone you\'d visit this with! 🌏' },
  AutoArena:      { ig: '🏎️ Zero to sixty in 3 seconds. Engineering at the BLEEDING edge of speed. ⚡ Follow @AAKNation. #AutoArena #Supercar #Engineering #Cars #AAKNation', fb: 'This is not just a car. It\'s a piece of mobile art engineering. Drop a 🏎️ if this is your dream machine.' },
  GamingGuru:     { ig: '🎮 The meta just SHIFTED. Did you catch it? The billion-dollar strategy behind the update. 🧠 Follow @AAKNation. #Gaming #MetaShift #Esports #GamingGuru #AAKNation', fb: 'Every major game update has a hidden financial strategy behind it. We decode it so you can play smarter. Follow AAK Nation for the gaming intelligence edge.' },
  NatureNook:     { ig: '🦋 Nature does not hurry. Yet everything is accomplished. Witness animal intelligence. ✨ Follow @AAKNation. #NatureNook #Wildlife #4K #Animals #AAKNation', fb: 'The natural world is more intelligent than we give it credit for. Watch this and tell me animals don\'t have feelings. Tag a nature lover 🦋' },
  PulsePolitics:  { ig: '🌍 The world map is being redrawn RIGHT NOW. Power shifts. Alliances break. 📡 Follow @AAKNation. #Geopolitics #WorldNews #PulsePolitics #GlobalAffairs #AAKNation', fb: 'The geopolitical chessboard has just made a major move. Here\'s what it means for you, your country, and your investments. Follow AAK Nation for the analysis.' },
  CinemaScope:    { ig: '🎬 Every great film hides a secret in its structure. We decode the invisible architecture. 🎥 Follow @AAKNation. #FilmTheory #Cinema #CinemaScope #Storytelling #AAKNation', fb: 'The greatest films ever made all share a hidden structural secret. Once you see it, you cannot unsee it. Follow AAK Nation for film theory that blows your mind.' },
  LifeHacks:      { ig: '🧬 Your body is a SYSTEM. Time to optimize it. Bio-hacking for peak performance. ⚡ Follow @AAKNation. #Biohacking #Productivity #LifeHacks #Performance #AAKNation', fb: 'These are not your average life hacks. These are science-backed, biologically optimized protocols for peak human performance. Follow AAK Nation for your daily upgrade.' },
  MindfulMinutes: { ig: '🧠 60 seconds. That\'s all you need to completely reset your nervous system. Try it. 🌊 Follow @AAKNation. #Mindfulness #MindfulMinutes #StressRelief #Breathwork #AAKNation', fb: 'One minute. That is ALL it takes. Try this micro-meditation and tell me how you feel after. Follow AAK Nation for your daily mind reset. 🧠' },
  GadgetGrab:     { ig: '🔩 Inside this chip is a universe of logic. We tear apart the tech the world depends on. ⚡ Follow @AAKNation. #GadgetGrab #EDC #Hardware #TechTear #AAKNation', fb: 'We tore this apart so you don\'t have to. What\'s inside will shock you. Follow AAK Nation for the deepest hardware dives on the internet.' },
  PetParade:      { ig: '🐾 They don\'t speak our language. But they understand EVERYTHING about love. 🥺 Follow @AAKNation. #PetParade #Animals #PetLove #Wholesome #AAKNation', fb: 'This moment is going to make your entire day. Drop a ❤️ if this melted your heart. Share with a fellow pet parent 🐾' },
  HistoryHub:     { ig: '📜 Empires rise. Empires fall. The pattern NEVER changes. What can we learn? 🏛️ Follow @AAKNation. #History #HistoryHub #Empires #AncientHistory #AAKNation', fb: 'History is not the past — it\'s a mirror of the present. Every empire that fell made the same mistakes. Are we doing the same? Follow AAK Nation for the historical intelligence edge.' },
  ForgeCore:      { ig: '⚙️ This is where it all BEGINS. The Crucible AI Empire. Built from nothing. Running everything. 🔱 Follow @AAKNation. #ForgeCore #AI #Automation #CrucibleEmpire #AAKNation', fb: 'We built an automated content empire from scratch using only AI and determination. This is how it works. Follow AAK Nation — the genesis of a new kind of media.' },
};

// ═══════════════════════════════════════════════════════
// 🔧 API HELPERS
// ═══════════════════════════════════════════════════════
async function apiCall(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const json = await res.json();
  if (json.error) throw new Error(`Meta API: ${json.error.message} (code ${json.error.code})`);
  return json;
}

// Upload a local video file using Meta's resumable upload API
async function uploadVideoFile(videoPath, uploadUrl) {
  const fileSize = fs.statSync(videoPath).size;
  const fileStream = fs.createReadStream(videoPath);
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `OAuth ${ACCESS_TOKEN}`,
      'offset': '0',
      'file_size': String(fileSize),
    },
    body: fileStream,
    duplex: 'half',
  });
  const json = await res.json();
  if (json.error) throw new Error(`Meta Upload: ${json.error.message} (code ${json.error.code})`);
  return json;
}

// ═══════════════════════════════════════════════════════
// 📸 INSTAGRAM REELS UPLOAD (URL mode for server, binary for local)
// ═══════════════════════════════════════════════════════
async function uploadToInstagram(videoPath, caption) {
  const videoName = path.basename(path.dirname(videoPath)); // topic name
  const publicBaseUrl = process.env.META_VIDEO_BASE_URL;
  const useUrl = publicBaseUrl && publicBaseUrl.startsWith('http');

  console.log(`[IG] Creating media container (${useUrl ? 'URL mode' : 'binary mode'})...`);

  let containerId, uploadUrl;

  if (useUrl) {
    // Server mode: pass public URL directly (GitHub Actions / Vercel CDN)
    const videoUrl = `${publicBaseUrl.replace(/\/$/, '')}/${videoName}/final-render.mp4`;
    console.log(`[IG] Using URL: ${videoUrl}`);
    const initRes = await apiCall(
      `${META_API}/${IG_ACCOUNT_ID}/media?access_token=${ACCESS_TOKEN}`,
      'POST',
      { media_type: 'REELS', video_url: videoUrl, caption, share_to_feed: true }
    );
    containerId = initRes.id;
  } else {
    // Local mode: binary resumable upload
    const initRes = await apiCall(
      `${META_API}/${IG_ACCOUNT_ID}/media?access_token=${ACCESS_TOKEN}`,
      'POST',
      { media_type: 'REELS', caption, share_to_feed: true, upload_type: 'resumable' }
    );
    containerId = initRes.id;
    uploadUrl   = initRes.uri;
    console.log(`[IG] Container: ${containerId}. Uploading binary...`);
    await uploadVideoFile(videoPath, uploadUrl);
    console.log(`[IG] Binary uploaded. Waiting for processing...`);
  }

  // Step 3: Poll until ready
  let status = 'IN_PROGRESS';
  let attempts = 0;
  while (status === 'IN_PROGRESS' && attempts < 30) {
    await new Promise(r => setTimeout(r, 10000));
    const check = await apiCall(
      `${META_API}/${containerId}?fields=status_code&access_token=${ACCESS_TOKEN}`
    );
    status = check.status_code;
    attempts++;
    console.log(`[IG] Status: ${status} (attempt ${attempts})`);
  }
  if (status !== 'FINISHED') throw new Error(`[IG] Processing failed: ${status}`);

  // Step 4: Publish
  const publish = await apiCall(
    `${META_API}/${IG_ACCOUNT_ID}/media_publish?access_token=${ACCESS_TOKEN}`,
    'POST',
    { creation_id: containerId }
  );
  console.log(`[IG] Published! Media ID: ${publish.id}`);
  return publish.id;
}

// ═══════════════════════════════════════════════════════
// 📘 FACEBOOK REELS UPLOAD (URL mode for server, binary for local)
// ═══════════════════════════════════════════════════════
async function uploadToFacebook(videoPath, caption) {
  const videoName = path.basename(path.dirname(videoPath));
  const publicBaseUrl = process.env.META_VIDEO_BASE_URL;
  const useUrl = publicBaseUrl && publicBaseUrl.startsWith('http');

  console.log(`[FB] Uploading Reel (${useUrl ? 'URL mode' : 'binary mode'})...`);

  // Step 1: Start upload session
  const init = await apiCall(
    `${META_API}/${FB_PAGE_ID}/video_reels?access_token=${ACCESS_TOKEN}`,
    'POST',
    { upload_phase: 'start' }
  );
  const videoId   = init.video_id;
  const uploadUrl = init.upload_url;
  console.log(`[FB] Video ID: ${videoId}.`);

  if (useUrl) {
    // Server mode: tell Meta to pull from public URL
    const videoUrl = `${publicBaseUrl.replace(/\/$/, '')}/${videoName}/final-render.mp4`;
    console.log(`[FB] Using URL: ${videoUrl}`);
    await apiCall(uploadUrl, 'POST', { file_url: videoUrl });
  } else {
    // Local mode: upload binary directly
    console.log(`[FB] Uploading binary...`);
    await uploadVideoFile(videoPath, uploadUrl);
  }
  console.log(`[FB] Upload done. Publishing...`);

  // Step 2: Finish + publish
  const finish = await apiCall(
    `${META_API}/${FB_PAGE_ID}/video_reels?access_token=${ACCESS_TOKEN}`,
    'POST',
    { video_id: videoId, upload_phase: 'finish', video_state: 'PUBLISHED', description: caption }
  );
  console.log(`[FB] Published! Result: ${JSON.stringify(finish)}`);
  return videoId;
}

// ═══════════════════════════════════════════════════════
// 🚀 MAIN DISPATCHER
// ═══════════════════════════════════════════════════════
async function uploadToMeta() {
  const topicName = getArg('--topic');
  if (!topicName) { console.error('Usage: node meta-official-uploader.mjs --topic <Topic>'); process.exit(1); }

  if (!ACCESS_TOKEN || !IG_ACCOUNT_ID) {
    console.error('❌ Missing META_ACCESS_TOKEN or META_IG_ACCOUNT_ID env vars.');
    console.error('   Add these to your .env file or GitHub Actions secrets.');
    process.exit(1);
  }

  const topicDir = path.join(BASE, topicName);
  const videoPath = path.join(topicDir, 'final-render.mp4');
  
  if (!fs.existsSync(videoPath)) {
    console.error(`❌ No video found at: ${videoPath}`);
    process.exit(1);
  }

  const hook = HOOKS[topicName] || HOOKS['SuccessCodes'];
  console.log(`\n[AAK Nation] Meta Upload: ${topicName}`);
  console.log('='.repeat(50));

  // Upload to Instagram
  try {
    const igId = await uploadToInstagram(videoPath, hook.ig);
    console.log(`[OK] Instagram Reel live: ID ${igId}`);
  } catch (e) { console.error(`[FAIL] Instagram: ${e.message}`); }

  // Upload to Facebook
  if (FB_PAGE_ID) {
    try {
      const fbId = await uploadToFacebook(videoPath, hook.fb);
      console.log(`[OK] Facebook Reel live: ID ${fbId}`);
    } catch (e) { console.error(`[FAIL] Facebook: ${e.message}`); }
  } else {
    console.log('[SKIP] Facebook: META_FB_PAGE_ID not set.');
  }
}

uploadToMeta();
