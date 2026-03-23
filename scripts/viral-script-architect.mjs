import fs from 'fs';
import path from 'path';

/**
 * 🏛️ CRUCIBLE DYNAMIC SCRIPT ARCHITECT
 * Converts the daily niche registry into high-velocity viral scripts.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');
const SCRIPTS_FILE = path.join(process.cwd(), 'data', 'viral-scripts.json');

async function architectScript(niche) {
  console.log(`✍️ [${niche.name}] Architecting viral script...`);
  
  const systemPrompt = `You are a viral scriptwriter for premium educational/entertainment Reels. 
Write short, punchy, word-by-word delivery scripts (15-20 seconds).
Focus on: Pattern Interrupt, High Logic, and a strong Viral Hook.`;

  const userPrompt = `Write a viral script for "${niche.name}".
Niche context: ${niche.reason || 'High velocity'}.
Visual Keywords: ${niche.keywords.join(', ')}.

Return ONLY a JSON object:
{
  "voice": "${niche.voice || 'en-US-GuyNeural'}",
  "lines": [
    { "text": "HOOK (e.g. 99% of people are wrong about...)", "duration": 5 },
    { "text": "THE LOGIC (e.g. The truth is...)", "duration": 5 },
    { "text": "THE PAYOFF (e.g. This is how you win.)", "duration": 5 }
  ]
}`;

  try {
    if (!OPENROUTER_KEY) throw new Error('No Key');

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
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.warn(`   ⚠️ Using fallback for ${niche.name}`);
    return {
      voice: niche.voice || 'en-US-GuyNeural',
      lines: [
        { text: `The truth about ${niche.name} is being hidden from you.`, duration: 5 },
        { text: `Most people fail because they lack the protocol.`, duration: 5 },
        { text: `Follow the system. This is AAK Nation.`, duration: 5 }
      ]
    };
  }
}

async function run() {
  if (!fs.existsSync(NICHES_FILE)) {
    console.error('❌ No niches file found.');
    return;
  }

  const registry = JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8'));
  const existingScripts = fs.existsSync(SCRIPTS_FILE) ? JSON.parse(fs.readFileSync(SCRIPTS_FILE, 'utf8')) : {};

  for (const niche of registry.niches) {
    // Only generate if priority or missing
    if (!existingScripts[niche.name] || niche.priority) {
      existingScripts[niche.name] = await architectScript(niche);
    }
  }

  fs.writeFileSync(SCRIPTS_FILE, JSON.stringify(existingScripts, null, 2));
  console.log(`\n✨ Dynamic scripts saved to ${SCRIPTS_FILE}`);
}

run();
