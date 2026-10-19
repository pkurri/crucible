import { google } from 'googleapis';
import fs from 'fs';

/**
 * 🔒 YOUTUBE LEGACY PRIVATIZER (one-off, reversible)
 * Sets every non-private legacy template Short (≤20s, uploaded before the film
 * series started) to private, so the channel's public upload pattern reflects
 * the new series. Titles varied ("ApexFlow_…", "Facts You Didn't Know",
 * "Secret Finally Revealed"), so selection is by length + upload date.
 *
 * Usage: node scripts/youtube-privatize-legacy.mjs [--before 2026-10-20]           (dry run)
 *        node scripts/youtube-privatize-legacy.mjs [--before 2026-10-20] --apply   (make private)
 */

const MAX_SECONDS = 20;
const apply = process.argv.includes('--apply');
const beforeIdx = process.argv.indexOf('--before');
const BEFORE = beforeIdx !== -1 ? process.argv[beforeIdx + 1] : '2026-10-20';

const seconds = (iso) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
  return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
};

async function main() {
  const creds = JSON.parse(fs.readFileSync('client_secret.json'));
  const { client_id, client_secret } = creds.web || creds.installed;
  const auth = new google.auth.OAuth2(client_id, client_secret);
  auth.setCredentials(JSON.parse(fs.readFileSync(process.env.YOUTUBE_TOKEN_PATH || 'youtube-token.json')));
  const yt = google.youtube({ version: 'v3', auth });

  const channel = (await yt.channels.list({ part: 'contentDetails,snippet', mine: true })).data.items[0];
  console.log(`📺 Channel: ${channel.snippet.title}`);
  const uploads = channel.contentDetails.relatedPlaylists.uploads;

  const ids = [];
  let pageToken;
  do {
    const page = (await yt.playlistItems.list({ part: 'contentDetails', playlistId: uploads, maxResults: 50, pageToken })).data;
    ids.push(...page.items.map(i => i.contentDetails.videoId));
    pageToken = page.nextPageToken;
  } while (pageToken);

  const targets = [];
  for (let i = 0; i < ids.length; i += 50) {
    const videos = (await yt.videos.list({ part: 'snippet,status,contentDetails', id: ids.slice(i, i + 50).join(',') })).data.items;
    for (const v of videos) {
      if (v.status.privacyStatus === 'private') continue;
      if (v.snippet.publishedAt < BEFORE && seconds(v.contentDetails.duration) <= MAX_SECONDS) targets.push(v);
    }
  }

  console.log(`🎯 ${targets.length} of ${ids.length} uploads match (≤${MAX_SECONDS}s, uploaded before ${BEFORE}, not already private):`);
  for (const v of targets) console.log(`   ${v.id}  ${v.snippet.publishedAt.slice(0, 10)}  ${v.contentDetails.duration}  ${v.snippet.title.slice(0, 70)}`);

  if (!apply) { console.log('\n🧪 Dry run — nothing changed. Re-run with --apply to make these private.'); return; }

  let done = 0;
  for (const v of targets) {
    // videos.update replaces the whole status part, so carry the writable fields over.
    const { embeddable, license, publicStatsViewable, selfDeclaredMadeForKids, containsSyntheticMedia } = v.status;
    const status = { privacyStatus: 'private', embeddable, license, publicStatsViewable, selfDeclaredMadeForKids, containsSyntheticMedia };
    Object.keys(status).forEach(k => status[k] === undefined && delete status[k]);
    await yt.videos.update({ part: 'status', requestBody: { id: v.id, status } });
    done++;
  }
  console.log(`🔒 Set ${done} video(s) to private.`);
}

main().catch(e => { console.error(`❌ ${e.message}`); process.exit(1); });
