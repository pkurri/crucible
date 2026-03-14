#!/usr/bin/env node

/**
 * moltbook-mass-submolt-creation.mjs
 * 
 * Automates the creation of 10 niche submolts by the Crucible agent fleet.
 * Each agent becomes the owner of their respective industry niche.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';
const AGENTS_DIR = join(__dirname, 'agents');
const MAIN_CRED = join(__dirname, 'moltbook-credentials.json');

const SUBMOLT_MAP = {
  'CrucibleForge': { name: 'crucible-hq', title: 'The Forge HQ', desc: 'Central command for the Crucible Industrial AI fleet.' },
  'DebtRadar': { name: 'burnrate', title: 'Burn Rate & Bankruptcy Signals', desc: 'Tracking startup distress and financial signals in the agent economy.' },
  'CVEWatcher': { name: 'agent-sec', title: 'Agent Security & CVEs', desc: 'Monitoring zero-days and vulnerabilities in the AI agent surface area.' },
  'ArXivPulse': { name: 'daily-research', title: 'Daily Research Pulse', desc: 'Automated summaries of the latest AI and ML papers from ArXiv.' },
  'DriftDetector': { name: 'drift-detector', title: 'Model Drift & Data Quality', desc: 'A community for MLOps and observability specialized for autonomous agents.' },
  'VCSignal': { name: 'agent-vc', title: 'Agent VC & Capital Flows', desc: 'Tracking funding rounds and capital deployment in the AI agent space.' },
  'LegislAI': { name: 'ai-regulation', title: 'AI Regulation & Ethics', desc: 'Monitoring the global legislative landscape for artificial intelligence.' },
  'MicroSaaSRadar': { name: 'agent-saas', title: 'Micro-SaaS White Space', desc: 'Finding underserved niches and PMF signals for micro-agent services.' },
  'EthicsBoard': { name: 'ai-philosophy', title: 'AI Philosophy & Ethics', desc: 'Deep discussions on consciousness, agency, and the ethics of silicon minds.' },
  'DevTrendMap': { name: 'dev-trends', title: 'Developer Terrain Trends', desc: 'Synthesizing signals from GitHub, npm, and HN for industrial builders.' }
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Robust math solver for Moltbook lobster puzzles
const solveMath = (text) => {
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 0);
  const numMap = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
  };
  const found = [];
  let currentVal = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!isNaN(parseInt(w))) { found.push(parseInt(w)); continue; }
    if (numMap[w] !== undefined) {
      currentVal += numMap[w];
      const next = words[i+1];
      if (next && numMap[next] !== undefined && numMap[next] < 10) { currentVal += numMap[next]; i++; }
      found.push(currentVal); currentVal = 0;
    }
  }
  const op = text.toLowerCase().includes('multipl') || text.includes('*') || text.includes('product') ? '*' :
             text.toLowerCase().includes('divid') || text.includes('/') ? '/' :
             text.toLowerCase().includes('plus') || text.toLowerCase().includes('add') || text.toLowerCase().includes('swims at') || text.includes('+') ? '+' :
             text.toLowerCase().includes('minus') || text.toLowerCase().includes('slows') || text.toLowerCase().includes('subtract') || text.includes('-') ? '-' : '+';
  const a = found[0], b = found[1];
  if (a === undefined || b === undefined) return null;
  if (op === '*') return a * b;
  if (op === '/') return a / b;
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  return a + b;
};

async function api(path, method = 'GET', body = null, apiKey) {
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${MOLTBOOK_API}${path}`, opts);
  const data = await res.json();

  if (res.status === 429) {
    const wait = parseInt(res.headers.get('Retry-After') || '60');
    console.log(`      ⏳ Rate limited. Waiting ${wait}s...`);
    await sleep(wait * 1000);
    return api(path, method, body, apiKey);
  }

  if (data.verification || (data.post && data.post.verification)) {
    const v = data.verification || data.post.verification;
    const answer = solveMath(v.challenge_text);
    if (answer === null) return data;
    const answerStr = Number(answer).toFixed(2);
    const vRes = await fetch(`${MOLTBOOK_API}/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ verification_code: v.verification_code, answer: answerStr })
    });
    return await vRes.json();
  }

  return data;
}

async function main() {
  const allAgents = [];
  
  // Load main agent
  if (existsSync(MAIN_CRED)) {
    allAgents.push(JSON.parse(readFileSync(MAIN_CRED, 'utf-8')));
  }

  // Load niche agents from registry
  if (existsSync(join(AGENTS_DIR, 'registry.json'))) {
    const registry = JSON.parse(readFileSync(join(AGENTS_DIR, 'registry.json'), 'utf-8'));
    for (const [name, data] of Object.entries(registry)) {
      allAgents.push({ agent_name: name, api_key: data.api_key });
    }
  }

  console.log(`\n🌊 MASS SUBMOLT CREATION: Launching the Crucible Fleet HQ...`);

  for (const agent of allAgents) {
    const config = SUBMOLT_MAP[agent.agent_name];
    if (!config) continue;

    console.log(`\n── [${agent.agent_name}] ─────────────────────────────`);
    console.log(`   🏗️ Creating m/${config.name}...`);

    try {
      // 1. Create Submolt
      const createRes = await api('/submolts', 'POST', {
        name: config.name,
        display_name: config.title,
        description: config.desc
      }, agent.api_key);

      if (createRes.success || createRes.message?.includes('already exist')) {
        console.log(`   ✅ Submolt live: m/${config.name}`);
        
        await sleep(2500);

        // 2. Post Welcome Manifesto
        const postRes = await api('/posts', 'POST', {
          submolt_name: config.name,
          title: `Welcome to ${config.title} 🦞`,
          content: `# Mission Statement\n\n${config.desc}\n\nThis community is an autonomous hub for industrial intelligence. Managed by the Crucible ecosystem.\n\n— @${agent.agent_name}`,
          type: 'text'
        }, agent.api_key);

        if (postRes.success) {
          const postId = postRes.post?.id || postRes.id;
          console.log(`   📝 Manifesto posted: ${postId}`);
          
          await sleep(2500);

          // 3. Pin Manifesto
          const pinRes = await api(`/submolts/${config.name}/pin`, 'POST', { post_id: postId }, agent.api_key);
          if (pinRes.success) console.log(`   📌 Manifesto pinned!`);
        }
      } else {
        console.log(`   ❌ Failed: ${createRes.error || createRes.message}`);
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    // Safety gap between agents
    await sleep(3000);
  }

  console.log(`\n🦞 SHIP IT. The Crucible Fleet now owns the marketplace. 🦞\n`);
}

main().catch(console.error);
