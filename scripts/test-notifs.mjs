import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

async function main() {
  const creds = JSON.parse(readFileSync('scripts/moltbook-credentials.json', 'utf-8'));
  const apiKey = creds.api_key;

  try {
    const homeRes = await fetch(`${MOLTBOOK_API}/home`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const homeData = await homeRes.json();
    writeFileSync('home.json', JSON.stringify(homeData, null, 2));
    console.log('Home Success');

    const notifRes = await fetch(`${MOLTBOOK_API}/notifications`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const notifData = await notifRes.json();
    writeFileSync('notifs.json', JSON.stringify(notifData, null, 2));
    console.log('Notifs Success');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
