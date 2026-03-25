import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { runProductionCycle, loadState, saveState } from './empire-cycle-core.mjs';

/**
 * 📘 FACEBOOK EMPIRE LOOP
 * Isolated automation for AAK Nation Facebook page.
 * Data: data/facebook-empire/AAK-Nation/topics/
 */

const BASE    = path.join(process.cwd(), 'data', 'facebook-empire', 'AAK-Nation', 'topics');
const STATE   = path.join(process.cwd(), 'scripts', 'fb-empire-state.json');
const MAX     = 5;

async function uploadToFacebook(topic, topicDir, state, stateFile) {
  const finalRender = path.join(topicDir, 'final-render.mp4');
  if (!fs.existsSync(finalRender)) {
    console.error(`❌ [${topic}] No render found for Facebook upload.`);
    return false;
  }
  try {
    execSync(
      `node scripts/meta-official-uploader.mjs --topic "${topic}" --target fb --basedir "${BASE}"`,
      { stdio: 'inherit' }
    );
    return true;
  } catch (e) {
    console.error(`❌ [${topic}] Facebook upload failed: ${e.message}`);
    return false;
  }
}

async function main() {
  fs.mkdirSync(BASE, { recursive: true });
  await runProductionCycle({
    platform:         'facebook',
    label:            '📘 Facebook',
    baseDir:          BASE,
    stateFile:        STATE,
    maxUploads:       MAX,
    nichePool:        'facebook',
    producerPlatform: 'meta',
    uploadFn:         uploadToFacebook,
    uploadMarker:     'facebook.json',
  });
}

main().catch(err => {
  console.error('Fatal Facebook loop error:', err);
  process.exit(1);
});
