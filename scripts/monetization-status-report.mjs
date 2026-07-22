#!/usr/bin/env node
import 'dotenv/config';
import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * monetization-status-report.mjs
 *
 * Pulls REAL audience/eligibility metrics from YouTube, Facebook, and
 * Instagram — replacing the simulated "rev" placeholder numbers that used
 * to live in yt-empire-state.json / fb-empire-state.json / ig-empire-state.json.
 *
 * None of these platforms expose "are you actually enrolled in monetization"
 * via a simple public API call for a small/personal account — that status
 * only lives in each platform's own creator dashboard. What IS queryable is
 * real audience size, which this script checks against each platform's
 * published self-serve eligibility thresholds to report real progress
 * instead of a fabricated dollar figure.
 *
 * Usage: node scripts/monetization-status-report.mjs
 * Requires (YouTube): client_secret.json + youtube-token.json at repo root.
 * Requires (Meta): META_ACCESS_TOKEN, META_FB_PAGE_ID, META_IG_ACCOUNT_ID env vars.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORT_PATH = join(ROOT, 'data', 'monetization-status.json');
const META_API = 'https://graph.facebook.com/v19.0';

// Published self-serve thresholds as of 2026 — these change over time and by
// region. Treat this as a directional progress signal, not ground truth;
// always confirm actual enrollment in the platform's own creator dashboard.
const THRESHOLDS = {
  youtube: {
    subscribers: 1000,
    note: 'Standard YPP track also requires 4,000 public watch hours in the last 12 months OR 500 subs + 3M Shorts views in 90 days. Watch-hour data needs the yt-analytics.readonly OAuth scope, which the current token does not have (upload/force-ssl/readonly only) — re-run the OAuth consent with that scope added to track it.',
  },
  facebook: {
    followers: 10000,
    note: 'In-stream ads eligibility also requires meeting Meta Partner Monetization Policies and a recent watch-time minimum — this only checks the follower count proxy. Verify actual status in Meta Business Suite.',
  },
  instagram: {
    note: 'Instagram monetization (Reels bonuses, subscriptions, brand deals) is invite-only/manual with no public self-serve follower threshold — reporting audience size only, not eligibility.',
  },
};

async function getYouTubeStatus() {
  const SECRET_PATH = join(ROOT, 'client_secret.json');
  const TOKEN_PATH = join(ROOT, 'youtube-token.json');
  if (!existsSync(SECRET_PATH) || !existsSync(TOKEN_PATH)) {
    return { platform: 'youtube', error: 'Missing client_secret.json or youtube-token.json' };
  }

  const credentials = JSON.parse(readFileSync(SECRET_PATH, 'utf-8'));
  const { client_id, client_secret } = credentials.web || credentials.installed;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
  oauth2Client.setCredentials(JSON.parse(readFileSync(TOKEN_PATH, 'utf-8')));

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const res = await youtube.channels.list({ part: 'snippet,statistics', mine: true });
  const channel = res.data.items?.[0];
  if (!channel) return { platform: 'youtube', error: 'No channel found for this token' };

  const hidden = !!channel.statistics.hiddenSubscriberCount;
  const subs = hidden ? null : Number(channel.statistics.subscriberCount);
  const progress = subs === null ? null : Math.min(1, subs / THRESHOLDS.youtube.subscribers);

  return {
    platform: 'youtube',
    channel: channel.snippet.title,
    subscribers: subs,
    subscribersHidden: hidden,
    totalViews: Number(channel.statistics.viewCount),
    videoCount: Number(channel.statistics.videoCount),
    subscriberEligibilityProgress: progress,
    monetizationStatus: subs === null ? 'unknown_subscribers_hidden' : (subs >= THRESHOLDS.youtube.subscribers ? 'subscriber_threshold_met_verify_watch_hours' : 'not_eligible'),
    note: THRESHOLDS.youtube.note,
  };
}

async function metaGraphGet(path) {
  const res = await fetch(`${META_API}${path}`);
  const data = await res.json();
  if (data.error) throw new Error(`${data.error.message} (code ${data.error.code})`);
  return data;
}

async function getFacebookStatus() {
  const token = process.env.META_ACCESS_TOKEN;
  const pageId = process.env.META_FB_PAGE_ID;
  if (!token || !pageId) return { platform: 'facebook', error: 'Missing META_ACCESS_TOKEN or META_FB_PAGE_ID env var' };

  const data = await metaGraphGet(`/${pageId}?fields=name,fan_count,followers_count&access_token=${encodeURIComponent(token)}`);
  const followers = data.followers_count ?? data.fan_count ?? null;
  const progress = followers === null ? null : Math.min(1, followers / THRESHOLDS.facebook.followers);

  return {
    platform: 'facebook',
    page: data.name,
    followers,
    followerEligibilityProgress: progress,
    monetizationStatus: followers === null ? 'unknown' : (followers >= THRESHOLDS.facebook.followers ? 'follower_threshold_met_verify_in_business_suite' : 'not_eligible'),
    note: THRESHOLDS.facebook.note,
  };
}

async function getInstagramStatus() {
  const token = process.env.META_ACCESS_TOKEN;
  const igId = process.env.META_IG_ACCOUNT_ID;
  if (!token || !igId) return { platform: 'instagram', error: 'Missing META_ACCESS_TOKEN or META_IG_ACCOUNT_ID env var' };

  const data = await metaGraphGet(`/${igId}?fields=username,followers_count,media_count&access_token=${encodeURIComponent(token)}`);

  return {
    platform: 'instagram',
    account: data.username,
    followers: data.followers_count ?? null,
    mediaCount: data.media_count ?? null,
    monetizationStatus: 'manual_review_required',
    note: THRESHOLDS.instagram.note,
  };
}

async function main() {
  const results = await Promise.all([
    getYouTubeStatus().catch(e => ({ platform: 'youtube', error: e.message })),
    getFacebookStatus().catch(e => ({ platform: 'facebook', error: e.message })),
    getInstagramStatus().catch(e => ({ platform: 'instagram', error: e.message })),
  ]);

  const report = { generatedAt: new Date().toISOString(), platforms: results };

  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log('📊 Monetization Status Report\n');
  for (const r of results) {
    console.log(r.error ? `❌ ${r.platform}: ${r.error}` : `✅ ${r.platform}:`);
    if (!r.error) console.log(JSON.stringify(r, null, 2));
  }
}

main();
