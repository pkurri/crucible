import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { execSync } from 'child_process';
import { callAI } from './ai-fallback-orchestrator.mjs';

/**
 * 🎨 CRUCIBLE AUTONOMOUS ASSET GENERATOR
 * Generates 4K cinematic visuals for the Social Empire using OpenRouter.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const BASE_DIR_YT = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics');
const BASE_DIR_META = path.join(process.cwd(), 'data', 'meta-empire', 'AAK-Nation', 'topics');
const PROMPTS_FILE = path.join(process.cwd(), 'data', 'empire-prompts-daily.json');

const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');
const registry = fs.existsSync(NICHES_FILE) ? JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8')) : { niches: [] };

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

const filterTopic = getArg('--topic');
const TOPICS = filterTopic ? [filterTopic] : registry.niches.map(n => n.name);

async function generateImagesForTopic(topic) {
  const nicheData = registry.niches.find(n => n.name === topic) || {};
  const keywords = nicheData.keywords ? nicheData.keywords.join(', ') : topic;

  console.log(`\n🎨 [${topic}] Generating assets...`);
  const topicMetaDir = path.join(BASE_DIR_META, topic);
  const baseForThisTopic = fs.existsSync(topicMetaDir) ? BASE_DIR_META : BASE_DIR_YT;
  const assetDir = path.join(baseForThisTopic, topic, 'assets');
  fs.mkdirSync(assetDir, { recursive: true });

  // Load prompt from engine
  if (!fs.existsSync(PROMPTS_FILE)) {
    console.log('💎 Architecting High-Intensity Visuals...');
    execSync('node scripts/visual-prompt-architect.mjs', { stdio: 'inherit' });
  }

  const prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));
  const config = prompts.find(p => p.channel === topic) || prompts[0];
  const prompt = config.prompt;

  for (let i = 1; i <= 3; i++) {
    const imgPath = path.join(assetDir, `shot_${i}.jpg`);
    
    console.log(`   📸 [Slot ${i}] Architecting Cinematic Prompt via AI Shield Fallback...`);
    try {
      const visualDescription = await callAI(
        `Generate a photorealistic cinematic visual prompt for the niche: "${topic}". \nVisual Theme: ${keywords}. \nSlot: ${i}. \nRule: No text or "AAK Nation" branding in the image. \nReturn ONLY the visual description.`,
        "You are a cinematic cinematographer and AI Vision prompt specialist."
      );

      console.log(`   🎨 Visual Blueprint architected: ${visualDescription.substring(0, 50)}...`);

      // 🖼️ GENERATE IMAGE — Pexels (AI-keyword search) → Stable Horde → Picsum
      console.log(`   🌀 Sourcing Cinematic Asset (Pexels → Horde → Picsum)...`);
      const PEXELS_KEY = process.env.PEXELS_API_KEY;
      let success = false;

      // ✅ Provider 1: Pexels API (niche-keyword matched, high quality)
      if (PEXELS_KEY) {
        try {
          // Extract 2-3 keyword search terms from the visual description
          const searchTerms = encodeURIComponent(
            visualDescription.split(' ').slice(0, 4).join(' ').replace(/[^a-zA-Z0-9 ]/g, '')
          );
          const pexelsUrl = `https://api.pexels.com/v1/search?query=${searchTerms}&per_page=15&orientation=portrait`;
          const pexRes = await fetch(pexelsUrl, {
            headers: { Authorization: PEXELS_KEY }
          });
          const pexData = await pexRes.json();
          if (pexData.photos && pexData.photos.length > 0) {
            // Pick a random photo from results for variety
            const photo = pexData.photos[Math.floor(Math.random() * pexData.photos.length)];
            const imgUrl = photo.src.large2x || photo.src.large;
            const imgRes = await fetch(imgUrl);
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            if (buffer.length > 50000) {
              fs.writeFileSync(imgPath, buffer);
              console.log(`   ✅ [Pexels] "${photo.alt || searchTerms}" — ${(buffer.length/1024).toFixed(0)}KB (by ${photo.photographer})`);
              success = true;
            }
          } else {
            console.warn(`   ⚠️ [Pexels] No results for: ${searchTerms}`);
          }
        } catch (pexErr) {
          console.warn(`   ⚠️ [Pexels] Error: ${pexErr.message}`);
        }
      }

      // ✅ Provider 2: Stable Horde (free community AI generator)
      if (!success) {
        try {
          const hordePayload = {
            prompt: visualDescription.substring(0, 300) + " cinematic vertical portrait 9:16",
            params: { width: 512, height: 912, steps: 20, n: 1, sampler_name: "k_euler" },
            nsfw: false, trusted_workers: false, models: ["stable_diffusion"], r2: true
          };
          const hordeRes = await fetch('https://stablehorde.net/api/v2/generate/async', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' },
            body: JSON.stringify(hordePayload)
          });
          const hordeData = await hordeRes.json();
          if (hordeData.id) {
            console.log(`   🤖 [Horde] Job: ${hordeData.id}. Polling...`);
            let imgUrl = null;
            for (let p = 0; p < 12; p++) {
              await new Promise(r => setTimeout(r, 8000));
              const pollData = await (await fetch(`https://stablehorde.net/api/v2/generate/check/${hordeData.id}`)).json();
              if (pollData.done) {
                const statusData = await (await fetch(`https://stablehorde.net/api/v2/generate/status/${hordeData.id}`)).json();
                imgUrl = statusData.generations?.[0]?.img;
                break;
              }
              console.log(`   ⏳ Horde queue: ${pollData.queue_position || '?'}`);
            }
            if (imgUrl) {
              const buffer = Buffer.from(await (await fetch(imgUrl)).arrayBuffer());
              if (buffer.length > 50000) {
                fs.writeFileSync(imgPath, buffer);
                console.log(`   ✅ [Horde] AI Asset: ${(buffer.length/1024).toFixed(0)}KB`);
                success = true;
              }
            }
          }
        } catch (hordeErr) {
          console.warn(`   ⚠️ [Horde] ${hordeErr.message}`);
        }
      }

      // ✅ Provider 3: Picsum (reliable stock fallback, always works)
      if (!success) {
        try {
          const seed = Math.floor(Math.random() * 1000);
          const buffer = Buffer.from(await (await fetch(`https://picsum.photos/seed/${seed}/1080/1920`)).arrayBuffer());
          if (buffer.length > 50000) {
            fs.writeFileSync(imgPath, buffer);
            console.log(`   ✅ [Picsum] Stock fallback: ${(buffer.length/1024).toFixed(0)}KB`);
            success = true;
          }
        } catch (picsumErr) {
          console.error(`   ❌ [Picsum] ${picsumErr.message}`);
        }
      }

      if (!success) throw new Error(`All image providers exhausted for slot ${i}.`);




    } catch (e) {
      console.error(`   ❌ Failed to generate asset ${i}: ${e.message}`);
    }
  }
}

async function run() {
  console.log('🚀 Starting Autonomous Asset Generation Cycle...');
  for (const topic of TOPICS) {
    await generateImagesForTopic(topic);
  }
  console.log('\n✨ Asset generation cycle complete.');
}

run();
