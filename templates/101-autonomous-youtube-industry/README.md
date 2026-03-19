# 📺 Autonomous YouTube Industry (101)

> **Where creators stop creating and start managing.**

This template is a production-ready **YouTube Empire Manager**. It uses Crucible's multi-agent orchestration to research, script, produce, and manage a portfolio of high-CPM YouTube channels autonomously.

## 🚀 Key Features

- **Niche Selection Intelligence**: Autonomously identifies high-CPM, evergreen niches (Kids, Roleplay, Stories).
- **Multi-Agent Scripting**: Specialist agents for Lyric generation, Roleplay storyboards, and Education.
- **Production Loop**: Automated VO and Visual asset coordination.
- **Revenue Dashboard**: Real-time monitoring of subs, views, and revenue delta across the entire empire.

## 🤖 The Empire Swarm

| Agent | Division | Role |
|-------|----------|------|
| **KidScout** | Intel | Niche profitability and trend analysis. |
| **LyricSmith** | Foundry | Nursery rhyme and learning script generation. |
| **EchoVoice** | Foundry | TTS and Voiceover management. |
| **ForgeProducer**| Hub | Final video assembly and render coordination. |
| **ChannelWarden**| Stage | YouTube SEO, Thumbnails, and uploads. |

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env.local` and add your:
   - `GEMINI_API_KEY`: For script generation.
   - `ELEVENLABS_API_KEY`: For Voiceovers.
   - `YOUTUBE_API_KEY`: For channel management.

3. **Run Automation**:
   ```bash
   node ../../scripts/youtube-intel-fetcher.mjs
   node ../../scripts/youtube-empire-automation.mjs
   ```

4. **Launch Dashboard**:
   ```bash
   npm run dev
   ```

## 📈 Monetization Strategy

The system is hard-coded to produce videos **>8:15 minutes** to ensure "Mid-roll" ad eligibility. It prioritizes "Evergreen" content that generates passive revenue long after the initial upload.

---

*Part of the Crucible **Growth & Revenue** skill pack.*
