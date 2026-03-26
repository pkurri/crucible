#!/usr/bin/env node
/**
 * 🧪 TEST HYBRID RENDER
 * Quick test script to verify hybrid video generation system
 */

import fs from 'fs';
import path from 'path';
import { renderHybridVideo } from './hybrid-video-renderer.mjs';

async function testHybridRender() {
  console.log('🧪 Testing Hybrid Video Render System...\n');

  // Create test directory
  const testDir = path.join(process.cwd(), 'data', 'test-hybrid-render');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Test configuration
  const config = {
    topicDir: testDir,
    topicName: 'Test Spiritual Wisdom',
    scriptText: 'Ancient wisdom teaches us about inner peace and spiritual growth. The path to enlightenment begins with self-awareness and mindfulness.',
    audioPath: null, // Set to audio file path if available
    imageCount: 3,   // Generate 3 images for quick test
    useExistingImages: true, // Use existing test images
    addCaptions: false, // Skip captions for quick test
    captionFormat: 'ass'
  };

  console.log('📋 Test Configuration:');
  console.log(`   Topic: ${config.topicName}`);
  console.log(`   Images: ${config.imageCount}`);
  console.log(`   Captions: ${config.addCaptions}`);
  console.log(`   Output: ${testDir}\n`);

  try {
    const videoPath = await renderHybridVideo(config);

    if (videoPath && fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log('\n✅ TEST PASSED');
      console.log(`   Video: ${videoPath}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log('\n🎬 You can now view the test video!');
    } else {
      console.error('\n❌ TEST FAILED: Video not generated');
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

testHybridRender().catch(error => {
  console.error(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
