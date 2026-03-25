import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { runProductionCycle } from './empire-cycle-core.mjs';

/**
 * 📸 INSTAGRAM EMPIRE LOOP
 * Isolated automation for AAK Nation Instagram account.
 * Data: data/instagram-empire/AAK-Nation/topics/
 */

const BASE  = path.join(process.cwd(), 'data', 'instagram-empire', 'AAK-Nation', 'topics');
const STATE = path.join(process.cwd(), 'scripts', 'ig-empire-state.json');
const MAX   = 5;

async function uploadToInstagram(topic, topicDir, state, stateFile) {
  const finalRender = path.join(topicDir, 'final-render.mp4');
  if (!fs.existsSync(finalRender)) {
    console.error(`❌ [${topic}] No render found for Instagram upload.`);
    return false;
  }
  try {
    execSync(
      `node scripts/meta-official-uploader.mjs --topic "${topic}" --target insta --basedir "${BASE}"`,
      { stdio: 'inherit' }
    );
    return true;
  } catch (e) {
    console.error(`❌ [${topic}] Instagram upload failed: ${e.message}`);
    return false;
  }
}

async function main() {
  fs.mkdirSync(BASE, { recursive: true });
  await runProductionCycle({
    platform:         'instagram',
    label:            '📸 Instagram',
    baseDir:          BASE,
    stateFile:        STATE,
    maxUploads:       MAX,
    nichePool:        'instagram',
    producerPlatform: 'meta',
    uploadFn:         uploadToInstagram,
    uploadMarker:     'instagram.json',
  });
}

main().catch(err => {
  console.error('Fatal Instagram loop error:', err);
  process.exit(1);
});
