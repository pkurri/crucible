import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🌌 AKASHA GLIMPSE YOUTUBE LOOP
 * Fully automates the production AND Youtube uploading of the Akasha channel.
 */

const topics = ['AkashicRecords', 'AstralProjection', 'SacredGeometry', 'ThirdEyeAwakening'];
const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'data', 'instagram-empire', 'AkashaGlimpse', 'topics');

async function main() {
    console.log("🌌 STARTING AKASHA GLIMPSE AUTONOMOUS LOOP 🌌");
    
    // Simple rotation logic based on the date so it doesn't upload the same one daily
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const selectedTopic = topics[dayOfYear % topics.length];
    
    console.log(`Selected Topic for today: ${selectedTopic}`);

    // 1. Run the Producer
    console.log(`\n1️⃣ Producing video for ${selectedTopic}...`);
    try {
        execSync(`node scripts/akasha-glimpse-producer.mjs --topic ${selectedTopic}`, { stdio: 'inherit' });
    } catch (e) {
        console.error("❌ Production Phase Failed.");
        process.exit(1);
    }
    
    // 2. Run the Uploader
    console.log(`\n2️⃣ Uploading ${selectedTopic} to AkashaGlimpse YouTube channel...`);
    
    // Ensure metadata exists for upload
    const metadataPath = path.join(ROOT, 'data', 'viral-metadata.json');
    if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        if (!metadata[selectedTopic]) {
            metadata[selectedTopic] = {
                title: `${selectedTopic.replace(/([A-Z])/g, ' $1').trim()} Explained | Cosmic Truths #shorts`,
                description: `Discover the hidden secrets of ${selectedTopic.replace(/([A-Z])/g, ' $1').trim()}.\n\n🌌 Subscribe to Akasha Glimpse to awaken your mind.\n👁️ Open your third eye.\n\n#spirituality #awakening #cosmos #mystery`,
                tags: [selectedTopic.toLowerCase(), 'spirituality', 'awakening', 'cosmic', 'mystery', 'shorts'],
                category: '27'
            };
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            console.log(`   💎 Injected missing metadata for ${selectedTopic}`);
        }
    }

    try {
        execSync(`node scripts/youtube-official-uploader.mjs --topic ${selectedTopic} --channel AkashaGlimpse --basedir "${BASE_DIR}" --token youtube-token-akasha.json`, { stdio: 'inherit' });
        console.log("✅ Autopilot Complete: Successfully uploaded to Akasha Glimpse!");
    } catch (e) {
        console.error("❌ Upload Phase Failed. Ensure youtube-token.json is valid.");
        process.exit(1);
    }
}

main();
