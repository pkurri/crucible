import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 🌌 AKASHA GLIMPSE PRODUCER
 * Autonomous pipeline for generating "AkashaGlimpse" style spiritual & cosmic content.
 * Generates ethereal/mystical imagery, deep philosophical TTS, and Ken Burns visuals.
 */

const ROOT = process.cwd();
const FFMPEG = process.env.GITHUB_ACTIONS ? 'ffmpeg' : path.join(ROOT, 'scripts', 'bin', 'ffmpeg.exe');

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// Configuration & Topics for AkashaGlimpse
const TOPICS = {
    AkashicRecords: {
        voice: 'en-US-AriaNeural', // A calm, ethereal storytelling voice
        prompts: [
            "grand infinite cosmic library floating in deep space, glowing golden books of souls, mystical ancient knowledge, ethereal mystical lighting, highly detailed unreal engine 5, 4k",
            "mystical glowing doorway made of stars and nebulas, ancient esoteric runes softly glowing, entering the akashic records, cinematic 8k",
            "ethereal glowing spirit reading a luminous book in a temple made of light, cosmic energy swirling, deep blue and gold colors, masterpiece"
        ],
        text: "Imagine a hidden library that holds every thought, action, and destiny of your soul. This is the Akasha. The universal hard drive of existence. Your past, present, and future are written here. Are you brave enough to read your own book? Follow Akasha Glimpse to unlock the secrets."
    },
    AstralProjection: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "astral projection, ethereal glowing spirit leaving sleeping physical body, floating in a room filled with cosmic light, mystical lighting, cinematic, 8k",
            "person floating effortlessly through a cosmic tunnel of sacred geometry and stars, out of body experience, deep purple and silver colors, 4k",
            "ethereal glowing being meditating among the stars in deep space, connected to earth by a silver cord, spiritual awakening, masterpiece"
        ],
        text: "What if your physical body is just a temporary spacesuit? When you sleep, your consciousness untethers and travels into the astral realms, exploring dimensions completely beyond time and space. It is time to wake up in your dreams. Follow Akasha Glimpse and learn to fly."
    },
    SacredGeometry: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "sacred geometry metatron cube glowing in deep space, intersecting cosmic energy lines, mystical vibrant neon colors, hyper detailed visual 8k",
            "fibonacci spiral forming a massive galaxy, divine mathematics of the universe, ethereal glowing stardust, cinematic wallpaper",
            "golden ratio flower of life pattern glowing over an ancient temple, mystical vibration, frequency healing, beautiful masterpiece"
        ],
        text: "The universe does not speak in words. It speaks in mathematics and geometry. From the grand spiral of a galaxy to the tiny petals of a flower, the divine blueprint of creation is everywhere. Once you see it, you cannot unsee it. Open your eyes. Follow Akasha Glimpse for cosmic truths."
    },
    ThirdEyeAwakening: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "close up of a third eye glowing bright indigo light on a forehead, pineal gland awakening, spiritual energy radiating, mystical 8k",
            "human silhouette filled with cosmic stars meditating, bright glowing light radiating from the center of the forehead, ethereal vibe",
            "ancient esoteric symbols glowing around a meditating figure, spiritual enlightenment, higher dimensions revealing themselves, cinematic 4k"
        ],
        text: "Deep inside your brain lies the pineal gland, often called the biological third eye. Ancient civilizations knew it was the hidden antenna for tuning into higher dimensions. Society tries to block it, but meditation awakens it. See beyond the modern illusion. Follow Akasha Glimpse to awaken."
    }
};

async function downloadPollinationsImage(prompt, outPath) {
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
        console.log(`🖼️ Image exists and looks valid: ${path.basename(outPath)}`);
        return;
    }
    
    console.log(`📥 Fetching image for: "${prompt.substring(0, 30)}..."`);
    const seed = Math.floor(Math.random() * 1000000);
    const stylePrompt = encodeURIComponent(prompt + ", dark atmospheric, highly detailed, photorealistic");
    const url = `https://image.pollinations.ai/prompt/${stylePrompt}?width=1080&height=1920&nologo=true&seed=${seed}`;
    
    for (let attempts = 1; attempts <= 2; attempts++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
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
    
    console.log(`⚠️ Pollinations inaccessible. Using abstract cosmic fallback layout...`);
    try {
        const fallbackUrl = `https://picsum.photos/seed/${Math.random()}/1080/1920?blur=4`;
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

    console.log(`🎙️ Generating cosmic voiceover [${script.voice}]...`);
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
        // Only use valid images
        if (fs.existsSync(imgPath) && fs.statSync(imgPath).size > 10000) {
            images.push(imgPath);
        }
    }

    if (images.length === 0) {
        console.error(`🛑 No valid images found. Cannot render video.`);
        return;
    }

    console.log(`🎬 Compiling ethereal video with ${images.length} layers...`);

    // Slower, more hypnotic Ken Burns effect for spiritual theme (zoom +0.001 is very slow)
    // d=150 (6 seconds per image instead of 5)
    const inputs = images.map(img => `-loop 1 -t 6 -i "${img}"`).join(' ');
    const kenBurnsFilters = images.map((img, i) => {
        // Slow pan/zoom suited for cosmic/meditative content
        return `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,zoompan=z='min(zoom+0.001,1.15)':d=150:s=1080x1920:fps=25,setsar=1,trim=duration=6,setpts=PTS-STARTPTS[v${i}]`;
    }).join(';');
    
    const concatPart = images.map((_, i) => `[v${i}]`).join('') + `concat=n=${images.length}:v=1:a=0[vout]`;
    let filterComplex = kenBurnsFilters + ';' + concatPart;
    let mapArgs = '';
    let extraInputs = '';

    if (audioPath && fs.existsSync(audioPath)) {
        extraInputs = `-i "${audioPath}"`;
        if (subtitlePath && fs.existsSync(subtitlePath)) {
            const relativeSubtitlePath = path.relative(ROOT, subtitlePath).replace(/\\/g, '/');
            // Clean, elegant, readable subtitles for spiritual content (white with soft black outline)
            const forceStyle = 'FontSize=18,FontName=Arial,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Alignment=2,MarginV=300,Bold=1,WrapStyle=0';
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

    // Adding some basic audio effects (like slight reverb) using FFmpeg could be done, 
    // but just mapping audio correctly is safest.
    const cmdLine = `"${FFMPEG}" -y ${inputs} ${extraInputs} -filter_complex "${filterComplex}" ${mapArgs} -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -shortest -movflags +faststart -r 25 "${outputFile}"`;

    try {
        execSync(cmdLine, { stdio: 'inherit' });
        console.log(`✅ [Akasha Glimpse] Reel manifested: ${outputFile}`);
    } catch (e) {
        console.error(`❌ Manifestation Failed: ${e.message}`);
    }
}

async function produce() {
    let topicName = getArg('--topic');
    if (!topicName || !TOPICS[topicName]) {
        console.log('No valid topic specified. Defaulting to AkashicRecords.');
        topicName = 'AkashicRecords';
    }

    console.log(`\n🌌 AWAKENING AKASHA GLIMPSE PRODUCER: ${topicName} 🌌`);
    const scriptParams = TOPICS[topicName];
    
    // Output structure inside instagram-empire/AkashaGlimpse
    const baseDir = path.join(ROOT, 'data', 'instagram-empire', 'AkashaGlimpse', 'topics');
    const topicDir = path.join(baseDir, topicName);
    const assetDir = path.join(topicDir, 'assets');
    
    if (!fs.existsSync(assetDir)) {
        fs.mkdirSync(assetDir, { recursive: true });
    }

    // 1. Generate Voiceover & Subtitles
    const tts = generateVoiceover(topicDir, scriptParams);

    // 2. Fetch Deep Space/Ethereal Images dynamically
    for (let i = 0; i < scriptParams.prompts.length; i++) {
        const outPath = path.join(assetDir, `img_${i}.jpg`);
        await downloadPollinationsImage(scriptParams.prompts[i], outPath);
    }

    // 3. Render Final Hypnotic Ken Burns Video
    await renderVideo(topicDir, topicName, tts.audioPath, tts.subtitlePath, scriptParams.prompts.length);
    
    console.log(`\n🎉 The vision is complete. Share the truth on Reels/TikTok.`);
}

produce();
