import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadState, saveState, getToday } from './empire-cycle-core.mjs';

/**
 * 🌌 AKASHA GLIMPSE YOUTUBE LOOP
 * Fully automates the production AND Youtube uploading of the Akasha channel.
 */

// Added more topics to give it more variety if it runs more frequently
const topics = [
    'AkashicRecords', 'AstralProjection', 'SacredGeometry', 'ThirdEyeAwakening',
    'LawOfAttraction', 'ShadowWork', 'LucidDreaming', 'Mindfulness',
    'ChakraHealing', 'QuantumConsciousness', 'ZenPhilosophy', 'StoicWisdom'
];
const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'data', 'instagram-empire', 'AkashaGlimpse', 'topics');
const STATE = path.join(ROOT, 'scripts', 'akasha-state.json');
const MAX_DAILY = 4; // Target 4 uploads a day to scale the channel!

async function main() {
    console.log("🌌 STARTING AKASHA GLIMPSE AUTONOMOUS LOOP 🌌");
    
    const state = loadState(STATE);
    const today = getToday();

    if (state.lastUploadDate !== today) {
        state.lastUploadDate = today;
        state.uploadsToday = 0;
    }

    if (state.uploadsToday >= MAX_DAILY) {
        console.log(`✅ Daily quota of ${MAX_DAILY} reached for Akasha. Skipping today.`);
        return;
    }

    const remaining = MAX_DAILY - state.uploadsToday;
    console.log(`📊 Quota: ${state.uploadsToday}/${MAX_DAILY} used today. Remaining: ${remaining}`);

    // Cycle through topics based on today's date and uploadsCount to get a fresh one every time
    for (let i = 0; i < remaining; i++) {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const selectedTopic = topics[(dayOfYear + i) % topics.length]; // Topic is tied to day and loop iteration, ensuring variety

        console.log(`\n🌀 Sequence ${i + 1}/${remaining} | Selected Topic: ${selectedTopic}`);

        // 1. Run the Producer
        console.log(`   1️⃣ Producing video for ${selectedTopic}...`);
        try {
            execSync(`node scripts/akasha-glimpse-producer.mjs --topic ${selectedTopic}`, { stdio: 'inherit' });
        } catch (e) {
            console.error(`   ❌ Production Phase Failed for ${selectedTopic}. Skipping this step.`);
            continue;
        }
        
        // 2. Run the Uploader
        console.log(`   2️⃣ Uploading ${selectedTopic} to AkashaGlimpse YouTube channel...`);
        
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
            const uploadCmd = `node scripts/youtube-official-uploader.mjs --topic ${selectedTopic} --channel AkashaGlimpse --basedir "${BASE_DIR}" --token youtube-token-akasha.json`;
            const output = execSync(uploadCmd, { encoding: 'utf-8' });
            console.log(output);

            if (output.includes('successfully') || output.includes('UPLOAD SUCCESSFUL')) {
                state.uploadsToday++;
                state.history = state.history || [];
                state.history.push({ topic: selectedTopic, date: new Date().toISOString() });
                saveState(STATE, state);
                console.log(`   ✅ Successfully uploaded ${selectedTopic}! (${state.uploadsToday}/${MAX_DAILY})`);
            } else if (output.includes('exceeded the number of videos')) {
                console.warn("   🛑 QUOTA EXCEEDED [API]. Stopping cycle.");
                break;
            } else {
                console.error("   ⚠️ Unexpected uploader output. Tracking as success for protection, but check logs.");
                state.uploadsToday++; // protect quota if uncertain
                saveState(STATE, state);
            }
        } catch (e) {
            console.error(`   ❌ Upload Phase Failed for ${selectedTopic}: ${e.message}`);
        }
    }

    console.log("\n🌌 Autopilot Sequence Complete: Successfully processed Akasha Glimpse batch!");
}

main().catch(err => {
    console.error('Fatal Akasha loop error:', err);
    process.exit(1);
});

