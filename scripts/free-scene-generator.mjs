import fs from 'fs';
import path from 'path';
import { run } from './film-quality-gate.mjs';

/**
 * 🆓 FREE SCENE GENERATOR — zero-cost alternative to veo-scene-generator.
 * Per scene: one AI still (Cloudflare Workers AI Flux free tier, falling back
 * to anonymous Stable Horde) → slow camera move in ffmpeg → Edge TTS narration
 * over a synthesized rain bed (no licensed audio). Writes the same
 * data/film-empire/<slug>/scenes/scene_<n>.mp4 files the assembler expects.
 *
 * Usage: node scripts/free-scene-generator.mjs --treatment <file>
 * Env:   CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN (optional; free plan never bills)
 */

const ROOT = process.cwd();
const BIBLE = path.join(ROOT, 'data', 'film-series-bible.json');
const FPS = 30;
const MIN_SCENE = 6;
const MAX_SCENE = 9;

const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function buildImagePrompt(scene, bible) {
  const c = bible.character;
  return `${scene.visual} The main character is ${c.name}, ${c.description}. Setting: ${bible.world} ` +
    `Style: ${bible.visualStyle}. Cinematic film still, highly detailed. No text, no letters, no logos, no watermark.`;
}

async function cloudflareFlux(prompt, seed, outFile) {
  const { CLOUDFLARE_ACCOUNT_ID: acct, CLOUDFLARE_API_TOKEN: token } = process.env;
  if (!acct || !token) throw new Error('Cloudflare credentials not set');
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt.slice(0, 2048), steps: 8, seed }),
  });
  const json = await res.json().catch(() => ({}));
  const b64 = json?.result?.image || json?.image;
  if (!res.ok || !b64) throw new Error(`Cloudflare ${res.status}: ${json?.errors?.[0]?.message || 'no image'}`);
  fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
}

async function stableHorde(prompt, seed, outFile) {
  const headers = { 'Content-Type': 'application/json', apikey: process.env.STABLE_HORDE_API_KEY || '0000000000' };
  const start = await (await fetch('https://stablehorde.net/api/v2/generate/async', {
    method: 'POST', headers,
    body: JSON.stringify({ prompt: prompt.slice(0, 1000), nsfw: false, censor_nsfw: true, params: { width: 576, height: 1024, steps: 25, seed: String(seed), n: 1, sampler_name: 'k_euler_a' } }),
  })).json();
  if (!start.id) throw new Error(`Stable Horde: ${start.message || 'no job id'}`);
  for (let i = 0; i < 90; i++) { // up to ~15 min: anonymous jobs queue at low priority
    await sleep(10000);
    const check = await (await fetch(`https://stablehorde.net/api/v2/generate/check/${start.id}`)).json();
    if (check.faulted) throw new Error('Stable Horde job faulted');
    if (check.done) break;
  }
  const status = await (await fetch(`https://stablehorde.net/api/v2/generate/status/${start.id}`)).json();
  const img = status.generations?.[0]?.img;
  if (!img) throw new Error('Stable Horde: no image returned (timed out?)');
  const buf = img.startsWith('http') ? Buffer.from(await (await fetch(img)).arrayBuffer()) : Buffer.from(img, 'base64');
  fs.writeFileSync(outFile, buf);
}

async function makeImage(prompt, seed, outFile) {
  try { await cloudflareFlux(prompt, seed, outFile); return 'cloudflare-flux'; }
  catch (e) { console.warn(`   ⚠️  ${e.message}; falling back to Stable Horde.`); }
  await stableHorde(prompt, seed, outFile);
  return 'stable-horde';
}

function tts(text, voice, rate, outFile) {
  const r = run('edge-tts', ['--voice', voice, `--rate=${rate}`, '--text', text, '--write-media', outFile]);
  if (r.status !== 0 || !fs.existsSync(outFile)) throw new Error(`edge-tts failed: ${r.out.slice(0, 300)}`);
}

function audioSeconds(file) {
  const r = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  return Number(r.out.trim()) || 0;
}

// Camera moves cycle so consecutive scenes don't feel identical.
const MOVES = [
  { z: "'min(zoom+0.0009,1.15)'", x: "'iw/2-(iw/zoom/2)'", y: "'ih/2-(ih/zoom/2)'" },            // push in
  { z: "'if(eq(on,0),1.15,max(zoom-0.0009,1.0))'", x: "'iw/2-(iw/zoom/2)'", y: "'ih/2-(ih/zoom/2)'" }, // pull out
  { z: "'1.12'", x: "'(iw-iw/zoom)*on/DUR'", y: "'ih/2-(ih/zoom/2)'" },                            // pan right
  { z: "'1.12'", x: "'(iw-iw/zoom)*(1-on/DUR)'", y: "'ih/2-(ih/zoom/2)'" },                        // pan left
];

/** Still image → D-second 1080x1920 clip: blurred fill + sharp centered image + camera move + voice + rain bed. */
function renderScene(image, voice, duration, moveIdx, outFile) {
  const frames = Math.round(duration * FPS);
  const m = MOVES[moveIdx % MOVES.length];
  const zp = `zoompan=z=${m.z}:x=${m.x.replace('DUR', frames)}:y=${m.y}:d=${frames}:s=1080x1920:fps=${FPS}`;
  const filter = [
    `[0:v]split[a][b]`,
    `[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:4,eq=brightness=-0.12[bg]`,
    `[b]scale=1080:-2[fg]`,
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p,${zp},trim=duration=${duration},setsar=1[v]`,
    `[1:a]adelay=400|400,apad,atrim=0:${duration}[vo]`,
    `[2:a]lowpass=f=1500,highpass=f=200,volume=0.12[rain]`,
    `[vo][rain]amix=inputs=2:normalize=0:duration=first,atrim=0:${duration}[aout]`,
  ].join(';');
  const r = run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
    '-i', image, '-i', voice,
    '-f', 'lavfi', '-t', String(duration), '-i', 'anoisesrc=color=brown:amplitude=0.5:sample_rate=48000',
    '-filter_complex', filter, '-map', '[v]', '-map', '[aout]',
    '-t', String(duration), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-ac', '2', outFile]);
  if (r.status !== 0 || !fs.existsSync(outFile)) throw new Error(`scene render failed: ${r.out.slice(-800)}`);
}

export async function generateFreeScenes({ treatmentPath }) {
  const treatment = JSON.parse(fs.readFileSync(treatmentPath, 'utf8'));
  const bible = JSON.parse(fs.readFileSync(BIBLE, 'utf8'));
  const voice = bible.tts?.voice || 'en-US-AvaNeural';
  const rate = bible.tts?.rate || '-5%';
  const outDir = path.join(ROOT, 'data', 'film-empire', treatment.slug, 'scenes');
  const workDir = path.join(ROOT, 'data', 'film-empire', treatment.slug, 'work');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(workDir, { recursive: true });
  const baseSeed = Math.floor(Math.random() * 1e9);
  treatment.promptsLog = treatment.promptsLog || [];

  // Phase 1: images, 3 at a time (anonymous Stable Horde jobs queue slowly, so overlap them).
  const sources = [];
  const queue = treatment.scenes.map((scene, i) => i);
  const worker = async () => {
    while (queue.length) {
      const i = queue.shift();
      const image = path.join(workDir, `scene_${i + 1}.jpg`);
      if (fs.existsSync(image)) { sources[i] = 'cached'; continue; }
      console.log(`🖼️  Scene ${i + 1}/${treatment.scenes.length}: image...`);
      sources[i] = await makeImage(buildImagePrompt(treatment.scenes[i], bible), baseSeed + i, image);
    }
  };
  await Promise.all([worker(), worker(), worker()]);

  // Phase 2: narration + camera move per scene.
  const files = [];
  for (const [i, scene] of treatment.scenes.entries()) {
    const n = i + 1;
    const outFile = path.join(outDir, `scene_${n}.mp4`);
    if (fs.existsSync(outFile)) { files.push(outFile); continue; }
    const prompt = buildImagePrompt(scene, bible);
    const image = path.join(workDir, `scene_${n}.jpg`);
    const source = sources[i];

    const line = (scene.narration || scene.dialogue || scene.caption).trim();
    const voiceFile = path.join(workDir, `scene_${n}.mp3`);
    tts(line, voice, rate, voiceFile);
    const duration = Math.min(MAX_SCENE, Math.max(MIN_SCENE, audioSeconds(voiceFile) + 1.2));

    renderScene(image, voiceFile, Number(duration.toFixed(2)), i, outFile);
    treatment.promptsLog.push({ scene: n, engine: 'free', imageSource: source, prompt, narration: line, seconds: duration, at: new Date().toISOString() });
    fs.writeFileSync(treatmentPath, JSON.stringify(treatment, null, 2));
    console.log(`   ✅ ${duration.toFixed(1)}s via ${source}`);
    files.push(outFile);
  }
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const treatmentPath = arg('--treatment');
  if (!treatmentPath) { console.error('Usage: --treatment <file>'); process.exit(1); }
  generateFreeScenes({ treatmentPath }).catch(e => { console.error(`❌ ${e.message}`); process.exit(1); });
}
