import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * 🎨 CRUCIBLE VISUAL PROMPT ARCHITECT
 * Upgrades simple keywords into high-fidelity, cinematic visual prompts.
 * Designed to stop the scroll with extreme detail and atmospheric lighting.
 */

const OUTPUT_FILE = 'data/empire-prompts-daily.json';

const engineConfigs = [
  { channel: 'SuccessCodes', niche: 'Spiritual/Success', keywords: ['Ganesha', 'Gold circuits', 'Infinite mirrors', 'Cosmic removal of obstacles'] },
  { channel: 'WealthWizards', niche: 'Finance/AI', keywords: ['Neural trading floor', 'Glass terminals', 'Holographic data streams', 'Hyper-wealth aesthetics'] },
  { channel: 'MysteryArchive', niche: 'True Crime/Mystery', keywords: ['Kodachrome 1970s', 'Flickering evidence room', 'Noir shadows', 'Red string conspiracy'] },
  { channel: 'PlayfulPixels', niche: 'Kids/Education', keywords: ['Floating candy alphabets', 'Neon jungle', 'Holographic pets', 'Portal of learning'] },
  { channel: 'ZenGarden', niche: 'Meditation/Ambient', keywords: ['Liquid glass waterfalls', 'Glowing lotus', 'Bioluminescent sand', 'Ethereal atmosphere'] },
  { channel: 'FutureTech', niche: 'Hardware/AI', keywords: ['Cerebral silicon', 'Superheated processors', 'Laser manufacturing', 'Techno-organic architecture'] },
  { channel: 'DailyStoic', niche: 'Philosophy', keywords: ['Marble statues in rain', 'Flickering torchlight', 'Ancient stone corridors', 'Weathered faces'] },
  { channel: 'CookingCzar', niche: 'Food Science', keywords: ['Molecular collisions', 'Hyper-macro spices', 'Sizzling plasma heat', 'Luminescence in liquids'] }
];

function architectVisualPrompt(config) {
  const aesthetic = "Extreme 8K resolution, cinematic lighting, volumetric fog, Unreal Engine 5 render style, hyper-realistic textures, shot on 35mm lens, f/1.8 deep depth of field.";
  const visualHook = config.keywords.join(' + ');
  
  return {
    channel: config.channel,
    prompt: `${visualHook}. ${aesthetic}. Atmospheric, moody, stopping power. High contrast, sharp edges, metallic reflections. 4K vertical ratio 9:16.`,
    vibe: `Viral ${config.niche} Visual Architecture`
  };
}

async function run() {
  console.log('💎 Architecting High-Intensity Visual Briefs...');
  
  const dailyBrief = engineConfigs.map(architectVisualPrompt);

  writeFileSync(OUTPUT_FILE, JSON.stringify(dailyBrief, null, 2));
  console.log(`✅ Visual Architecture saved to ${OUTPUT_FILE}`);
  console.log('🚀 Visuals are now synced with Viral Script intensity.');
}

run();
