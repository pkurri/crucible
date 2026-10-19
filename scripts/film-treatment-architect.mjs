import fs from 'fs';
import path from 'path';
import { generateText } from './gemini-client.mjs';
import { callAI } from './ai-fallback-orchestrator.mjs';
import { validateTreatment, findNearDuplicate } from './film-quality-gate.mjs';

/**
 * ✍️ FILM TREATMENT ARCHITECT
 * Writes one episode treatment for the series in data/film-series-bible.json.
 * Output: data/film-treatments/<date>-<slug>.json (prints TREATMENT_PATH: <file>)
 *
 * Usage: node scripts/film-treatment-architect.mjs [--state scripts/film-empire-state.json] [--scenes 6]
 */

const ROOT = process.cwd();
const BIBLE = path.join(ROOT, 'data', 'film-series-bible.json');
const OUT_DIR = path.join(ROOT, 'data', 'film-treatments');
const MAX_ATTEMPTS = 3;

const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };

export function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'episode';
}

function buildPrompt(bible, history, sceneCount, feedback) {
  const past = history.slice(-30).map(h => `- ${h.title}: ${h.logline}`).join('\n') || '- (none yet)';
  return `Write the next episode of the series "${bible.series}".

SERIES BIBLE
Premise: ${bible.premise}
Main character: ${bible.character.name}, ${bible.character.description}. Voice: ${bible.character.voice}.
World: ${bible.world}
Tone: ${bible.tone}
Rules:\n${bible.rules.map(r => `- ${r}`).join('\n')}

PREVIOUS EPISODES (do not repeat their object, recipient or twist):
${past}

STRUCTURE (a ${sceneCount * 8}-second vertical short film, exactly ${sceneCount} scenes of 8 seconds each):
- Scene 1 is the hook: the strangest visual of the episode in the first 3 seconds, before any explanation.
- Middle scenes: the delivery, the impossible object, rising tension.
- Final scene: the twist/reveal, then ${bible.character.name} delivers the call to action "${bible.cta}" in one short line.

Each scene is rendered by an AI video model that sees only that scene's text, so every "visual" must describe the full shot on its own:
subject and action, setting, lighting. Keep each "visual" under 60 words. Put the camera move in "camera" (e.g. "slow dolly-in", "handheld tracking shot").
"audio" lists sound effects and ambience. "dialogue" is at most one short spoken line (or ""). "caption" is the on-screen text (max 60 chars).

Return JSON only:
{
  "title": "episode title (no clickbait, no emojis)",
  "logline": "one sentence",
  "hook": "what the viewer sees in the first 3 seconds",
  "scenes": [{"visual": "", "camera": "", "audio": "", "dialogue": "", "caption": ""}],
  "ytTitle": "YouTube title under 70 chars, ends with #Shorts",
  "ytDescription": "2-3 sentences about this episode, then 3 hashtags",
  "tags": ["5-8 tags"],
  "igCaption": "Instagram caption: one-line hook, one sentence, 5 hashtags"
}${feedback ? `\n\nYour previous attempt was rejected for: ${feedback}. Fix these issues.` : ''}`;
}

function parseJson(text) {
  const m = String(text).match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no JSON object in response');
  return JSON.parse(m[0]);
}

async function draft(prompt) {
  const system = 'You are the showrunner of a serialized AI short-film channel. You write tight, visual, original episodes.';
  if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
    try { return await generateText(prompt, { system, json: true }); }
    catch (e) { console.warn(`⚠️  Gemini failed (${e.message}); trying fallback LLMs.`); }
  }
  return parseJson(await callAI(prompt, system));
}

export async function createTreatment({ statePath, sceneCount = 6 } = {}) {
  const bible = JSON.parse(fs.readFileSync(BIBLE, 'utf8'));
  const history = statePath && fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')).history || [] : [];

  let feedback = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`✍️  Drafting treatment (attempt ${attempt}/${MAX_ATTEMPTS})...`);
    let t;
    try { t = await draft(buildPrompt(bible, history, sceneCount, feedback)); }
    catch (e) { feedback = `invalid output (${e.message})`; console.warn(`   ${feedback}`); continue; }

    if (Array.isArray(t.scenes)) t.scenes = t.scenes.slice(0, sceneCount);
    const fails = validateTreatment(t);
    const dup = findNearDuplicate(t, history);
    if (dup) fails.push(`too similar to "${dup.title}"`);
    if (fails.length) { feedback = fails.join('; '); console.warn(`   rejected: ${feedback}`); continue; }

    const date = new Date().toISOString().split('T')[0];
    t.slug = `${date}-${slugify(t.title)}`;
    t.series = bible.series;
    t.createdAt = new Date().toISOString();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const file = path.join(OUT_DIR, `${t.slug}.json`);
    fs.writeFileSync(file, JSON.stringify(t, null, 2));
    console.log(`✅ Treatment: "${t.title}" — ${t.logline}`);
    console.log(`TREATMENT_PATH: ${file}`);
    return { file, treatment: t };
  }
  // Never fall back to a placeholder episode: a skipped day beats a template upload.
  throw new Error(`No valid treatment after ${MAX_ATTEMPTS} attempts. Last issues: ${feedback}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  createTreatment({ statePath: arg('--state'), sceneCount: Number(arg('--scenes') || 6) })
    .catch(e => { console.error(`❌ ${e.message}`); process.exit(1); });
}
