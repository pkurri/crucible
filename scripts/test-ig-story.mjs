import 'dotenv/config';
import fs from 'fs';
import path from 'path';

/**
 * 📸 INSTAGRAM STORY TESTER (Binary Upload)
 * This tests if Meta accepts a simple IMAGE story.
 * If this works, the problem with videos is definitely processing/encoding time.
 */

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const IG_ACCOUNT_ID = process.env.META_IG_ACCOUNT_ID;
const IMAGE_PATH = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics', 'WealthWizards', 'assets', 'frame1.png');

async function uploadStory() {
    if (!fs.existsSync(IMAGE_PATH)) {
        console.error('❌ Test image not found at:', IMAGE_PATH);
        return;
    }

    console.log('🖼️ Attempting Instagram Story upload...');

    // Step 1: Create Container via URL (Placeholder for test)
    const testUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1920&fit=crop';
    console.log(`📡 Using test image URL: ${testUrl}`);
    
    const initUrl = `https://graph.facebook.com/v20.0/${IG_ACCOUNT_ID}/media?access_token=${ACCESS_TOKEN}`;
    const initRes = await fetch(initUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            media_type: 'STORIES',
            image_url: testUrl
        })
    });

    const initJson = await initRes.json();
    if (initJson.error) {
        console.error('❌ Init Failed:', initJson.error.message);
        return;
    }

    const containerId = initJson.id;
    console.log(`✅ Container Created: ${containerId}`);

    // Step 2: Wait a bit
    console.log('⏳ Waiting 15s for image processing...');
    await new Promise(r => setTimeout(r, 15000));

    // Step 3: Publish
    console.log('🚀 Publishing story...');
    const pubRes = await fetch(`https://graph.facebook.com/v20.0/${IG_ACCOUNT_ID}/media_publish?access_token=${ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerId })
    });

    const pubJson = await pubRes.json();
    if (pubJson.id) {
        console.log(`🎉 STORY LIVE! ID: ${pubJson.id}`);
    } else {
        console.error('❌ Publish Failed:', JSON.stringify(pubJson));
    }
}

uploadStory();
