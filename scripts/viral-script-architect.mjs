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
    if (parsed.lines || parsed.list) return parsed;
    if (parsed.content && typeof parsed.content === 'string') {
       const inner = cleanJSON(parsed.content);
       if (inner.lines || inner.list) return inner;
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
          if (obj.lines || obj.list) return obj;
          // If it's a wrapper object (like OpenRouter response), check content
          if (obj.choices && obj.choices[0]?.message?.content) {
            const nested = cleanJSON(obj.choices[0].message.content);
            if (nested.lines || nested.list) return nested;
          }
        } catch (e) { continue; }
      }
    }
  } catch (e) { /* fall back to error */ }

  throw new Error("Could not extract a valid script JSON with 'lines' or 'list' property.");
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
Your goal is to write high-impact scripts (40-60 seconds) for viral Shorts/Reels.

RETENTION STRUCTURE (8-10 lines required):
1. Pattern-Interrupt Hook (lines 1-2, ~8s): Stop the scroll with an unexpected, high-stakes statement.
2. Body — 3 Revelations (lines 3-5, ~15s): Each line reveals one jaw-dropping fact or insight.
3. Curiosity Bridge (lines 6-7, ~8s): Tease what they'll miss if they don't keep watching.
4. CTA (line 8, ~5s): Direct, urgent call to subscribe/follow.
5. Optional Cliffhanger (lines 9-10, ~6s): Leave them wanting the next video.

CRITICAL: Each line must be under 60 characters. Total script duration MUST be 40-60 seconds.
Style: Natural, engaging, spoken tone. END EVERY SCRIPT WITH: "${hook}"`;

  const format = process.argv.indexOf('--format') !== -1 ? process.argv[process.argv.indexOf('--format') + 1] : 'standard';

  if (format === 'paper-listicle') {
    const listUserPrompt = `Write a viral listicle for the niche: "${niche.name}".
Target Emotion: ${niche.targetEmotion || 'Curiosity'}.
You must provide a hook and a list of exactly 8 items (category, name, emoji icon).

Return ONLY a JSON object:
{
  "voice": "af_heart",
  "hook": "Here are the top 8 ${niche.name} secrets you need to know.",
  "closing": "${hook}",
  "list": [
    { "title": "Category1", "name": "Tool/Item1", "icon": "💎" },
    ... (total 8)
  ]
}
NOTE: Voice must be one of: af_heart, af_alloy, af_bella, am_adam, am_echo, am_michael, bf_emma, bm_george. Default to af_heart.`;
    const aiResponse = await callAI(listUserPrompt, systemPrompt);
    return cleanJSON(aiResponse);
  }

  const keywordsStr = niche.keywords ? niche.keywords.join(', ') : niche.name;
  const userPrompt = `Write a retention-optimized viral script for the niche: "${niche.name}".
Target Emotion: ${niche.targetEmotion || 'Curiosity'}.
Niche Rationale: ${niche.reason || 'High velocity'}.
Visual Keywords: ${keywordsStr}.

CRITICAL:
1. Write EXACTLY 8-10 lines. Total duration must be 40-60 seconds.
2. Keep each line under 60 characters for mobile readability.
3. Use intensive, high-stakes language with emotional triggers.
4. Follow structure: Hook (2 lines) → 3 Revelations (3 lines) → Curiosity Bridge (2 lines) → CTA (1 line) → optional Cliffhanger (1-2 lines).
5. Ensure a clear "Problem → Insight → Transformation" arc.

Return ONLY a JSON object:
{
  "voice": "${niche.voice || 'en-US-GuyNeural'}",
  "lines": [
    { "text": "[PATTERN INTERRUPT HOOK - unexpected statement]", "duration": 5 },
    { "text": "[RAISE THE STAKES - why this matters NOW]", "duration": 4 },
    { "text": "[REVELATION 1 - jaw-dropping fact]", "duration": 5 },
    { "text": "[REVELATION 2 - deeper insight]", "duration": 5 },
    { "text": "[REVELATION 3 - the twist or surprise]", "duration": 5 },
    { "text": "[CURIOSITY BRIDGE - tease what comes next]", "duration": 4 },
    { "text": "[AMPLIFY BRIDGE - raise urgency]", "duration": 4 },
    { "text": "${hook}", "duration": 5 },
    { "text": "[CLIFFHANGER - hint at next video topic]", "duration": 4 }
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
        { text: `Nobody talks about the truth of ${niche.name}.`, duration: 5 },
        { text: `And that silence is costing you everything.`, duration: 5 },
        { text: `The data shows 97% of people get this wrong.`, duration: 5 },
        { text: `The real pattern only 3% ever discover.`, duration: 5 },
        { text: `It was hidden in plain sight the entire time.`, duration: 5 },
        { text: `Once you see it, you cannot unsee it.`, duration: 4 },
        { text: `Most will scroll past this and stay behind.`, duration: 4 },
        { text: hook, duration: 5 },
        { text: `Next: the method that changes everything.`, duration: 4 }
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
