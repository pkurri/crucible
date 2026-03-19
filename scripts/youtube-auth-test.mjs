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
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SECRET_PATH = join(__dirname, '../client_secret.json');
const TOKEN_PATH = join(__dirname, '../youtube-token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly'
];

async function authenticate() {
  if (!existsSync(SECRET_PATH)) {
    console.error('❌ Error: client_secret.json not found in the root directory.');
    console.log('   Please move your Google Cloud JSON file to C:\\Users\\Prasad\\workspace\\dups\\crucible\\client_secret.json');
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
          resolve(oauth2Client);
        }
      } catch (e) {
        reject(e);
      }
    }).listen(3001, () => {
      console.log('📡 Auth server listening on port 3001.');
      console.log('🌐 Opening browser for authorization...');
      open(authUrl);
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
