import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🕉️ CUTE SANATAN REELS PRODUCER
 * Fully autonomous pipeline for generating "cutesanatanreels" style content.
 * Dynamically fetches 3D cute Hindu deity images, generates TTS, and renders 4K Ken Burns reels.
 */

const ROOT = process.cwd();
const FFMPEG = process.env.GITHUB_ACTIONS ? 'ffmpeg' : path.join(ROOT, 'scripts', 'bin', 'ffmpeg.exe');

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// Configuration & Stories
const TOPICS = {
    BabyKrishna: {
        voice: 'en-IN-NeerjaNeural', 
        prompts: [
            "cute 3d pixar style baby krishna playing flute under a glowing magical tree, highly detailed, soft lighting, 4k",
            "cute 3d pixar style baby krishna eating butter from a clay pot, innocent smile, large eyes, vibrant colors",
            "cute 3d pixar style baby krishna standing with a peacock, magical divine aura, soft glowing light, 8k resolution"
        ],
        text: "Lord Krishna was not just a deity. He was the entire universe disguised as a dancing child. Whenever chaos rises in your life, remember to listen to the silent melody of his flute to restore balance and peace. Type Hare Krishna and follow for daily Sanatan wisdom."
    },
    LittleHanuman: {
        voice: 'en-IN-NeerjaNeural',
        prompts: [
            "cute 3d pixar style baby baby hanuman flying in the sky reaching for the glowing sun, beautiful clouds, detailed",
            "cute 3d pixar style baby hanuman meditating peacefully, glowing aura, divine light, highly detailed 8k",
            "cute 3d pixar style baby hanuman holding a small magical mountain, smiling, cute large eyes, cinematic lighting"
        ],
        text: "Did you know Baby Hanuman mistook the sun for a mango and flew into space to eat it? This divine story reminds us that true faith and devotion have absolutely no limits. Unleash your inner strength today. Type Jai Shri Ram and follow for daily Sanatan wisdom."
    },
    LordGanesha: {
        voice: 'en-IN-NeerjaNeural',
        prompts: [
            "cute 3d pixar style baby ganesha eating a sweet modak, sitting on a lotus, magical divine lighting, 4k",
            "cute 3d pixar style baby ganesha reading an ancient glowing book, big cute eyes, soft cinematic lighting",
            "cute 3d pixar style baby ganesha blessing with a small mouse companion, vibrant colors, 8k resolution"
        ],
        text: "Lord Ganesha is the ultimate remover of all obstacles. Before you start any new journey or face a difficult challenge, remember that divine wisdom and patience will always pave the way to success. Type Om Ganeshay Namah and follow for daily peace."
    },
    BabyShiva: {
        voice: 'en-IN-NeerjaNeural',
        prompts: [
            "cute 3d pixar style baby lord shiva meditating in snowy himalayas, small crescent moon on head, glowing aura",
            "cute 3d pixar style baby lord shiva holding a small cute trishul, third eye softly glowing, cinematic lighting 4k",
            "cute 3d pixar style baby lord shiva sitting with a cute baby nandi bull, divine peaceful atmosphere, 8k"
        ],
        text: "Mahadev teaches us that destruction is just the beginning of a beautiful new creation. When life feels like it is falling apart, trust that Lord Shiva is making space for something divinely beautiful. Type Har Har Mahadev and follow for daily blessings."
    }
};

async function downloadPollinationsImage(prompt, outPath) {
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
        console.log(`🖼️ Image exists: ${path.basename(outPath)}`);
        return;
    }
    console.log(`📥 Downloading image for prompt: "${prompt.substring(0, 30)}..."`);
    
    for (let attempts = 1; attempts <= 2; attempts++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const seed = Math.floor(Math.random() * 1000000);
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&nologo=true&seed=${seed}`;
            
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('image')) throw new Error('Non-image response');
            
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(outPath, Buffer.from(buffer));
            console.log(`✅ Saved ${path.basename(outPath)}`);
            return;
        } catch (e) {
            console.warn(`⚠️ Attempt ${attempts} failed: ${e.message}`);
        }
    }
    
    console.log(`⚠️ Pollinations inaccessible. Using fallback aesthetic image...`);
    try {
        const fallbackUrl = `https://picsum.photos/seed/${Math.random()}/1080/1920?blur=2`;
        const res = await fetch(fallbackUrl);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(outPath, Buffer.from(buffer));
        console.log(`🌌 Saved abstract fallback for ${path.basename(outPath)}`);
    } catch (e) {
        console.error(`❌ Ultimate fallback failed: ${e.message}`);
    }
}

function generateVoiceover(topicDir, script) {
    const audioPath = path.join(topicDir, 'voiceover.mp3');
    const subtitlePath = path.join(topicDir, 'captions.vtt');
    
    if (fs.existsSync(audioPath) && fs.existsSync(subtitlePath)) {
        console.log(`🎙️ Voiceover already exists.`);
        return { audioPath, subtitlePath };
    }

    console.log(`🎙️ Generating voiceover [${script.voice}]...`);
    try {
        execSync(`edge-tts --voice "${script.voice}" --text "${script.text}" --write-media "${audioPath}" --write-subtitles "${subtitlePath}" 2>&1`, { encoding: 'utf-8' });
        return { audioPath, subtitlePath };
    } catch (e) {
        console.error(`❌ TTS Failed: ${e.message}`);
        return { audioPath: null, subtitlePath: null };
    }
}

async function renderVideo(topicDir, topicName, audioPath, subtitlePath, numImages) {
    const assetDir = path.join(topicDir, 'assets');
    const outputFile = path.join(topicDir, 'final-render.mp4');

    const images = [];
    for (let i = 0; i < numImages; i++) {
        const imgPath = path.join(assetDir, `img_${i}.jpg`);
        if (fs.existsSync(imgPath)) images.push(imgPath);
    }

    if (images.length === 0) {
        console.error(`🛑 No images found for rendering.`);
        return;
    }

    console.log(`🎬 Compiling video with ${images.length} images...`);

    // Ken Burns Effect filters
    const inputs = images.map(img => `-loop 1 -t 5 -i "${img}"`).join(' ');
    const kenBurnsFilters = images.map((img, i) => {
        return `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,zoompan=z='min(zoom+0.0015,1.2)':d=125:s=1080x1920:fps=25,setsar=1,trim=duration=5,setpts=PTS-STARTPTS[v${i}]`;
    }).join(';');
    
    const concatPart = images.map((_, i) => `[v${i}]`).join('') + `concat=n=${images.length}:v=1:a=0[vout]`;
    let filterComplex = kenBurnsFilters + ';' + concatPart;
    let mapArgs = '';
    let extraInputs = '';

    if (audioPath && fs.existsSync(audioPath)) {
        extraInputs = `-i "${audioPath}"`;
        if (subtitlePath && fs.existsSync(subtitlePath)) {
            const relativeSubtitlePath = path.relative(ROOT, subtitlePath).replace(/\\/g, '/');
            // Instagram / Meta specific subtitle styling - aesthetic, legible, glowing
            const forceStyle = 'FontSize=18,FontName=Arial,PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,Outline=3,Alignment=2,MarginV=250,Bold=1,WrapStyle=0';
            filterComplex += `;[vout]subtitles=filename='${relativeSubtitlePath}':force_style='${forceStyle}'[vfinal]`;
            mapArgs = '-map "[vfinal]" -map ' + images.length + ':a';
        } else {
            filterComplex += ';[vout]copy[vfinal]';
            mapArgs = '-map "[vfinal]" -map ' + images.length + ':a';
        }
    } else {
        filterComplex += ';[vout]copy[vfinal]';
        mapArgs = '-map "[vfinal]"';
    }

    const cmdLine = `"${FFMPEG}" -y ${inputs} ${extraInputs} -filter_complex "${filterComplex}" ${mapArgs} -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -shortest -movflags +faststart -r 25 "${outputFile}"`;

    try {
        execSync(cmdLine, { stdio: 'inherit' });
        console.log(`✅ [Sanatan Reels] Video rendered: ${outputFile}`);
    } catch (e) {
        console.error(`❌ Render Failed: ${e.message}`);
    }
}

async function produce() {
    let topicName = getArg('--topic');
    if (!topicName || !TOPICS[topicName]) {
        console.log('No valid topic specified. Defaulting to BabyKrishna.');
        topicName = 'BabyKrishna';
    }

    console.log(`\n🕉️ STARTING SANATAN REELS PRODUCER: ${topicName} 🕉️`);
    const scriptParams = TOPICS[topicName];
    
    // Setup Directories
    const baseDir = path.join(ROOT, 'data', 'instagram-empire', 'SanatanReels', 'topics');
    const topicDir = path.join(baseDir, topicName);
    const assetDir = path.join(topicDir, 'assets');
    
    if (!fs.existsSync(assetDir)) {
        fs.mkdirSync(assetDir, { recursive: true });
    }

    // 1. Generate Voiceover & Subtitles
    const tts = generateVoiceover(topicDir, scriptParams);

    // 2. Fetch Images dynamically
    for (let i = 0; i < scriptParams.prompts.length; i++) {
        const outPath = path.join(assetDir, `img_${i}.jpg`);
        await downloadPollinationsImage(scriptParams.prompts[i], outPath);
    }

    // 3. Render Final Ken Burns Video
    await renderVideo(topicDir, topicName, tts.audioPath, tts.subtitlePath, scriptParams.prompts.length);
    
    console.log(`\n🎉 Production Complete! Share this reel to spread the wisdom.`);
}

produce();
