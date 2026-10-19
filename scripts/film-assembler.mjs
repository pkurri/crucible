import fs from 'fs';
import path from 'path';
import { run } from './film-quality-gate.mjs';

/**
 * 🎞️ FILM ASSEMBLER
 * Stitches Veo scene clips into one 1080x1920 master with crossfades, burned
 * captions (most short-form is watched muted), a 1s end-frame hold and
 * EBU R128 loudness normalization (-16 LUFS). Keeps Veo's native audio only.
 *
 * Usage: node scripts/film-assembler.mjs --treatment <file>
 * Output: data/film-empire/<slug>/final-render.mp4
 */

const ROOT = process.cwd();
const FADE = 0.4;
const END_HOLD = 1;

const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };

function probe(file) {
  const r = run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]);
  if (r.status !== 0) throw new Error(`ffprobe failed on ${file}`);
  const j = JSON.parse(r.out);
  return { duration: Number(j.format.duration), hasAudio: j.streams.some(s => s.codec_type === 'audio') };
}

const assTime = (t) => {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = (t % 60).toFixed(2).padStart(5, '0');
  return `${h}:${String(m).padStart(2, '0')}:${s}`;
};
const assText = (s) => s.replace(/\\/g, '').replace(/[{}]/g, '').replace(/\n/g, ' ');

/** Caption cues: one per scene, visible while that scene is fully on screen. */
export function buildAss(captions, durations) {
  let t = 0;
  const events = captions.map((cap, i) => {
    const start = t + (i === 0 ? 0.2 : FADE);
    const end = t + durations[i] - (i === captions.length - 1 ? -END_HOLD : FADE) - 0.1;
    t += durations[i] - FADE;
    return `Dialogue: 0,${assTime(start)},${assTime(end)},Caption,,0,0,0,,${assText(cap)}`;
  });
  return `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,DejaVu Sans,64,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,5,2,2,80,80,420,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events.join('\n')}
`;
}

export function assemble({ treatmentPath }) {
  const treatment = JSON.parse(fs.readFileSync(treatmentPath, 'utf8'));
  const dir = path.join(ROOT, 'data', 'film-empire', treatment.slug);
  const scenesDir = path.join(dir, 'scenes');
  const clips = fs.readdirSync(scenesDir).filter(f => /^scene_\d+\.mp4$/.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
    .map(f => path.join(scenesDir, f));
  if (clips.length < 2) throw new Error(`need at least 2 scene clips, found ${clips.length}`);

  const meta = clips.map(probe);
  const durations = meta.map(m => m.duration);
  const captions = treatment.scenes.slice(0, clips.length).map(s => s.caption || '');
  const assPath = path.join(dir, 'captions.ass');
  fs.writeFileSync(assPath, buildAss(captions, durations));

  // Inputs: each clip, plus a silent track for any clip without audio.
  const args = ['-hide_banner', '-y'];
  const audioIdx = [];
  let n = 0;
  clips.forEach(c => { args.push('-i', c); n++; });
  meta.forEach((m, i) => {
    if (m.hasAudio) audioIdx[i] = `${i}:a`;
    else { args.push('-f', 'lavfi', '-t', String(m.duration), '-i', 'anullsrc=r=48000:cl=stereo'); audioIdx[i] = `${n++}:a`; }
  });

  const f = [];
  clips.forEach((_, i) => {
    f.push(`[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1,format=yuv420p[v${i}]`);
    f.push(`[${audioIdx[i]}]aresample=48000,aformat=channel_layouts=stereo[a${i}]`);
  });
  let v = 'v0', a = 'a0', offset = durations[0] - FADE;
  for (let i = 1; i < clips.length; i++) {
    f.push(`[${v}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(3)}[vx${i}]`);
    f.push(`[${a}][a${i}]acrossfade=d=${FADE}[ax${i}]`);
    v = `vx${i}`; a = `ax${i}`; offset += durations[i] - FADE;
  }
  const relAss = path.relative(ROOT, assPath).replace(/\\/g, '/');
  f.push(`[${v}]subtitles=filename='${relAss}',tpad=stop_mode=clone:stop_duration=${END_HOLD}[vout]`);
  f.push(`[${a}]apad=pad_dur=${END_HOLD},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[aout]`);

  const out = path.join(dir, 'final-render.mp4');
  args.push('-filter_complex', f.join(';'), '-map', '[vout]', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out);

  console.log(`🎞️  Assembling ${clips.length} scenes → ${path.relative(ROOT, out)}`);
  const r = run('ffmpeg', args);
  if (r.status !== 0 || !fs.existsSync(out)) throw new Error(`ffmpeg failed:\n${r.out.slice(-1500)}`);
  console.log(`✅ Master: ${probe(out).duration.toFixed(1)}s`);
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const treatmentPath = arg('--treatment');
  if (!treatmentPath) { console.error('Usage: --treatment <file>'); process.exit(1); }
  try { assemble({ treatmentPath }); } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
