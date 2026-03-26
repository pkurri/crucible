# 🚀 Hybrid Video System - Quick Start Guide

## Prerequisites

### 1. Install FFmpeg

**Windows:**
```powershell
# Download from https://ffmpeg.org/download.html
# Or use Chocolatey:
choco install ffmpeg
```

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

### 2. Install Whisper (Optional, for captions)

```bash
pip install openai-whisper
```

Verify installation:
```bash
whisper --version
```

### 3. Get Gemini API Key

1. Visit <https://makersuite.google.com/app/apikey>
2. Create a new API key
3. Add to your `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

## Quick Test

Run the test script to verify everything works:

```bash
node scripts/test-hybrid-render.mjs
```

This will:
- Generate 3 AI images using Gemini Imagen
- Apply Ken Burns effects
- Create a test video in `data/test-hybrid-render/`

## Basic Usage

### Option 1: Automated Processing

Process all topics in your empire:

```bash
node scripts/akasha-hybrid-automation.mjs
```

### Option 2: Single Topic

```javascript
import { renderFromTopicDir } from './scripts/hybrid-video-renderer.mjs';

const videoPath = await renderFromTopicDir('/path/to/topic');
```

### Option 3: Custom Configuration

```javascript
import { renderHybridVideo } from './scripts/hybrid-video-renderer.mjs';

const config = {
  topicDir: '/path/to/topic',
  topicName: 'My Topic',
  scriptText: 'Your script here...',
  audioPath: '/path/to/audio.mp3',
  imageCount: 5,
  addCaptions: true
};

const videoPath = await renderHybridVideo(config);
```

## Common Workflows

### Workflow 1: Generate Video from Scratch

```bash
# 1. Create topic directory
mkdir -p data/youtube-empire/AkashaGlimpse/topics/MyTopic

# 2. Add audio file (if you have one)
cp audio.mp3 data/youtube-empire/AkashaGlimpse/topics/MyTopic/narration.mp3

# 3. Run hybrid renderer
node scripts/akasha-hybrid-automation.mjs
```

### Workflow 2: Use Existing Images

If you already have images in the `assets/` folder:

```javascript
const videoPath = await renderFromTopicDir(topicDir, {
  useExistingImages: true,  // Use existing images
  addCaptions: false        // Skip captions for speed
});
```

### Workflow 3: Replace Shotstack

Update your existing scripts:

```javascript
// OLD: Using Shotstack
// import { renderWithShotstack } from './shotstack-renderer.mjs';
// const video = await renderWithShotstack(topicDir, topicName, audioPath);

// NEW: Using Hybrid Renderer
import { renderFromTopicDir } from './hybrid-video-renderer.mjs';
const video = await renderFromTopicDir(topicDir);
```

## Configuration Options

### Image Generation

```javascript
{
  imageCount: 5,              // Number of images to generate
  useExistingImages: true,    // Try existing images first
}
```

### Captions

```javascript
{
  addCaptions: true,          // Enable captions
  captionFormat: 'ass',       // 'ass' or 'srt'
}
```

### Audio

The system automatically looks for:
- `narration.mp3`
- `audio.mp3`
- `voiceover.mp3`

Or specify manually:
```javascript
{
  audioPath: '/path/to/audio.mp3'
}
```

## Troubleshooting

### "GEMINI_API_KEY not found"

```bash
# Check if .env file exists
cat .env | grep GEMINI_API_KEY

# Add key if missing
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### "Whisper not found"

```bash
# Install Whisper
pip install openai-whisper

# Or skip captions
const video = await renderFromTopicDir(topicDir, { addCaptions: false });
```

### "FFmpeg not found"

```bash
# Install FFmpeg (see Prerequisites above)
ffmpeg -version
```

### Images not generating

1. Check API key is valid
2. Check API quota (50 free requests/day)
3. Use existing images as fallback:

```javascript
const video = await renderFromTopicDir(topicDir, {
  useExistingImages: true
});
```

## Performance Tips

### Speed up processing

1. **Use existing images**: Set `useExistingImages: true`
2. **Skip captions**: Set `addCaptions: false`
3. **Reduce image count**: Set `imageCount: 3`

### Reduce API costs

1. **Reuse images** across similar topics
2. **Generate once**, render multiple times
3. **Use free tier** (50 requests/day)

## Next Steps

1. ✅ Run test script to verify setup
2. ✅ Process a single topic manually
3. ✅ Integrate with empire automation
4. ✅ Monitor API usage and costs
5. ✅ Optimize for your workflow

## Support

- Full documentation: `docs/HYBRID_VIDEO_SYSTEM.md`
- Test script: `scripts/test-hybrid-render.mjs`
- Example automation: `scripts/akasha-hybrid-automation.mjs`

## Comparison with Shotstack

| Feature | Shotstack | Hybrid System |
|---------|-----------|---------------|
| Setup | API key only | FFmpeg + Whisper + API key |
| Cost | Free tier (20/month) | API costs (~$0.10/video) |
| Speed | 10-30s cloud | 2-5 min local |
| Quality | Static slideshow | Dynamic video with motion |
| Captions | No | Yes (word-level) |
| Customization | Limited | Full control |

## FAQ

**Q: Can I use both systems?**
A: Yes! Keep Shotstack for quick renders, use Hybrid for high-quality videos.

**Q: Do I need Whisper for basic videos?**
A: No, set `addCaptions: false` to skip caption generation.

**Q: How much does it cost?**
A: ~$0.10 per video with Gemini API. Free if using existing images.

**Q: Can I use my own images?**
A: Yes! Place images in `assets/` folder and set `useExistingImages: true`.

**Q: How do I add background music?**
A: Currently not supported. Coming in future update.
