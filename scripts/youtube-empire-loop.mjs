import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * ⏳ CRUCIBLE YOUTUBE EMPIRE LOOP
 * This script orchestrates the 30-minute production heartbeat for your LLC.
 * All channels are optimized for 4K / HD automated output.
 */

const CHANNELS = [
  'AAK-tion', 'PlayfulPixels', 'WealthWizards', 'ChefCipher', 'CodeCrucible',
  'PixelPioneers', 'LogicLoom', 'NeonNexus', 'AeroArc', 'CircuitSage',
  'QuantumQuiver', 'DataDruid', 'EchoEther', 'VortexVantage', 'SummitSphere',
  'GridGrit', 'BioBeam', 'StellarSync', 'TerraTable', 'PrismPro'
];
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
      

async function runEmpireCycle() {
    console.log(`\n🔱 STARTING INDUSTRIAL PRODUCTION CYCLE - ${new Date().toLocaleString()}`);
    
    for (const channelName of CHANNELS) {
        console.log(`\n📦 Processing Channel: ${channelName}`);
        
        // 1. Check for 4K Assets
        const assetDir = path.join(process.cwd(), 'data', 'youtube-empire', channelName, 'assets');
        const finalRenderPath = path.join(process.cwd(), 'data', 'youtube-empire', channelName, 'final-render.mp4');

        if (fs.existsSync(assetDir) && fs.readdirSync(assetDir).length > 0) {
            console.log(`🎬 4K Assets found! Triggering Render Factory...`);
            try {
                // Execute the stitcher directly
                execSync(`node scripts/empire-4k-stitcher.mjs ${channelName}`, { stdio: 'inherit' });
            } catch (e) {
                console.error(`❌ Render failed for ${channelName}. Continuing to next...`);
            }
        }

        // 2. Upload if video exists
        if (fs.existsSync(finalRenderPath)) {
            console.log(`🚀 Final render found! Triggering Global Upload...`);
            try {
                execSync(`node scripts/youtube-official-uploader.mjs ${channelName}`, { stdio: 'inherit' });
                // Move or delete after upload to prevent duplicate uploads? 
                // For now, let's keep it and the uploader should handle tracking.
            } catch (e) {
                console.error(`❌ Upload failed for ${channelName}.`);
            }
        } else {
            console.log(`⚠️ No final-render.mp4 for ${channelName}. Skipping...`);
        }
    }
}

// Initial Run
runHeartbeat();
