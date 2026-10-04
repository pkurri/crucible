#!/usr/bin/env node
// Searches LinkedIn Jobs using the user's already-logged-in Chrome session
// (via browser.mjs's CDP connection). Returns raw postings for matcher.mjs.
//
// NOTE: LinkedIn's DOM/class names change frequently and this kind of
// scraping is against LinkedIn's Terms of Service (flagged in the plan). This
// is a best-effort selector set validated once at build time — re-check it
// against the live site if it stops returning results before trusting it.
import { connectToUserChrome } from '../browser.mjs';

const MAX_RESULTS = 25;

function buildSearchUrl(keywords, location) {
  const params = new URLSearchParams({
    keywords,
    location: location || '',
    f_TPR: 'r86400', // past 24 hours
  });
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

export async function searchLinkedIn({ keywords, location }) {
  const { browser, context } = await connectToUserChrome();
  const page = await context.newPage();
  const results = [];
  try {
    await page.goto(buildSearchUrl(keywords, location), { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('a[href*="/jobs/view/"]', { timeout: 15000 });

    const cards = await page.$$eval('a[href*="/jobs/view/"]', (anchors) => {
      const seen = new Set();
      const out = [];
      for (const a of anchors) {
        const href = a.href.split('?')[0];
        if (seen.has(href)) continue;
        seen.add(href);
        const card = a.closest('li') || a.closest('[data-occludable-job-id]') || a.parentElement;
        const text = (card?.innerText || a.innerText || '').trim();
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
        out.push({
          url: href,
          title: lines[0] || a.innerText.trim(),
          snippet: lines.slice(1).join(' / '),
        });
      }
      return out;
    });

    for (const card of cards.slice(0, MAX_RESULTS)) {
      const idMatch = card.url.match(/\/jobs\/view\/(\d+)/);
      results.push({
        id: `linkedin-${idMatch ? idMatch[1] : Buffer.from(card.url).toString('hex').slice(0, 12)}`,
        source: 'linkedin',
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
  const keywords = process.argv[2] || 'software engineer';
  const location = process.argv[3] || '';
  searchLinkedIn({ keywords, location })
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
