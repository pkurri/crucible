import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { callAI } from './ai-fallback-orchestrator.mjs';

/**
 * 🏛️ CRUCIBLE DYNAMIC SCRIPT ARCHITECT
 * Converts the daily niche registry into high-velocity viral scripts.
 */

const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');
const SCRIPTS_FILE = path.join(process.cwd(), 'data', 'viral-scripts.json');

function cleanJSON(str) {
  try {
    return JSON.parse(str.replace(/```json\n?|```/g, '').trim());
  } catch (e) {
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(str.substring(start, end + 1));
    }
    throw e;
  }
}

async function architectScript(niche) {
  console.log(`✍️ [${niche.name}] Architecting viral script via Universal Fallback...`);
  
  const systemPrompt = `You are the "Professional YouTube Scriptwriter" specialized in Retention Optimization.
Your goal is to write high-impact scripts (10-15 seconds) for viral Shorts/Reels.

RETENTION STRUCTURE:
1. Pattern-Interrupt Hook (0-3s): Stop the scroll with an unexpected statement.
2. Curiosity Loop (3-7s): Raise a question that can only be answered at the end.
3. Rapid Payoff (7-12s): Provide the insight or "visual gold".
4. Engagement Trigger (12-15s): Subtle prompt for comments or followers.

Style: Natural, engaging, spoken tone. No generic "AAK Nation" branding in the voiceover.`;

  const keywordsStr = niche.keywords ? niche.keywords.join(', ') : niche.name;
  const userPrompt = `Write a retention-optimized viral script for the niche: "${niche.name}".
Target Emotion: ${niche.targetEmotion || 'Curiosity'}.
Niche Rationale: ${niche.reason || 'High velocity'}.
Visual Keywords: ${keywordsStr}.

CRITICAL:
1. Keep each line under 60 characters for mobile readability.
2. Use intensive, high-stakes language.
3. Ensure a clear "Problem → Insight" transformation.

Return ONLY a JSON object:
{
  "voice": "${niche.voice || 'en-US-GuyNeural'}",
  "lines": [
    { "text": "[PATTERN INTERRUPT HOOK]...", "duration": 4 },
    { "text": "[CURIOSITY LOOP/PROBLEM]...", "duration": 4 },
    { "text": "[INSIGHT/PAYOFF]...", "duration": 4 },
    { "text": "[CTA/ENGAGEMENT]...", "duration": 3 }
  ]
}`;

  try {
    const aiResponse = await callAI(userPrompt, systemPrompt);
    return cleanJSON(aiResponse);
  } catch (e) {
    console.warn(`   ⚠️ Final fallback for ${niche.name} triggered: ${e.message}`);
    return {
      voice: niche.voice || 'en-US-GuyNeural',
      lines: [
        { text: `The secrets of ${niche.name} are finally revealed.`, duration: 5 },
        { text: `Most fail because they lack the proper protocol.`, duration: 5 },
        { text: `Follow the system to win the game.`, duration: 5 }
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

  const filterTopic = process.argv.indexOf('--topic') !== -1 ? process.argv[process.argv.indexOf('--topic') + 1] : null;

  for (const niche of registry.niches) {
    if (filterTopic && niche.name !== filterTopic) continue;

    // Only generate if priority, missing, or explicitly filtered
    if (!existingScripts[niche.name] || niche.priority || filterTopic) {
      existingScripts[niche.name] = await architectScript(niche);
    }
  }

  fs.writeFileSync(SCRIPTS_FILE, JSON.stringify(existingScripts, null, 2));
  console.log(`\n✨ Dynamic scripts saved to ${SCRIPTS_FILE}`);
}

run();
