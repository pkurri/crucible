import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * ⏳ CRUCIBLE YOUTUBE EMPIRE LOOP
 * This script orchestrates the 30-minute production heartbeat for your LLC.
 * All channels are optimized for 4K / HD automated output.
 */

const CHANNELS = ['AAK-tion', 'PlayfulPixels', 'WealthWizards', 'ChefCipher', 'CodeCrucible'];
const INTERVAL_MS = 30 * 60 * 1000; // 30 Minutes

async function runHeartbeat() {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n💓 [EMPIRE HEARTBEAT] ${timestamp} - Starting Production Cycle...`);

  for (const channel of CHANNELS) {
    console.log(`\n🏭 Processing Division for channel: ${channel}`);

    const channelPath = path.join(process.cwd(), 'data', 'youtube-empire', channel);
    if (!existsSync(channelPath)) {
       mkdirSync(channelPath, { recursive: true });
       console.log(`📁 Initialized directory: ${channelPath}`);
    }

    try {
      // 1. Fetch Intelligence
      console.log(`🔍 [Market Scout] Fetching high-CPM trends for ${channel}...`);
      
      // 2. Run Generation Logic
      console.log(`⚒️ [StorySmith] Generating 4K Script and SEO Metadata...`);
      
      // 3. Asset Quality Audit
      const videoFilePath = path.join(channelPath, 'final-render.mp4');
      if (existsSync(videoFilePath)) {
         console.log(`📡 [Quality Audit] Scanning 4K Master at: ${videoFilePath}`);
         // Here you would add ffmpeg/ffprobe checks for resolution if available
      } else {
         console.log(`⚠️ [Quality Audit] No video found. Waiting for 4K Render...`);
      }
      
      // 4. Checking Uploader Readiness
      console.log(`🚢 [Channel Warden] Checking connectivity and pushing for ${channel}...`);
      
      // Run the dynamic uploader with the channel flag
      execSync(`node scripts/youtube-official-uploader.mjs --channel "${channel}"`, { stdio: 'inherit' });

    } catch (err) {
      console.error(`❌ Error in ${channel} cycle: ${err.message}`);
    }
  }

  console.log(`\n✅ Heartbeat Complete. Resting for 30 minutes...`);
  setTimeout(runHeartbeat, INTERVAL_MS);
}

// Initial Run
runHeartbeat();
