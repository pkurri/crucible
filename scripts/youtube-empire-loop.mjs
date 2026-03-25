import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { runProductionCycle, loadState, saveState } from './empire-cycle-core.mjs';

/**
 * 🔱 YOUTUBE EMPIRE LOOP
 * Isolated automation for AAK Nation YouTube Shorts.
 * Data: data/youtube-empire/AAK-Nation/topics/
 */

const BASE  = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics');
const STATE = path.join(process.cwd(), 'scripts', 'yt-empire-state.json');
const MAX   = 6;

async function uploadToYouTube(topic, topicDir, state, stateFile) {
  const finalRender = path.join(topicDir, 'final-render.mp4');
  if (!fs.existsSync(finalRender)) {
    console.error(`❌ [${topic}] No render found for YouTube upload.`);
    return false;
  }
  try {
    const output = execSync(
      `node scripts/youtube-official-uploader.mjs --topic "${topic}" --basedir "${BASE}"`,
      { encoding: 'utf8' }
    );
    console.log(output);
    if (output.includes('exceeded the number of videos')) {
      console.log('🛑 QUOTA REACHED [API Level]. Stopping.');
      const s = loadState(stateFile);
      s.uploadsToday = MAX;
      saveState(stateFile, s);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`❌ [${topic}] YouTube upload failed: ${e.message}`);
    return false;
  }
}

async function main() {
  fs.mkdirSync(BASE, { recursive: true });
  await runProductionCycle({
    platform:         'youtube',
    label:            '🔱 YouTube',
    baseDir:          BASE,
    stateFile:        STATE,
    maxUploads:       MAX,
    nichePool:        'youtube',
    producerPlatform: 'youtube',
    uploadFn:         uploadToYouTube,
    uploadMarker:     'youtube.json',
  });
}

main().catch(err => {
  console.error('Fatal YouTube loop error:', err);
  process.exit(1);
});
