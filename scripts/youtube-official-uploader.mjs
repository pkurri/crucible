import { google } from 'googleapis';
import { readFileSync, existsSync, createReadStream } from 'fs';
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
  const channelName = getArg('--channel') || 'AAK-tion';
  console.log(`🚀 Initializing Crucible Official Uploader for ${channelName}...`);

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

  // 📦 METADATA LOGIC
  const channelConfigs = {
    'AAK-tion': {
       title: 'Lord Ganesha: The Secret Science of Removing Obstacles (4K Success Guide)',
       description: 'Unlock ancient wisdom in 4K HD. Lord Ganesha isn\'t just a story; He is a protocol for high-performance.\n\n#4K #UltraHD #Success #Wisdom',
       tags: ['ganesha', '4k', 'success', 'aaktion', 'wisdom'],
       category: '27'
    },
    'PlayfulPixels': {
       title: 'ABC Animal Adventures (4K Kids Learning)',
       description: 'Learning the alphabet has never been so vibrant. Ultra HD 4K educational fun for kids!\n\n#4K #Kids #Learning #ABC',
       tags: ['kids', 'abc', '4k', 'learning', 'playfulpixels'],
       category: '1'
    },
    'WealthWizards': {
       title: 'Market Intel: AI & The New Economy (4K Finance)',
       description: 'Institutional-grade finance intel in 4K HD resolution. Stay ahead of the curve.',
       tags: ['finance', 'ai', '4k', 'wealth', 'investing'],
       category: '27'
    },
    'ChefCipher': {
       title: 'AI Recipe Hacks: The Future of Flavor (4K Cooking)',
       description: 'Computational gastronomy in stunning 4K detail. Re-designing your kitchen logic.',
       tags: ['cooking', 'recipes', '4k', 'food', 'chef'],
       category: '22'
    },
    'CodeCrucible': {
       title: 'Industrial Code Snippets: Micro-Service Logic (4K Dev)',
       description: 'Clean code in clear 4K. Architecting the future one line at a time.',
       tags: ['coding', 'programming', '4k', 'dev', 'softwaredesign'],
       category: '28'
    }
  };

  const videoData = channelConfigs[channelName] || channelConfigs['AAK-tion'];

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

  const videoFilePath = path.join(process.cwd(), 'data', 'youtube-empire', channelName, 'final-render.mp4');

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
          privacyStatus: 'unlisted',
          selfDeclaredMadeForKids: channelName === 'PlayfulPixels', 
        },
      },
      media: {
        body: createReadStream(videoFilePath),
      },
    });

    console.log(`✅ ${channelName} UPLOAD SUCCESSFUL!`);
    console.log('🔗 Video ID: ' + response.data.id);
  } catch (err) {
    console.error('❌ Upload Error: ' + err.message);
  }
}

uploadVideo();
