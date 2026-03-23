import { google } from 'googleapis';
import { readFileSync, existsSync, createReadStream, mkdirSync, renameSync } from 'fs';
import path from 'path';

/**
 * 🚢 CRUCIBLE OFFICIAL YOUTUBE UPLOADER
 * This script handles the final "Push" of your AI-generated content to YouTube.
 */

const TOKEN_PATH = 'youtube-token.json';
const CREDENTIALS_PATH = 'client_secret.json';

const getArg = (key) => {
  const index = process.argv.indexOf(key);
  return index !== -1 ? process.argv[index + 1] : null;
};

async function uploadVideo() {
  const topicName = getArg('--topic') || 'SuccessCodes';
  const channelName = 'AAK-Nation'; // Forced consolidation
  console.log(`🚀 Initializing Crucible Official Uploader for ${channelName} [Series: ${topicName}]...`);

  if (!existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Missing client_secret.json. Please ensure your OAuth credentials are in the root.');
    process.exit(1);
  }

  if (!existsSync(TOKEN_PATH)) {
    console.error('❌ Missing youtube-token.json. Run youtube-auth-test.mjs first.');
    process.exit(1);
  }

  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;
  const tokens = JSON.parse(readFileSync(TOKEN_PATH));

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris ? redirect_uris[0] : 'http://localhost:3001/oauth2callback');
  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // 🏛️ DYNAMIC METADATA ARCHITECTURE
  const METADATA_PATH = path.join(process.cwd(), 'data', 'viral-metadata.json');
  let videoData = {
    title: `${topicName} | Facts You Didn't Know`,
    description: `Exploring the hidden depth of ${topicName}. Like and Subscribe for more facts.`,
    tags: [topicName, 'viral', 'facts'],
    category: '27'
  };

  if (existsSync(METADATA_PATH)) {
    const allMeta = JSON.parse(readFileSync(METADATA_PATH));
    if (allMeta[topicName]) {
      videoData = allMeta[topicName];
      if (!videoData.category) videoData.category = '27';
      console.log(`   💎 Local Viral Metadata loaded for ${topicName}.`);
    }
  }

  const isUpdateBio = process.argv.includes('--update-bio');
  if (isUpdateBio) {
    console.log(`📡 Updating Channel Bio for ${channelName} (Handshake Proof)...`);
    try {
      const res = await youtube.channels.list({ part: 'snippet', mine: true });
      const channel = res.data.items[0];
      const snippet = channel.snippet;
      snippet.description = `Crucible Empire [${channelName}]: VERIFIED 🚀\nQuality: 4K UHD Optimized.`;
      await youtube.channels.update({
        part: 'snippet',
        requestBody: { id: channel.id, snippet: snippet }
      });
      console.log('✅ Channel Bio Updated Successfully!');
      return;
    } catch (err) {
      console.error('❌ Bio Update Error: ' + err.message);
      return;
    }
  }

  const videoFilePath = path.join(process.cwd(), 'data', 'youtube-empire', channelName, 'topics', topicName, 'final-render.mp4');

  if (!existsSync(videoFilePath)) {
    console.log('⚠️ No real video file found at: ' + videoFilePath);
    console.log('📡 Performing "Handshake Check" instead...');
    const res = await youtube.channels.list({ part: 'snippet', mine: true });
    const channel = res.data.items[0];
    console.log('✅ Connectivity Verified: ' + (channel ? channel.snippet.title : 'Unknown'));
    return;
  }

  console.log(`🚢 Pushing 4K Video to ${channelName}...`);

  try {
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: videoData.title,
          description: videoData.description,
          tags: videoData.tags,
          categoryId: videoData.category,
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: channelName === 'PlayfulPixels', 
        },
      },
      media: {
        body: createReadStream(videoFilePath),
      },
    });

    console.log(`✅ ${channelName} UPLOAD SUCCESSFUL!`);
    console.log('🔗 Video ID: ' + response.data.id);

    // 📦 ARCHIVAL LOGIC: Move to 'uploaded' folder
    const uploadedDir = path.join(path.dirname(videoFilePath), 'uploaded');
    if (!existsSync(uploadedDir)) mkdirSync(uploadedDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archvePath = path.join(uploadedDir, `uploaded_${timestamp}.mp4`);
    
    renameSync(videoFilePath, archvePath);
    console.log(`📦 Archived: ${path.basename(videoFilePath)} -> ${path.basename(archvePath)}`);

  } catch (err) {
    console.error('❌ Upload Error: ' + err.message);
  }
}

uploadVideo();
