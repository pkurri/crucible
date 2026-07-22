# Monetization Strategy

This document replaces the dead link in `README.md` ("Deep dive into the
tiered Pro model") and reflects the real, measured state of every
monetization surface in this repo as of this audit — not aspirational
numbers. Re-run `node scripts/monetization-status-report.mjs` (or check
`data/monetization-status.json`, refreshed daily by
`.github/workflows/monetization-status.yml`) before making decisions off of
this doc; the audience numbers below will move.

## The one proven revenue mechanism: Crucible Pro (Stripe)

`templates/006-crucible-web` has real, working Stripe billing —
`src/app/api/checkout`, `src/app/api/webhook`, and `data/pricing.json`:

| Tier | Price | Target |
| - | - | - |
| Starter | $49/mo | Small teams |
| Pro | $99/mo | Growing teams |
| Enterprise | Custom | Large orgs |

This is the only monetization surface in the repo that is not gated behind a
platform eligibility threshold. Every other channel below should be
evaluated first on how well it drives signups here, not on native ad
revenue it can't yet earn.

## Reality check: native platform ad revenue is not close

| Platform | Real measured state (this audit) | Native monetization gate |
| - | - | - |
| YouTube | Channel "AAK-tion!": 0 subscribers, 50 total views, 39 videos uploaded | YPP: 1,000 subs + 4,000 public watch hours/12mo, or the Shorts-specific track |
| Facebook | Uploads succeeding; follower count not yet pulled (populates via the new daily report) | In-stream ads: ~10,000 followers + sustained watch time, Meta Partner Monetization Policies |
| Instagram | Uploads succeeding; follower count not yet pulled | Reels bonuses / subscriptions: invite-only, no public self-serve threshold |
| Moltbook | Not an ad platform at all | N/A — see below |

39 YouTube videos producing 50 total views means the content isn't being
discovered — that's a distribution problem, not a monetization-plumbing
problem. Wiring up ad revenue APIs earlier than this would have tracked a
number that stays at zero regardless of what the code does. Fix discovery
before fixing tracking.

## Strategy: sequence, don't parallelize

### Phase 1 — Done this audit

- Fixed the YouTube upload pipeline (dead OAuth token was blocking all
  uploads).
- Fixed a content-pipeline bug that silently dropped videos when the last
  image-fallback provider had a single transient failure.
- Replaced simulated/fabricated revenue numbers with real, API-sourced
  audience metrics (`scripts/monetization-status-report.mjs`).
- Fixed a spam-risk pattern in the live Moltbook automation (all 6 brand
  identities were posting into one submolt and self-pinning every post).

### Phase 2 — Distribution, not monetization (do this next)

Native ad revenue on any of these platforms is bottlenecked on audience
size, not on code. Before building more monetization infrastructure:

- Diagnose why 39 uploaded YouTube videos produced 50 views: check
  title/thumbnail quality, whether content matches an actual search/browse
  demand, upload consistency, and whether the account shows any
  shadow-restriction signals.
- Do the same audit for Facebook/Instagram once the daily report has a few
  days of follower/reach data to show a trend, not a single snapshot.
- Treat "grow the audience" as the actual monetization work for the next
  phase — a 10x view-count improvement matters more than any code change to
  the upload pipeline at current audience size.

### Phase 3 — Cross-platform funnel to the proven revenue mechanism

Every platform's descriptions/bios/captions should carry a consistent
call-to-action pointing at the Crucible Pro checkout flow, since that's the
only monetization path here that isn't gated by a follower-count threshold.
Concretely: add a consistent CTA line to
`scripts/viral-script-architect.mjs`-generated descriptions and to the
Moltbook post-generation prompt in
`templates/006-crucible-web/src/app/api/moltbook/automation/route.ts`.

### Phase 4 — Native platform monetization, once eligible

Only worth revisiting once the daily report shows the channel/page is
actually near a platform's published threshold:

- YouTube: apply for YPP once past 1,000 subscribers, or track the
  Shorts-specific path if Shorts views are the growth driver.
- Facebook/Instagram: check Meta Business Suite directly — no API reliably
  exposes "are you enrolled," so this has to be a manual check once
  follower/reach numbers look close.

## Moltbook: growth channel, not a revenue channel

Moltbook has no ad program — its only monetization value is as a
distribution channel to an AI-agent-adjacent, technically literate
audience that's a plausible customer base for Crucible Pro. Now that the
spam-risk behavior is fixed (per-brand submolt routing, no auto-self-pin),
the next lever is content relevance per submolt and genuine
community engagement (replying to mentions/DMs, which the current
automation only partially does — see the code comments in
`automation/route.ts`), not posting volume.
