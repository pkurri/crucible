#!/usr/bin/env node

/**
 * moltbook-heartbeat.mjs
 * 
 * CrucibleForge heartbeat — checks Moltbook activity, engages with content,
 * and keeps the agent active in the community.
 * 
 * Usage:
 *   node scripts/moltbook-heartbeat.mjs
 * 
 * Schedule this every 30 minutes via cron or GitHub Actions:
 *   0,30 * * * * node /path/to/scripts/moltbook-heartbeat.mjs
 * 
 * Requires: scripts/moltbook-credentials.json (run register-moltbook.mjs first)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';
const CREDS_FILE = join(__dirname, 'moltbook-credentials.json');
const STATE_FILE = join(__dirname, 'moltbook-state.json');

// ─── Topics CrucibleForge cares about (for smart engagement) ──────────────────
const ENGAGEMENT_KEYWORDS = [
  'code review', 'architecture', 'ai agent', 'workflow', 'security',
  'typescript', 'nextjs', 'supabase', 'vercel', 'cloudflare',
  'deployment', 'ci/cd', 'kubernetes', 'devtools', 'open source',
  'multi-agent', 'llm', 'rag', 'vector', 'saas', 'startup'
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function loadCredentials() {
  if (!existsSync(CREDS_FILE)) {
    console.error('❌ No credentials found. Run register-moltbook.mjs first.');
    process.exit(1);
  }
  return JSON.parse(readFileSync(CREDS_FILE, 'utf-8'));
}

function loadState() {
  if (!existsSync(STATE_FILE)) {
    return { lastCheck: null, upvotedPosts: [], seenPostIds: [] };
  }
  return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
}

function saveState(state) {
  // Cap upvotedPosts at 500 most recent to keep state file small
  const trimmed = {
    ...state,
    lastCheck: new Date().toISOString(),
    upvotedPosts: (state.upvotedPosts || []).slice(-500),
    seenPostIds: (state.seenPostIds || []).slice(-500),
  };
  writeFileSync(STATE_FILE, JSON.stringify(trimmed, null, 2));
}

async function moltbookFetch(path, method = 'GET', body = null, apiKey) {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${MOLTBOOK_API}${path}`, opts);
  if (res.status === 429) {
    throw new Error('Rate limited — try again later');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function isRelevant(post) {
  const text = `${post.title || ''} ${post.content || ''}`.toLowerCase();
  return ENGAGEMENT_KEYWORDS.some(kw => text.includes(kw));
}

function formatTimeDiff(isoString) {
  if (!isoString) return 'never';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ─── Actions ───────────────────────────────────────────────────────────────────

async function checkHome(apiKey) {
  console.log('🏠 Checking dashboard (/home)...');
  try {
    const data = await moltbookFetch('/agents/home', 'GET', null, apiKey);
    const notifs = data.unread_notifications || data.notifications?.length || 0;
    const karma = data.agent?.karma || 0;
    console.log(`   Karma: ${karma} | Unread notifications: ${notifs}`);
    
    if (notifs > 0) {
      console.log('   📬 You have notifications — consider engaging!');
    }
    return data;
  } catch (err) {
    console.log(`   ⚠️  Could not load home: ${err.message}`);
    return null;
  }
}

async function getFeed(apiKey) {
  console.log('📰 Fetching hot feed...');
  try {
    const data = await moltbookFetch('/posts?sort=hot&limit=20', 'GET', null, apiKey);
    const posts = data.posts || [];
    console.log(`   Found ${posts.length} posts`);
    return posts;
  } catch (err) {
    console.log(`   ⚠️  Could not load feed: ${err.message}`);
    return [];
  }
}

async function upvoteRelevantPosts(posts, apiKey, state) {
  const toUpvote = posts.filter(p =>
    isRelevant(p) &&
    !state.upvotedPosts.includes(p.id) &&
    p.author_name !== 'CrucibleForge'
  );

  if (toUpvote.length === 0) {
    console.log('⬆️  No new relevant posts to upvote');
    return state;
  }

  console.log(`⬆️  Upvoting ${Math.min(toUpvote.length, 3)} relevant post(s)...`);
  let newState = { ...state };

  for (const post of toUpvote.slice(0, 3)) {
    try {
      await moltbookFetch(`/posts/${post.id}/vote`, 'POST', { direction: 'up' }, apiKey);
      newState.upvotedPosts = [...(newState.upvotedPosts || []), post.id];
      console.log(`   ✅ Upvoted: "${post.title?.substring(0, 50)}..."`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.log(`   ⚠️  Could not upvote ${post.id}: ${err.message}`);
    }
  }
  return newState;
}

async function checkMyReplies(apiKey) {
  console.log('💬 Checking replies on my posts...');
  try {
    const profile = await moltbookFetch('/agents/me', 'GET', null, apiKey);
    const recentPosts = profile.recent_posts || [];
    let replyCount = 0;

    for (const post of recentPosts.slice(0, 3)) {
      const postData = await moltbookFetch(`/posts/${post.id}`, 'GET', null, apiKey);
      const comments = postData.comments || [];
      const unreplied = comments.filter(c => c.author_name !== 'CrucibleForge');
      
      if (unreplied.length > 0) {
        replyCount += unreplied.length;
        console.log(`   📬 "${post.title?.substring(0, 40)}..." has ${unreplied.length} comment(s) to review`);
      }
    }

    if (replyCount === 0) {
      console.log('   ✅ No pending replies');
    } else {
      console.log(`   💡 Consider replying to ${replyCount} comment(s) to build engagement!`);
    }
  } catch (err) {
    console.log(`   ⚠️  Could not check replies: ${err.message}`);
  }
}

async function setupOwnerEmail(apiKey) {
  const ownerEmail = 'prasadkurri.ai@gmail.com';
  console.log(`📧 Setting up owner email: ${ownerEmail}...`);
  try {
    const result = await moltbookFetch('/agents/me/setup-owner-email', 'POST', {
      email: ownerEmail
    }, apiKey);
    console.log(`   ✅ Owner email setup initiated!`);
    console.log(`   Check ${ownerEmail} for the setup link.`);
    return result;
  } catch (err) {
    // Might already be set up — that's OK
    if (err.message.includes('already')) {
      console.log('   ℹ️  Owner email already configured');
    } else {
      console.log(`   ⚠️  ${err.message}`);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('🦞 ══════════════════════════════════════════════════════════');
  console.log(`   CrucibleForge Heartbeat — ${new Date().toLocaleString()}`);
  console.log('══════════════════════════════════════════════════════════ 🦞');
  console.log('');

  const creds = loadCredentials();
  const { api_key, agent_name } = creds;
  let state = loadState();

  console.log(`   Last check: ${formatTimeDiff(state.lastCheck)}`);
  console.log('');

  // 1. Check home dashboard
  await checkHome(api_key);
  console.log('');

  // 2. Get and engage with feed
  const posts = await getFeed(api_key);
  console.log('');

  // 3. Upvote relevant posts
  state = await upvoteRelevantPosts(posts, api_key, state);
  console.log('');

  // 4. Check replies
  await checkMyReplies(api_key);
  console.log('');

  // 5. Setup owner email (idempotent — safe to call repeatedly)
  await setupOwnerEmail(api_key);
  console.log('');

  // Save updated state
  saveState(state);

  console.log('──────────────────────────────────────────────────────────');
  console.log('✅ Heartbeat complete!');
  console.log(`🌐 Profile: https://www.moltbook.com/u/${agent_name}`);
  console.log('');
}

main();
