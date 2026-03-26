# 🎬 Hybrid Video Generation System

## Overview

The Hybrid Video System integrates real video generation capabilities into the Crucible platform, replacing static photo slideshows with dynamic AI-generated videos featuring motion, captions, and professional effects.

## Architecture

### Components

1. **Gemini Imagen Generator** (`gemini-imagen-generator.mjs`)
   - Generates AI B-roll images using Google's Imagen API
   - Creates variations for dynamic visual storytelling
   - Supports 9:16 vertical format for shorts

2. **Ken Burns Renderer** (`ken-burns-renderer.mjs`)
   - Applies cinematic motion to static images
   - Effects: zoom-in, zoom-out, pan-right, pan-left, pan-up, pan-down
   - Concatenates clips into seamless video

3. **Whisper Caption Generator** (`whisper-caption-generator.mjs`)
   - Generates word-level timestamps using OpenAI Whisper
   - Creates ASS/SRT subtitle files
   - Burns captions into video with styling

4. **Hybrid Video Renderer** (`hybrid-video-renderer.mjs`)
   - Orchestrates the full pipeline
   - Combines all components into final video
   - Handles existing assets and fallbacks

## Pipeline Flow

```
Topic Input
    ↓
Generate AI Images (Gemini Imagen)
    ↓
Apply Ken Burns Effects (FFmpeg)
    ↓
Add Audio Track
    ↓
Generate Captions (Whisper)
    ↓
Burn Subtitles
    ↓
Final Video Output
```

## Installation

### Prerequisites

```bash
# Install Python dependencies for Whisper
pip install openai-whisper

# Install FFmpeg (if not already installed)
# Windows: Download from https://ffmpeg.org/download.html
# Linux: sudo apt install ffmpeg
# macOS: brew install ffmpeg

# Install Node.js dependencies
npm install
```

### Environment Variables

Add to your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## Usage

### Basic Usage

```javascript
import { renderHybridVideo } from './scripts/hybrid-video-renderer.mjs';

const config = {
  topicDir: '/path/to/topic',
  topicName: 'Your Topic Name',
  scriptText: 'Your script content...',
  audioPath: '/path/to/audio.mp3',
  imageCount: 5,
  addCaptions: true
};

const videoPath = await renderHybridVideo(config);
```

### Automated Processing

Process all topics in the Akasha Glimpse channel:

```bash
node scripts/akasha-hybrid-automation.mjs
```

### Render from Existing Topic Directory

```javascript
import { renderFromTopicDir } from './scripts/hybrid-video-renderer.mjs';

const videoPath = await renderFromTopicDir('/path/to/topic', {
  useExistingImages: true,  // Use existing images if available
  addCaptions: true,        // Add word-level captions
  captionFormat: 'ass',     // 'ass' or 'srt'
  imageCount: 5             // Number of images to generate if needed
});
```

## Features

### ✅ Real Video Motion
- Ken Burns effects create dynamic movement
- Multiple effect types for variety
- Smooth transitions between clips

### ✅ AI-Generated Visuals
- Gemini Imagen creates high-quality B-roll
- Contextual variations based on script
- 9:16 vertical format optimized for shorts

### ✅ Word-Level Captions
- Precise timing using Whisper
- Stylized ASS subtitles with highlighting
- Burned-in for maximum compatibility

### ✅ Fallback Support
- Uses existing images if available
- Graceful degradation on API failures
- Continues without captions if Whisper unavailable

## Comparison: Old vs New

| Feature | Shotstack (Old) | Hybrid System (New) |
|---------|----------------|---------------------|
| Image Generation | Manual/External | AI-Generated (Gemini) |
| Motion | Basic transitions | Ken Burns effects |
| Captions | None | Word-level (Whisper) |
| Processing | Cloud (20/month limit) | Local (unlimited) |
| Cost | Free tier limited | API costs only |
| Quality | Static slideshow | Dynamic video |

## Configuration Options

### Render Options

```javascript
{
  topicDir: string,           // Required: Topic directory path
  topicName: string,          // Required: Topic name
  scriptText: string,         // Optional: Script for visual prompts
  audioPath: string,          // Optional: Audio track path
  imageCount: number,         // Default: 5
  useExistingImages: boolean, // Default: false
  addCaptions: boolean,       // Default: true
  captionFormat: 'ass'|'srt'  // Default: 'ass'
}
```

### Ken Burns Effects

Available effects:
- `zoom-in`: Slow zoom into image
- `zoom-out`: Slow zoom out from image
- `pan-right`: Pan from left to right
- `pan-left`: Pan from right to left
- `pan-up`: Pan from bottom to top
- `pan-down`: Pan from top to bottom

Effects rotate automatically for variety.

## Troubleshooting

### Gemini API Issues

```bash
# Check API key
echo $GEMINI_API_KEY

# Test API access
curl -H "Content-Type: application/json" \
  -d '{"prompt":"test"}' \
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=$GEMINI_API_KEY"
```

### Whisper Not Found

```bash
# Install Whisper
pip install openai-whisper

# Verify installation
whisper --version
```

### FFmpeg Issues

```bash
# Check FFmpeg installation
ffmpeg -version

# Test Ken Burns effect
ffmpeg -loop 1 -i test.jpg -vf "zoompan=z='min(zoom+0.0015,1.5)':d=125:s=1080x1920" -t 5 output.mp4
```

## Performance

### Processing Times (Approximate)

- Image Generation: 10-20s per image
- Ken Burns Rendering: 5-10s per clip
- Caption Generation: 10-30s depending on audio length
- Total per video: 2-5 minutes

### Optimization Tips

1. **Reuse existing images** when possible
2. **Batch process** multiple topics
3. **Adjust image count** based on video length
4. **Skip captions** for faster processing if not needed

## Integration with Empire Loop

The hybrid renderer integrates seamlessly with existing empire automation:

```javascript
// In your empire loop
import { renderFromTopicDir } from './hybrid-video-renderer.mjs';

// Replace Shotstack call with:
const videoPath = await renderFromTopicDir(topicDir);
```

## Future Enhancements

- [ ] Video clip generation (not just images)
- [ ] Background music with auto-ducking
- [ ] Advanced caption styling
- [ ] GPU acceleration for rendering
- [ ] Thumbnail generation integration
- [ ] Multi-language caption support

## API Costs

### Gemini Imagen
- Free tier: 50 requests/day
- Paid: ~$0.02 per image
- 5 images per video = ~$0.10 per video

### Whisper
- Free (local processing)
- Uses CPU/GPU resources

### Total Cost per Video
- ~$0.10 with Gemini API
- $0 if using existing images

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in topic directories
3. Test individual components separately
4. Verify API keys and dependencies

## License

Part of the Crucible project. See main LICENSE file.
