import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { KokoroTTS } from 'kokoro-js';

const ROOT = process.cwd();
const FFMPEG = process.env.GITHUB_ACTIONS ? 'ffmpeg' : path.join(ROOT, 'scripts', 'bin', 'ffmpeg.exe');

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// Top 5 AI tools hardcoded for this prototype (can be dynamic later)
const LIST_DATA = [
    { title: "Images", name: "Pollinations.ai", icon: "🎨" },
    { title: "Videos", name: "Runway Gen-3", icon: "🎬" },
    { title: "Voices", name: "Kokoro TTS", icon: "🎙️" },
    { title: "Music", name: "Suno AI", icon: "🎵" },
    { title: "Clones", name: "HeyGen", icon: "🤖" },
    { title: "Coding", name: "Cursor AI", icon: "💻" },
    { title: "Memes", name: "Supermeme", icon: "😂" },
    { title: "Edits", name: "CapCut Pro", icon: "✂️" },
];

async function capturePaperBackground(outPath) {
    // Convert local asset to base64 so Puppeteer doesn't need a local server to render it
    const deskBgPath = path.join(ROOT, 'assets', 'listicle-desk-bg.png');
    let deskBgCss = '';
    if (fs.existsSync(deskBgPath)) {
        const bgB64 = fs.readFileSync(deskBgPath).toString('base64');
        deskBgCss = `background: url(data:image/png;base64,${bgB64}) center center / cover no-repeat;`;
    } else {
        deskBgCss = `background-color: #d1d5db;`; // Fallback plain desk
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
                font-family: 'Roboto Slab', serif; /* A more typewriter/printed paper font vibe */
            }
            .paper-container {
                width: 950px;
                height: 1650px;
                /* Authentic paper texture overlay using CSS masks or subtle gradients */
                background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
                filter: drop-shadow(25px 25px 50px rgba(0,0,0,0.6));
                border-radius: 4px;
                transform: rotate(-1.5deg); /* Crucial for photorealism */
                padding: 100px 90px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: 55px;
            }
            /* Multiply blend mode pushes the black "ink" into the background "fibers" and blur(0.4px) simulates sub-pixel ink bleed! */
            .ink {
                mix-blend-mode: multiply;
                filter: blur(0.4px);
                color: #0f172a;
            }
            .header {
                font-size: 72px;
                font-weight: 800;
                text-align: center;
                margin-bottom: 50px;
                text-decoration: underline;
                text-decoration-thickness: 4px;
                text-underline-offset: 8px;
            }
            .row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 52px;
                font-weight: 700;
                font-family: 'Inter', sans-serif;
                border-bottom: 2px dashed rgba(0,0,0,0.1);
                padding-bottom: 15px;
            }
            .category {
                width: 320px;
                text-align: left;
                color: #334155;
            }
            .tool {
                flex-grow: 1;
                text-align: right;
                font-weight: 800;
            }
            .icon {
                font-size: 65px;
                margin-left: 35px;
                filter: none; /* icons shouldn't bleed like text */
                background: rgba(255,255,255,0.5);
                border-radius: 12px;
                padding: 5px;
                box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div class="paper-container">
            <div class="header ink">Top AI Tools 2026</div>
            ${LIST_DATA.map(item => `<div class="row ink"><span class="category">${item.title}</span><span class="tool">${item.name}</span><span class="icon">${item.icon}</span></div>`).join('')}
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

async function generateVoiceoverKokoro(topicDir, text) {
    const audioPath = path.join(topicDir, 'voiceover.wav');
    try {
        console.log("🎙️ [Kokoro] Synthesizing ultra-natural audio (Local ONNX) ...");
        const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
            dtype: "fp32",
        });
        const audio = await tts.generate(text, { voice: "af_heart" });
        await audio.save(audioPath);
        console.log("✅ [Kokoro] Audio successfully generated.");
        return audioPath;
    } catch (e) {
        const errLine = (e.message || "").split('\\n')[0];
        console.warn(`⚠️ [Kokoro Failed] Fallback to Edge-TTS. Error: ` + errLine);
        const edgePath = path.join(topicDir, 'voiceover.mp3');
        execSync(`edge-tts --voice "en-US-JennyNeural" --text "${text}" --write-media "${edgePath}"`, { stdio: 'ignore' });
        return edgePath;
    }
}

async function produce() {
    const topicName = getArg('--topic') || 'ListicleTest';
    const baseDir = path.join(ROOT, 'data', 'meta-empire', 'AAK-Nation', 'topics');
    const topicDir = path.join(baseDir, topicName);
    if (!fs.existsSync(topicDir)) fs.mkdirSync(topicDir, { recursive: true });

    const bgPath = path.join(topicDir, 'paper_bg.png');
    const handPath = path.join(topicDir, 'hand.png');
    const outVideo = path.join(topicDir, 'final-render.mp4');

    await capturePaperBackground(bgPath);
    await ensureHandImage(handPath);

    const textToRead = "Here are the top AI tools you need in 2026. For Images, use Pollinations AI. For Videos, Runway Gen 3. For Voices, Kokoro TTS. For Music, Suno AI. For clones, use Hey Gen. For coding, try Cursor. For edits, use CapCut pro. Save this video for later!";
    const audioPath = await generateVoiceoverKokoro(topicDir, textToRead);

    console.log(`🎬 [Listicle] Overlaying hand animation & burning video...`);
    const filterComplex = 
        `[1:v]scale=350:-1[hand_scaled];` + 
        `[hand_scaled]colorchannelmixer=aa=1.0[hand_solid];` + 
        `[0:v][hand_solid]overlay=x=-30:y='min(400+t*85, 1550)':eval=frame[vout]`;

    const cmd = `"${FFMPEG}" -y -loop 1 -i "${bgPath}" -loop 1 -i "${handPath}" -i "${audioPath}" -filter_complex "${filterComplex}" -map "[vout]" -map 2:a -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -shortest -r 30 "${outVideo}"`;
    
    try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(`\\n🎉 SUCCESS! Faceless Paper Listicle created at: ${outVideo}`);
    } catch(e) {
        console.error(`\\n❌ Failed to render listicle: ${e.message}`);
    }
}

produce();
