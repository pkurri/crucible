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
    },
    LawOfAttraction: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "person manifestation energy, golden particles flowing from hands into a vortex of galaxies and stars, magnetic energy field, ethereal lighting",
            "wishing well made of stardust and cosmic light, thoughts turning into physical reality, cinematic dreamscape, 8k masterpiece",
            "vibrant heart chakra radiating golden light that aligns with the constellations, abundance energy flowing, mystical atmospheric"
        ],
        text: "The universe does not give you what you want. It gives you what you are. Your frequency is the remote control for your reality. Match the vibration of the life you desire, and it must manifest. This is not philosophy; this is physics. Master your mind. Follow Akasha Glimpse for practical wisdom."
    },
    ShadowWork: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "man confronting his own shadow in a dark mystical mirror, the shadow is made of stars and smoke, deep psychological concept, cinematic lighting",
            "ancient stone statue half in light half in darkness, deep contrast, psychological depth, mystical symbols, 4k",
            "soul navigating a misty labyrinth lit by a single lantern of blue light, meeting the inner child, healing deep trauma, ethereal vibe"
        ],
        text: "To find your light, you must first walk through your darkness. Your shadows are not your enemies; they are the unloved parts of your essence. Integration is the final step of human evolution. Stop running from yourself. Follow Akasha Glimpse to start your healing journey."
    },
    LucidDreaming: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "sleeping person with a second translucent self floating into a surreal dream world of floating islands and clockwork gears, lucid dreaming concept, cosmic",
            "surreal landscape where the sky is an ocean and fish fly through clouds, mystical dreamscape, ethereal lighting, hyper detailed",
            "realizing it's a dream, hand glowing with magical energy, breaking the rules of physics, spiritual control of consciousness"
        ],
        text: "What if you could live a second life every night? Lucid dreaming is the art of waking up inside your own subconscious. When you realize the dream is a creation, you become the architect of everything. Experience the ultimate freedom. Follow Akasha Glimpse and master the night."
    },
    Mindfulness: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "still water reflecting a perfect moonlit sky, single drop creating ripples of golden light, peace and tranquility, high resolution 8k",
            "monk sitting in perfect stillness as the world rushes by in a blur of light and color, cinematic contrast, zen atmosphere",
            "translucent lotus flower glowing in a dark forest, symbols of enlightenment, peaceful mystical energy, masterpiece"
        ],
        text: "Most people are either living in a past that's gone or a future that doesn't exist. The only place where life actually happens is right here, in the eternal now. Silence the noise and listen to the pulse of existence. Find your center. Follow Akasha Glimpse to find peace."
    },
    ChakraHealing: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "human body silhouette with 7 glowing chakra centers, energy flowing like a river of light, mystical healing vibe, 8k",
            "crown chakra opening like a thousand petal lotus of white light, cosmic connection, divine intelligence, ethereal lighting",
            "root chakra grounding into the earth with red energy vines, stability and survival, ancient forest setting, detailed"
        ],
        text: "You are an energy system before you are a physical body. When your chakras are blocked, life feels heavy. When they flow, you become a conduit for miracles. Balance your energy, and watch your world transform. Align your spirit. Follow Akasha Glimpse to heal."
    },
    QuantumConsciousness: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "brain neurons merging with galaxy structures, the mind as the universe, quantum entanglement of souls, blue and purple lighting, 8k",
            "observer effect, a single eye looking at a wave of particles turning into matter, mystical science, cosmic mystery",
            "infinitely many parallel realities as translucent layers of light, the power of choice, philosophical 4k"
        ],
        text: "The observer creates the reality. In the quantum field, all possibilities exist at once until you choose one. Your consciousness is the spark that gives form to the formless. You are the universe experiencing itself. Think big. Follow Akasha Glimpse for quantum truths."
    },
    ZenPhilosophy: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "zen rock garden in the clouds, simplicity and beauty, minimalist mystical vibe, high detailed 8k",
            "empty tea cup with a reflection of the entire universe inside, paradoxical wisdom, cinematic still life",
            "brush stroke of an enso circle onto a canvas of stars, perfection in imperfection, meditative art"
        ],
        text: "Before enlightenment, chop wood and carry water. After enlightenment, chop wood and carry water. Wisdom is not found in complex books, but in the simplicity of being. Let go of the need to understand, and you will finally know. Stay empty. Follow Akasha Glimpse for Zen insights."
    },
    StoicWisdom: {
        voice: 'en-US-AriaNeural',
        prompts: [
            "marble bust of a philosopher partially cracked with stardust leaking out, resilience, strength of mind, cinematic lighting",
            "stormy ocean with a solid rock standing firm against the waves, peace in the chaos, stoicism concept, 4k",
            "fire burning in a dark winter night, the light of reason, ancient mystical atmosphere, masterpiece"
        ],
        text: "You have power over your mind—not outside events. Realize this, and you will find strength. The obstacle is not in your way; it is the way. Your perception is your only cage. Break free with logic and virtue. Be unshakable. Follow Akasha Glimpse for timeless wisdom."
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
