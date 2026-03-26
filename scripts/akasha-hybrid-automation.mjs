#!/usr/bin/env node
/**
 * ✨ AKASHA GLIMPSE HYBRID AUTOMATION
 * Uses the new hybrid renderer (Gemini Imagen + Ken Burns + Whisper)
 * for real video generation instead of static photo slideshows
 */

import fs from 'fs';
import path from 'path';
import { renderFromTopicDir } from './hybrid-video-renderer.mjs';

const BASE_DIR = path.join(process.cwd(), 'data', 'youtube-empire', 'AkashaGlimpse', 'topics');

async function processTopics() {
  console.log('✨ [Akasha Hybrid] Starting automated video generation...\n');

  if (!fs.existsSync(BASE_DIR)) {
    console.error(`❌ [Akasha Hybrid] Base directory not found: ${BASE_DIR}`);
    return;
  }

  const topics = fs.readdirSync(BASE_DIR).filter(t => 
    fs.statSync(path.join(BASE_DIR, t)).isDirectory()
  );

  console.log(`📁 [Akasha Hybrid] Found ${topics.length} topics\n`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const topic of topics) {
    const topicDir = path.join(BASE_DIR, topic);
    const renderMarker = path.join(topicDir, 'hybrid-render.json');
    const finalVideo = path.join(topicDir, 'final-render.mp4');

    // Skip if already rendered
    if (fs.existsSync(renderMarker) && fs.existsSync(finalVideo)) {
      console.log(`⏭️  [Akasha Hybrid] Skipping ${topic} (already rendered)`);
      skipped++;
      continue;
    }

    console.log(`\n🎬 [Akasha Hybrid] Processing: ${topic}`);

    try {
      const videoPath = await renderFromTopicDir(topicDir, {
        useExistingImages: true, // Try to use existing images first
        addCaptions: true,
        captionFormat: 'ass',
        imageCount: 5
      });

      if (videoPath) {
        console.log(`✅ [Akasha Hybrid] Successfully rendered: ${topic}`);
        processed++;
      } else {
        console.error(`❌ [Akasha Hybrid] Failed to render: ${topic}`);
        failed++;
      }

    } catch (error) {
      console.error(`❌ [Akasha Hybrid] Error processing ${topic}: ${error.message}`);
      failed++;
    }

    // Rate limiting to avoid API throttling
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`\n📊 [Akasha Hybrid] Session Complete:`);
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📹 Total: ${topics.length}\n`);
}

processTopics().catch(error => {
  console.error(`❌ [Akasha Hybrid] Fatal error: ${error.message}`);
  process.exit(1);
});
