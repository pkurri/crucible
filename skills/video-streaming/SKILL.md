---
name: video-streaming
description:
  Video streaming platform with adaptive bitrate streaming (HLS/DASH), live
  streaming, and video analytics. Use when building video platforms,
  implementing streaming, adding video content, or analyzing video engagement.
triggers:
  - 'video streaming'
  - 'HLS'
  - 'DASH'
  - 'live streaming'
  - 'video player'
  - 'adaptive bitrate'
---

# Video Streaming Platform

Video streaming with adaptive bitrate, live streaming, and analytics.

## Capabilities

- **Adaptive Streaming**: HLS/DASH protocols
- **Live Streaming**: Real-time broadcast
- **Video Player**: Custom player UI
- **Analytics**: Watch time, engagement
- **Transcoding**: Multi-format support

## Usage

```markdown
@skill video-streaming

Set up video streaming:

- Format: HLS
- Resolutions: 1080p, 720p, 480p
- CDN: CloudFront
- Analytics: Enabled
```

## Video Processing

```typescript
// Transcode video to multiple formats
import {transcode} from '@crucible/video'

const job = await transcode({
  input: 's3://bucket/raw/video.mp4',
  outputs: [
    {
      format: 'hls',
      resolutions: ['1080p', '720p', '480p'],
      codec: 'h264',
    },
    {
      format: 'dash',
      resolutions: ['1080p', '720p'],
      codec: 'h264',
    },
  ],
})

// Monitor progress
job.on('progress', percent => {
  console.log(`Transcoding: ${percent}%`)
})

job.on('complete', outputs => {
  console.log('Transcoding complete:', outputs)
})
```

## Video Player

```typescript
// React component
import { VideoPlayer } from '@crucible/video';

function VideoPage() {
  return (
    <VideoPlayer
      src="https://cdn.example.com/video/master.m3u8"
      poster="/poster.jpg"
      controls
      autoplay={false}

      // Analytics
      onPlay={() => analytics.track('video_play')}
      onProgress={(time) => analytics.track('video_progress', { time })}
      onComplete={() => analytics.track('video_complete')}

      // Customization
      theme="dark"
      primaryColor="#ff0000"
    />
  );
}
```

## Live Streaming

```typescript
// WebRTC for low-latency streaming
import {LiveStream} from '@crucible/video'

const stream = new LiveStream({
  mode: 'webrtc', // or 'rtmp'
  quality: '1080p',
  frameRate: 30,
})

// Start streaming
await stream.start({
  ingestUrl: 'rtmp://live.example.com/stream',
  streamKey: 'stream-key-123',
})

// View live stream
const viewer = stream.createViewer()
viewer.play('https://live.example.com/hls/stream.m3u8')
```

## HLS Playlist

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480
480p/playlist.m3u8
```

## Analytics

```typescript
// Track video metrics
import { VideoAnalytics } from '@crucible/video';

const analytics = new VideoAnalytics({
  videoId: 'video-123',
  userId: 'user-456'
});

analytics.track({
  event: 'play',
  timestamp: Date.now(),
  data: {
    quality: '1080p',
    bufferTime: 200
  }
});

// Get insights
const insights = await analytics.getInsights({
  videoId: 'video-123',
  period: '7d'
});

// Returns:
{
  totalViews: 10000,
  avgWatchTime: 180,
  completionRate: 0.65,
  qualityDistribution: {
    '1080p': 0.6,
    '720p': 0.3,
    '480p': 0.1
  }
}
```

## Features

- **DRM**: Widevine, FairPlay
- **Subtitles**: WebVTT support
- **Thumbnails**: Preview images
- **Chromecast**: Cast support
- **AirPlay**: Apple device support
- **PIP**: Picture-in-picture

## Integration

- AWS MediaConvert: Transcoding
- CloudFront: CDN delivery
- Mux: Video API
- Cloudflare Stream: Edge streaming
