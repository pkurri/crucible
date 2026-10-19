import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateText } from './gemini-client.mjs';

/**
 * 🛡️ FILM QUALITY GATE
 * Nothing publishes unless every check passes. Exit 1 blocks the run.
 *
 * Usage:
 *   node scripts/film-quality-gate.mjs --treatment <file> [--video <mp4>] [--state <json>] [--no-critic]
 */

export const BANNED_TITLE = /ApexFlow|Truth Nobody Tells|Untitled|^\s*$/i;
export const MIN_SECONDS = 30;
export const MAX_SECONDS = 60;
export const MIN_CRITIC_SCORE = Number(process.env.FILM_MIN_CRITIC_SCORE || 7);
const SIMILARITY_LIMIT = 0.6;

const tokens = (s = '') => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2));

export function jaccard(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

/** Schema + content rules. Returns a list of failure strings (empty = pass). */
export function validateTreatment(t) {
  const fails = [];
  const str = (v) => typeof v === 'string' && v.trim().length > 0;
  for (const k of ['title', 'logline', 'hook', 'ytTitle', 'ytDescription', 'igCaption']) {
    if (!str(t?.[k])) fails.push(`missing field: ${k}`);
  }
  if (str(t?.title) && BANNED_TITLE.test(t.title)) fails.push(`template/placeholder title: "${t.title}"`);
  if (str(t?.ytTitle) && BANNED_TITLE.test(t.ytTitle)) fails.push(`template/placeholder ytTitle: "${t.ytTitle}"`);
  if (str(t?.ytTitle) && t.ytTitle.length > 100) fails.push('ytTitle longer than 100 chars');
  if (!Array.isArray(t?.tags) || t.tags.length < 3) fails.push('needs at least 3 tags');
  if (!Array.isArray(t?.scenes) || t.scenes.length < 4 || t.scenes.length > 7) {
    fails.push(`needs 4-7 scenes (got ${t?.scenes?.length ?? 0})`);
  } else {
    t.scenes.forEach((s, i) => {
      for (const k of ['visual', 'camera', 'audio', 'caption']) {
        if (!str(s?.[k])) fails.push(`scene ${i + 1} missing ${k}`);
      }
      if (str(s?.caption) && s.caption.length > 70) fails.push(`scene ${i + 1} caption longer than 70 chars`);
    });
  }
  return fails;
}

/** Near-duplicate check against previously published treatments. */
export function findNearDuplicate(t, history = []) {
  const me = `${t.title} ${t.logline}`;
  for (const h of history.slice(-30)) {
    const score = jaccard(me, `${h.title || ''} ${h.logline || ''}`);
    if (score >= SIMILARITY_LIMIT) return { title: h.title, score: Number(score.toFixed(2)) };
  }
  return null;
}

/** Run a binary without a shell; returns stdout + stderr. Throws when it can't start. */
export function run(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw r.error;
  return { out: r.stdout + r.stderr, status: r.status };
}

function ffprobeJson(file) {
  const r = run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]);
  if (r.status !== 0) throw new Error(`ffprobe failed: ${r.out.slice(0, 300)}`);
  return JSON.parse(r.out);
}

/** Technical checks on the rendered master. Returns failure strings. */
export function checkVideo(file) {
  const fails = [];
  if (!fs.existsSync(file)) return [`video not found: ${file}`];
  const probe = ffprobeJson(file);
  const duration = Number(probe.format?.duration || 0);
  const video = probe.streams.find(s => s.codec_type === 'video');
  const audio = probe.streams.find(s => s.codec_type === 'audio');
  if (duration < MIN_SECONDS || duration > MAX_SECONDS) fails.push(`duration ${duration.toFixed(1)}s outside ${MIN_SECONDS}-${MAX_SECONDS}s`);
  if (!video) fails.push('no video stream');
  else if (video.width !== 1080 || video.height !== 1920) fails.push(`resolution ${video.width}x${video.height}, expected 1080x1920`);
  if (!audio) fails.push('no audio stream');

  // Black frames: sum of black_duration reported by blackdetect.
  const black = run('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'blackdetect=d=0.3:pix_th=0.10', '-an', '-f', 'null', '-']).out;
  const blackTotal = [...black.matchAll(/black_duration:([\d.]+)/g)].reduce((a, m) => a + Number(m[1]), 0);
  if (blackTotal > 2) fails.push(`${blackTotal.toFixed(1)}s of black frames`);

  // Integrated loudness (EBU R128) — target -16 LUFS ±3.
  if (audio) {
    const loud = run('ffmpeg', ['-hide_banner', '-i', file, '-af', 'ebur128', '-vn', '-f', 'null', '-']).out;
    const m = [...loud.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop();
    const lufs = m ? Number(m[1]) : NaN;
    if (Number.isNaN(lufs) || lufs < -19 || lufs > -13) fails.push(`loudness ${Number.isNaN(lufs) ? 'unreadable' : lufs + ' LUFS'}, expected -16±3`);
  }
  return fails;
}

/** Gemini critic: scores the treatment (and frames, when given) 1-10. */
export async function critique(t, frames = []) {
  const prompt = `You are a strict short-form film editor. Score this AI short film for YouTube Shorts / Instagram Reels.
Return JSON: {"hook":1-10,"originality":1-10,"coherence":1-10,"overall":1-10,"reason":"one sentence"}.
"overall" must not exceed the lowest of the other three by more than 1. Penalize generic, template-like or clickbait output.
Treatment:\n${JSON.stringify({ title: t.title, logline: t.logline, hook: t.hook, scenes: t.scenes }, null, 2)}`;
  return generateText(prompt, { json: true, images: frames });
}

function extractFrames(video, outDir) {
  const duration = Number(ffprobeJson(video).format.duration);
  fs.mkdirSync(outDir, { recursive: true });
  return [0.1, 0.5, 0.9].map((f, i) => {
    const out = path.join(outDir, `gate_frame_${i}.jpg`);
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', (duration * f).toFixed(2), '-i', video, '-frames:v', '1', '-vf', 'scale=540:-2', out]);
    return out;
  });
}

/** Full gate. Returns { pass, fails, critic }. */
export async function runGate({ treatment, video, history = [], useCritic = true }) {
  const fails = [...validateTreatment(treatment)];
  const dup = findNearDuplicate(treatment, history);
  if (dup) fails.push(`near-duplicate of "${dup.title}" (similarity ${dup.score})`);
  if (video) fails.push(...checkVideo(video));

  let critic = null;
  if (useCritic && fails.length === 0) {
    try {
      const frames = video ? extractFrames(video, path.join(path.dirname(video), 'gate')) : [];
      critic = await critique(treatment, frames);
      if (!(Number(critic.overall) >= MIN_CRITIC_SCORE)) fails.push(`critic score ${critic.overall} < ${MIN_CRITIC_SCORE}: ${critic.reason}`);
    } catch (e) {
      fails.push(`critic unavailable: ${e.message}`); // fail closed: no critic, no publish
    }
  }
  return { pass: fails.length === 0, fails, critic };
}

// ── CLI ───────────────────────────────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
  const treatmentPath = arg('--treatment');
  if (!treatmentPath) { console.error('Usage: --treatment <file> [--video <mp4>] [--state <json>] [--no-critic]'); process.exit(1); }
  const statePath = arg('--state');
  const history = statePath && fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')).history || [] : [];
  const result = await runGate({
    treatment: JSON.parse(fs.readFileSync(treatmentPath, 'utf8')),
    video: arg('--video'),
    history,
    useCritic: !process.argv.includes('--no-critic'),
  });
  if (result.critic) console.log(`🎬 Critic: ${JSON.stringify(result.critic)}`);
  if (result.pass) { console.log('✅ QUALITY GATE PASSED'); }
  else { console.error('🛑 QUALITY GATE FAILED:\n  - ' + result.fails.join('\n  - ')); process.exit(1); }
}
