import 'dotenv/config';
import fetch from 'node-fetch'; // Requires: npm install node-fetch
import fs from 'fs';
import path from 'path';

/**
 * 👨‍💼 HEYGEN AI AVATAR PRODUCER
 * Fully integrated script to generate photorealistic "Talking Face" videos 
 * of AI humans via the official HeyGen API.
 * 
 * Replace HEYGEN_API_KEY with your token when ready.
 */

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'your_heygen_api_key_here';
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics');

const testScript = "Welcome to the channel. Today we are exposing exactly how the biggest automated YouTube empires are secretly generating millions using AI avatars.";

async function generateAvatarVideo(script, topicName) {
    if (HEYGEN_API_KEY === 'your_heygen_api_key_here') {
        console.warn('⚠️ [HeyGen] No API Key provided. Exiting early.');
        return;
    }

    console.log(`\n🤖 [HeyGen Avatar Protocol] Initiating AI Human for topic: ${topicName}`);

    try {
        // Step 1: Initiate Generation
        console.log(`   📡 Sending script to HeyGen API [Length: ${script.length} chars]...`);
        const initResponse = await fetch('https://api.heygen.com/v2/video/generate', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'x-api-key': HEYGEN_API_KEY
            },
            body: JSON.stringify({
                video_inputs: [
                    {
                        character: {
                            type: "avatar",
                            avatar_id: "Wayne_20240711",  // Professional Male Avatar ID
                            avatar_style: "normal"
                        },
                        voice: {
                            type: "text",
                            input_text: script,
                            voice_id: "1bd001e7e50f421d891986aad5158bc8" // Deep cinematic voice
                        }
                    }
                ],
                test: true, // Use test mode to generate watermarked free previews initially
                aspect_ratio: "9:16" // Instagram Reels / YouTube Shorts Vertical Format
            })
        });

        const initData = await initResponse.json();
        
        if (initData.error) {
            throw new Error(initData.error.message);
        }
        
        const videoId = initData.data.video_id;
        console.log(`   ⏳ Video job started! Video ID: ${videoId}. Now waiting for render...`);

        // Step 2: Poll for Completion (Usually takes 30s to 2mins)
        let videoUrl = null;
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 10000)); // Wait 10 seconds per loop
            console.log(`   🔄 Checking job status [Attempt ${i+1}/30]...`);
            
            const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
                method: 'GET',
                headers: { 'x-api-key': HEYGEN_API_KEY }
            });
            const statusData = await statusResponse.json();
            
            if (statusData.data.status === 'completed') {
                videoUrl = statusData.data.video_url;
                break;
            } else if (statusData.data.status === 'failed') {
                throw new Error("HeyGen rendering failed on their end.");
            }
        }

        if (!videoUrl) {
            throw new Error("Render timed out after 5 minutes.");
        }

        // Step 3: Download Local File
        console.log(`\n✅ Render Complete! Downloading high-fidelity avatar MP4...`);
        const topicDir = path.join(OUTPUT_DIR, topicName);
        if (!fs.existsSync(topicDir)) { fs.mkdirSync(topicDir, { recursive: true }); }
        
        const outputMp4 = path.join(topicDir, 'avatar-render.mp4');
        const mp4Response = await fetch(videoUrl);
        const buffer = await mp4Response.arrayBuffer();
        fs.writeFileSync(outputMp4, Buffer.from(buffer));
        
        console.log(`👨‍💼 High-Retention Avatar Video saved to ${outputMp4}`);
        
    } catch (e) {
        console.error(`❌ [HeyGen Request Failed]: ${e.message}`);
    }
}

// Example Execution
generateAvatarVideo(testScript, "AvatarTestingLab");
