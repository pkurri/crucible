#!/usr/bin/env node
/**
 * 🎬 SHOTSTACK CLOUD RENDERER
 * Ultra-fast cloud-based video rendering (10-30s)
 * Free tier: 20 renders/month
 */

import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY || 'stage-key'; // Use stage key for testing
const SHOTSTACK_API_URL = SHOTSTACK_API_KEY.startsWith('stage') 
  ? 'https://api.shotstack.io/stage' 
  : 'https://api.shotstack.io/v1';

async function uploadToCatbox(filePath) {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('fileToUpload', fs.createReadStream(filePath));
  form.append('reqtype', 'fileupload');
  
  try {
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    });
    const url = await response.text();
    return url.trim();
  } catch (e) {
    console.error(`❌ [Catbox] Upload failed: ${e.message}`);
    return null;
  }
}

async function renderWithShotstack(topicDir, topicName, audioPath) {
  const assetDir = path.join(topicDir, 'assets');
  const outputFile = path.join(topicDir, 'final-render.mp4');
  
  if (!fs.existsSync(assetDir)) {
    console.error('❌ [Shotstack] Assets directory not found');
    return null;
  }
  
  const imagePaths = fs.readdirSync(assetDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(assetDir, f));
  
  if (imagePaths.length < 3) {
    console.error('❌ [Shotstack] Insufficient assets');
    return null;
  }
  
  console.log(`🎬 [Shotstack] Rendering ${topicName} in the cloud...`);
  console.log(`📤 [Shotstack] Uploading ${imagePaths.length} images to CDN...`);
  
  // Upload images to public CDN (required for Shotstack)
  const imageUrls = [];
  for (const imgPath of imagePaths) {
    const url = await uploadToCatbox(imgPath);
    if (!url) {
      console.error('❌ [Shotstack] Image upload failed, aborting');
      return null;
    }
    imageUrls.push(url);
  }
  
  console.log(`✅ [Shotstack] All images uploaded to CDN`);
  
  // Build Shotstack JSON template
  const clips = imageUrls.map((url, i) => ({
    asset: {
      type: 'image',
      src: url
    },
    start: i * 5,
    length: 5,
    fit: 'cover',
    scale: 1.2,
    position: 'center',
    transition: {
      in: 'fade',
      out: 'fade'
    }
  }));
  
  const timeline = {
    tracks: [
      {
        clips: clips
      }
    ]
  };
  
  // Upload audio if exists
  if (audioPath && fs.existsSync(audioPath)) {
    console.log(`📤 [Shotstack] Uploading audio to CDN...`);
    const audioUrl = await uploadToCatbox(audioPath);
    if (audioUrl) {
      timeline.tracks.push({
        clips: [{
          asset: {
            type: 'audio',
            src: audioUrl
          },
          start: 0,
          length: imageUrls.length * 5
        }]
      });
      console.log(`✅ [Shotstack] Audio uploaded`);
    }
  }
  
  const renderPayload = {
    timeline: timeline,
    output: {
      format: 'mp4',
      resolution: 'hd',
      fps: 25,
      size: {
        width: 1080,
        height: 1920
      }
    }
  };
  
  try {
    // Submit render job
    const renderResponse = await fetch(`${SHOTSTACK_API_URL}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHOTSTACK_API_KEY
      },
      body: JSON.stringify(renderPayload)
    });
    
    if (!renderResponse.ok) {
      const errorText = await renderResponse.text();
      throw new Error(`Shotstack API error: ${renderResponse.status} - ${errorText}`);
    }
    
    const renderData = await renderResponse.json();
    const renderId = renderData.response.id;
    
    console.log(`📡 [Shotstack] Render job submitted: ${renderId}`);
    console.log(`⏳ [Shotstack] Waiting for cloud render to complete...`);
    
    // Poll for completion
    let status = 'queued';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max wait
    
    while (status !== 'done' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`${SHOTSTACK_API_URL}/render/${renderId}`, {
        headers: { 'x-api-key': SHOTSTACK_API_KEY }
      });
      
      const statusData = await statusResponse.json();
      status = statusData.response.status;
      
      if (status === 'failed') {
        throw new Error(`Shotstack render failed: ${statusData.response.error}`);
      }
      
      console.log(`⏳ [Shotstack] Status: ${status} (${attempts * 5}s elapsed)`);
      attempts++;
    }
    
    if (status !== 'done') {
      throw new Error('Shotstack render timeout');
    }
    
    // Get final status data
    const finalStatusResponse = await fetch(`${SHOTSTACK_API_URL}/render/${renderId}`, {
      headers: { 'x-api-key': SHOTSTACK_API_KEY }
    });
    const finalStatusData = await finalStatusResponse.json();
    
    // Download rendered video
    const videoUrl = finalStatusData.response.url;
    console.log(`⬇️ [Shotstack] Downloading rendered video...`);
    
    const videoResponse = await fetch(videoUrl);
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    fs.writeFileSync(outputFile, videoBuffer);
    
    console.log(`✅ [Shotstack] Video rendered and downloaded: ${outputFile}`);
    return outputFile;
    
  } catch (e) {
    console.error(`❌ [Shotstack] Render failed: ${e.message}`);
    return null;
  }
}

export { renderWithShotstack };
