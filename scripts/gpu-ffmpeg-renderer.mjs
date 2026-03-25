#!/usr/bin/env node
/**
 * 🚀 GPU-ACCELERATED FFMPEG RENDERER
 * Uses NVIDIA CUDA or AMD VCE for 5-10x faster rendering
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function detectGPU() {
  try {
    // Try NVIDIA GPU detection
    execSync('nvidia-smi', { stdio: 'ignore' });
    console.log('✅ [GPU] NVIDIA GPU detected');
    return 'nvidia';
  } catch (e) {
    // NVIDIA not found
  }
  
  try {
    // Try AMD GPU detection (less reliable)
    const gpuInfo = execSync('wmic path win32_VideoController get name', { encoding: 'utf8' });
    if (gpuInfo.toLowerCase().includes('amd') || gpuInfo.toLowerCase().includes('radeon')) {
      console.log('✅ [GPU] AMD GPU detected');
      return 'amd';
    }
  } catch (e) {
    // AMD detection failed
  }
  
  console.log('⚠️ [GPU] No compatible GPU detected - falling back to CPU');
  return null;
}

function renderWithGPU(topicDir, topicName, audioPath, subtitlePath, ffmpegPath) {
  const gpuType = detectGPU();
  
  if (!gpuType) {
    return null; // No GPU available
  }
  
  const assetDir = path.join(topicDir, 'assets');
  const outputFile = path.join(topicDir, 'final-render.mp4');
  
  if (!fs.existsSync(assetDir)) return null;
  
  const images = fs.readdirSync(assetDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  if (images.length < 3) {
    console.error('❌ [GPU] Insufficient assets');
    return null;
  }
  
  console.log(`🚀 [GPU] Rendering with ${gpuType.toUpperCase()} acceleration...`);
  
  const inputs = images.map(img => `-loop 1 -t 5 -i "${path.join(assetDir, img)}"`).join(' ');
  
  // GPU-specific encoder settings
  let encoderSettings = '';
  let hwaccel = '';
  
  if (gpuType === 'nvidia') {
    hwaccel = '-hwaccel cuda -hwaccel_output_format cuda';
    encoderSettings = '-c:v h264_nvenc -preset p4 -tune hq -rc vbr -cq 28';
  } else if (gpuType === 'amd') {
    hwaccel = '-hwaccel d3d11va';
    encoderSettings = '-c:v h264_amf -quality speed -rc vbr_latency -qp_i 28 -qp_p 28';
  }
  
  // Simplified filter without zoompan for speed
  const filters = images.map((_, i) => 
    `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25[v${i}]`
  ).join(';');
  
  const concatPart = images.map((_, i) => `[v${i}]`).join('') + `concat=n=${images.length}:v=1:a=0[vout]`;
  let filterComplex = filters + ';' + concatPart + ';[vout]copy[vfinal]';
  
  let extraInputs = '';
  let mapArgs = '-map "[vfinal]"';
  
  if (audioPath && fs.existsSync(audioPath)) {
    extraInputs = `-i "${audioPath}"`;
    mapArgs = `-map "[vfinal]" -map ${images.length}:a`;
  }
  
  const cmdLine = `"${ffmpegPath}" -y ${hwaccel} ${inputs} ${extraInputs} -filter_complex "${filterComplex}" ${mapArgs} ${encoderSettings} -pix_fmt yuv420p -c:a aac -shortest -movflags +faststart -r 25 "${outputFile}"`;
  
  try {
    execSync(cmdLine, { stdio: 'inherit', timeout: 120000 }); // 2 min timeout
    console.log(`✅ [GPU] Video rendered with ${gpuType.toUpperCase()}: ${outputFile}`);
    return outputFile;
  } catch (e) {
    console.error(`❌ [GPU] Render failed: ${e.message}`);
    return null;
  }
}

export { renderWithGPU, detectGPU };
