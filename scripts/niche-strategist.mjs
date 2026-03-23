import fs from 'fs';
import path from 'path';

/**
 * 🎯 CRUCIBLE DYNAMIC NICHE STRATEGIST
 * Runs daily to discover NEW viral niches and append them to the AAK Nation registry.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');

async function discoverDailyNiche() {
  console.log('🔍 [Niche Strategist] Analyzing real-time viral velocity...');

  const existingNiches = fs.existsSync(NICHES_FILE) 
    ? JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8')).niches 
    : [];

  const existingNames = existingNiches.map(n => n.name).join(', ');

  const systemPrompt = `You are an AI-driven Viral Trend Analyst for Instagram Reels and YouTube Shorts. 
Identify ONE new, high-velocity faceless niche that is NOT in this list: [${existingNames}].
Focus on sub-niches that leverage high-intensity visuals (4K macro, AI-generated, industrial physics).`;

  const userPrompt = `Research and propose 1 NEW viral niche.
Provide:
1. TopicID: CamelCase (e.g. BrainHackers, CyberneticSoul).
2. Platforms: ["meta", "youtube"] (which suits it best).
3. Keywords: 5 high-intensity visual hooks.
4. Voice: 'en-US-GuyNeural' or 'en-US-JennyNeural'.
5. Priority: true.

Return ONLY a JSON object: { "name": "TopicID", "platforms": [], "keywords": [], "voice": "", "priority": true, "reason": "..." }`;

  try {
    if (!OPENROUTER_KEY) throw new Error('No OPENROUTER_API_KEY set.');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const newNiche = JSON.parse(data.choices[0].message.content);
    
    // Clear priority on old ones
    existingNiches.forEach(n => n.priority = false);
    
    // Append
    existingNiches.push(newNiche);
    
    console.log(`✨ [New Niche Discovery] TopicID: ${newNiche.name} prioritized for platforms: ${newNiche.platforms.join(', ')}`);
    return { niches: existingNiches };
  } catch (e) {
    console.error(`❌ Discovery failed: ${e.message}`);
    const fallback = {
      name: `ApexFlow_${Date.now()}`,
      platforms: ["meta", "youtube"],
      keywords: ["Neon liquid", "Data points", "Hyper-car interiors", "Neural networks"],
      voice: "en-US-GuyNeural",
      priority: true,
      reason: "High aesthetic retention rate."
    };
    existingNiches.forEach(n => n.priority = false);
    existingNiches.push(fallback);
    return { niches: existingNiches };
  }
}

async function run() {
  const result = await discoverDailyNiche();
  fs.mkdirSync(path.dirname(NICHES_FILE), { recursive: true });
  fs.writeFileSync(NICHES_FILE, JSON.stringify(result, null, 2));
  console.log(`✅ Viral registry updated at ${NICHES_FILE}`);
}

run();
