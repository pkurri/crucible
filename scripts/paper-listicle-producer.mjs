import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { KokoroTTS } from 'kokoro-js';

const ROOT = process.cwd();
const FFMPEG = process.env.GITHUB_ACTIONS ? 'ffmpeg' : path.join(ROOT, 'scripts', 'bin', 'ffmpeg.exe');
const SCRIPTS_PATH = path.join(ROOT, 'data', 'viral-scripts.json');

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// Fallback list if nothing is found in registry
const FALLBACK_LIST = [
    { title: "Images", name: "Pollinations.ai", icon: "🎨" },
    { title: "Videos", name: "Runway Gen-3", icon: "🎬" },
    { title: "Voices", name: "Kokoro TTS", icon: "🎙️" },
    { title: "Music", name: "Suno AI", icon: "🎵" },
    { title: "Clones", name: "HeyGen", icon: "🤖" },
    { title: "Coding", name: "Cursor AI", icon: "💻" },
    { title: "Memes", name: "Supermeme", icon: "😂" },
    { title: "Edits", name: "CapCut Pro", icon: "✂️" },
];

async function capturePaperBackground(outPath, listData, topicName) {
    const deskBgPath = path.join(ROOT, 'assets', 'listicle-desk-bg.png');
    let deskBgCss = '';
    if (fs.existsSync(deskBgPath)) {
        const bgB64 = fs.readFileSync(deskBgPath).toString('base64');
        deskBgCss = `background: url(data:image/png;base64,${bgB64}) center center / cover no-repeat;`;
    } else {
        deskBgCss = `background-color: #d1d5db;`; 
    }

    const html = `
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@500;800&family=Inter:wght@500;700&display=swap" rel="stylesheet">
        <style>
            body { 
                margin: 0; padding: 0;
                width: 1080px; height: 1920px;
                ${deskBgCss}
                display: flex; justify-content: center; align-items: center;
                font-family: 'Roboto Slab', serif;
            }
            .paper-container {
                width: 920px;
                height: 1680px;
                /* Sublte paper texture and lighting to match the generated photo */
                background: rgba(255,255,255,0.05);
                filter: contrast(1.1) brightness(1.05) drop-shadow(15px 15px 30px rgba(0,0,0,0.55));
                border-radius: 4px;
                transform: rotate(-0.5deg);
                padding: 120px 80px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: 58px;
            }
            .ink {
                mix-blend-mode: multiply;
                filter: blur(0.5px);
                color: #0f172a;
                font-family: 'Roboto Slab', serif;
            }
            .header {
                font-size: 82px;
                font-weight: 800;
                text-align: center;
                margin-bottom: 60px;
                border-bottom: 6px solid #0f172a;
                padding-bottom: 20px;
            }
            .row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 58px;
                font-weight: 700;
                font-family: 'Inter', sans-serif;
                border-bottom: 3px solid rgba(15,23,42,0.15);
                padding-bottom: 20px;
            }
            .category {
                width: 320px;
                text-align: left;
                color: #334155;
                font-size: 48px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .tool {
                flex-grow: 1;
                text-align: right;
                font-weight: 800;
                color: #1e293b;
            }
            .icon {
                font-size: 70px;
                margin-left: 40px;
                opacity: 0.85;
            }
        </style>
    </head>
    <body>
        <div class="paper-container">
            <div class="header ink">${topicName}</div>
            ${listData.map(item => `
            <div class="row ink">
                <span class="category">${item.title}</span>
                <span class="tool">${item.name}</span>
                <span class="icon">${item.icon}</span>
            </div>
            `).join('')}
        </div>
    </body>
    </html>
    `;

    console.log("📸 [Listicle] Capturing high-res HTML paper template...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({ path: outPath });
    await browser.close();
    console.log("✅ [Listicle] Background paper generated.");
}

async function ensureHandImage(outPath) {
    const rawHand = path.join(ROOT, 'assets', 'hand_raw.png');
    if (fs.existsSync(rawHand)) {
        console.log("🦾 [Listicle] Using premium stylized hand asset.");
        fs.copyFileSync(rawHand, outPath);
        return;
    }
    if (fs.existsSync(outPath)) return;
    console.log("📥 [Listicle] Downloading transparent pointing hand...");
    const fallbackUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f449.png";
    try {
        const res = await fetch(fallbackUrl);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(outPath, Buffer.from(buffer));
    } catch(e) {
        console.error("Failed hand DL", e);
    }
}

async function generateVoiceoverKokoro(topicDir, text, voicePreference) {
    const audioPath = path.join(topicDir, 'voiceover.wav');
    try {
        console.log(`🎙️ [Kokoro] Synthesizing ultra-natural audio [${voicePreference || 'af_heart'}] ...`);
        const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
            dtype: "fp32",
        });
        const audio = await tts.generate(text, { voice: voicePreference || "af_heart" });
        await audio.save(audioPath);
        console.log("✅ [Kokoro] Audio successfully generated.");
        return audioPath;
    } catch (e) {
        const errLine = (e.message || "").split('\n')[0];
        console.warn(`⚠️ [Kokoro Failed] Fallback to Edge-TTS. Error: ` + errLine);
        const edgePath = path.join(topicDir, 'voiceover.mp3');
        const voice = voicePreference || "en-US-JennyNeural";
        execSync(`edge-tts --voice "${voice}" --text "${text}" --write-media "${edgePath}"`, { stdio: 'ignore' });
        return edgePath;
    }
}

async function produce() {
    const topicName = getArg('--topic');
    if (!topicName) {
        console.error("❌ No topic specified. Use --topic [NicheName]");
        process.exit(1);
    }

    const platform = getArg('--platform') || 'youtube';
    let baseDir = path.join(ROOT, 'data', 'youtube-empire', 'AAK-Nation', 'topics');
    if (platform === 'meta') baseDir = path.join(ROOT, 'data', 'meta-empire', 'AAK-Nation', 'topics');

    const topicDir = path.join(baseDir, topicName);
    if (!fs.existsSync(topicDir)) fs.mkdirSync(topicDir, { recursive: true });

    // Load dynamic script
    let listData = FALLBACK_LIST;
    let hook = `Here are the top tools for ${topicName}.`;
    let closing = "Follow for more AI secrets.";
    let voice = "af_heart";

    if (fs.existsSync(SCRIPTS_PATH)) {
        const scripts = JSON.parse(fs.readFileSync(SCRIPTS_PATH, 'utf8'));
        const script = scripts[topicName];
        if (script && script.list) {
            listData = script.list;
            hook = script.hook || hook;
            closing = script.closing || closing;
            voice = script.voice || voice;
            console.log(`💎 Dynamic list loaded for ${topicName}`);
        }
    }

    const bgPath = path.join(topicDir, 'paper_bg.png');
    const handPath = path.join(topicDir, 'hand.png');
    const outVideo = path.join(topicDir, 'final-render.mp4');

    await capturePaperBackground(bgPath, listData, topicName);
    await ensureHandImage(handPath);

    const fullTranscript = `${hook} ${listData.map(i => `${i.title}: ${i.name}.`).join(' ')} ${closing}`;
    const audioPath = await generateVoiceoverKokoro(topicDir, fullTranscript, voice);

    console.log(`🎬 [Listicle] Overlaying hand animation & burning video...`);
    // Improved hand blending: remove white background from the hand_raw photo using chromakey+colorkey
    const filterComplex = 
        `[1:v]scale=500:-1[hand_sc];` + 
        `[hand_sc]colorkey=0xFFFFFF:0.1:0.1[hand_tr];` + // Remove white from generated hand photo
        `[0:v][hand_tr]overlay=x=-50:y='min(480+t*105, 1750)':eval=frame[vout]`;

    const cmd = `"${FFMPEG}" -y -loop 1 -i "${bgPath}" -loop 1 -i "${handPath}" -i "${audioPath}" -filter_complex "${filterComplex}" -map "[vout]" -map 2:a -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -shortest -r 30 "${outVideo}"`;
    
    try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(`\n🎉 SUCCESS! Faceless Paper Listicle created at: ${outVideo}`);
    } catch(e) {
        console.error(`\n❌ Failed to render listicle: ${e.message}`);
    }
}

produce();
