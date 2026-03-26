#!/usr/bin/env node
/**
 * 📚 YOUTUBE PLAYLIST MANAGER
 * Automatically organizes videos into playlists for better watch time
 */

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const CREDENTIALS_PATH = process.env.YOUTUBE_CREDENTIALS || path.join(process.cwd(), 'youtube-credentials.json');
const TOKEN_PATH = process.env.YOUTUBE_TOKEN || path.join(process.cwd(), 'youtube-token.json');

// Playlist configuration
const PLAYLISTS = {
  'AAK Innovation Shorts': {
    description: 'Daily tech innovations and breakthrough discoveries',
    tags: ['innovation', 'technology', 'shorts']
  },
  'Akasha Glimpse Spiritual': {
    description: 'Ancient wisdom and spiritual insights',
    tags: ['spirituality', 'wisdom', 'hinduism']
  },
  'Top 10 Most Viral': {
    description: 'Our most popular and viral content',
    tags: ['viral', 'trending', 'popular']
  }
};

// ═══════════════════════════════════════════════════════
// 🔐 AUTHENTICATION
// ═══════════════════════════════════════════════════════
async function getAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('YouTube credentials not found. Set YOUTUBE_CREDENTIALS env var.');
  }
  
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
  } else {
    throw new Error('YouTube token not found. Run authentication flow first.');
  }
  
  return oAuth2Client;
}

// ═══════════════════════════════════════════════════════
// 📚 PLAYLIST OPERATIONS
// ═══════════════════════════════════════════════════════
async function getOrCreatePlaylist(youtube, title, description) {
  try {
    // Check if playlist exists
    const response = await youtube.playlists.list({
      part: 'snippet',
      mine: true,
      maxResults: 50
    });
    
    const existing = response.data.items.find(p => p.snippet.title === title);
    if (existing) {
      console.log(`   ✅ Found existing playlist: ${title}`);
      return existing.id;
    }
    
    // Create new playlist
    const createResponse = await youtube.playlists.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: title,
          description: description
        },
        status: {
          privacyStatus: 'public'
        }
      }
    });
    
    console.log(`   ✅ Created new playlist: ${title}`);
    return createResponse.data.id;
    
  } catch (e) {
    console.error(`   ❌ Playlist operation failed: ${e.message}`);
    return null;
  }
}

async function addVideoToPlaylist(youtube, playlistId, videoId) {
  try {
    await youtube.playlistItems.insert({
      part: 'snippet',
      requestBody: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId
          }
        }
      }
    });
    return true;
  } catch (e) {
    if (e.message.includes('videoAlreadyInPlaylist')) {
      return true; // Already in playlist, that's fine
    }
    console.error(`   ❌ Add to playlist failed: ${e.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════
// 🔄 MAIN LOOP
// ═══════════════════════════════════════════════════════
async function main() {
  console.log('📚 YouTube Playlist Manager Starting...\n');
  
  try {
    const auth = await getAuthClient();
    const youtube = google.youtube({ version: 'v3', auth });
    
    // Create/get all playlists
    console.log('📚 Setting up playlists...');
    const playlistIds = {};
    for (const [title, config] of Object.entries(PLAYLISTS)) {
      const id = await getOrCreatePlaylist(youtube, title, config.description);
      if (id) playlistIds[title] = id;
    }
    
    console.log('\n📊 Scanning for videos to organize...');
    
    const baseDirs = [
      path.join(process.cwd(), 'data', 'youtube-empire', 'AkashaGlimpse', 'topics'),
      path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics')
    ];
    
    let organized = 0;
    
    for (const baseDir of baseDirs) {
      if (!fs.existsSync(baseDir)) continue;
      
      const channelName = baseDir.includes('AkashaGlimpse') ? 'Akasha' : 'AAK';
      const defaultPlaylist = channelName === 'Akasha' 
        ? 'Akasha Glimpse Spiritual' 
        : 'AAK Innovation Shorts';
      
      const topics = fs.readdirSync(baseDir).filter(t => 
        fs.statSync(path.join(baseDir, t)).isDirectory()
      );
      
      for (const topic of topics) {
        const topicDir = path.join(baseDir, topic);
        const uploadedFile = path.join(topicDir, 'uploaded', 'youtube.json');
        const playlistMarker = path.join(topicDir, 'playlist-added.json');
        
        if (!fs.existsSync(uploadedFile) || fs.existsSync(playlistMarker)) {
          continue;
        }
        
        try {
          const uploadData = JSON.parse(fs.readFileSync(uploadedFile, 'utf8'));
          const videoId = uploadData.video_id;
          
          if (!videoId) continue;
          
          console.log(`\n📹 Organizing: ${topic}`);
          
          // Add to default playlist
          const playlistId = playlistIds[defaultPlaylist];
          if (playlistId && await addVideoToPlaylist(youtube, playlistId, videoId)) {
            console.log(`   ✅ Added to ${defaultPlaylist}`);
            
            // Mark as added
            fs.writeFileSync(
              playlistMarker,
              JSON.stringify({
                added_at: new Date().toISOString(),
                playlist: defaultPlaylist,
                video_id: videoId
              }, null, 2)
            );
            
            organized++;
          }
          
        } catch (e) {
          console.error(`   ❌ Failed to organize ${topic}: ${e.message}`);
        }
      }
    }
    
    console.log(`\n📊 Session Complete: ${organized} videos organized into playlists`);
    
  } catch (e) {
    console.error(`❌ Fatal error: ${e.message}`);
    process.exit(1);
  }
}

main();
