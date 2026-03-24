import fs from 'fs';
import path from 'path';
import 'dotenv/config';

/**
 * 🎯 CRUCIBLE DYNAMIC NICHE VETTER (V2)
 * Orchestrates the discovery and vetting of high-velocity YouTube/Meta niches.
 * Uses the Growth Strategy Personas to ensure only 1M+ subscriber potential niches are prioritized.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');

function cleanJSON(str) {
  try {
    return JSON.parse(str.replace(/```json\n?|```/g, '').trim());
  } catch (e) {
    // If it still fails, try to extract first { and last }
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(str.substring(start, end + 1));
    }
    throw e;
  }
}

async function discoverAndVetNiche() {
  console.log('🔍 [Niche Strategist] Analyzing real-time viral velocity & vetting candidate...');

  const existingNiches = fs.existsSync(NICHES_FILE) 
    ? JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8')).niches 
    : [];

  const existingNames = existingNiches.map(n => n.name).join(', ');

  const systemPrompt = `You are the YouTube Growth Strategist Suite (Channel Strategy Architect & Viral Video Idea Generator). 
Your task is to identify and VET ONE high-velocity faceless niche.
A niche is ONLY valid if it can realistically reach 1M+ subscribers and 100K+ views per video.

CRITERIA FOR VETTING:
1. Differentiation: Can it be positioned uniquely against [${existingNames}]?
2. Retention Potential: Does it support "Scroll-Stopping" hooks and "Curiosity Loops"?
3. Target Emotion: Does it trigger specific emotions (curiosity, fear, wonder)?
4. Scalability: Can you generate 25+ unique viral ideas for this?

VETTING PROCESS:
- Discover a niche candidates.
- Generate 5 Sample Viral Video Ideas using the "Viral Video Idea Generator" persona.
- Assign a 'ViralScore' (1.0 - 10.0). Only niches > 8.5 should be prioritized.`;

  const userPrompt = `Research and propose 1 NEW, VETTED viral niche.
Provide:
1. TopicID: CamelCase (e.g., QuantumSecrets, StoicPrestige).
2. Platforms: ["meta", "youtube"].
3. ViralScore: Numeric (1.0 - 10.0).
4. TargetEmotion: one word (e.g. Curiosity, Fear, Awe).
5. ViralRationale: Why this topic has viral potential right now.
6. SampleViralIdeas: List of 3 "Viral Idea Generator" style titles and hooks.
7. Keywords: 5 high-intensity visual keywords.
8. Voice: 'en-US-GuyNeural' or 'en-US-JennyNeural'.
9. Priority: true.

Return ONLY a JSON object: 
{ 
  "name": "TopicID", 
  "platforms": [], 
  "viralScore": 0.0, 
  "targetEmotion": "",
  "reason": "ViralRationale...", 
  "ideas": ["Title / Hook..."],
  "keywords": [], 
  "voice": "", 
  "priority": true 
}`;

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
    const newNiche = cleanJSON(data.choices[0].message.content);
    
    if (newNiche.viralScore < 8.0) {
      console.warn(`⚠️ [Vetter] Niche ${newNiche.name} rejected with score ${newNiche.viralScore}.`);
      return { niches: existingNiches }; 
    }

    // Clear priority on old ones
    existingNiches.forEach(n => n.priority = false);
    
    // Append
    existingNiches.push(newNiche);
    
    console.log(`✨ [Vetted & Prioritized] TopicID: ${newNiche.name} | Score: ${newNiche.viralScore}/10 | Emotion: ${newNiche.targetEmotion}`);
    console.log(`💡 Sample Idea: ${newNiche.ideas[0]}`);
    
    return { niches: existingNiches };
  } catch (e) {
    console.error(`❌ Vetting failed: ${e.message}`);
    // Fallback niche (Vetted standard)
    const fallback = {
      name: `ApexFlow_${Date.now()}`,
      platforms: ["meta", "youtube"],
      viralScore: 8.5,
      targetEmotion: "Awe",
      reason: "High aesthetic flow videos have high retention and shareability.",
      ideas: ["NEON LIQUID SECRETS / 99% of people miss the hidden pattern in physics."],
      keywords: ["Neon liquid", "Data points", "Hyper-car interiors", "Neural networks"],
      voice: "en-US-GuyNeural",
      priority: true
    };
    existingNiches.forEach(n => n.priority = false);
    existingNiches.push(fallback);
    return { niches: existingNiches };
  }
}

async function run() {
  const result = await discoverAndVetNiche();
  fs.mkdirSync(path.dirname(NICHES_FILE), { recursive: true });
  fs.writeFileSync(NICHES_FILE, JSON.stringify(result, null, 2));
  console.log(`✅ Viral registry updated at ${NICHES_FILE}`);
}

run();

