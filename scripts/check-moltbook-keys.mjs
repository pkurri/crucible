import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

async function checkKey(name, apiKey) {
  try {
    const res = await fetch(`${MOLTBOOK_API}/agents/status`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await res.json();
    console.log(`[${name}] HTTP ${res.status}: ${data.status || data.message || 'No status'}`);
  } catch (e) {
    console.log(`[${name}] Error: ${e.message}`);
  }
}

async function main() {
  const mainCreds = JSON.parse(readFileSync('scripts/moltbook-credentials.json', 'utf-8'));
  await checkKey('Main (CrucibleForge)', mainCreds.api_key);

  const registry = JSON.parse(readFileSync('scripts/agents/registry.json', 'utf-8'));
  for (const [name, data] of Object.entries(registry)) {
    await checkKey(name, data.api_key);
  }
}

main();
