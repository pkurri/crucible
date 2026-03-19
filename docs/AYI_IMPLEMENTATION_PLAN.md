# Implementation Plan: Autonomous YouTube Industry (AYI)

This plan outlines the creation of a fully autonomous YouTube channel management system powered by Crucible AI agents.

## 1. Architectural Strategy

The AYI system will follow the Crucible "Division" model, leveraging existing skills and introducing new ones specialized for video content.

### Agents & Divisions

| Agent | Division | Role |
|-------|----------|------|
| **Niche Scout** | Intel | Scans YouTube Trends, VidIQ data, and CPM benchmarks to identify profitable niches. |
| **Story Smith** | Foundry | Generates educational and entertaining scripts (e.g., ABC songs, Minecraft roleplay). |
| **Asset Oracle** | Foundry | Directs visual style and generates prompts for AI video/image generators. |
| **Echo Voice** | Foundry | Generates high-quality voiceovers using ElevenLabs or OpenAI TTS. |
| **Forge Producer**| Hub | Orchestrates the assembly of VO, visuals, and background music (via FFmpeg or Cloud Video API). |
| **Channel Warden**| Stage | Uploads to YouTube, optimizes SEO (tags/titles), and monitors performance. |

## 2. Core Components

### 🚀 New Skill: `workflow-youtube-industry`
A high-level orchestration skill that chains the above agents together in a multi-phase loop.

- **Phase 1: Market Intelligence** (Niche Scouting)
- **Phase 2: Scripting & Asset Prep** (Story Smith + Echo Voice)
- **Phase 3: Production** (Forge Producer)
- **Phase 4: Distribution** (Channel Warden)
- **Phase 5: Optimization** (Revenue Analysis)

### 📦 New Template: `101-autonomous-youtube-industry`
A production-ready starter project that implements the orchestration logic and provides a dashboard for monitoring the "Industry".

### 🛠️ New Tool: `tool-youtube-api`
An MCP-compatible tool for interacting with the YouTube Data API (uploads, metadata updates, analytics).

## 3. Technical YouTube Integration

To move from simulation to production, the system requires the following connection points:

### YouTube Data API v3
- **Authentication**: OAuth2.0 Client ID (Web Application or Desktop).
- **Permissions**: `youtube.upload`, `youtube.readonly` (for analytics).
- **Agent Integration**: The **Channel Warden** uses the `tool-youtube-api` to:
  - Upload `data/youtube-empire/{channel}/{video_id}`.
  - Patch metadata (Title, Tags, Description).
  - Set "Made for Kids" flag (mandatory for your niches).
  - Trigger monetization.

### Automated Asset Rendering
- **FFmpeg Integration**: The **Forge Producer** uses a local or cloud FFmpeg worker to stitch the `Echo Voice` VO with visuals from `Asset Oracle`.
- **Cloud Video API**: Alternatively, use an API like **Shotstack** or **Creatomate** for scalable cloud rendering.

## 4. Financial & Legal Integration (LLC)

To ensure earnings are correctly tied to your LLC, follow this governance structure:

### AdSense & Tax ID
1. **Business AdSense Account**: Do NOT use a personal AdSense account. Create one specifically for your LLC.
2. **EIN (Tax ID)**: Provide the LLC's Employer Identification Number (EIN) during AdSense setup. This ensures the 1099-K is issued to the business, not to you personally.
3. **Business Bank Account**: Link the LLC’s business checking account for monthly payouts.

### Revenue Automation
- **Revenue Optimizer agent**: This agent monitors YouTube Analytics API for "Estimated Revenue".
- **Bookkeeping Sync**: Use the **Crucible Stripe/Bookkeeping Skill** to sync these estimates into your LLC's ledger (e.g., QuickBooks or Xero) for tax readiness.

## 5. Implementation Steps

1.  **Infrastructure Setup**:
    - Create `skills/workflow-youtube-industry/SKILL.md`.
    - Create `templates/101-autonomous-youtube-industry/`.
2.  **Logic Development**:
    - Build a "Niche Research" script using Search/Trends.
    - Build a "Content Scripting" engine with tailored prompts for kids' content.
    - Integration with ElevenLabs for Voice.
3.  **Automation Script**:
    - Create `scripts/youtube-industry-automation.mjs`, modeled after `moltbook-full-automation.mjs`.
4.  **Verification**:
    - Test the full loop from niche selection to final "blueprint" (ready for video assembly).

## 4. Target Niches (Initial Focus)
- **Kids Learning**: ABCs, numbers, colors.
- **Storytime**: Bedtime stories with high retention hooks.
- **Gaming Roleplay**: Minecraft-themed educational/funny roleplays.

---

> [!TIP]
> **Revenue Optimization**: The system will prioritize videos >8 minutes to allow for mid-roll ads, maximizing the "Evergreen" revenue potential as requested.
