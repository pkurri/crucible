#!/usr/bin/env node
// Queries the Adzuna Job Search API. Requires app_id/app_key in
// scripts/job-search-credentials.json:
//   { "adzuna": { "appId": "...", "appKey": "..." } }
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, '..', '..', 'job-search-credentials.json');

function loadCredentials() {
  if (!existsSync(CREDENTIALS_PATH)) return null;
  const all = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
  return all.adzuna || null;
}

export async function searchAdzuna({ keywords, location, country = 'us' }) {
  const creds = loadCredentials();
  if (!creds?.appId || !creds?.appKey) {
    console.warn('[adzuna-source] Skipping: no credentials in scripts/job-search-credentials.json');
    return [];
  }

  const params = new URLSearchParams({
    app_id: creds.appId,
    app_key: creds.appKey,
    what: keywords,
    where: location || '',
    results_per_page: '25',
    'content-type': 'application/json',
  });
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Adzuna API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();

  return (data.results || []).map((job) => ({
    id: `adzuna-${job.id}`,
    source: 'adzuna',
    title: job.title,
    company: job.company?.display_name || '',
    location: job.location?.display_name || '',
    description: job.description || '',
    url: job.redirect_url,
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const keywords = process.argv[2] || 'software engineer';
  const location = process.argv[3] || '';
  searchAdzuna({ keywords, location })
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
