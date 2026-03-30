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
  // 1. Basic cleaning
  const cleaned = str.replace(/```json\n?|```/g, '').trim();
  
  // 2. Try parsing entire string first
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.lines) return parsed;
    if (parsed.content && typeof parsed.content === 'string') {
       const inner = cleanJSON(parsed.content);
       if (inner.lines) return inner;
    }
    // If it's a message object but no lines, it might be in content as JSON
  } catch (e) { /* ignore and try regex extraction */ }

  // 3. RegEx extraction for innermost { "lines": ... } or outermost object
  try {
    const matches = str.match(/\{[\s\S]*\}/g);
    if (matches) {
      // Sort by length (descending) to find the most probable candidate or try each
      for (const match of matches) {
        try {
          const obj = JSON.parse(match);
          if (obj.lines) return obj;
          // If it's a wrapper object (like OpenRouter response), check content
          if (obj.choices && obj.choices[0]?.message?.content) {
            const nested = cleanJSON(obj.choices[0].message.content);
            if (nested.lines) return nested;
          }
        } catch (e) { continue; }
      }
    }
  } catch (e) { /* fall back to error */ }

  throw new Error("Could not extract a valid script JSON with 'lines' property.");
}

const SUB_HOOKS = [
  "Don't let the algorithm hide the truth. Follow for more [topic].",
  "If you want to master [topic], you're in the right place. Subscribe.",
  "Stop scrolling. This is your sign to level up. Follow.",
  "99% miss the hidden pattern. Be the 1% who sees it. Join us."
];

async function architectScript(niche) {
  const hook = SUB_HOOKS[Math.floor(Math.random() * SUB_HOOKS.length)].replace('[topic]', niche.name);
  console.log(`✍️ [${niche.name}] Architecting viral script via Universal Fallback...`);
  
  const systemPrompt = `You are the "Professional YouTube Scriptwriter" specialized in Retention Optimization.
Your goal is to write high-impact scripts (10-15 seconds) for viral Shorts/Reels.

RETENTION STRUCTURE:
1. Pattern-Interrupt Hook (0-3s): Stop the scroll with an unexpected statement.
2. Curiosity Loop (3-7s): Raise a question that can only be answered at the end.
3. Rapid Payoff (7-12s): Provide the insight or "visual gold".
4. Engagement Trigger (12-15s): Strong CTA for followers/subscribers.

Style: Natural, engaging, spoken tone. END EVERY SCRIPT WITH: "${hook}"`;

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
    { "text": "${hook}", "duration": 3 }
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
