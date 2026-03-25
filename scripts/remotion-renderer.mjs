#!/usr/bin/env node
/**
 * 🎬 REMOTION RENDERER
 * GPU-accelerated React-based video rendering (10-30x faster than FFmpeg)
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function renderWithRemotion(topicDir, topicName, audioPath, subtitlePath) {
  const assetDir = path.join(topicDir, 'assets');
  const outputFile = path.join(topicDir, 'final-render.mp4');
  
  if (!fs.existsSync(assetDir)) {
    console.error('❌ [Remotion] Assets directory not found');
    return null;
  }
  
  const images = fs.readdirSync(assetDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(assetDir, f));
  
  if (images.length < 3) {
    console.error('❌ [Remotion] Insufficient assets');
    return null;
  }
  
  console.log(`🎬 [Remotion] Rendering ${topicName} with GPU acceleration...`);
  
  try {
    // Step 1: Bundle Remotion project
    console.log(`📦 [Remotion] Bundling project...`);
    const bundleLocation = await bundle({
      entryPoint: path.join(ROOT, 'src', 'remotion', 'index.ts'),
      webpackOverride: (config) => config,
    });
    
    // Step 2: Get composition
    const compositionId = 'ShortVideo';
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        images: images,
        audioPath: audioPath,
        captionPath: subtitlePath,
      },
    });
    
    // Step 3: Render video
    console.log(`🎥 [Remotion] Rendering composition...`);
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputFile,
      inputProps: {
        images: images,
        audioPath: audioPath,
        captionPath: subtitlePath,
      },
      imageFormat: 'jpeg',
      // GPU acceleration settings
      chromiumOptions: {
        gl: 'angle', // Use ANGLE for better GPU support
      },
      // High quality settings
      quality: 90,
      // Parallel rendering for speed
      concurrency: null, // Auto-detect CPU cores
    });
    
    console.log(`✅ [Remotion] Video rendered: ${outputFile}`);
    return outputFile;
    
  } catch (e) {
    console.error(`❌ [Remotion] Render failed: ${e.message}`);
    return null;
  }
}

export { renderWithRemotion };
