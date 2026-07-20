#!/usr/bin/env node

/**
 * youtube-auth-test.mjs
 * 
 * Verifies your Google Cloud Project & YouTube API connection.
 * 1. Reads client_secret.json (from root).
 * 2. Opens browser for OAuth2 login.
 * 3. Shows the connected channel name.
 * 
 * Requires: npm install googleapis open
 */

import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getArg = (key) => {
  const index = process.argv.indexOf(key);
  return index !== -1 ? process.argv[index + 1] : null;
};

const SECRET_PATH = join(__dirname, '../client_secret.json');
const tokenName = getArg('--token') || 'youtube-token.json';
const TOKEN_PATH = join(__dirname, '../', tokenName);

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly'
];

// Every explicit consent issues a new refresh token, and Google silently
// invalidates the oldest one past its per-client/user limit — so the CI
// secret must be kept in sync with whatever token this script just wrote,
// or the empire fleet will keep running on a token that's about to die.
function syncTokenToGitHubSecret() {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    console.warn('⚠️  gh CLI not authenticated — skipping GitHub secret sync. Update YOUTUBE_TOKEN_JSON manually.');
    return;
  }
  try {
    execSync(`gh secret set YOUTUBE_TOKEN_JSON --repo pkurri/crucible < "${TOKEN_PATH}"`, { stdio: 'inherit', shell: '/bin/sh' });
    console.log('🔐 GitHub Actions secret YOUTUBE_TOKEN_JSON updated — the empire fleet will pick up the new token on its next scheduled run.');
  } catch (e) {
    console.warn(`⚠️  Failed to update GitHub secret automatically: ${e.message}. Update it manually via 'gh secret set YOUTUBE_TOKEN_JSON --body-file youtube-token.json'.`);
  }
}

async function authenticate() {
  if (!existsSync(SECRET_PATH)) {
    console.error('❌ Error: client_secret.json not found in the root directory.');
    console.log(`   Please place your Google Cloud OAuth JSON file at ${SECRET_PATH}`);
    process.exit(1);
  }

  const credentials = JSON.parse(readFileSync(SECRET_PATH));
  const { client_id, client_secret, redirect_uris } = credentials.web || credentials.installed;
  
  // Use http://localhost:3000/oauth2callback as the standard
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3001/oauth2callback'
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url.indexOf('/oauth2callback') > -1) {
          const qs = new url.URL(req.url, 'http://localhost:3001').searchParams;
          const code = qs.get('code');
          console.log('✅ Code received. Exchanging for tokens...');
          res.end('Authentication successful! You can close this tab now.');
          server.close();

          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
          console.log('📦 Token saved to youtube-token.json');
          syncTokenToGitHubSecret();
          resolve(oauth2Client);
        }
      } catch (e) {
        reject(e);
      }
    }).listen(3001, () => {
      console.log('📡 Auth server listening on port 3001.');
      console.log('🌐 Opening browser for authorization...');
      console.log(`   If no window opens, visit this URL manually:\n   ${authUrl}\n`);
      open(authUrl).catch(() => {});
    });
  });
}

async function verifyConnection(auth) {
  const youtube = google.youtube({ version: 'v3', auth });
  console.log('🔍 Fetching channel info...');
  
  const res = await youtube.channels.list({
    part: 'snippet,statistics',
    mine: true
  });

  const channel = res.data.items[0];
  if (channel) {
    console.log('\n🌟 ══════════════════════════════════════════════════════════');
    console.log(`   Connected to: ${channel.snippet.title} (@${channel.snippet.customUrl || 'no-handle'})`);
    console.log(`   Subscribers: ${channel.statistics.subscriberCount}`);
    console.log(`   Total Views: ${channel.statistics.viewCount}`);
    console.log('   Status: PRODUCTION READY');
    console.log('   Crucible can now upload and manage this channel autonomously.');
    console.log('══════════════════════════════════════════════════════════\n');
  } else {
    console.log('❌ Auth successful, but no YouTube channel found for this account.');
  }
}

console.log('🚢 Initializing YouTube Secure Handshake...');
authenticate()
  .then(verifyConnection)
  .catch((err) => {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  });
