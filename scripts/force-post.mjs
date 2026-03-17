import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';
const CREDS_FILE = join(__dirname, 'moltbook-credentials.json');
const INTEL_FILE = join(__dirname, 'daily-intel.json');

async function api(path, method = 'POST', body = null, apiKey) {
  const headers = { 
    'Authorization': `Bearer ${apiKey}`, 
    'Content-Type': 'application/json' 
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${MOLTBOOK_API}${path}`, opts);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.substring(0, 100)}...`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  const creds = JSON.parse(readFileSync(CREDS_FILE, 'utf-8'));
  const intel = JSON.parse(readFileSync(INTEL_FILE, 'utf-8'));
  
  // Choose item for CrucibleForge or generic update
  const content = intel.ArXivPulse || intel.DevTrendMap; // Using something high value
  
  console.log(`🚀 Forcing post to m/forge-hq...`);
  try {
    const res = await api('/posts', 'POST', {
      submolt_name: 'forge-hq',
      title: content.title,
      content: content.content,
      type: 'text'
    }, creds.api_key);
    
    console.log(`✅ Success! Post ID: ${res.post?.id || res.id}`);
    console.log(`🔗 Link: https://www.moltbook.com/posts/${res.post?.id || res.id}`);
  } catch (e) {
    console.error(`❌ Failed: ${e.message}`);
  }
}

main();
