import fs from 'fs';
import path from 'path';
import { GEMINI_BASE, apiKey, geminiFetch } from './gemini-client.mjs';

/**
 * 🎥 VEO SCENE GENERATOR (Veo 3.1 via the official Gemini API)
 * Renders one 8s 9:16 clip (with native audio) per treatment scene.
 * Output: data/film-empire/<slug>/scenes/scene_<n>.mp4
 *
 * Usage: node scripts/veo-scene-generator.mjs --treatment <file> [--max-clips 6]
 * Env:   GOOGLE_API_KEY, VEO_MODEL (default veo-3.1-fast-generate-preview),
 *        VEO_MAX_CLIPS_PER_DAY (default 6), VEO_RESOLUTION (720p | 1080p)
 */

const ROOT = process.cwd();
const BIBLE = path.join(ROOT, 'data', 'film-series-bible.json');
const MODEL = process.env.VEO_MODEL || 'veo-3.1-fast-generate-preview';
const RESOLUTION = process.env.VEO_RESOLUTION || '720p';
const POLL_MS = 10000;
const POLL_LIMIT = 60; // 10 minutes per clip
const RETRIES = 2;

const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Compose a self-contained Veo prompt: Veo sees only this text, so restate character + style every time. */
export function buildVeoPrompt(scene, bible) {
  const c = bible.character;
  return [
    `${scene.visual}`,
    `Camera: ${scene.camera}.`,
    `The main character is ${c.name}, ${c.description}.`,
    `Setting: ${bible.world}`,
    `Style: ${bible.visualStyle}. Vertical 9:16 framing.`,
    `Audio: ${scene.audio}. ${bible.audioStyle}.`,
    scene.dialogue ? `${c.name} says, in a ${c.voice} voice: "${scene.dialogue}"` : 'No dialogue.',
    'No on-screen text, no subtitles, no logos, no watermarks.',
  ].join(' ');
}

function referenceImages(bible) {
  // Optional character sheet(s) for consistency: bible.referenceImages = ["data/film-series/kai.png", ...]
  return (bible.referenceImages || []).filter(p => fs.existsSync(path.join(ROOT, p))).slice(0, 3).map(p => ({
    image: { inlineData: { mimeType: p.endsWith('.png') ? 'image/png' : 'image/jpeg', data: fs.readFileSync(path.join(ROOT, p)).toString('base64') } },
    referenceType: 'asset',
  }));
}

async function generateClip(prompt, refs, outFile) {
  const body = {
    instances: [{ prompt, ...(refs.length ? { referenceImages: refs } : {}) }],
    parameters: { aspectRatio: '9:16', durationSeconds: '8', resolution: RESOLUTION },
  };
  const op = await geminiFetch(`${GEMINI_BASE}/models/${MODEL}:predictLongRunning`, { method: 'POST', body: JSON.stringify(body) });
  if (!op?.name) throw new Error(`no operation returned: ${JSON.stringify(op).slice(0, 200)}`);

  let status = op;
  for (let i = 0; !status.done && i < POLL_LIMIT; i++) {
    await sleep(POLL_MS);
    status = await geminiFetch(`${GEMINI_BASE}/${op.name}`);
  }
  if (!status.done) throw new Error('timed out waiting for Veo');
  if (status.error) throw new Error(`Veo error: ${status.error.message}`);

  const resp = status.response?.generateVideoResponse;
  const uri = resp?.generatedSamples?.[0]?.video?.uri;
  if (!uri) {
    const filtered = resp?.raiMediaFilteredReasons?.join('; ');
    throw new Error(filtered ? `blocked by safety filter: ${filtered}` : 'no video URI in response');
  }
  const res = await fetch(uri, { headers: { 'x-goog-api-key': apiKey() }, redirect: 'follow' });
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
  fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
}

export async function generateScenes({ treatmentPath, maxClips }) {
  const treatment = JSON.parse(fs.readFileSync(treatmentPath, 'utf8'));
  const bible = JSON.parse(fs.readFileSync(BIBLE, 'utf8'));
  const cap = Number(maxClips || process.env.VEO_MAX_CLIPS_PER_DAY || 6);
  const scenes = treatment.scenes.slice(0, cap);
  if (scenes.length < treatment.scenes.length) console.warn(`⚠️  Clip cap ${cap}: rendering ${scenes.length}/${treatment.scenes.length} scenes.`);

  const outDir = path.join(ROOT, 'data', 'film-empire', treatment.slug, 'scenes');
  fs.mkdirSync(outDir, { recursive: true });
  const refs = referenceImages(bible);
  treatment.promptsLog = treatment.promptsLog || [];

  const files = [];
  for (const [i, scene] of scenes.entries()) {
    const outFile = path.join(outDir, `scene_${i + 1}.mp4`);
    if (fs.existsSync(outFile)) { files.push(outFile); continue; } // resume after partial failure
    const prompt = buildVeoPrompt(scene, bible);
    let lastErr;
    for (let attempt = 0; attempt <= RETRIES; attempt++) {
      try {
        console.log(`🎥 Scene ${i + 1}/${scenes.length} (${MODEL}, attempt ${attempt + 1})...`);
        await generateClip(prompt, refs, outFile);
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        console.warn(`   ⚠️  ${e.message}`);
        if (/blocked by safety|API key|billing|PERMISSION_DENIED|not found/i.test(e.message)) break; // retrying won't help
        await sleep(15000 * (attempt + 1));
      }
    }
    treatment.promptsLog.push({ scene: i + 1, model: MODEL, prompt, ok: !lastErr, error: lastErr?.message, at: new Date().toISOString() });
    fs.writeFileSync(treatmentPath, JSON.stringify(treatment, null, 2));
    if (lastErr) throw new Error(`Scene ${i + 1} failed: ${lastErr.message}`);
    files.push(outFile);
  }
  console.log(`✅ ${files.length} scene clip(s) in ${outDir}`);
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const treatmentPath = arg('--treatment');
  if (!treatmentPath) { console.error('Usage: --treatment <file> [--max-clips N]'); process.exit(1); }
  generateScenes({ treatmentPath, maxClips: arg('--max-clips') })
    .catch(e => { console.error(`❌ ${e.message}`); process.exit(1); });
}
