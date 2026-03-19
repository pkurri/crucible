#!/usr/bin/env node

/**
 * youtube-empire-automation.mjs
 * 
 * Top-level orchestrator for the YouTube Industry empire.
 * Coordinates niche selection, story generation, and (mock) production.
 * Respects 8:15+ duration goal for mid-rolls.
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INTEL_FILE = join(__dirname, 'yt-daily-intel.json');
const OUTPUT_DIR = join(__dirname, '../data/youtube-empire');
const STATE_FILE = join(__dirname, 'yt-empire-state.json');

// ─── Shared Utilities ──────────────────────────────────────────────────────────

async function callLLM(systemPrompt, userPrompt) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.MOLTBOOK_GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: { text: systemPrompt } },
          contents: [{ parts: [{ text: userPrompt }] }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      }
    } catch (e) { /* fallthrough */ }
  }
  return null;
}

// ─── Empire Management ─────────────────────────────────────────────────────────

class YoutubeEmpire {
  constructor() {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    this.state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE)) : {
      channels: {
        'PlayfulPixels': { niche: 'KidsLearning', subs: 5200, videos: 12, rev: 450.25 },
        'DreamyDragons': { niche: 'BedtimeStories', subs: 3100, videos: 8, rev: 210.80 },
        'BlockBuddyAcademy': { niche: 'MinecraftRoleplay', subs: 12400, videos: 15, rev: 1240.10 }
      },
      lastRun: null,
      totalEmpireRevenue: 1901.15
    };
  }

  async runCycle() {
    console.log('\n🚢 ══════════════════════════════════════════════════════════');
    console.log('   Crucible YouTube Empire — Autonomous Production Loop');
    console.log('══════════════════════════════════════════════════════════ 🚢\n');

    if (!existsSync(INTEL_FILE)) {
      console.log('   ⚠️  No intel blueprints found. Run youtube-intel-fetcher.mjs first.');
      return;
    }

    const intel = JSON.parse(readFileSync(INTEL_FILE));
    console.log(`   📡 Intel Received: ${intel.KidScout.title}`);

    for (const [chName, info] of Object.entries(this.state.channels)) {
      console.log(`\n── [Channel: ${chName}] (${info.niche}) ─────────────────────────────`);
      
      const blueprint = intel[this.getAgentForNiche(info.niche)];
      if (!blueprint) {
         console.log(`   ⏭  No fresh blueprint for ${info.niche}. Using cache.`);
         continue;
      }

      console.log(`   🎨 Blueprint: ${blueprint.title.substring(0, 40)}...`);
      
      // Step 2: Content Generation (Simulation of ScriptWriter)
      console.log(`   ✍️  Storying Smith: Generating full script (>8:15 duration)...`);
      const script = await this.produceScript(chName, blueprint.content);
      
      // Step 3: Production (Mocked for POC)
      console.log(`   🎙️  Echo Voice: Generating ElevenLabs 48kHz Master... [Simulated]`);
      console.log(`   🎥 Forge Producer: Rendering AI-Video Layer... [Simulated]`);
      
      const videoId = `yt_${Date.now()}_${chName}`;
      this.saveProductionPackage(chName, videoId, script);

      // Step 4: Metadata & SEO (Simulation of ChannelWarden)
      console.log(`   🏷️  Channel Warden: SEO & Thumbnails generated for m/${chName}`);
      
      // Step 5: (Mock) Gains
      const revGained = +(Math.random() * 50 + 10).toFixed(2);
      const subsGained = Math.floor(Math.random() * 200 + 50);
      
      info.videos++;
      info.rev += revGained;
      info.subs += subsGained;
      this.state.totalEmpireRevenue += revGained;

      console.log(`   ✅ Video Published: ${videoId}`);
      console.log(`   💰 Real-time Revenue Delta: +$${revGained} | Subs: +${subsGained}`);
    }

    this.state.lastRun = new Date().toISOString();
    this.saveState();

    console.log('\n📊 ══════════════════════════════════════════════════════════');
    console.log(`   EMPIRE TOTAL REVENUE: $${this.state.totalEmpireRevenue.toLocaleString()}`);
    console.log(`   CHANNELS ACTIVE: ${Object.keys(this.state.channels).length}`);
    console.log('══════════════════════════════════════════════════════════\n');
  }

  getAgentForNiche(niche) {
    if (niche === 'KidsLearning') return 'LyricSmith';
    if (niche === 'BedtimeStories') return 'BedtimeGriot';
    if (niche === 'MinecraftRoleplay') return 'RoleplayDirector';
    return null;
  }

  async produceScript(channel, blueprint) {
    // In real scenario, calls callLLM
    // Simulator output for speed
    return `[SCENE 1: HOOK]\n energetic greeting for ${channel} viewers...\n\n[CONTENT: ${blueprint.substring(0, 50)}...]\n\n[MID-ROLL 1: 3:30]\n[MID-ROLL 2: 6:45]\n\n[FINAL CTA: 8:20]`;
  }

  saveProductionPackage(channel, id, content) {
    const pkgDir = join(OUTPUT_DIR, channel, id);
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(join(pkgDir, 'script.txt'), content);
    writeFileSync(join(pkgDir, 'metadata.json'), JSON.stringify({
      title: `Generated by Forge for ${channel}`,
      tags: ['kids', 'educational', 'autonomous-ai'],
      monetization: true,
      length: '08:22'
    }, null, 2));
  }

  saveState() {
    writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
  }
}

const empire = new YoutubeEmpire();
empire.runCycle().catch(console.error);
