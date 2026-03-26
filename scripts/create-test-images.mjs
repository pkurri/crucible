#!/usr/bin/env node
/**
 * Create test images for hybrid video system testing
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const outputDir = path.join(process.cwd(), 'data', 'test-hybrid-render', 'assets');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Creating test images with FFmpeg...\n');

const colors = [
  { name: 'blue', color: 'blue' },
  { name: 'green', color: 'green' },
  { name: 'purple', color: 'purple' }
];

for (let i = 0; i < colors.length; i++) {
  const color = colors[i];
  const outputPath = path.join(outputDir, `test-${i + 1}.png`);
  
  try {
    // Create colored image with text using FFmpeg
    const cmd = `ffmpeg -f lavfi -i color=c=${color.color}:s=1080x1920:d=1 -vf "drawtext=text='Test Image ${i + 1}':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -frames:v 1 -y "${outputPath}"`;
    
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ Created: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to create ${outputPath}: ${error.message}`);
  }
}

console.log('\n✅ Test images created successfully!');
