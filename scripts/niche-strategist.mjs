import fs from 'fs';
import path from 'path';

/**
 * 🎯 CRUCIBLE NICHE STRATEGIST (PROMPT 1)
 * Analyzes market signals to identify high-velocity, under-served faceless niches.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');

async function discoverNiches() {
  console.log('🔍 [Niche Discovery] Analyzing high-velocity market signals...');

  const systemPrompt = `You are a world-class YouTube Growth Strategist. 
Your goal is to identify niches for faceless channels where view demand is accelerating faster than creator supply.
Focus on "New Speed" niches (AI visuals, data breakdowns, cinematic narration).`;

  const userPrompt = `Generate a list of 5 high-velocity YouTube niches suitable for faceless channels that are currently under-served.
For each niche, provide:
1. Name: Niche title.
2. Why: Why it's taking off now.
3. Format: Type of faceless content (clips, narration, Al visuals, etc.).
4. Sigal: Low competition indicator.
5. Repeatability: How easy it is to scale.

Return as a JSON array of objects.`;

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
    const result = JSON.parse(data.choices[0].message.content);
    console.log(`   ✅ Discovered ${result.niches ? result.niches.length : 0} high-growth niches.`);
    return result;
  } catch (e) {
    console.log('   ⚠️ Using Strategist Fallback Blueprints.');
    return {
      niches: [
        {
          name: "Neural-Art Mysteries",
          why: "AI art is evolving faster than people can explain it.",
          format: "Midjourney/Runway Visuals + Dark Ambient Narration",
          signal: "High search volume for 'hidden prompts' and 'AI secrets'.",
          repeatability: "High (Infinite content via prompt variations)"
        },
        {
          name: "Stoic Combat-Log",
          why: "Ancient stoicism applied to modern workplace stress.",
          format: "Animated text + Stock 4K Industrial b-roll",
          signal: "Low supply of high-quality stoic analysis in the 'Career' niche.",
          repeatability: "High (Text-based automation)"
        }
      ]
    };
  }
}

async function run() {
  const niches = await discoverNiches();
  fs.mkdirSync(path.dirname(NICHES_FILE), { recursive: true });
  fs.writeFileSync(NICHES_FILE, JSON.stringify(niches, null, 2));
  console.log(`✨ Strategy report saved to ${NICHES_FILE}`);
}

run();
