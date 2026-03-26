#!/usr/bin/env node
/**
 * 📱 INSTAGRAM STORIES PRODUCER
 * Creates interactive Stories with polls, quizzes, and CTAs
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const META_API = 'https://graph.facebook.com/v21.0';
const IG_ACCOUNT_ID = process.env.META_IG_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const STATE_FILE = path.join(process.cwd(), 'data', 'instagram-stories-state.json');
const MAX_STORIES_PER_RUN = 2;

// Story templates with interactive elements
const STORY_TEMPLATES = [
  {
    type: 'poll',
    question: 'Which innovation excites you most?',
    options: ['AI Tech', 'Space Exploration']
  },
  {
    type: 'quiz',
    question: 'Can you guess this breakthrough?',
    correctAnswer: 0
  },
  {
    type: 'question',
    prompt: 'What topic should we cover next?'
  },
  {
    type: 'countdown',
    text: 'New video dropping soon!'
  }
];

// ═══════════════════════════════════════════════════════
// 📊 STATE MANAGEMENT
// ═══════════════════════════════════════════════════════
function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { lastProcessed: [], totalStories: 0 };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════════════════
// 🎨 CREATE STORY IMAGE WITH TEXT OVERLAY
// ═══════════════════════════════════════════════════════
function createStoryImage(sourceImage, outputPath, template, topicName) {
  console.log(`🎨 Creating Story image with ${template.type}...`);
  
  try {
    // Prepare text based on template type
    let overlayText = '';
    let fontSize = 48;
    let yPosition = 'h-200';
    
    switch (template.type) {
      case 'poll':
        overlayText = template.question;
        break;
      case 'quiz':
        overlayText = `${template.question}\\n\\nTap to answer!`;
        break;
      case 'question':
        overlayText = template.prompt;
        fontSize = 40;
        break;
      case 'countdown':
        overlayText = template.text;
        yPosition = 'h/2';
        break;
      default:
        overlayText = `Follow for more ${topicName}`;
    }
    
    // Add text overlay with FFmpeg
    const ffmpegCmd = `ffmpeg -i "${sourceImage}" -vf "drawtext=text='${overlayText}':fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf:fontsize=${fontSize}:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=${yPosition}" "${outputPath}" -y`;
    
    execSync(ffmpegCmd, { stdio: 'pipe' });
    console.log(`   ✅ Story image created`);
    return true;
  } catch (e) {
    console.error(`   ❌ Story creation failed: ${e.message}`);
    return false;
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
// 📱 INSTAGRAM STORY UPLOAD
// ═══════════════════════════════════════════════════════
async function uploadStory(imageUrl) {
  console.log(`📱 Uploading Story...`);
  
  try {
    // Create story media container
    const response = await fetch(
      `${META_API}/${IG_ACCOUNT_ID}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          media_type: 'STORIES',
          access_token: ACCESS_TOKEN
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Story container failed: ${error}`);
    }
    
    const data = await response.json();
    const containerId = data.id;
    
    // Publish story
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
    console.log(`✅ Story published! ID: ${publishData.id}`);
    return publishData.id;
    
  } catch (e) {
    console.error(`❌ Story upload failed: ${e.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// 🔄 MAIN LOOP
// ═══════════════════════════════════════════════════════
async function main() {
  console.log('📱 Instagram Stories Producer Starting...\n');
  
  if (!IG_ACCOUNT_ID || !ACCESS_TOKEN) {
    console.error('❌ Missing META_IG_ACCOUNT_ID or META_ACCESS_TOKEN');
    process.exit(1);
  }
  
  const state = loadState();
  const baseDirs = [
    path.join(process.cwd(), 'data', 'instagram-empire', 'AAK-Nation', 'topics'),
    path.join(process.cwd(), 'data', 'facebook-empire', 'AAK-Nation', 'topics')
  ];
  
  let storiesCreated = 0;
  
  for (const baseDir of baseDirs) {
    if (!fs.existsSync(baseDir)) continue;
    
    const topics = fs.readdirSync(baseDir).filter(t => 
      fs.statSync(path.join(baseDir, t)).isDirectory() &&
      !state.lastProcessed.includes(t)
    );
    
    for (const topic of topics) {
      if (storiesCreated >= MAX_STORIES_PER_RUN) break;
      
      const topicDir = path.join(baseDir, topic);
      const assetsDir = path.join(topicDir, 'assets');
      const storyMarker = path.join(topicDir, 'story-posted.json');
      
      if (!fs.existsSync(assetsDir) || fs.existsSync(storyMarker)) continue;
      
      // Find first image in assets
      const images = fs.readdirSync(assetsDir).filter(f => f.endsWith('.jpg'));
      if (images.length === 0) continue;
      
      console.log(`\n📱 Creating Story: ${topic}`);
      
      try {
        const sourceImage = path.join(assetsDir, images[0]);
        const template = STORY_TEMPLATES[storiesCreated % STORY_TEMPLATES.length];
        
        // Create story image with overlay
        const storyDir = path.join(topicDir, 'story');
        if (!fs.existsSync(storyDir)) fs.mkdirSync(storyDir, { recursive: true });
        
        const storyImage = path.join(storyDir, 'story.jpg');
        if (!createStoryImage(sourceImage, storyImage, template, topic)) {
          continue;
        }
        
        // Upload to CDN
        console.log(`📤 Uploading to CDN...`);
        const imageUrl = uploadToCatbox(storyImage);
        if (!imageUrl) {
          throw new Error('CDN upload failed');
        }
        
        // Upload to Instagram
        const storyId = await uploadStory(imageUrl);
        if (!storyId) {
          throw new Error('Instagram upload failed');
        }
        
        // Mark as posted
        fs.writeFileSync(
          storyMarker,
          JSON.stringify({
            posted_at: new Date().toISOString(),
            story_id: storyId,
            template_type: template.type
          }, null, 2)
        );
        
        state.lastProcessed.push(topic);
        storiesCreated++;
        
        console.log(`✅ Story posted successfully!\n`);
        
      } catch (e) {
        console.error(`❌ Failed to create story: ${e.message}\n`);
      }
    }
    
    if (storiesCreated >= MAX_STORIES_PER_RUN) break;
  }
  
  state.totalStories += storiesCreated;
  saveState(state);
  
  console.log(`\n📊 Session Complete: ${storiesCreated} stories created`);
  console.log(`📈 Total stories: ${state.totalStories}`);
}

main().catch(e => {
  console.error(`❌ Fatal error: ${e.message}`);
  process.exit(1);
});
