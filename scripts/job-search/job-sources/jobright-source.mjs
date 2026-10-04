#!/usr/bin/env node
// Pulls job matches from the user's Jobright.ai account (already logged in
// as prasadkurri.ai@gmail.com in the Chrome instance browser.mjs attaches
// to). Jobright already runs its own resume-match + auto-apply pipeline;
// this just surfaces its matches into our own review/notify flow.
//
// NOTE: `$$eval`/`evaluate` below are Playwright's page-context evaluators
// (functions run inside the browser tab), not a call to JS `eval()` on
// untrusted strings from this script.
import { connectToUserChrome } from '../browser.mjs';

const MATCHES_URL = 'https://jobright.ai/jobs/recommend';
const MAX_RESULTS = 25;

export async function fetchJobrightMatches() {
  const { browser, context } = await connectToUserChrome();
  const page = await context.newPage();
  const results = [];
  try {
    await page.goto(MATCHES_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('a[href*="/jobs/"]', { timeout: 15000 });

    const cards = await page.$$eval('a[href*="/jobs/"]', (anchors) => {
      const seen = new Set();
      const out = [];
      for (const a of anchors) {
        const href = a.href.split('?')[0];
        if (seen.has(href) || !/\/jobs\/[a-zA-Z0-9-]+$/.test(href)) continue;
        seen.add(href);
        const card = a.closest('[class*="card"]') || a.closest('li') || a.parentElement;
        const text = (card?.innerText || a.innerText || '').trim();
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
        out.push({ url: href, title: lines[0] || '', snippet: lines.slice(1).join(' / ') });
      }
      return out;
    });

    for (const card of cards.slice(0, MAX_RESULTS)) {
      results.push({
        id: `jobright-${Buffer.from(card.url).toString('hex').slice(0, 12)}`,
        source: 'jobright',
        title: card.title,
        company: card.snippet.split(' / ')[0] || '',
        location: card.snippet.split(' / ')[1] || '',
        description: card.snippet,
        url: card.url,
      });
    }
  } finally {
    await page.close();
    await browser.close();
  }
  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchJobrightMatches()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
