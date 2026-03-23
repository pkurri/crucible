import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

/**
 * 🛠️ CRUCIBLE YOUTUBE METADATA SURGERY
 * Fixes repetitive and generic video metadata using AI.
 */

const TOKEN_PATH = 'youtube-token.json';
const CREDENTIALS_PATH = 'client_secret.json';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

async function runSurgery() {
  console.log('🧪 Starting Metadata Surgery...');

  if (!fs.existsSync(TOKEN_PATH) || !fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Missing YouTube credentials.');
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  const { client_id, client_secret, redirect_uris } = credentials.web || credentials.installed;

  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris ? redirect_uris[0] : 'http://localhost:3001/oauth2callback');
  auth.setCredentials(tokens);

  const youtube = google.youtube({ version: 'v3', auth });

  try {
    const res = await youtube.search.list({
      part: 'snippet',
      forMine: true,
      type: 'video',
      maxResults: 20,
      order: 'date'
    });

    const videos = res.data.items;
    console.log(`📡 Analyzing ${videos.length} recent videos...`);

    const titleCounts = {};

    for (const video of videos) {
      const vidId = video.id.videoId;
      const currentTitle = video.snippet.title;
      
      // Registry of seen titles to detect duplicates
      titleCounts[currentTitle] = (titleCounts[currentTitle] || 0) + 1;
      const isDuplicate = titleCounts[currentTitle] > 1;
      const isGeneric = currentTitle.includes('SERIES') || currentTitle.includes('PROTOCOL') || currentTitle.includes('|');

      if (isDuplicate || isGeneric) {
        console.log(`\n🚨 Fixing: "${currentTitle}" [ID: ${vidId}]`);
        
        // Extract a "Base Topic" for AI
        const baseTopic = currentTitle.split(':')[0].split('|')[0].replace('THE ', '').replace(' SERIES', '').trim();
        
        const viral = await generateUniqueViralHook(baseTopic, titleCounts[currentTitle]);
        if (viral) {
          console.log(`   ✨ New Title: "${viral.title}"`);
          await youtube.videos.update({
            part: 'snippet',
            requestBody: {
              id: vidId,
              snippet: {
                title: viral.title,
                description: viral.description + "\n\n#shorts #viral #growth",
                categoryId: '27'
              }
            }
          });
          console.log('   ✅ Updated.');
        }
      }
    }
    console.log('\n🏁 Surgery Complete.');
  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
  }
}

async function generateUniqueViralHook(topic, variantSeed) {
  if (!OPENROUTER_KEY) return null;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{
          role: 'user', content: `Generate a unique, viral YouTube Shorts title and description for a video about: "${topic}".
Variation: ${variantSeed} (make it different from other versions).
Rules: Max 100 chars, use curiosity gaps, no "SuccessCodes" or "Series" branding.
{ "title": "...", "description": "..." }`
        }],
        response_format: { type: 'json_object' }
      })
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return null;
  }
}

runSurgery();
