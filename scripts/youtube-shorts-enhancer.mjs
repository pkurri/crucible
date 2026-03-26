#!/usr/bin/env node
/**
 * 🎬 YOUTUBE SHORTS ENHANCER
 * Adds subscribe watermark, end screens, and optimizes titles for growth
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const WATERMARK_TEXT = "👆 SUBSCRIBE";
const WATERMARK_POSITION = "x=W-w-20:y=20"; // Top-right corner
const END_SCREEN_DURATION = 3; // Last 3 seconds

// ═══════════════════════════════════════════════════════
// 🎨 ADD SUBSCRIBE WATERMARK
// ═══════════════════════════════════════════════════════
function addSubscribeWatermark(inputVideo, outputVideo) {
  console.log(`🎨 Adding subscribe watermark...`);
  
  try {
    // Create watermark with FFmpeg drawtext filter
    const ffmpegCmd = `ffmpeg -i "${inputVideo}" -vf "drawtext=text='${WATERMARK_TEXT}':fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf:fontsize=32:fontcolor=white:borderw=3:bordercolor=black:${WATERMARK_POSITION}" -c:a copy "${outputVideo}" -y`;
    
    execSync(ffmpegCmd, { stdio: 'pipe' });
    console.log(`   ✅ Watermark added`);
    return true;
  } catch (e) {
    console.error(`   ❌ Watermark failed: ${e.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════
// 🎬 ADD END SCREEN OVERLAY
// ═══════════════════════════════════════════════════════
function addEndScreen(inputVideo, outputVideo) {
  console.log(`🎬 Adding end screen...`);
  
  try {
    // Get video duration
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`;
    const duration = parseFloat(execSync(durationCmd, { encoding: 'utf8' }).trim());
    const startTime = Math.max(0, duration - END_SCREEN_DURATION);
    
    // Add "SUBSCRIBE FOR MORE" text in last 3 seconds
    const ffmpegCmd = `ffmpeg -i "${inputVideo}" -vf "drawtext=text='SUBSCRIBE FOR MORE':enable='gte(t,${startTime})':fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf:fontsize=48:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h-100" -c:a copy "${outputVideo}" -y`;
    
    execSync(ffmpegCmd, { stdio: 'pipe' });
    console.log(`   ✅ End screen added`);
    return true;
  } catch (e) {
    console.error(`   ❌ End screen failed: ${e.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════
// 📝 OPTIMIZE TITLE FOR SEO
// ═══════════════════════════════════════════════════════
function optimizeTitle(originalTitle) {
  // Remove special characters and clean up
  let title = originalTitle
    .replace(/([A-Z])/g, ' $1') // Add spaces before capitals
    .replace(/_/g, ' ')
    .trim();
  
  // Capitalize first letter of each word
  title = title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Add #shorts tag
  if (!title.toLowerCase().includes('#shorts')) {
    title += ' #shorts';
  }
  
  // Add hook if title is short
  if (title.length < 30) {
    const hooks = [
      'This Will Blow Your Mind',
      'You Need To See This',
      'This Changes Everything',
      'The Truth About',
      'What They Don\'t Tell You'
    ];
    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
    title = `${randomHook}: ${title}`;
  }
  
  return title;
}

// ═══════════════════════════════════════════════════════
// 🔄 PROCESS VIDEO
// ═══════════════════════════════════════════════════════
function enhanceShort(videoPath, topicName) {
  console.log(`\n🎬 Enhancing: ${topicName}`);
  
  const dir = path.dirname(videoPath);
  const tempWatermark = path.join(dir, 'temp-watermark.mp4');
  const enhancedVideo = path.join(dir, 'enhanced-render.mp4');
  
  try {
    // Step 1: Add watermark
    if (!addSubscribeWatermark(videoPath, tempWatermark)) {
      return false;
    }
    
    // Step 2: Add end screen
    if (!addEndScreen(tempWatermark, enhancedVideo)) {
      fs.unlinkSync(tempWatermark);
      return false;
    }
    
    // Clean up temp file
    fs.unlinkSync(tempWatermark);
    
    // Replace original with enhanced version
    fs.renameSync(enhancedVideo, videoPath);
    
    console.log(`✅ Enhancement complete!\n`);
    return true;
    
  } catch (e) {
    console.error(`❌ Enhancement failed: ${e.message}\n`);
    // Clean up temp files
    if (fs.existsSync(tempWatermark)) fs.unlinkSync(tempWatermark);
    if (fs.existsSync(enhancedVideo)) fs.unlinkSync(enhancedVideo);
    return false;
  }
}

// ═══════════════════════════════════════════════════════
// 🔄 MAIN LOOP
// ═══════════════════════════════════════════════════════
async function main() {
  console.log('🎬 YouTube Shorts Enhancer Starting...\n');
  
  const baseDirs = [
    path.join(process.cwd(), 'data', 'youtube-empire', 'AkashaGlimpse', 'topics'),
    path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics')
  ];
  
  let enhanced = 0;
  
  for (const baseDir of baseDirs) {
    if (!fs.existsSync(baseDir)) {
      console.log(`⚠️  Directory not found: ${baseDir}`);
      continue;
    }
    
    const topics = fs.readdirSync(baseDir).filter(t => 
      fs.statSync(path.join(baseDir, t)).isDirectory()
    );
    
    for (const topic of topics) {
      const topicDir = path.join(baseDir, topic);
      const videoPath = path.join(topicDir, 'final-render.mp4');
      const enhancedMarker = path.join(topicDir, 'enhanced.json');
      
      // Skip if already enhanced or no video
      if (!fs.existsSync(videoPath) || fs.existsSync(enhancedMarker)) {
        continue;
      }
      
      // Enhance the video
      if (enhanceShort(videoPath, topic)) {
        // Mark as enhanced
        const optimizedTitle = optimizeTitle(topic);
        fs.writeFileSync(
          enhancedMarker,
          JSON.stringify({
            enhanced_at: new Date().toISOString(),
            original_title: topic,
            optimized_title: optimizedTitle
          }, null, 2)
        );
        
        console.log(`📝 Optimized title: ${optimizedTitle}\n`);
        enhanced++;
      }
    }
  }
  
  console.log(`\n📊 Session Complete: ${enhanced} videos enhanced`);
}

main().catch(e => {
  console.error(`❌ Fatal error: ${e.message}`);
  process.exit(1);
});
