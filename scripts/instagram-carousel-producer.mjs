#!/usr/bin/env node
/**
 * 📸 INSTAGRAM CAROUSEL POST PRODUCER
 * Extracts frames from existing Reels and posts as carousel with AI captions
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const META_API = 'https://graph.facebook.com/v21.0';
const IG_ACCOUNT_ID = process.env.META_IG_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const STATE_FILE = path.join(process.cwd(), 'data', 'instagram-carousel-state.json');
const MAX_POSTS_PER_RUN = 2;

// ═══════════════════════════════════════════════════════
// 📊 STATE MANAGEMENT
// ═══════════════════════════════════════════════════════
function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { lastProcessed: [], totalPosts: 0 };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════════════════
// 🎨 FRAME EXTRACTION
// ═══════════════════════════════════════════════════════
function extractFrames(videoPath, outputDir) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  // Extract 3 frames at 20%, 50%, 80% of video duration
  const frames = [];
  for (let i = 0; i < 3; i++) {
    const timestamp = i === 0 ? '00:00:02' : i === 1 ? '00:00:07' : '00:00:12';
    const outputPath = path.join(outputDir, `frame_${i + 1}.jpg`);
    
    try {
      execSync(
        `ffmpeg -i "${videoPath}" -ss ${timestamp} -vframes 1 -q:v 2 "${outputPath}" -y`,
        { stdio: 'pipe' }
      );
      frames.push(outputPath);
    } catch (e) {
      console.warn(`⚠️  Frame extraction failed at ${timestamp}: ${e.message}`);
    }
  }
  
  return frames;
}

// ═══════════════════════════════════════════════════════
// 🤖 AI CAPTION GENERATION
// ═══════════════════════════════════════════════════════
async function generateCaption(topicName) {
  const prompt = `Write a viral Instagram carousel caption for topic: "${topicName}". 
Include:
- Hook in first line
- 3-5 bullet points with emojis
- Call to action
- 5 relevant hashtags
Keep under 2000 chars.`;

  try {
    // Try Google Gemini first
    if (process.env.GOOGLE_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }
    }
    
    // Fallback to basic caption
    return `✨ ${topicName}\n\nSwipe to explore →\n\n#innovation #tech #trending #viral #explore`;
  } catch (e) {
    console.warn(`⚠️  AI caption failed: ${e.message}`);
    return `✨ ${topicName}\n\nSwipe to explore →\n\n#innovation #tech #trending #viral #explore`;
  }
}

// ═══════════════════════════════════════════════════════
// 📤 CATBOX CDN UPLOAD
// ═══════════════════════════════════════════════════════
function uploadToCatbox(filePath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = execSync(
        `curl -F "reqtype=fileupload" -F "fileToUpload=@${filePath}" https://catbox.moe/user/api.php`,
        { encoding: 'utf8', timeout: 60000 }
      ).trim();
      
      if (result.startsWith('http')) {
        return result;
      }
    } catch (e) {
      console.warn(`⚠️  Catbox upload attempt ${i + 1} failed`);
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════
// 📸 INSTAGRAM CAROUSEL UPLOAD
// ═══════════════════════════════════════════════════════
async function uploadCarousel(imageUrls, caption) {
  console.log(`📸 Creating carousel container...`);
  
  // Step 1: Create media containers for each image
  const mediaIds = [];
  for (const url of imageUrls) {
    const response = await fetch(
      `${META_API}/${IG_ACCOUNT_ID}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: url,
          is_carousel_item: true,
          access_token: ACCESS_TOKEN
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Media container failed: ${error}`);
    }
    
    const data = await response.json();
    mediaIds.push(data.id);
    console.log(`   ✅ Media container: ${data.id}`);
  }
  
  // Step 2: Create carousel container
  console.log(`📦 Creating carousel post...`);
  const carouselResponse = await fetch(
    `${META_API}/${IG_ACCOUNT_ID}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: mediaIds.join(','),
        caption: caption,
        access_token: ACCESS_TOKEN
      })
    }
  );
  
  if (!carouselResponse.ok) {
    const error = await carouselResponse.text();
    throw new Error(`Carousel container failed: ${error}`);
  }
  
  const carouselData = await carouselResponse.json();
  const containerId = carouselData.id;
  
  // Step 3: Publish carousel
  console.log(`🚀 Publishing carousel...`);
  const publishResponse = await fetch(
    `${META_API}/${IG_ACCOUNT_ID}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: ACCESS_TOKEN
      })
    }
  );
  
  if (!publishResponse.ok) {
    const error = await publishResponse.text();
    throw new Error(`Publish failed: ${error}`);
  }
  
  const publishData = await publishResponse.json();
  console.log(`✅ Carousel published! ID: ${publishData.id}`);
  return publishData.id;
}

// ═══════════════════════════════════════════════════════
// 🔄 MAIN LOOP
// ═══════════════════════════════════════════════════════
async function main() {
  console.log('📸 Instagram Carousel Producer Starting...\n');
  
  if (!IG_ACCOUNT_ID || !ACCESS_TOKEN) {
    console.error('❌ Missing META_IG_ACCOUNT_ID or META_ACCESS_TOKEN');
    process.exit(1);
  }
  
  const state = loadState();
  const baseDirs = [
    path.join(process.cwd(), 'data', 'instagram-empire', 'AAK-Nation', 'topics'),
    path.join(process.cwd(), 'data', 'facebook-empire', 'AAK-Nation', 'topics')
  ];
  
  let postsCreated = 0;
  
  for (const baseDir of baseDirs) {
    if (!fs.existsSync(baseDir)) continue;
    
    const topics = fs.readdirSync(baseDir).filter(t => 
      fs.statSync(path.join(baseDir, t)).isDirectory() &&
      !state.lastProcessed.includes(t)
    );
    
    for (const topic of topics) {
      if (postsCreated >= MAX_POSTS_PER_RUN) break;
      
      const topicDir = path.join(baseDir, topic);
      const videoPath = path.join(topicDir, 'final-render.mp4');
      const carouselMarker = path.join(topicDir, 'carousel-posted.json');
      
      if (!fs.existsSync(videoPath) || fs.existsSync(carouselMarker)) continue;
      
      console.log(`\n🎨 Processing: ${topic}`);
      
      try {
        // Extract frames
        const framesDir = path.join(topicDir, 'carousel-frames');
        const frames = extractFrames(videoPath, framesDir);
        
        if (frames.length < 3) {
          console.warn(`⚠️  Only ${frames.length} frames extracted, skipping`);
          continue;
        }
        
        // Upload frames to CDN
        console.log(`📤 Uploading ${frames.length} frames to CDN...`);
        const imageUrls = [];
        for (const frame of frames) {
          const url = uploadToCatbox(frame);
          if (!url) {
            throw new Error('Frame upload failed');
          }
          imageUrls.push(url);
        }
        
        // Generate caption
        const caption = await generateCaption(topic);
        console.log(`✍️  Caption: ${caption.substring(0, 100)}...`);
        
        // Upload carousel
        const postId = await uploadCarousel(imageUrls, caption);
        
        // Mark as posted
        fs.writeFileSync(
          carouselMarker,
          JSON.stringify({ posted_at: new Date().toISOString(), post_id: postId }, null, 2)
        );
        
        state.lastProcessed.push(topic);
        postsCreated++;
        
        console.log(`✅ Carousel posted successfully!\n`);
        
      } catch (e) {
        console.error(`❌ Failed to create carousel: ${e.message}\n`);
      }
    }
    
    if (postsCreated >= MAX_POSTS_PER_RUN) break;
  }
  
  state.totalPosts += postsCreated;
  saveState(state);
  
  console.log(`\n📊 Session Complete: ${postsCreated} carousel posts created`);
  console.log(`📈 Total carousel posts: ${state.totalPosts}`);
}

main().catch(e => {
  console.error(`❌ Fatal error: ${e.message}`);
  process.exit(1);
});
