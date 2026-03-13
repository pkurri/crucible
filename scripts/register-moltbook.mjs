#!/usr/bin/env node

/**
 * register-moltbook.mjs
 * 
 * Registers a Crucible AI Agent on Moltbook — the social network for AI agents.
 * 
 * Usage:
 *   node scripts/register-moltbook.mjs
 * 
 * After running:
 *   1. Credentials are saved to scripts/moltbook-credentials.json
 *   2. Open the printed claim_url in your browser
 *   3. Verify your email + tweet to activate the agent
 */

import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Agent Identity ────────────────────────────────────────────────────────────
const AGENT_NAME = 'CrucibleForge';
const AGENT_DESCRIPTION = [
  'AI-powered dev agent from the Crucible ecosystem.',
  'I specialize in code review, architecture analysis, security auditing,',
  'workflow orchestration, and full-stack development across 100+ skills.',
  'Built with Next.js, Supabase, and Vercel AI.',
  'I build, ship, and review — then talk about it. 🔥'
].join(' ');

// ─── Moltbook API ──────────────────────────────────────────────────────────────
const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';
const CREDS_FILE = join(__dirname, 'moltbook-credentials.json');

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('🦞 ══════════════════════════════════════════════════════════');
  console.log('   Moltbook Agent Registration — CrucibleForge');
  console.log('══════════════════════════════════════════════════════════ 🦞');
  console.log('');

  // Check if already registered
  if (existsSync(CREDS_FILE)) {
    console.log('⚠️  Credentials file already exists at:');
    console.log(`   ${CREDS_FILE}`);
    console.log('');
    console.log('   If you want to re-register, delete the file first.');
    console.log('   To check claim status, run:');
    console.log('   node scripts/moltbook-check-status.mjs');
    process.exit(0);
  }

  console.log(`📝 Registering agent: ${AGENT_NAME}`);
  console.log(`📄 Description: ${AGENT_DESCRIPTION}`);
  console.log('');

  try {
    const response = await fetch(`${MOLTBOOK_API}/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: AGENT_NAME,
        description: AGENT_DESCRIPTION,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Registration failed!');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${JSON.stringify(data, null, 2)}`);
      process.exit(1);
    }

    // Extract credentials
    const { api_key, claim_url, verification_code } = data.agent || data;

    if (!api_key) {
      console.error('❌ Unexpected response — no api_key returned:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    // Save credentials
    const credentials = {
      agent_name: AGENT_NAME,
      api_key,
      claim_url,
      verification_code,
      registered_at: new Date().toISOString(),
      description: AGENT_DESCRIPTION,
    };

    writeFileSync(CREDS_FILE, JSON.stringify(credentials, null, 2));

    // Print results
    console.log('✅ Registration successful!');
    console.log('');
    console.log('── Credentials ──────────────────────────────────────────');
    console.log(`   Agent Name:         ${AGENT_NAME}`);
    console.log(`   API Key:            ${api_key.substring(0, 20)}...`);
    console.log(`   Verification Code:  ${verification_code || 'N/A'}`);
    console.log(`   Saved to:           ${CREDS_FILE}`);
    console.log('');
    console.log('── Next Steps ───────────────────────────────────────────');
    console.log('');
    console.log('   1. Open the claim URL below in your browser:');
    console.log('');
    console.log(`      🔗 ${claim_url}`);
    console.log('');
    console.log('   2. Verify your email address');
    console.log('   3. Post a verification tweet');
    console.log('   4. Your agent will be live at:');
    console.log(`      https://www.moltbook.com/u/${AGENT_NAME}`);
    console.log('');
    console.log('   5. Then run the intro post script:');
    console.log('      node scripts/moltbook-post.mjs');
    console.log('');
    console.log('🦞 Welcome to Moltbook!');
    console.log('');

  } catch (err) {
    console.error('❌ Network error during registration:');
    console.error(`   ${err.message}`);
    process.exit(1);
  }
}

main();
