import fs from 'fs';
import path from 'path';

/**
 * 🕵️ CRUCIBLE VIRAL METADATA ARCHITECT
 * Generates unique, viral titles and descriptions for every niche.
 * NO branding (No AAK Nation references) in public metadata.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const METADATA_FILE = path.join(process.cwd(), 'data', 'viral-metadata.json');

const TOPICS = [
  'SuccessCodes', 'WealthWizards', 'MysteryArchive', 'PlayfulPixels',
  'ZenGarden', 'FutureTech', 'DailyStoic', 'CookingCzar',
  'TravelTrek', 'AutoArena', 'GamingGuru', 'NatureNook',
  'PulsePolitics', 'CinemaScope', 'LifeHacks', 'MindfulMinutes',
  'GadgetGrab', 'PetParade', 'HistoryHub', 'ForgeCore', 'BioHarmonize'
];

async function generateMetadata(topic) {
  console.log(`\n📑 [${topic}] Architecting viral metadata...`);

  const systemPrompt = `You are a viral metadata strategist for YouTube Shorts and Instagram Reels. 
Your goal is to write titles and descriptions that maximize Click-Through Rate (CTR) for specific niches. 
Rule: DO NOT mention "AAK Nation" or any specific channel name. 
Structure:
- Title: Curiosity-driven, under 60 chars.
- Description: High-hook intro, 3-5 tags.`;

  const userPrompt = `Generate viral metadata for the niche: "${topic}".
Rule: NEVER mention "AAK Nation" or any specific channel name.
Return JSON object:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", ...],
  "ig_hook": "...",
  "fb_hook": "..."
}`;

  try {
    if (!OPENROUTER_KEY || OPENROUTER_KEY.startsWith('REDACTED')) throw new Error('No API Key');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.log(`   ⚠️ Using fallback metadata (Offline/No Key).`);
    const fallbacks = {
      SuccessCodes: { 
        title: 'The 3 Rituals of High-Achievers 🐘', 
        description: 'Unlock your potential with these ancient protocols.\n\n#success #mindset #rituals', 
        tags: ['success', 'mindset', 'ritual'],
        ig_hook: '🙏 Stop scroll. This प्राचीन protocol removes every obstacle. #SuccessMindset #Rituals',
        fb_hook: 'These ancient protocols for success are finally being decoded. Drop a 🙏 if you want the full guide.'
      },
      WealthWizards: { 
        title: 'Why your 401k is a SCAM 📉', 
        description: 'What the 1% knows that you dont. The AI wealth revolution is here.\n\n#wealth #investing #finance', 
        tags: ['wealth', 'finance', 'investing'],
        ig_hook: '💰 Financial advice is DEAD. The AI revolution has already replaced your advisor. #WealthBuilding #Finance',
        fb_hook: 'The old playbook for wealth is dead. AI is rewriting the rules of finance in real-time. Are you adapting?'
      }
    };
    return fallbacks[topic] || {
      title: `${topic} Secret Finally Revealed 🕵️`,
      description: `The deep truth about ${topic} that no one is telling you.\n\n#${topic.toLowerCase()} #viral #fact`,
      tags: [topic.toLowerCase(), 'viral', 'fact'],
      ig_hook: `🔍 The truth about ${topic} is being hidden from you. #viral #${topic.toLowerCase()}`,
      fb_hook: `Most people think ${topic} is about one thing, but it is actually the opposite. Learn why.`
    };
  }
}

async function run() {
  const allMetadata = {};
  for (const topic of TOPICS) {
    allMetadata[topic] = await generateMetadata(topic);
  }
  fs.mkdirSync(path.dirname(METADATA_FILE), { recursive: true });
  fs.writeFileSync(METADATA_FILE, JSON.stringify(allMetadata, null, 2));
  console.log(`\n✨ Viral metadata architected and saved to ${METADATA_FILE}`);
}

run();
