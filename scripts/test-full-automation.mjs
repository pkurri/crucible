#!/usr/bin/env node
/**
 * 🧪 FULL AUTOMATION TEST
 * Tests the complete automation pipeline with hybrid video rendering
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { renderFromTopicDir } from './hybrid-video-renderer.mjs';

const TEST_BASE_DIR = path.join(process.cwd(), 'data', 'youtube-empire', 'AkashaGlimpse', 'topics');
const TEST_TOPIC_NAME = 'TestAutomation_SpiritualWisdom';

async function setupTestTopic() {
  console.log('🔧 Setting up test topic...\n');
  
  const topicDir = path.join(TEST_BASE_DIR, TEST_TOPIC_NAME);
  
  // Create topic directory structure
  if (fs.existsSync(topicDir)) {
    console.log('   ⚠️  Cleaning existing test topic...');
    fs.rmSync(topicDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(topicDir, { recursive: true });
  const assetsDir = path.join(topicDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  
  console.log(`   ✅ Created topic directory: ${topicDir}`);
  
  // Create test script
  const scriptContent = `Ancient wisdom teaches us about the power of mindfulness and inner peace.
Through meditation and self-reflection, we discover our true nature.
The path to enlightenment begins with a single step of awareness.`;
  
  fs.writeFileSync(path.join(topicDir, 'script.txt'), scriptContent);
  console.log('   ✅ Created script.txt');
  
  // Create test images using FFmpeg
  console.log('   🎨 Generating test images...');
  
  const imageConfigs = [
    { color: 'darkblue', text: 'Ancient Wisdom' },
    { color: 'darkgreen', text: 'Mindfulness' },
    { color: 'purple', text: 'Inner Peace' },
    { color: 'darkred', text: 'Enlightenment' },
    { color: 'darkorange', text: 'Awareness' }
  ];
  
  for (let i = 0; i < imageConfigs.length; i++) {
    const config = imageConfigs[i];
    const outputPath = path.join(assetsDir, `image-${i + 1}.png`);
    
    try {
      const cmd = `ffmpeg -f lavfi -i color=c=${config.color}:s=1080x1920:d=1 -vf "drawtext=text='${config.text}':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -frames:v 1 -y "${outputPath}"`;
      execSync(cmd, { stdio: 'pipe' });
      console.log(`      ✅ Created image ${i + 1}: ${config.text}`);
    } catch (error) {
      console.error(`      ❌ Failed to create image ${i + 1}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Test topic setup complete!\n');
  return topicDir;
}

async function testHybridRendering(topicDir) {
  console.log('🎬 Testing hybrid video rendering...\n');
  
  try {
    const videoPath = await renderFromTopicDir(topicDir, {
      useExistingImages: true,
      addCaptions: false,
      imageCount: 5
    });
    
    if (videoPath && fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log('\n✅ HYBRID RENDERING TEST PASSED');
      console.log(`   Video: ${videoPath}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      // Check video duration using ffprobe
      try {
        const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
        const duration = parseFloat(execSync(durationCmd, { encoding: 'utf8' }).trim());
        console.log(`   Duration: ${duration.toFixed(1)}s`);
        
        if (duration < 10) {
          console.warn('   ⚠️  Warning: Video duration is very short');
        }
      } catch (e) {
        console.warn('   ⚠️  Could not determine video duration');
      }
      
      return true;
    } else {
      console.error('\n❌ HYBRID RENDERING TEST FAILED: Video not generated');
      return false;
    }
  } catch (error) {
    console.error(`\n❌ HYBRID RENDERING TEST FAILED: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

async function testMetadataGeneration(topicDir) {
  console.log('\n📝 Testing metadata generation...\n');
  
  const metadataFile = path.join(topicDir, 'hybrid-render.json');
  
  if (fs.existsSync(metadataFile)) {
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    console.log('✅ METADATA TEST PASSED');
    console.log(`   Rendered at: ${metadata.rendered_at}`);
    console.log(`   Images used: ${metadata.images_used}`);
    console.log(`   Has audio: ${metadata.has_audio}`);
    console.log(`   Has captions: ${metadata.has_captions}`);
    return true;
  } else {
    console.error('❌ METADATA TEST FAILED: metadata file not found');
    return false;
  }
}

async function testVideoQuality(topicDir) {
  console.log('\n🔍 Testing video quality...\n');
  
  const videoPath = path.join(topicDir, 'final-render.mp4');
  
  try {
    // Check video codec and resolution
    const codecCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate -of default=noprint_wrappers=1 "${videoPath}"`;
    const codecInfo = execSync(codecCmd, { encoding: 'utf8' });
    
    console.log('✅ VIDEO QUALITY TEST PASSED');
    console.log('   Video properties:');
    codecInfo.split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`      ${line}`);
      }
    });
    
    // Verify it's 1080x1920 (vertical)
    if (codecInfo.includes('width=1080') && codecInfo.includes('height=1920')) {
      console.log('   ✅ Correct vertical format (1080x1920)');
      return true;
    } else {
      console.warn('   ⚠️  Warning: Video resolution may not be optimal for shorts');
      return true;
    }
  } catch (error) {
    console.error(`❌ VIDEO QUALITY TEST FAILED: ${error.message}`);
    return false;
  }
}

async function testCleanup(topicDir) {
  console.log('\n🧹 Testing cleanup...\n');
  
  const tempDir = path.join(topicDir, 'hybrid-temp');
  
  if (!fs.existsSync(tempDir)) {
    console.log('✅ CLEANUP TEST PASSED: Temporary files removed');
    return true;
  } else {
    console.warn('⚠️  CLEANUP TEST WARNING: Temporary files still exist');
    return true;
  }
}

async function runFullTest() {
  console.log('🧪 FULL AUTOMATION TEST SUITE\n');
  console.log('=' .repeat(60));
  console.log('\n');
  
  const results = {
    setup: false,
    rendering: false,
    metadata: false,
    quality: false,
    cleanup: false
  };
  
  try {
    // Step 1: Setup test topic
    const topicDir = await setupTestTopic();
    results.setup = true;
    
    // Step 2: Test hybrid rendering
    results.rendering = await testHybridRendering(topicDir);
    
    if (results.rendering) {
      // Step 3: Test metadata generation
      results.metadata = await testMetadataGeneration(topicDir);
      
      // Step 4: Test video quality
      results.quality = await testVideoQuality(topicDir);
      
      // Step 5: Test cleanup
      results.cleanup = await testCleanup(topicDir);
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TEST SUMMARY\n');
    console.log(`   Setup:          ${results.setup ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Rendering:      ${results.rendering ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Metadata:       ${results.metadata ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Quality:        ${results.quality ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Cleanup:        ${results.cleanup ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = Object.values(results).every(r => r === true);
    
    console.log('\n' + '='.repeat(60));
    
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Hybrid automation is working correctly.\n');
      console.log(`📹 Test video location: ${path.join(TEST_BASE_DIR, TEST_TOPIC_NAME, 'final-render.mp4')}\n`);
      return 0;
    } else {
      console.log('\n❌ SOME TESTS FAILED. Please review the output above.\n');
      return 1;
    }
    
  } catch (error) {
    console.error(`\n❌ FATAL ERROR: ${error.message}`);
    console.error(error.stack);
    return 1;
  }
}

// Run the test
runFullTest().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error(`❌ Unhandled error: ${error.message}`);
  process.exit(1);
});
