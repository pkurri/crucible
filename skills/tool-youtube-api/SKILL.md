---
name: tool-youtube-api
description:
  'Technical operations for the YouTube Data API: uploads, metadata updates, 
  and channel analytics. Requires OAuth2.0 Client ID for the target channel.'
allowed-tools:
  - Bash
  - WebFetch
  - node
---

# YouTube API Integration (Production)

This skill provides the technical connection between Crucible agents and your real YouTube channels.

## 🔑 Authentication (OAuth2)

1. **GCP Project**: Go to [Google Cloud Console](https://console.cloud.google.com/), create a project, and enable the **YouTube Data API v3**.
2. **OAuth Credentials**: Create a "Web Application" OR "Desktop App" Client ID.
3. **Scopes**:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube.force-ssl` (for metadata)
   - `https://www.googleapis.com/auth/yt-analytics.readonly`

## 🛠️ Provided Tools

| Tool | Action | Requirements |
|------|--------|--------------|
| `youtube_upload` | Upload video to channel | `video_path`, `snippet`, `status` |
| `youtube_update_metadata` | Update Title/Tags/Description | `video_id`, `parts` |
| `youtube_get_analytics` | Fetch views/revenue/watchtime | `channel_id`, `time_range` |

## 📦 Implementation (Node.js)

Agents use the `google-api-nodejs-client` library via a bridge script.

```javascript
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client,
});

async function uploadVideo(path, metadata) {
  const res = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: '1', // Film & Animation
      },
      status: {
        privacyStatus: 'unlisted', // Recommended for review before public
        selfDeclaredMadeForKids: true,
      },
    },
    media: {
      body: fs.createReadStream(path),
    },
  });
  return res.data.id;
}
```

## 🔐 Security Best Practices

- **Vault Storage**: Store `client_id`, `client_secret`, and `refresh_token` in the Crucible Vault or `.env.local`.
- **Review Loop**: Always upload as `unlisted` first. The **Channel Warden** should send a preview link to the Human Manager before setting to `public`.
- **COPPA Compliance**: Ensure `selfDeclaredMadeForKids` is correctly set, as nursery/kids content is strictly regulated.
