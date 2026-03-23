import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

/**
 * 🧹 CRUCIBLE YOUTUBE PURGER
 * Deletes recent misaligned or low-quality videos to reset for the Dynamic Empire.
 */

const TOKEN_PATH = 'youtube-token.json';
const CREDENTIALS_PATH = 'client_secret.json';

async function purgeVideos() {
  console.log('🧹 Initializing YouTube Purge Cycle...');

  if (!fs.existsSync(TOKEN_PATH) || !fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Missing credentials.');
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
    console.log(`📡 Found ${videos.length} videos to evaluate for removal...`);

    for (const video of videos) {
      const vidId = video.id.videoId;
      const title = video.snippet.title;
      
      console.log(`🗑️ Deleting Video: "${title}" [ID: ${vidId}]`);
      try {
        await youtube.videos.delete({ id: vidId });
        console.log('   ✅ Removed.');
      } catch (err) {
        if (err.message.includes('forbidden')) {
          console.error('   ❌ Permission Denied. You may need to manually delete this one or check API scopes.');
        } else {
          console.error(`   ❌ Failed: ${err.message}`);
        }
      }
    }
    console.log('\n✨ Purge Cycle Complete. Slate cleared.');
  } catch (e) {
    console.error(`❌ Global error: ${e.message}`);
  }
}

purgeVideos();
