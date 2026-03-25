import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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

// --basedir flag overrides default; each platform loop passes its own folder
const BASE = (() => {
  const idx = process.argv.indexOf('--basedir');
  return idx !== -1 ? process.argv[idx + 1] : path.join(process.cwd(), 'data', 'meta-empire', 'AAK-Nation', 'topics');
})();
const META_API = 'https://graph.facebook.com/v19.0';

const USER_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const IG_ACCOUNT_ID     = process.env.META_IG_ACCOUNT_ID;
const FB_PAGE_ID        = process.env.META_FB_PAGE_ID;

// Mutable: will be upgraded to Page Access Tokens after exchange
let ACCESS_TOKEN = USER_ACCESS_TOKEN;
let FB_PAGE_TOKEN = USER_ACCESS_TOKEN;

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// 🏛️ Metadata will be loaded dynamically in uploadToMeta()


// ═══════════════════════════════════════════════════════
// 🔧 API HELPERS WITH RATE LIMIT HANDLING (AUTO-HEALING)
// ═══════════════════════════════════════════════════════
const MAX_RETRIES = 5;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkRateLimitHeaders(res) {
  const metaUsage = res.headers.get('x-app-usage') || res.headers.get('x-business-usecase-usage') || res.headers.get('x-ig-app-usage');
  if (metaUsage) {
    try {
      const usage = JSON.parse(metaUsage);
      const maxUsage = Math.max(...Object.values(usage).map(Number).filter(n => !isNaN(n)));
      if (maxUsage > 85) { 
        console.warn(`🛑 [CRITICAL RATE LIMIT] Meta App Limit at ${maxUsage}%. Cooldown 120s.`);
        return 120000; 
      }
      if (maxUsage > 70) {
        console.warn(`⚠️ [HIGH RATE LIMIT] Meta App Limit at ${maxUsage}%. Cooldown 60s.`);
        return 60000;
      }
      if (maxUsage > 40) {
        console.log(`📡 [MODERATE USAGE] Meta App Limit at ${maxUsage}%. Adding 10s buffer.`);
        return 10000;
      }
    } catch (e) { /* ignore parse errors */ }
  }
  return 2000; // Base 2s sleep to preserve quota
}

// ── Page Token Exchange ──────────────────────────────────────────────────────
// Facebook video_reels requires a Page Access Token, not a User token.
// This exchanges the user token for the page-specific token automatically.
async function exchangeForPageToken(pageId, userToken) {
  try {
    const res = await fetch(`${META_API}/${pageId}?fields=access_token&access_token=${userToken}`);
    const data = await res.json();
    if (data.access_token) {
      console.log(`[Auth] Page Access Token acquired for Page ${pageId}.`);
      return data.access_token;
    }
    console.warn(`[Auth] Page token exchange returned no token. Using original token.`);
  } catch (e) {
    console.warn(`[Auth] Page token exchange failed: ${e.message}. Using original token.`);
  }
  return userToken;
}

async function apiCall(url, method = 'GET', body = null, retryCount = 0) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  
  const res = await fetch(url, opts);
  
  // Dynamic Auto-Healing Rate Limit
  const waitMs = checkRateLimitHeaders(res);
  if (waitMs > 0) await sleep(waitMs);
  
  const isRateLimited = res.status === 429;
  let json;
  try { json = await res.json(); } catch (e) { json = {}; }
  
  const metaErrorCode = json.error ? json.error.code : 0;
  const isLimitError = [4, 17, 32, 613].includes(metaErrorCode);

  if (isRateLimited || isLimitError) {
    if (retryCount >= MAX_RETRIES) throw new Error(`Meta API: Failed after ${MAX_RETRIES} retries due to rate limits.`);
    const backoff = Math.pow(2, retryCount) * 60000; // 60s, 120s...
    console.warn(`🛑 [THROTTLED] Meta API Limit Hit (Code ${metaErrorCode}). Backing off ${backoff / 1000}s...`);
    await sleep(backoff);
    return apiCall(url, method, body, retryCount + 1);
  }

  if (json.error) throw new Error(`Meta API: ${json.error.message} (code ${json.error.code})`);
  return json;
}

// Upload a local video file using Meta's resumable upload API
async function uploadVideoFile(videoPath, uploadUrl, retryCount = 0, token = ACCESS_TOKEN) {
  const fileSize = fs.statSync(videoPath).size;
  const fileStream = fs.createReadStream(videoPath);
  
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `OAuth ${token}`,
      'offset': '0',
      'file_size': String(fileSize),
    },
    body: fileStream,
    duplex: 'half',
  });
  
  const waitMs = checkRateLimitHeaders(res);
  if (waitMs > 0) await sleep(waitMs);
  
  let json;
  try { json = await res.json(); } catch(e) { json = {}; }
  
  const isRateLimited = res.status === 429 || (json.error && [4, 17, 32, 613].includes(json.error.code));
  if (isRateLimited) {
    if (retryCount >= MAX_RETRIES) throw new Error(`Meta Upload: Failed after ${MAX_RETRIES} retries due to rate limits.`);
    const backoff = Math.pow(2, retryCount) * 60000;
    console.warn(`🛑 [BINARY THROTTLE] Delaying upload. Backing off ${backoff / 1000}s...`);
    await sleep(backoff);
    return uploadVideoFile(videoPath, uploadUrl, retryCount + 1, token);
  }

  if (json.error) throw new Error(`Meta Upload: ${json.error.message} (code ${json.error.code})`);
  return json;
}

// ═══════════════════════════════════════════════════════
// 🌐 HIGH-SPEED CDN TUNNEL (Fixes Meta Fwdproxy / Resumable Limits)
// ═══════════════════════════════════════════════════════
function uploadToCatbox(videoPath, retries = 3) {
  console.log(`[CDN] Tunneling video through high-speed CDN to bypass Meta proxy limitations...`);
  for (let i = 0; i < retries; i++) {
    try {
      const cmd = `curl -s -F "reqtype=fileupload" -F "fileToUpload=@${videoPath}" https://catbox.moe/user/api.php`;
      const tmpUrl = execSync(cmd).toString().trim();
      if (tmpUrl && tmpUrl.startsWith('http')) {
        console.log(`[CDN] Tunnel URL acquired: ${tmpUrl}`);
        return tmpUrl;
      }
      console.warn(`[CDN] Attempt ${i + 1} failed. Output: ${tmpUrl}`);
    } catch (e) {
      console.warn(`[CDN] Attempt ${i + 1} error: ${e.message}`);
    }
    if (i < retries - 1) {
      console.log(`[CDN] Waiting 3 seconds before retry...`);
      execSync('node -e "setTimeout(()=>{}, 3000)"');
    }
  }
  throw new Error('CDN Handshake fully failed after 3 attempts.');
}

// ═══════════════════════════════════════════════════════
// 📸 INSTAGRAM REELS UPLOAD (Forced URL Mode)
// ═══════════════════════════════════════════════════════
async function uploadToInstagram(videoPath, caption) {
  const videoName = path.basename(path.dirname(videoPath)); // topic name
  const publicBaseUrl = process.env.META_VIDEO_BASE_URL;
  const useUrl = publicBaseUrl && publicBaseUrl.startsWith('http');

  let videoUrl;
  if (useUrl) {
    videoUrl = `${publicBaseUrl.replace(/\/$/, '')}/${videoName}/final-render.mp4`;
    console.log(`[IG] Using provided domain URL: ${videoUrl}`);
  } else {
    videoUrl = uploadToCatbox(videoPath);
  }

  console.log(`[IG] Creating media container (Cloud-Pull mode)...`);
  const initRes = await apiCall(
    `${META_API}/${IG_ACCOUNT_ID}/media?access_token=${ACCESS_TOKEN}`,
    'POST',
    { media_type: 'REELS', video_url: videoUrl, caption, share_to_feed: true }
  );
  const containerId = initRes.id;
  console.log(`[IG] Container: ${containerId}. Waiting for cloud ingestion...`);

  // Step 3: Poll until ready (Increased to 120 attempts for 4K)
  let status = 'IN_PROGRESS';
  let attempts = 0;
  while (status === 'IN_PROGRESS' && attempts < 120) {
    await sleep(30000); // 30s interval to preserve quota
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
  
  // Mark as uploaded
  const uploadedDir = path.join(path.dirname(videoPath), 'uploaded');
  if (!fs.existsSync(uploadedDir)) fs.mkdirSync(uploadedDir, { recursive: true });
  fs.writeFileSync(path.join(uploadedDir, 'instagram.json'), JSON.stringify({ published_at: new Date().toISOString(), media_id: publish.id }, null, 2));

  return publish.id;
}

// ═══════════════════════════════════════════════════════
// 📘 FACEBOOK REELS UPLOAD (URL mode for server, binary for local)
// ═══════════════════════════════════════════════════════
async function uploadToFacebook(videoPath, caption) {
  const videoName = path.basename(path.dirname(videoPath));
  const publicBaseUrl = process.env.META_VIDEO_BASE_URL;
  const useUrl = publicBaseUrl && publicBaseUrl.startsWith('http');

  // 🛡️ [HANDSHAKE] Verify Facebook Connectivity First
  // Exchange user token for page-specific access token (fixes #200 permission error)
  FB_PAGE_TOKEN = await exchangeForPageToken(FB_PAGE_ID, USER_ACCESS_TOKEN);

  console.log(`[FB] Verifying connectivity for Page ID ${FB_PAGE_ID}...`);
  try {
    const pageCheck = await apiCall(`${META_API}/${FB_PAGE_ID}?fields=name,has_added_app&access_token=${FB_PAGE_TOKEN}`);
    console.log(`✅ [FB] Handshake Verified: ${pageCheck.name} (App Linked: ${pageCheck.has_added_app})`);
    if (process.argv.includes('--verify')) return pageCheck.id;
  } catch (e) {
    throw new Error(`[FB] Handshake FAILED: ${e.message}. Check Page Access Token permissions.`);
  }

  console.log(`[FB] Uploading Reel (${useUrl ? 'URL mode' : 'binary mode'})...`);

  // Step 1: Start upload session
  const init = await apiCall(
    `${META_API}/${FB_PAGE_ID}/video_reels?access_token=${FB_PAGE_TOKEN}`,
    'POST',
    { upload_phase: 'start' }
  );
  const videoId   = init.video_id;
  const uploadUrl = init.upload_url;
  console.log(`[FB] Video ID: ${videoId}.`);

  if (useUrl) {
    // URL-pull mode: pass file_url in the start phase (not to upload_url)
    const videoUrl = `${publicBaseUrl.replace(/\/$/, '')}/${videoName}/final-render.mp4`;
    console.log(`[FB] Pulling from public URL: ${videoUrl}`);
    await apiCall(`${META_API}/${FB_PAGE_ID}/video_reels?access_token=${FB_PAGE_TOKEN}`, 'POST',
      { upload_phase: 'start', file_url: videoUrl });
  } else {
    // Binary upload mode: stream file directly to the resumable upload_url
    console.log(`[FB] Uploading binary to resumable endpoint...`);
    await uploadVideoFile(videoPath, uploadUrl, 0, FB_PAGE_TOKEN);
  }
  console.log(`[FB] Upload done. Publishing...`);

  // Step 2: Finish + publish
  const finish = await apiCall(
    `${META_API}/${FB_PAGE_ID}/video_reels?access_token=${FB_PAGE_TOKEN}`,
    'POST',
    { video_id: videoId, upload_phase: 'finish', video_state: 'PUBLISHED', description: caption }
  );
  console.log(`[FB] Published! Result: ${JSON.stringify(finish)}`);

  // Mark as uploaded
  const uploadedDir = path.join(path.dirname(videoPath), 'uploaded');
  if (!fs.existsSync(uploadedDir)) fs.mkdirSync(uploadedDir, { recursive: true });
  fs.writeFileSync(path.join(uploadedDir, 'facebook.json'), JSON.stringify({ published_at: new Date().toISOString(), video_id: videoId }, null, 2));

  return videoId;
}

// ═══════════════════════════════════════════════════════
// 🛡️ STUDIO GUARDRAILS: PRE-FLIGHT CHECKS
// ═══════════════════════════════════════════════════════
function validateVideo(videoPath) {
  console.log(`🛡️  [Guardrail] Validating video integrity: ${path.basename(videoPath)}...`);
  
  if (!fs.existsSync(videoPath)) {
    throw new Error(`[Guardrail] FAILED: Video file does not exist at ${videoPath}`);
  }

  const stats = fs.statSync(videoPath);
  if (stats.size < 500000) { // 500KB minimum for a 4K/Short reel
    throw new Error(`[Guardrail] FAILED: Rendered file is too small (${stats.size} bytes). Likely a failed render.`);
  }

  // Check for broken render signature (optional but good)
  try {
     const probe = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`).toString().trim();
     const duration = parseFloat(probe);
     if (isNaN(duration) || duration <= 0) {
       throw new Error(`[Guardrail] FAILED: Video duration is invalid (${probe}s).`);
     }
     console.log(`✅ [Guardrail] Integrity Check Passed. Size: ${(stats.size/1024/1024).toFixed(2)}MB | Duration: ${duration}s`);
  } catch (e) {
     console.warn(`⚠️  [Guardrail] FFprobe check skipped or failed: ${e.message}`);
     // If ffprobe is missing in local dev, we still pass based on file size, but fail on explicit errors.
     if (e.message.includes('FAILED')) throw e;
  }
}

// ═══════════════════════════════════════════════════════
// 🚀 MAIN DISPATCHER
// ═══════════════════════════════════════════════════════
async function uploadToMeta() {
  const topicName = getArg('--topic');
  const isVerify = process.argv.includes('--verify');
  
  if (!topicName && !isVerify) { 
    console.error('Usage: node meta-official-uploader.mjs --topic <Topic>'); process.exit(1); 
  }

  if (!ACCESS_TOKEN) {
    console.error('❌ Missing META_ACCESS_TOKEN env var.');
    process.exit(1);
  }

  // 🛡️ [HANDSHAKE] Headless Verification Mode
  if (isVerify) {
    console.log(`📡 [Forge] Headless Handshake Mode Active...`);
    try {
      if (FB_PAGE_ID) {
        const pageCheck = await apiCall(`${META_API}/${FB_PAGE_ID}?fields=name,has_added_app&access_token=${ACCESS_TOKEN}`);
        console.log(`✅ [FB] Handshake Verified: ${pageCheck.name} (App Linked: ${pageCheck.has_added_app})`);
      }
      if (IG_ACCOUNT_ID) {
         const igCheck = await apiCall(`${META_API}/${IG_ACCOUNT_ID}?fields=username,name&access_token=${ACCESS_TOKEN}`);
         console.log(`✅ [IG] Handshake Verified: @${igCheck.username} (${igCheck.name})`);
      }
      process.exit(0);
    } catch (e) {
      console.error(`❌ [Handshake] FAILED: ${e.message}`);
      process.exit(1);
    }
  }

  const topicDir = path.join(BASE, topicName);
  const videoPath = path.join(topicDir, 'final-render.mp4');
  
  if (!fs.existsSync(videoPath)) {
    console.error(`❌ No video found at root or YT paths for topic: ${topicName}`);
    process.exit(1);
  }

  // 🛡️ [GUARDRAIL] Mandatory Pre-Flight Integrity Check
  try {
    validateVideo(videoPath);
  } catch (e) {
    console.error(`🛑  [PUBLISH ABORTED] ${e.message}`);
    process.exit(1);
  }

  // 🏛️ DYNAMIC METADATA ARCHITECTURE
  const METADATA_PATH = path.join(process.cwd(), 'data', 'viral-metadata.json');
  const VIRAL_HASHTAGS = "\n.\n.\n.\n#reels #viral #trending #reelsinstagram #explorepage #mindset #entrepreneur #success #motivation #discipline #hustle #aesthetic #lifestyle #grind #luxurylifestyle #fyp #foryou #growth #wealth #wisdom #productivity #focus #consistency #hardwork #financialfreedom #passiveincome #inspire #automation #ai #aaknation";

  let hook = {
    ig: `The truth about ${topicName} finally revealed 🔍 ${VIRAL_HASHTAGS}`,
    fb: `Everything you thought you knew about ${topicName} is wrong. Here is why. ${VIRAL_HASHTAGS}`
  };

  if (fs.existsSync(METADATA_PATH)) {
    const allMeta = JSON.parse(fs.readFileSync(METADATA_PATH));
    if (allMeta[topicName]) {
      const meta = allMeta[topicName];
      hook = {
        ig: (meta.ig_hook || meta.description || meta.hook || `Success path for ${topicName}`) + " " + VIRAL_HASHTAGS,
        fb: (meta.fb_hook || meta.description || meta.hook || `Success path for ${topicName}`) + " " + VIRAL_HASHTAGS
      };
      console.log(`   💎 Local Viral Metadata loaded for Meta [${topicName}].`);
    }
  }

  const targetStr = getArg('--target') || 'both';
  const forceRemix = process.argv.includes('--force-remix');

  console.log(`\n[Forge] Meta Upload: ${topicName} (Target: ${targetStr})`);
  if (forceRemix) console.log(`🔱 FORCE REMIX ACTIVE: Re-uploading optimized version...`);
  console.log('='.repeat(50));

  const uploadedDir = path.join(topicDir, 'uploaded');
  const igUploaded = fs.existsSync(path.join(uploadedDir, 'instagram.json'));
  const fbUploaded = fs.existsSync(path.join(uploadedDir, 'facebook.json'));

  if (!forceRemix && igUploaded && fbUploaded && targetStr === 'both') {
    console.log(`[SKIP] ${topicName} already uploaded to IG and FB.`);
    return;
  }

  let hasError = false;

  // Upload to Instagram
  if (targetStr === 'both' || targetStr === 'insta') {
    try {
      if (!igUploaded || forceRemix) {
        const igId = await uploadToInstagram(videoPath, hook.ig);
        console.log(`[OK] Instagram Reel live: ID ${igId}`);
      } else {
        console.log(`[SKIP] Instagram: Already uploaded.`);
      }
    } catch (e) {
      console.error(`[FAIL] Instagram: ${e.message}`);
      if (targetStr === 'insta' || targetStr === 'both') hasError = true;
    }
  }

  // Upload to Facebook
  if ((targetStr === 'both' || targetStr === 'fb') && FB_PAGE_ID) {
    try {
      if (!fbUploaded) {
        const fbId = await uploadToFacebook(videoPath, hook.fb);
        console.log(`[OK] Facebook Reel live: ID ${fbId}`);
      } else {
        console.log(`[SKIP] Facebook: Already uploaded.`);
      }
    } catch (e) {
      console.error(`[FAIL] Facebook: ${e.message}`);
      // Only count fb as hard error if specifically targeted
      if (targetStr === 'fb') hasError = true;
    }
  }

  if (hasError) {
    console.error('❌ Upload task failed. Exiting with error state.');
    process.exit(1);
  }

  // File Clean-up for Vercel / GitHub Actions (to free ephemeral disk space)
  if (!hasError && fs.existsSync(videoPath)) {
    console.log(`🧹 Cleaning up heavy video file to save disk space...`);
    fs.unlinkSync(videoPath);
    console.log(`[OK] Deleted ${videoPath}`);
  }
}

uploadToMeta();
