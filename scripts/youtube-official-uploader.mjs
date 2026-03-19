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
       title: 'The Unstoppable Protocol: Why Lord Ganesha is Your Secret Success Code 🐘💎',
       description: 'Unlock higher dimensions of productivity. Lord Ganesha isn\'t just a story; He is the universal removal of obstacles.\n\n#Ganesha #Success #Mindset #4K #Viral',
       tags: ['ganesha', 'productivity', 'success', 'aaktion', '4k', 'wisdom'],
       category: '27'
    },
    'PlayfulPixels': {
       title: 'Magic ABC Adventure: Hyper-Visual Learning for Kids! 🌈👶',
       description: 'Can learning be this vibrant? 3D letters jumping through rainbow portals in 4K.\n\n#Learning #Alphabet #KidsEducation #FamilyFriendly #Shorts',
       tags: ['kids', 'abc', '4k', 'nurseryrhymes', 'education'],
       category: '1',
       madeForKids: true
    },
    'WealthWizards': {
       title: 'THE INSIDER EDGE: Why AI is Rewriting the Finance Manual 📉🤖',
       description: 'Deep-blue market intel in institutional 4K. Stay ahead or get left behind.\n\n#Finance #Investing #AI #Crypto #WealthWizards',
       tags: ['finance', 'passiveincome', 'ai', 'stocks', 'trading'],
       category: '27'
    },
    'ChefCipher': {
       title: 'THE FLAVOR MATRIX: 3 AI-Assisted Cooking Hacks That Shouldn\'t Be Legal 🧪🍔',
       description: 'Molecular results using standard kitchen logic. Computational gastronomy in 4K.\n\n#Cooking #FoodHacks #Science #ChefCipher #4K',
       tags: ['cooking', 'recipes', 'futureoffood', 'gastronomy', 'ai'],
       category: '22'
    },
    'CodeCrucible': {
       title: 'THE ARCHITECTS TRAP: Why Your Microservices Are Failing (And How to Fix It) 💻⚙️',
       description: 'Industrial-grade software design explained in clear 4K logic.\n\n#Coding #SystemDesign #SoftwareEngineering #JavaScripts #Architecture',
       tags: ['coding', 'programming', 'architecture', 'dev', 'softwaredesign'],
       category: '28'
    },
    'PixelPioneers': { title: '1984 vs 2026: Giving a Vintage Mac a Neural Link 🖥️🧠', description: 'Retro tech meets the AI Singularity in 4K.\n#Tech #Retro #AI #History', tags: ['retro', 'vintage', 'ai', 'tech'], category: '28' },
    'LogicLoom': { title: 'THE PARADOX REVEALED: Why Everything You Know is a Loop 🌀🗿', description: 'Deep logic and philosophical deep dives in stunning 4K.\n#Philosophy #Logic #DeepThink', tags: ['philosophy', 'logic', 'paradox', 'mindblowing'], category: '27' },
    'NeonNexus': { title: 'CYBERPUNK 2026: The Hidden Tech Already Living in Your City 🏙️🌃', description: 'Exploring the neon edge of future cities in 4K.\n#Cyberpunk #Future #Tech #Aesthetic', tags: ['cyberpunk', 'future', 'neon', 'cityscape'], category: '28' },
    'AeroArc': { title: 'VERTICAL LIMIT: The Impossible Physics of Next-Gen Propulsion 🚀🔥', description: 'Aerospace engineering at the absolute limit. 4K Fire and Steel.\n#SpaceX #NASA #Engineering #Aerospace', tags: ['rocket', 'aerospace', 'physics', 'engineering'], category: '28' },
    'CircuitSage': { title: 'SILICON SECRETS: The Hidden Logic Inside Your iPhone 📱🔍', description: 'Macro-scale hardware deep dives in 4K UHD.\n#Hardware #Teardown #Electronics #Engineering', tags: ['electronics', 'hardware', 'teardown', 'circuits'], category: '28' },
    'QuantumQuiver': { title: 'THE QUANTUM GHOST: Visualizing the Sub-Atomic Matrix 🌌⚛️', description: 'Seeing the invisible in 4K quantum simulations.\n#Physics #Quantum #Universe #Science', tags: ['quantum', 'physics', 'science', 'universe'], category: '27' },
    'DataDruid': { title: 'INFINITE DATA: How the Internet Actually Consumes Your Mind 🌐🧠', description: 'The absolute scale of Big Data visualized in 4K.\n#DataScience #BigData #Internet #Secrets', tags: ['data', 'analytics', 'internet', 'tech'], category: '28' },
    'EchoEther': { title: 'CYBERPUNK RAIN: Immersion Protocol for Deep Focus 🌧️🌆', description: '4K ASMR and ambient futuristic soundscapes.\n#LoFi #Focus #Study #Immersion', tags: ['ambient', 'lofi', 'focus', 'asmr'], category: '10' },
    'VortexVantage': { title: 'CHAOS CONTROL: The Beautiful Math of Fluid Destabilization 🌊🔥', description: 'Stunning 4K fluid simulations and physics art.\n#Physics #Art #Satisfying #FluidSim', tags: ['satisfying', 'physics', 'art', 'vortex'], category: '27' },
    'SummitSphere': { title: 'ABOVE THE CLOUDS: Impossible Landscapes Rendered in 8K Detail 🏔️🚁', description: 'Ultra-high fidelity travel and nature captures.\n#Travel #Nature #4K #Landscapes', tags: ['travel', 'nature', 'landscape', 'photography'], category: '19' },
    'GridGrit': { title: 'CONCRETE JUNGLE: The Brutalist Aesthetics of Modern Architecture 🏗️🏛️', description: 'Finding beauty in the industrial grid in 4K.\n#Architecture #Design #Industrial #Brutalism', tags: ['architecture', 'design', 'industrial', 'grid'], category: '19' },
    'BioBeam': { title: 'CRISPR DREAMS: Re-Coding the Human Genome in 4K 🧬🧪', description: 'The terrifying and beautiful future of Biotech.\n#Biotech #Science #Genetics #Future', tags: ['biology', 'science', 'crispr', 'biohacking'], category: '28' },
    'StellarSync': { title: 'THE GALACTIC CORE: Real Space Recordings You Weren\'t Meant to See 🔭🌌', description: 'Outer space mysteries in 4K UHD clarity.\n#Space #Universe #NASA #Telescope', tags: ['space', 'universe', 'astronomy', 'stars'], category: '28' },
    'TerraTable': { title: 'WAR GAMES: Topographical Mapping of Current Global Shifts 🗺️🎖️', description: '3D geopolitics and terrain analysis in 4K.\n#Geography #History #Maps #Strategy', tags: ['maps', 'geopolitics', 'strategy', 'history'], category: '19' },
    'PrismPro': { title: 'COLOR THEORY: The Psychological Warfare of Visual Branding 🎨🎭', description: 'How light and color manipulate your choices. 4K Optics.\n#Design #Art #ColorTheory #Branding', tags: ['art', 'design', 'color', 'theory'], category: '10' }
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
