import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 🏛️ CRUCIBLE VIRAL SCRIPT ARCHITECT
 * Generates high-velocity, word-by-word viral scripts for the YouTube Empire.
 * Uses patterns: Curiosity Gaps, Polarity, Authority, and Trend-Surfing.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const SCRIPTS_FILE = path.join(process.cwd(), 'data', 'viral-scripts.json');

const TOPICS = [
  'SuccessCodes', 'WealthWizards', 'MysteryArchive', 'PlayfulPixels',
  'ZenGarden', 'FutureTech', 'DailyStoic', 'CookingCzar',
  'TravelTrek', 'AutoArena', 'GamingGuru', 'NatureNook',
  'PulsePolitics', 'CinemaScope', 'LifeHacks', 'MindfulMinutes',
  'GadgetGrab', 'PetParade', 'HistoryHub', 'ForgeCore', 'BioHarmonize'
];

async function generateViralScript(topic) {
  console.log(`\n✍️ [${topic}] Architecting viral script...`);
  
  const systemPrompt = `You are a viral YouTube scriptwriter for faceless channels. 
Your goal is to write a high-velocity script (approx 45-60 seconds) that uses:
1. Curiosity Gap: Start with a pattern interrupt.
2. Polarity: Take a strong stance.
3. Word-by-word delivery: Short, punchy sentences.
4. Retention: No fluff. Every sentence must move the story forward.
RULE: NEVER mention "AAK Nation" or any specific channel name. Focus purely on the niche.`;

  const userPrompt = `Write a viral script for a niche called "${topic}".
Theme: ${topic}
Structure:
- Hook (3-5 seconds): Must stop the scroll.
- Body (30-40 seconds): High density value or controversy.
- CTA (5 seconds): Engagement trigger (e.g. "Subscribe for more").

Return the result as a JSON object:
{
  "voice": "en-US-GuyNeural",
  "lines": [
    { "text": "Hook line...", "duration": 5 },
    { "text": "Body line 1...", "duration": 5 },
    ...
  ]
}`;

  try {
    if (!OPENROUTER_KEY || OPENROUTER_KEY.startsWith('REDACTED')) {
      throw new Error('No API Key');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001', // Fast and smart for scripts
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    console.log(`   ✅ Script architected with ${content.lines.length} lines.`);
    return content;
  } catch (e) {
    console.log(`   ⚠️ Using fallback viral blueprint (Offline/No Key).`);
    // Fallback logic for SuccessCodes as example
    const blueprints = {
      SuccessCodes: {
        voice: 'en-US-GuyNeural',
        lines: [
          { text: '99% of people are using the Ganesha Protocol the WRONG way.', duration: 5 },
          { text: 'He is not just a deity. He is the Universal Protocol for removing obstacles in your neural path.', duration: 5 },
          { text: 'Stop praying for success. Start executing the code.', duration: 5 },
          { text: 'This is AAK Nation. Subscribe to unlock the full protocol.', duration: 5 }
        ]
      },
      WealthWizards: {
        voice: 'en-US-GuyNeural',
        lines: [
          { text: 'Financial advice is DEAD. The AI revolution has already replaced your advisor.', duration: 5 },
          { text: 'The old playbook is for losers. We are mapping the market in real-time with neural logic.', duration: 5 },
          { text: 'Watch the next 30 seconds to see how we decode the volatility.', duration: 5 },
          { text: 'WealthWizards. The future of finance is on AAK Nation.', duration: 5 }
        ]
      }
    };
    return blueprints[topic] || {
      voice: 'en-US-GuyNeural',
      lines: [
        { text: `The truth about ${topic} is being hidden from you.`, duration: 5 },
        { text: `Most people think ${topic} is about one thing, but it is actually the opposite.`, duration: 5 },
        { text: `Stay tuned as we decode the logic of ${topic}.`, duration: 5 },
        { text: `This is AAK Nation. Join the empire now.`, duration: 5 }
      ]
    };
  }
}

async function run() {
  console.log('🚀 Starting Viral Script Architecture Cycle...');
  const allScripts = {};

  for (const topic of TOPICS) {
    allScripts[topic] = await generateViralScript(topic);
  }

  fs.mkdirSync(path.dirname(SCRIPTS_FILE), { recursive: true });
  fs.writeFileSync(SCRIPTS_FILE, JSON.stringify(allScripts, null, 2));
  console.log(`\n✨ Viral scripts saved to ${SCRIPTS_FILE}`);
}

run();
