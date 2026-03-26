#!/usr/bin/env node
/**
 * 🎬 HYBRID VIDEO RENDERER
 * Combines Gemini Imagen + Ken Burns + Whisper Captions for real video generation
 */

import fs from 'fs';
import path from 'path';
import { generateBrollImages, generateBrollFromScript } from './gemini-imagen-generator.mjs';
import { renderVideoFromImages } from './ken-burns-renderer.mjs';
import { generateCaptions } from './whisper-caption-generator.mjs';

/**
 * Full hybrid rendering pipeline
 * @param {Object} config - Rendering configuration
 * @returns {Promise<string>} Path to final rendered video
 */
async function renderHybridVideo(config) {
  const {
    topicDir,
    topicName,
    scriptText,
    audioPath,
    imageCount = 5,
    useExistingImages = false,
    addCaptions = true,
    captionFormat = 'ass'
  } = config;

  console.log(`\n🎬 [Hybrid] Starting hybrid video render for: ${topicName}`);
  console.log(`   📁 Topic Dir: ${topicDir}`);
  console.log(`   🎵 Audio: ${audioPath ? 'Yes' : 'No'}`);
  console.log(`   📝 Captions: ${addCaptions ? 'Yes' : 'No'}`);

  const assetsDir = path.join(topicDir, 'assets');
  const tempDir = path.join(topicDir, 'hybrid-temp');
  const outputPath = path.join(topicDir, 'final-render.mp4');

  try {
    // Create directories
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    let imagePaths = [];

    // Step 1: Generate or use existing images
    if (useExistingImages && fs.existsSync(assetsDir)) {
      console.log(`\n📸 [Hybrid] Using existing images from assets...`);
      imagePaths = fs.readdirSync(assetsDir)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .map(f => path.join(assetsDir, f));
      
      console.log(`   ✅ Found ${imagePaths.length} existing images`);
    }

    if (imagePaths.length < 3) {
      console.log(`\n🎨 [Hybrid] Generating AI images with Gemini Imagen...`);
      
      // Generate visual prompt from script
      const visualPrompt = scriptText 
        ? `${scriptText.substring(0, 200)}, cinematic, professional, 4K quality`
        : `${topicName}, cinematic visualization, dramatic lighting, professional photography`;

      const generatedImages = await generateBrollImages(visualPrompt, imageCount, assetsDir);
      
      if (generatedImages.length === 0) {
        throw new Error('No images generated');
      }

      imagePaths = generatedImages;
    }

    // Step 2: Apply Ken Burns effects and create video
    console.log(`\n🎥 [Hybrid] Applying Ken Burns effects...`);
    const videoWithoutCaptions = path.join(tempDir, 'video-no-captions.mp4');
    
    const renderSuccess = await renderVideoFromImages(imagePaths, videoWithoutCaptions, audioPath);
    
    if (!renderSuccess) {
      throw new Error('Ken Burns rendering failed');
    }

    // Step 3: Add captions if requested
    let finalVideo = videoWithoutCaptions;

    if (addCaptions && audioPath && fs.existsSync(audioPath)) {
      console.log(`\n📝 [Hybrid] Adding word-level captions...`);
      
      const captionResult = await generateCaptions(
        audioPath,
        videoWithoutCaptions,
        tempDir,
        { format: captionFormat, burn: true }
      );

      if (captionResult && captionResult.videoPath) {
        finalVideo = captionResult.videoPath;
      } else {
        console.warn(`⚠️ [Hybrid] Caption generation failed, using video without captions`);
      }
    }

    // Step 4: Move final video to output location
    if (finalVideo !== outputPath) {
      fs.copyFileSync(finalVideo, outputPath);
    }

    // Step 5: Clean up temp files
    console.log(`\n🧹 [Hybrid] Cleaning up temporary files...`);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    console.log(`\n✅ [Hybrid] Render complete: ${outputPath}\n`);
    
    // Save render metadata
    const metadata = {
      rendered_at: new Date().toISOString(),
      topic: topicName,
      images_used: imagePaths.length,
      has_audio: !!audioPath,
      has_captions: addCaptions,
      output_path: outputPath
    };
    
    fs.writeFileSync(
      path.join(topicDir, 'hybrid-render.json'),
      JSON.stringify(metadata, null, 2)
    );

    return outputPath;

  } catch (error) {
    console.error(`\n❌ [Hybrid] Render failed: ${error.message}\n`);
    
    // Clean up on failure
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    return null;
  }
}

/**
 * Batch render multiple topics
 * @param {Array} topics - Array of topic configurations
 * @returns {Promise<Object>} Render statistics
 */
async function batchRenderTopics(topics) {
  console.log(`\n🎬 [Hybrid] Starting batch render for ${topics.length} topics...\n`);

  const results = {
    total: topics.length,
    successful: 0,
    failed: 0,
    videos: []
  };

  for (const topic of topics) {
    const videoPath = await renderHybridVideo(topic);
    
    if (videoPath) {
      results.successful++;
      results.videos.push(videoPath);
    } else {
      results.failed++;
    }
  }

  console.log(`\n📊 [Hybrid] Batch render complete:`);
  console.log(`   ✅ Successful: ${results.successful}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📹 Total videos: ${results.videos.length}\n`);

  return results;
}

/**
 * Render from existing topic directory structure
 * @param {string} topicDir - Topic directory path
 * @param {Object} options - Rendering options
 * @returns {Promise<string>} Path to rendered video
 */
async function renderFromTopicDir(topicDir, options = {}) {
  const topicName = path.basename(topicDir);
  
  // Find audio file
  const audioFiles = ['narration.mp3', 'audio.mp3', 'voiceover.mp3'];
  let audioPath = null;
  
  for (const audioFile of audioFiles) {
    const testPath = path.join(topicDir, audioFile);
    if (fs.existsSync(testPath)) {
      audioPath = testPath;
      break;
    }
  }

  // Find script file
  let scriptText = '';
  const scriptFiles = ['script.txt', 'script.json', 'prompt.txt'];
  
  for (const scriptFile of scriptFiles) {
    const testPath = path.join(topicDir, scriptFile);
    if (fs.existsSync(testPath)) {
      const content = fs.readFileSync(testPath, 'utf8');
      scriptText = typeof content === 'string' ? content : JSON.stringify(content);
      break;
    }
  }

  const config = {
    topicDir,
    topicName,
    scriptText,
    audioPath,
    useExistingImages: options.useExistingImages !== false,
    addCaptions: options.addCaptions !== false,
    captionFormat: options.captionFormat || 'ass',
    imageCount: options.imageCount || 5
  };

  return await renderHybridVideo(config);
}

export {
  renderHybridVideo,
  batchRenderTopics,
  renderFromTopicDir
};
