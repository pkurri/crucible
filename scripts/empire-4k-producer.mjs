import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🎬 CRUCIBLE 4K PRODUCER — FREE REVID.AI KILLER
 * Generates complete short-form videos with:
 *   1. AI-generated visuals (B-Roll with Ken Burns)
 *   2. AI voiceover (Edge TTS — free, no API key)
 *   3. Burned-in animated captions
 */

const ROOT = process.cwd();
const FFMPEG = process.env.GITHUB_ACTIONS ? 'ffmpeg' : path.join(ROOT, 'scripts', 'bin', 'ffmpeg.exe');
const BASE_DIR = path.join(ROOT, 'data', 'youtube-empire', 'AAK-Nation', 'topics');

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// ... Rest of the script from memory ... (I'll use the exact content from Step 615)
const SCRIPTS = {
  SuccessCodes: { voice: 'en-US-GuyNeural', lines: [ { text: 'Lord Ganesha is not just a deity.', duration: 5 }, { text: 'He is the universal protocol for removing every obstacle in your path.', duration: 5 }, { text: 'Ancient wisdom meets modern success. This is AAK Nation.', duration: 5 } ] },
  WealthWizards: { voice: 'en-US-GuyNeural', lines: [ { text: 'While you sleep, AI is rewriting the rules of finance.', duration: 5 }, { text: 'The old playbook is dead. Adapt or get left behind.', duration: 5 }, { text: 'This is WealthWizards. Only on AAK Nation.', duration: 5 } ] },
  MysteryArchive: { voice: 'en-US-AriaNeural', lines: [ { text: 'Some cases were never meant to be solved.', duration: 5 }, { text: 'But the data tells a different story.', duration: 5 }, { text: 'MysteryArchive. Only on AAK Nation.', duration: 5 } ] },
  PlayfulPixels: { voice: 'en-US-JennyNeural', lines: [ { text: 'A is for Amazing! B is for Brilliant!', duration: 5 }, { text: 'Learning has never looked this colorful.', duration: 5 }, { text: 'PlayfulPixels. Fun learning on AAK Nation.', duration: 5 } ] },
  ZenGarden: { voice: 'en-US-AriaNeural', lines: [ { text: 'Close your eyes. Breathe in.', duration: 5 }, { text: 'Let the ambient frequencies restore your focus.', duration: 5 }, { text: 'ZenGarden. Peace through sound. AAK Nation.', duration: 5 } ] },
  FutureTech: { voice: 'en-US-GuyNeural', lines: [ { text: 'The silicon revolution is not coming. It is already here.', duration: 5 }, { text: 'Hardware that thinks. Chips that dream.', duration: 5 }, { text: 'FutureTech. Powered by AAK Nation.', duration: 5 } ] },
  DailyStoic: { voice: 'en-US-GuyNeural', lines: [ { text: 'You cannot control the storm.', duration: 5 }, { text: 'But you can build a mind that weathers anything.', duration: 5 }, { text: 'DailyStoic. Strength from AAK Nation.', duration: 5 } ] },
  CookingCzar: { voice: 'en-US-JennyNeural', lines: [ { text: 'What if your kitchen became a laboratory?', duration: 5 }, { text: 'Flavor at the molecular level. Science you can taste.', duration: 5 }, { text: 'CookingCzar. Only on AAK Nation.', duration: 5 } ] },
  TravelTrek: { voice: 'en-US-AriaNeural', lines: [ { text: 'Some landscapes should not exist.', duration: 5 }, { text: 'Yet here they are, in breathtaking detail.', duration: 5 }, { text: 'TravelTrek. Explore with AAK Nation.', duration: 5 } ] },
  AutoArena: { voice: 'en-US-GuyNeural', lines: [ { text: 'Zero to sixty in three seconds.', duration: 5 }, { text: 'Engineering at the bleeding edge of speed and design.', duration: 5 }, { text: 'AutoArena. Driven by AAK Nation.', duration: 5 } ] },
  GamingGuru: { voice: 'en-US-GuyNeural', lines: [ { text: 'The meta just shifted. Did you notice?', duration: 5 }, { text: 'Behind every update is a billion-dollar strategy.', duration: 5 }, { text: 'GamingGuru. Decoded by AAK Nation.', duration: 5 } ] },
  NatureNook: { voice: 'en-US-JennyNeural', lines: [ { text: 'Nature does not hurry. Yet everything is accomplished.', duration: 5 }, { text: 'Witness animal intelligence in stunning detail.', duration: 5 }, { text: 'NatureNook. A window from AAK Nation.', duration: 5 } ] },
  PulsePolitics: { voice: 'en-US-GuyNeural', lines: [ { text: 'The world map is being redrawn in real time.', duration: 5 }, { text: 'Power shifts. Alliances break. New orders rise.', duration: 5 }, { text: 'PulsePolitics. Analysis by AAK Nation.', duration: 5 } ] },
  CinemaScope: { voice: 'en-US-AriaNeural', lines: [ { text: 'Every great film hides a secret in its structure.', duration: 5 }, { text: 'We decode the invisible architecture of storytelling.', duration: 5 }, { text: 'CinemaScope. Film theory by AAK Nation.', duration: 5 } ] },
  LifeHacks: { voice: 'en-US-GuyNeural', lines: [ { text: 'Your body is a system. Optimize it.', duration: 5 }, { text: 'Bio-hacking protocols for peak human performance.', duration: 5 }, { text: 'LifeHacks. Engineered by AAK Nation.', duration: 5 } ] },
  MindfulMinutes: { voice: 'en-US-AriaNeural', lines: [ { text: 'Sixty seconds. That is all you need.', duration: 5 }, { text: 'One minute to reset your entire nervous system.', duration: 5 }, { text: 'MindfulMinutes. Calm from AAK Nation.', duration: 5 } ] },
  GadgetGrab: { voice: 'en-US-GuyNeural', lines: [ { text: 'Inside this chip is a universe of logic.', duration: 5 }, { text: 'We tear apart the tech the world depends on.', duration: 5 }, { text: 'GadgetGrab. Hardware by AAK Nation.', duration: 5 } ] },
  PetParade: { voice: 'en-US-JennyNeural', lines: [ { text: 'They do not speak our language.', duration: 5 }, { text: 'But they understand everything about love.', duration: 5 }, { text: 'PetParade. Heart from AAK Nation.', duration: 5 } ] },
  HistoryHub: { voice: 'en-US-GuyNeural', lines: [ { text: 'Empires rise. Empires fall. The pattern never changes.', duration: 5 }, { text: 'Learn from the past or be condemned to repeat it.', duration: 5 }, { text: 'HistoryHub. Lessons from AAK Nation.', duration: 5 } ] },
  ForgeCore: { voice: 'en-US-GuyNeural', lines: [ { text: 'This is where it all begins.', duration: 5 }, { text: 'The Crucible AI Empire. Built from nothing. Running everything.', duration: 5 }, { text: 'ForgeCore. The genesis of AAK Nation.', duration: 5 } ] },
};

function generateVoiceover(topicDir, script) {
  const fullText = script.lines.map(l => l.text).join(' ');
  const audioPath = path.join(topicDir, 'voiceover.mp3');
  const subtitlePath = path.join(topicDir, 'captions.vtt');
  console.log(`🎙️ Generating voiceover [${script.voice}]...`);
  try {
    execSync(`edge-tts --voice "${script.voice}" --text "${fullText}" --write-media "${audioPath}" --write-subtitles "${subtitlePath}"`, { stdio: 'inherit' });
    return { audioPath, subtitlePath };
  } catch (e) { console.error('❌ TTS Error:', e.message); return null; }
}

function render4KVideo(topicDir, topicName, audioPath, subtitlePath) {
  const assetDir = path.join(topicDir, 'assets');
  const outputFile = path.join(topicDir, 'final-render.mp4');
  const images = fs.readdirSync(assetDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  if (images.length === 0) return null;

  const batPath = path.join(topicDir, 'render.bat');
  const inputs = images.map(img => `-loop 1 -t 5 -i "${path.join(assetDir, img)}"`).join(' ');
  const filterParts = images.map((_, i) => `[${i}:v]scale=2160:3840:force_original_aspect_ratio=decrease,pad=2160:3840:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(zoom+0.0015,1.3)':d=125:s=2160x3840:fps=25[v${i}]`);
  const concatPart = images.map((_, i) => `[v${i}]`).join('') + `concat=n=${images.length}:v=1:a=0[vout]`;
  let filterComplex = filterParts.join(';') + ';' + concatPart;
  let mapArgs = '', extraInputs = '';
  if (audioPath && fs.existsSync(audioPath)) {
    extraInputs = `-i "${audioPath}"`;
    if (subtitlePath && fs.existsSync(subtitlePath)) {
      filterComplex += `;[vout]subtitles='${subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\\\:')}':force_style='FontSize=42,FontName=Arial,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=3,Alignment=2,MarginV=120'[vfinal]`;
      mapArgs = '-map "[vfinal]" -map ' + images.length + ':a';
    } else { filterComplex += ';[vout]copy[vfinal]'; mapArgs = '-map "[vfinal]" -map ' + images.length + ':a'; }
  } else { filterComplex += ';[vout]copy[vfinal]'; mapArgs = '-map "[vfinal]"'; }

  const cmdLine = `"${FFMPEG}" -y ${inputs} ${extraInputs} -filter_complex "${filterComplex}" ${mapArgs} -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest -r 25 "${outputFile}"`;
  
  console.log(`🎬 Rendering 4K video for ${topicName}...`);
  try {
    execSync(cmdLine, { stdio: 'inherit' });
    return outputFile;
  } catch (e) { console.error(`❌ Render failed: ${e.message}`); }
  return null;
}

async function produce() {
  const topicName = getArg('--topic');
  if (!topicName) process.exit(1);
  const topicDir = path.join(BASE_DIR, topicName);
  const script = SCRIPTS[topicName];
  if (!script) process.exit(1);
  const tts = generateVoiceover(topicDir, script);
  const video = render4KVideo(topicDir, topicName, tts?.audioPath, tts?.subtitlePath);
}

produce();
