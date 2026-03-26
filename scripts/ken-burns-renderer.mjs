#!/usr/bin/env node
/**
 * 🎥 KEN BURNS EFFECT RENDERER
 * Adds dynamic zoom/pan motion to static images using FFmpeg
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Apply Ken Burns effect to a single image
 * @param {string} imagePath - Input image path
 * @param {string} outputPath - Output video path
 * @param {number} duration - Duration in seconds
 * @param {string} effect - Effect type: 'zoom-in', 'zoom-out', 'pan-right', 'pan-left'
 * @returns {Promise<boolean>} Success status
 */
async function applyKenBurnsEffect(imagePath, outputPath, duration = 5, effect = 'zoom-in') {
  console.log(`🎥 [Ken Burns] Applying ${effect} effect to ${path.basename(imagePath)}...`);

  try {
    let zoompanFilter;

    switch (effect) {
      case 'zoom-in':
        // Start at 100% scale, zoom to 120% over duration
        zoompanFilter = `zoompan=z='min(zoom+0.0015,1.5)':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25`;
        break;

      case 'zoom-out':
        // Start at 120% scale, zoom out to 100%
        zoompanFilter = `zoompan=z='if(lte(zoom,1.0),1.5,max(1.0,zoom-0.0015))':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25`;
        break;

      case 'pan-right':
        // Pan from left to right with slight zoom
        zoompanFilter = `zoompan=z='1.3':d=${duration * 25}:x='if(gte(on,1),x+2,0)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25`;
        break;

      case 'pan-left':
        // Pan from right to left with slight zoom
        zoompanFilter = `zoompan=z='1.3':d=${duration * 25}:x='if(gte(on,1),x-2,iw-iw/zoom)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25`;
        break;

      case 'pan-up':
        // Pan from bottom to top
        zoompanFilter = `zoompan=z='1.3':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='if(gte(on,1),y-2,ih-ih/zoom)':s=1080x1920:fps=25`;
        break;

      case 'pan-down':
        // Pan from top to bottom
        zoompanFilter = `zoompan=z='1.3':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='if(gte(on,1),y+2,0)':s=1080x1920:fps=25`;
        break;

      default:
        zoompanFilter = `zoompan=z='min(zoom+0.0015,1.5)':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25`;
    }

    const ffmpegCmd = `ffmpeg -loop 1 -i "${imagePath}" -vf "${zoompanFilter}" -t ${duration} -c:v libx264 -pix_fmt yuv420p -y "${outputPath}"`;

    execSync(ffmpegCmd, { stdio: 'pipe' });
    console.log(`   ✅ [Ken Burns] Effect applied: ${outputPath}`);
    return true;

  } catch (error) {
    console.error(`   ❌ [Ken Burns] Failed: ${error.message}`);
    return false;
  }
}

/**
 * Process multiple images with Ken Burns effects
 * @param {Array} images - Array of {path, duration} objects
 * @param {string} outputDir - Output directory
 * @returns {Promise<Array>} Array of generated video clip paths
 */
async function processImageBatch(images, outputDir) {
  console.log(`🎥 [Ken Burns] Processing ${images.length} images...`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const effects = ['zoom-in', 'zoom-out', 'pan-right', 'pan-left', 'pan-up', 'pan-down'];
  const videoClips = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const effect = effects[i % effects.length]; // Rotate through effects
    const outputPath = path.join(outputDir, `clip-${i + 1}.mp4`);

    const success = await applyKenBurnsEffect(
      image.path || image,
      outputPath,
      image.duration || 5,
      effect
    );

    if (success) {
      videoClips.push(outputPath);
    }
  }

  console.log(`✅ [Ken Burns] Generated ${videoClips.length}/${images.length} video clips`);
  return videoClips;
}

/**
 * Concatenate video clips into final video
 * @param {Array} videoClips - Array of video clip paths
 * @param {string} outputPath - Final output video path
 * @param {string} audioPath - Optional audio track path
 * @returns {Promise<boolean>} Success status
 */
async function concatenateClips(videoClips, outputPath, audioPath = null) {
  console.log(`🎬 [Ken Burns] Concatenating ${videoClips.length} clips...`);

  try {
    // Create concat file
    const concatFile = path.join(path.dirname(outputPath), 'concat-list.txt');
    const concatContent = videoClips.map(clip => `file '${clip}'`).join('\n');
    fs.writeFileSync(concatFile, concatContent);

    let ffmpegCmd;

    if (audioPath && fs.existsSync(audioPath)) {
      // Concatenate with audio
      ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -i "${audioPath}" -c:v copy -c:a aac -shortest -y "${outputPath}"`;
    } else {
      // Concatenate without audio
      ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy -y "${outputPath}"`;
    }

    execSync(ffmpegCmd, { stdio: 'pipe' });

    // Clean up concat file
    fs.unlinkSync(concatFile);

    console.log(`✅ [Ken Burns] Final video created: ${outputPath}`);
    return true;

  } catch (error) {
    console.error(`❌ [Ken Burns] Concatenation failed: ${error.message}`);
    return false;
  }
}

/**
 * Full pipeline: Images → Ken Burns clips → Concatenated video
 * @param {Array} images - Array of image paths or {path, duration} objects
 * @param {string} outputPath - Final video output path
 * @param {string} audioPath - Optional audio track
 * @returns {Promise<boolean>} Success status
 */
async function renderVideoFromImages(images, outputPath, audioPath = null) {
  console.log(`\n🎥 [Ken Burns] Starting full render pipeline...`);
  console.log(`   📸 Images: ${images.length}`);
  console.log(`   🎵 Audio: ${audioPath ? 'Yes' : 'No'}`);

  const tempDir = path.join(path.dirname(outputPath), 'ken-burns-temp');
  
  try {
    // Step 1: Apply Ken Burns to all images
    const videoClips = await processImageBatch(images, tempDir);

    if (videoClips.length === 0) {
      throw new Error('No video clips generated');
    }

    // Step 2: Concatenate clips
    const success = await concatenateClips(videoClips, outputPath, audioPath);

    // Step 3: Clean up temp files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    if (success) {
      console.log(`\n✅ [Ken Burns] Render complete: ${outputPath}\n`);
    }

    return success;

  } catch (error) {
    console.error(`\n❌ [Ken Burns] Pipeline failed: ${error.message}\n`);
    
    // Clean up on failure
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    return false;
  }
}

export {
  applyKenBurnsEffect,
  processImageBatch,
  concatenateClips,
  renderVideoFromImages
};
