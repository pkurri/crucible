---
name: marketing-engine
description: >
  Bundled marketing intelligence engine with 41 specialized skills across 7 verticals:
  Conversion (CRO), Content & Copy, SEO & Discovery, Paid & Measurement, Growth & Retention,
  Sales & GTM, and Strategy. Provides expert-level frameworks for landing page optimization,
  copywriting, SEO auditing, email sequences, paid ads, churn prevention, pricing strategy,
  and more. All skills share a common product-marketing-context foundation.
license: 'MIT'
triggers:
  - "When the user needs help with any marketing task"
  - "When optimizing conversions, CRO, landing pages, or signup flows"
  - "When writing marketing copy, headlines, CTAs, or email sequences"
  - "When auditing SEO, site architecture, or schema markup"
  - "When planning paid ads, ad creative, or A/B tests"
  - "When building growth loops, referral programs, or reducing churn"
  - "When creating sales collateral, pitch decks, or launch strategies"
  - "When researching competitors, customers, or pricing"
  - "When the user mentions 'marketing', 'growth', 'conversion', 'SEO', 'copy'"
metadata:
  version: 1.0.0
  upstream: https://github.com/coreyhaines31/marketingskills
  upstream_version: 2.0
---

# Marketing Engine

Comprehensive marketing intelligence for AI agents. 41 specialized skills organized into 7 verticals, each with deep reference materials, frameworks, templates, and best practices.

## Foundation: Product Marketing Context

**Before using ANY marketing skill**, check for the product context file:

1. Read `.agents/product-marketing-context.md` (primary location)
2. Fallback: `.claude/product-marketing-context.md`
3. If neither exists, run `/marketing-context` to create one first

This context captures your product, audience, positioning, competitors, and brand voice — every other skill reads it to avoid redundant questions.

**Full setup guide:** [references/foundation/product-marketing-context.md](references/foundation/product-marketing-context.md)

---

## Skill Router

Use this routing table to dispatch to the right skill based on user intent:

### 🎯 Conversion Optimization (CRO)

| Command | Skill | Use When |
|---------|-------|----------|
| `/page-cro` | Page CRO | Optimizing any marketing page for conversions |
| `/signup-cro` | Signup Flow CRO | Improving registration/trial activation flows |
| `/onboarding-cro` | Onboarding CRO | Post-signup activation and time-to-value |
| `/form-cro` | Form CRO | Lead capture forms, contact forms |
| `/popup-cro` | Popup CRO | Modals, overlays, slide-ins, banners |
| `/paywall-cro` | Paywall CRO | In-app upgrade screens, upsell modals |

**Reference files:** `references/conversion/`

### ✍️ Content & Copy

| Command | Skill | Use When |
|---------|-------|----------|
| `/copywriting` | Copywriting | Writing marketing page copy from scratch |
| `/copy-edit` | Copy Editing | Polishing or improving existing copy |
| `/cold-email` | Cold Email | B2B cold outreach emails and sequences |
| `/email-seq` | Email Sequence | Automated email flows (welcome, onboarding, etc.) |
| `/social` | Social Content | Social media content strategy and creation |
| `/image` | Image | AI image generation and optimization |
| `/video` | Video | AI video creation and programmatic video |

**Reference files:** `references/content/`

### 🔍 SEO & Discovery

| Command | Skill | Use When |
|---------|-------|----------|
| `/seo-audit` | SEO Audit | Technical and on-page SEO diagnosis |
| `/ai-seo` | AI SEO | Optimizing for AI search (AEO, GEO, LLMO) |
| `/pseo` | Programmatic SEO | Creating SEO pages at scale with templates |
| `/site-arch` | Site Architecture | URL structure, navigation, page hierarchy |
| `/comp-alt` | Competitor Alternatives | Comparison and alternative pages |
| `/schema` | Schema Markup | JSON-LD structured data |
| `/content-strat` | Content Strategy | Content planning and editorial calendar |
| `/aso` | ASO Audit | App Store / Google Play listing optimization |
| `/directories` | Directory Submissions | Product directory listings and submissions |

**Reference files:** `references/seo/`

### 💰 Paid & Measurement

| Command | Skill | Use When |
|---------|-------|----------|
| `/paid-ads` | Paid Ads | Google, Meta, LinkedIn ad campaigns |
| `/ad-creative` | Ad Creative | Bulk ad copy generation and iteration |
| `/ab-test` | A/B Test Setup | Experiment design and hypothesis testing |
| `/analytics` | Analytics Tracking | GA4, GTM, event tracking setup |

**Reference files:** `references/paid/`

### 🚀 Growth & Retention

| Command | Skill | Use When |
|---------|-------|----------|
| `/churn` | Churn Prevention | Cancel flows, save offers, dunning, payment recovery |
| `/referral` | Referral Program | Referral and affiliate program design |
| `/free-tool` | Free Tool Strategy | Marketing tools and calculators for lead gen |
| `/community` | Community Marketing | Building communities for product growth |
| `/co-mktg` | Co-Marketing | Partner identification and joint campaigns |
| `/lead-magnet` | Lead Magnets | Content for email capture and lead gen |

**Reference files:** `references/growth/`

### 🤝 Sales & GTM

| Command | Skill | Use When |
|---------|-------|----------|
| `/revops` | RevOps | Lead lifecycle, scoring, routing, pipeline |
| `/sales-enable` | Sales Enablement | Decks, one-pagers, objection docs, demo scripts |
| `/launch` | Launch Strategy | Product launches, feature announcements |
| `/pricing` | Pricing Strategy | Pricing, packaging, monetization |
| `/comp-profile` | Competitor Profiling | Deep competitor research and analysis |

**Reference files:** `references/sales/`

### 🧠 Strategy & Intelligence

| Command | Skill | Use When |
|---------|-------|----------|
| `/mktg-ideas` | Marketing Ideas | 140+ SaaS marketing tactics and inspiration |
| `/mktg-psych` | Marketing Psychology | Behavioral science and mental models |
| `/cust-research` | Customer Research | Voice-of-customer analysis and synthesis |

**Reference files:** `references/strategy/`

---

## Cross-Skill Dependencies

Skills reference each other and build on shared context:

```
                    ┌────────────────────────────┐
                    │  product-marketing-context  │
                    │   (read by ALL skills)      │
                    └─────────────┬──────────────┘
                                  │
    ┌──────────┬──────────┬───────┼───────┬──────────┬──────────┐
    ▼          ▼          ▼       ▼       ▼          ▼          ▼
 CRO       Content     SEO     Paid   Growth     Sales    Strategy
(6 skills) (7 skills) (9 skills)(4)  (6 skills) (5 skills) (3 skills)
```

**Common chains:**
- `copywriting` ↔ `page-cro` ↔ `ab-test-setup`
- `revops` ↔ `sales-enablement` ↔ `cold-email`
- `seo-audit` ↔ `schema-markup` ↔ `ai-seo`
- `customer-research` → `copywriting`, `page-cro`, `competitor-alternatives`
- `pricing-strategy` → `paywall-upgrade-cro` → `churn-prevention`

---

## How to Use

### Quick Start
```
"Help me optimize this landing page"        → Routes to page-cro
"Write homepage copy for my SaaS"           → Routes to copywriting
"Set up GA4 tracking for signups"           → Routes to analytics-tracking
"Create a 5-email welcome sequence"         → Routes to email-sequence
"Why am I not ranking on Google?"           → Routes to seo-audit
"Plan a Product Hunt launch"               → Routes to launch-strategy
"Our churn rate is too high"               → Routes to churn-prevention
```

### Direct Invocation
Use any command from the routing table above:
```
/page-cro
/copywriting
/seo-audit
/pricing
```

### Multi-Skill Workflows
For complex tasks, chain skills together:
1. `/cust-research` → Understand audience language
2. `/copywriting` → Write page copy using customer language
3. `/page-cro` → Optimize conversion layout
4. `/ab-test` → Test variations
5. `/analytics` → Track results

---

## Reference Library

All reference materials are organized by vertical under `references/`:

| Vertical | Key References |
|----------|----------------|
| `conversion/` | CRO experiments, paywall patterns |
| `content/` | Copy frameworks, email templates, social post templates, video prompting |
| `seo/` | International SEO, AI writing detection, schema examples, site templates |
| `paid/` | Platform setup checklists, audience targeting, ad copy templates, sample sizes |
| `growth/` | Cancel flow patterns, dunning playbooks, referral program examples, tool types |
| `sales/` | Deck frameworks, demo scripts, objection libraries, lifecycle definitions |
| `strategy/` | 140+ marketing ideas by category, customer research source guides |
| `foundation/` | Product marketing context setup guide |

---

## Integration Points

- Works with `review-seo-audit` for automated SEO review
- Works with `tool-programmatic-seo` for scaled page generation
- Works with `tool-schema-markup` for structured data
- Works with `web-app-builder` for implementing marketing pages
- Works with `stripe` / `mcp-stripe` for pricing and billing implementation
