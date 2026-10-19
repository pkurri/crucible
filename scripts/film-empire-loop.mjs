import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { loadState, saveState, getToday } from './empire-cycle-core.mjs';
import { createTreatment } from './film-treatment-architect.mjs';
import { generateScenes } from './veo-scene-generator.mjs';
import { assemble } from './film-assembler.mjs';
import { runGate } from './film-quality-gate.mjs';

/**
 * 🎬 FILM EMPIRE LOOP — one AI short film per day, published natively to
 * YouTube Shorts and Instagram Reels from the same master.
 *
 *   treatment → Veo scenes → assembly → quality gate → YouTube → Instagram
 *
 * Usage: node scripts/film-empire-loop.mjs [--no-upload] [--force]
 *   --no-upload  produce + gate only (local testing)
 *   --force      run even if today's episode already exists
 */

const ROOT = process.cwd();
const STATE = path.join(ROOT, 'scripts', 'film-empire-state.json');
const METADATA = path.join(ROOT, 'data', 'viral-metadata.json');
const FILM_DIR = path.join(ROOT, 'data', 'film-empire');
const DISCLOSURE = '🎬 AI-generated short film.';

const noUpload = process.argv.includes('--no-upload');
const force = process.argv.includes('--force');

function writeMetadata(t) {
  const all = fs.existsSync(METADATA) ? JSON.parse(fs.readFileSync(METADATA, 'utf8')) : {};
  all[t.slug] = {
    title: t.ytTitle,
    description: `${t.ytDescription}\n\n${DISCLOSURE}`,
    tags: t.tags,
    category: '1', // Film & Animation
    synthetic: true,
    ig_hook: `${t.igCaption}\n\n${DISCLOSURE}`,
    series: t.series,
  };
  fs.writeFileSync(METADATA, JSON.stringify(all, null, 2));
}

/** Each uploader consumes its file (moves/deletes it), so give each platform its own copy. */
function stageCopy(master, platform, slug) {
  const dir = path.join(FILM_DIR, platform, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(master, path.join(dir, 'final-render.mp4'));
  return path.join(FILM_DIR, platform);
}

function runNode(args) {
  const r = spawnSync('node', args, { encoding: 'utf8', env: process.env, maxBuffer: 16 * 1024 * 1024 });
  const out = (r.stdout || '') + (r.stderr || '');
  process.stdout.write(out);
  return { ok: r.status === 0, out };
}

function uploadYouTube(master, slug) {
  const basedir = stageCopy(master, 'youtube', slug);
  const r = runNode(['scripts/youtube-official-uploader.mjs', '--topic', slug, '--basedir', basedir]);
  const id = r.out.match(/Video ID: (\S+)/)?.[1];
  if (r.ok && r.out.includes('UPLOAD SUCCESSFUL') && id) return { ok: true, id };
  if (/invalid_grant/.test(r.out)) console.error('❌ YouTube token dead — run `node scripts/youtube-auth-test.mjs` locally.');
  return { ok: false };
}

function uploadInstagram(master, slug) {
  const basedir = stageCopy(master, 'instagram', slug);
  const r = runNode(['scripts/meta-official-uploader.mjs', '--topic', slug, '--target', 'insta', '--basedir', basedir]);
  const id = r.out.match(/Media ID: (\S+)/)?.[1];
  return r.ok && id ? { ok: true, id } : { ok: false };
}

async function main() {
  const state = loadState(STATE);
  const today = getToday();
  if (!force && state.history.some(h => h.date?.startsWith(today))) {
    console.log(`⏭️  Today's episode already exists (${today}). Skipping.`);
    return;
  }
  console.log(`\n🎬 FILM EMPIRE — ${new Date().toISOString()}`);

  const { file, treatment } = await createTreatment({ statePath: STATE });
  await generateScenes({ treatmentPath: file });
  const master = assemble({ treatmentPath: file });

  const gate = await runGate({ treatment, video: master, history: state.history });
  if (gate.critic) console.log(`🎬 Critic: ${JSON.stringify(gate.critic)}`);
  const episode = {
    slug: treatment.slug, title: treatment.title, logline: treatment.logline,
    date: new Date().toISOString(), gate: gate.pass ? 'passed' : 'failed', critic: gate.critic?.overall ?? null, platforms: {},
  };
  if (!gate.pass) {
    console.error('🛑 QUALITY GATE FAILED — nothing published:\n  - ' + gate.fails.join('\n  - '));
    episode.gateFails = gate.fails;
    state.history.push(episode); // keeps the idea out of future treatments too
    saveState(STATE, state);
    process.exitCode = 1;
    return;
  }
  console.log('✅ QUALITY GATE PASSED');

  if (noUpload) {
    console.log(`🧪 --no-upload: master kept at ${path.relative(ROOT, master)}`);
    return;
  }

  writeMetadata(treatment);
  const yt = uploadYouTube(master, treatment.slug);
  episode.platforms.youtube = yt.ok ? yt.id : 'failed';
  const ig = uploadInstagram(master, treatment.slug);
  episode.platforms.instagram = ig.ok ? ig.id : 'failed';

  state.history.push(episode);
  state.lastUploadDate = today;
  state.uploadsToday = [yt, ig].filter(x => x.ok).length;
  saveState(STATE, state);

  console.log(`\n🏆 "${treatment.title}" — YouTube: ${episode.platforms.youtube}, Instagram: ${episode.platforms.instagram}`);
  if (!yt.ok || !ig.ok) process.exitCode = 1;
}

main().catch(err => {
  console.error(`❌ Film loop failed: ${err.message}`);
  process.exit(1);
});
