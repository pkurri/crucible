#!/usr/bin/env node
// Queries the JSearch API (via RapidAPI), which aggregates LinkedIn/Indeed/
// Glassdoor/etc listings. Requires a key in
// scripts/job-search-credentials.json:
//   { "rapidApi": { "key": "..." } }
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, '..', '..', 'job-search-credentials.json');
const JSEARCH_HOST = 'jsearch.p.rapidapi.com';

function loadCredentials() {
  if (!existsSync(CREDENTIALS_PATH)) return null;
  const all = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
  return all.rapidApi || null;
}

export async function searchJSearch({ keywords, location }) {
  const creds = loadCredentials();
  if (!creds?.key) {
    console.warn('[jsearch-source] Skipping: no credentials in scripts/job-search-credentials.json');
    return [];
  }

  const query = location ? `${keywords} in ${location}` : keywords;
  const url = `https://${JSEARCH_HOST}/search?${new URLSearchParams({
    query,
    page: '1',
    num_pages: '1',
  }).toString()}`;

  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key': creds.key,
      'x-rapidapi-host': JSEARCH_HOST,
    },
  });
  if (!res.ok) {
    throw new Error(`JSearch API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();

  return (data.data || []).map((job) => ({
    id: `jsearch-${job.job_id}`,
    source: 'jsearch',
    title: job.job_title,
    company: job.employer_name || '',
    location: job.job_city ? `${job.job_city}, ${job.job_state || ''}`.trim() : '',
    description: job.job_description || '',
    url: job.job_apply_link || job.job_google_link || '',
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const keywords = process.argv[2] || 'software engineer';
  const location = process.argv[3] || '';
  searchJSearch({ keywords, location })
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
