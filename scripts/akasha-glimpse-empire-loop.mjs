#!/usr/bin/env node
/**
 * ✨ AKASHA GLIMPSE YOUTUBE EMPIRE LOOP
 * Automated content production and upload for AkashaGlimpse channel
 */

import { runEmpireCycle } from './empire-cycle-core.mjs';
import path from 'path';

// AkashaGlimpse channel configuration
const AKASHA_CONFIG = {
  platform: 'youtube',
  label: 'AKASHA GLIMPSE',
  baseDir: path.join(process.cwd(), 'data', 'youtube-empire', 'AkashaGlimpse', 'topics'),
  stateFile: path.join(process.cwd(), 'data', 'akasha-glimpse-state.json'),
  maxUploads: 3, // Conservative start for spiritual content
  nichePool: 'youtube',
  producerPlatform: 'youtube',
  uploadMarker: 'akasha-glimpse-uploaded',
  uploadFn: async (topic, topicDir, state, stateFile) => {
    const { execSync } = await import('child_process');
    const fs = await import('fs');
    
    console.log(`🌌 [AkashaGlimpse] Uploading: ${topic}`);
    
    try {
      // Upload to YouTube using the official uploader
      const uploadCmd = `node scripts/youtube-official-uploader.mjs --topic "${topic}" --channel "AkashaGlimpse"`;
      execSync(uploadCmd, { stdio: 'inherit', cwd: process.cwd() });
      
      // Mark as uploaded
      const uploadedFile = path.join(topicDir, 'akasha-glimpse-uploaded');
      fs.writeFileSync(uploadedFile, new Date().toISOString());
      
      console.log(`✅ [AkashaGlimpse] Successfully uploaded: ${topic}`);
      return true;
      
    } catch (error) {
      console.error(`❌ [AkashaGlimpse] Upload failed for ${topic}: ${error.message}`);
      return false;
    }
  }
};

// Run the AkashaGlimpse empire cycle
runEmpireCycle(AKASHA_CONFIG).catch(console.error);
