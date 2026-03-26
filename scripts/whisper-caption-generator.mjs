#!/usr/bin/env node
/**
 * 🎤 WHISPER CAPTION GENERATOR
 * Generates word-level captions with precise timing using Whisper
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Generate word-level timestamps using Whisper
 * @param {string} audioPath - Path to audio file
 * @param {string} outputDir - Directory for output files
 * @returns {Promise<Object>} Transcription with word-level timestamps
 */
async function generateWordTimestamps(audioPath, outputDir) {
  console.log(`🎤 [Whisper] Generating word-level timestamps...`);

  if (!fs.existsSync(audioPath)) {
    console.error(`❌ [Whisper] Audio file not found: ${audioPath}`);
    return null;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Check if whisper is installed
    try {
      execSync('whisper --version', { stdio: 'pipe' });
    } catch (e) {
      console.error(`❌ [Whisper] Whisper not installed. Install with: pip install openai-whisper`);
      return null;
    }

    const outputFile = path.join(outputDir, 'transcription');
    
    // Run Whisper with word-level timestamps
    const whisperCmd = `whisper "${audioPath}" --model base --output_format json --output_dir "${outputDir}" --word_timestamps True --language en`;
    
    console.log(`   🔄 [Whisper] Processing audio...`);
    execSync(whisperCmd, { stdio: 'pipe' });

    // Read the JSON output
    const jsonPath = path.join(outputDir, `${path.basename(audioPath, path.extname(audioPath))}.json`);
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ [Whisper] Transcription file not found`);
      return null;
    }

    const transcription = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ [Whisper] Transcription complete`);

    return transcription;

  } catch (error) {
    console.error(`❌ [Whisper] Failed: ${error.message}`);
    return null;
  }
}

/**
 * Generate ASS subtitle file with word-level highlighting
 * @param {Object} transcription - Whisper transcription with word timestamps
 * @param {string} outputPath - Output ASS file path
 * @returns {boolean} Success status
 */
function generateASSSubtitles(transcription, outputPath) {
  console.log(`📝 [Whisper] Generating ASS subtitles...`);

  try {
    // ASS file header
    const assHeader = `[Script Info]
Title: Auto-generated Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,10,10,150,1
Style: Highlight,Arial,48,&H0000FFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,10,10,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    let assContent = assHeader;

    // Process segments
    if (transcription.segments) {
      for (const segment of transcription.segments) {
        if (segment.words) {
          // Word-by-word highlighting
          for (const word of segment.words) {
            const start = formatTime(word.start);
            const end = formatTime(word.end);
            const text = word.word.trim();
            
            assContent += `Dialogue: 0,${start},${end},Highlight,,0,0,0,,${text}\n`;
          }
        } else {
          // Fallback to segment-level
          const start = formatTime(segment.start);
          const end = formatTime(segment.end);
          const text = segment.text.trim();
          
          assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
        }
      }
    }

    fs.writeFileSync(outputPath, assContent);
    console.log(`✅ [Whisper] ASS subtitles saved: ${outputPath}`);
    return true;

  } catch (error) {
    console.error(`❌ [Whisper] ASS generation failed: ${error.message}`);
    return false;
  }
}

/**
 * Generate SRT subtitle file
 * @param {Object} transcription - Whisper transcription
 * @param {string} outputPath - Output SRT file path
 * @returns {boolean} Success status
 */
function generateSRTSubtitles(transcription, outputPath) {
  console.log(`📝 [Whisper] Generating SRT subtitles...`);

  try {
    let srtContent = '';
    let index = 1;

    if (transcription.segments) {
      for (const segment of transcription.segments) {
        const start = formatSRTTime(segment.start);
        const end = formatSRTTime(segment.end);
        const text = segment.text.trim();

        srtContent += `${index}\n${start} --> ${end}\n${text}\n\n`;
        index++;
      }
    }

    fs.writeFileSync(outputPath, srtContent);
    console.log(`✅ [Whisper] SRT subtitles saved: ${outputPath}`);
    return true;

  } catch (error) {
    console.error(`❌ [Whisper] SRT generation failed: ${error.message}`);
    return false;
  }
}

/**
 * Format time for ASS subtitles (H:MM:SS.CC)
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const centisecs = Math.floor((seconds % 1) * 100);

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centisecs).padStart(2, '0')}`;
}

/**
 * Format time for SRT subtitles (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millisecs = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millisecs).padStart(3, '0')}`;
}

/**
 * Burn subtitles into video
 * @param {string} videoPath - Input video path
 * @param {string} subtitlePath - ASS or SRT subtitle path
 * @param {string} outputPath - Output video path
 * @returns {Promise<boolean>} Success status
 */
async function burnSubtitles(videoPath, subtitlePath, outputPath) {
  console.log(`🔥 [Whisper] Burning subtitles into video...`);

  try {
    const ext = path.extname(subtitlePath).toLowerCase();
    let ffmpegCmd;

    if (ext === '.ass') {
      // Use ASS subtitles (supports styling)
      ffmpegCmd = `ffmpeg -i "${videoPath}" -vf "ass='${subtitlePath.replace(/\\/g, '/')}'" -c:a copy -y "${outputPath}"`;
    } else {
      // Use SRT subtitles
      ffmpegCmd = `ffmpeg -i "${videoPath}" -vf "subtitles='${subtitlePath.replace(/\\/g, '/')}'" -c:a copy -y "${outputPath}"`;
    }

    execSync(ffmpegCmd, { stdio: 'pipe' });
    console.log(`✅ [Whisper] Subtitles burned into video`);
    return true;

  } catch (error) {
    console.error(`❌ [Whisper] Subtitle burning failed: ${error.message}`);
    return false;
  }
}

/**
 * Full caption pipeline: Audio → Transcription → Subtitles → Burned Video
 * @param {string} audioPath - Audio file path
 * @param {string} videoPath - Video file path (optional, for burning)
 * @param {string} outputDir - Output directory
 * @param {Object} options - {format: 'ass'|'srt', burn: boolean}
 * @returns {Promise<Object>} {transcription, subtitlePath, videoPath}
 */
async function generateCaptions(audioPath, videoPath = null, outputDir, options = {}) {
  console.log(`\n🎤 [Whisper] Starting caption generation pipeline...`);

  const format = options.format || 'ass';
  const burn = options.burn !== false; // Default true

  try {
    // Step 1: Generate transcription with word timestamps
    const transcription = await generateWordTimestamps(audioPath, outputDir);
    if (!transcription) {
      throw new Error('Transcription failed');
    }

    // Step 2: Generate subtitle file
    const subtitlePath = path.join(outputDir, `captions.${format}`);
    let success;

    if (format === 'ass') {
      success = generateASSSubtitles(transcription, subtitlePath);
    } else {
      success = generateSRTSubtitles(transcription, subtitlePath);
    }

    if (!success) {
      throw new Error('Subtitle generation failed');
    }

    // Step 3: Burn subtitles into video (if requested)
    let finalVideoPath = videoPath;

    if (burn && videoPath && fs.existsSync(videoPath)) {
      finalVideoPath = path.join(outputDir, 'video-with-captions.mp4');
      const burnSuccess = await burnSubtitles(videoPath, subtitlePath, finalVideoPath);
      
      if (!burnSuccess) {
        console.warn(`⚠️ [Whisper] Subtitle burning failed, using original video`);
        finalVideoPath = videoPath;
      }
    }

    console.log(`\n✅ [Whisper] Caption pipeline complete\n`);

    return {
      transcription,
      subtitlePath,
      videoPath: finalVideoPath
    };

  } catch (error) {
    console.error(`\n❌ [Whisper] Caption pipeline failed: ${error.message}\n`);
    return null;
  }
}

export {
  generateWordTimestamps,
  generateASSSubtitles,
  generateSRTSubtitles,
  burnSubtitles,
  generateCaptions
};
