---
name: legal-skills
description:
  "Directory and install guide for legal-domain Claude skills: Anthropic's
  official claude-for-legal plugin (11 practice areas — AI governance,
  commercial contracts, corporate/M&A, employment, IP, litigation, privacy,
  product, regulatory, law student, legal clinic), Skala's startup/VC legal
  pack, and community-authored contract/NDA review skills. Points to real
  install commands rather than bundling copied content, since claude-for-legal
  is a cohesive plugin with cross-skill state dependencies that only work when
  installed properly, and community skills need a license check before use in a
  commercial context. Triggers: legal skill, contract review, NDA review, legal
  compliance, litigation support, employment law, IP/patent, privacy/GDPR,
  corporate legal, startup legal, bar prep."
allowed-tools:
  - Read
  - Bash
  - WebFetch
triggers:
  - 'When a legal-domain task needs a specialized skill (contract, NDA, IP,
    employment, privacy, litigation, corporate, compliance)'
  - 'When the user mentions legal skills, claude-for-legal, or asks what legal
    tooling is available'
  - 'When this skill is referenced by another agent or workflow'
---

# Legal Skills Directory

This is a directory and install guide, not a bundle of copied skill files.
Legal-domain Claude skills live in three places with very different shapes —
install the one that matches the task rather than expecting this repo to carry a
flattened copy of all of them.

## Why not just copy them in

Anthropic's `claude-for-legal` is a cohesive **plugin**, not a set of
independent files: its skills invoke each other via slash commands (e.g.
`/ai-governance-legal:policy-starter` → `/ai-governance-legal:vendor-ai-review`)
and share a per-practice-area state file the plugin installer sets up at
`~/.claude/plugins/config/claude-for-legal/<practice-area>/CLAUDE.md`, populated
by each practice area's own `cold-start-interview` skill. Copying individual
skill files out of it into this repo's flat `skills/` directory would break
every cross-reference and leave skills reading config that was never populated.
Install the real plugin instead.

The ~30 individually-authored community skills below (surfaced via
[HAQQ's legal skills directory](https://www.haqq.ai/best-legal-skills)) come
from independent repos with their own licenses — several have no explicit
license file at all. Vet a given repo's license before pulling its content into
anything you redistribute; this directory only links to them, it doesn't copy
them.

## Anthropic — `claude-for-legal` (Apache License 2.0)

```bash
claude plugin install claude-for-legal@anthropics
```

Repo:
[anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal).
11 practice areas, each with its own `cold-start-interview` onboarding skill
that configures the plugin to your actual practice before other skills in that
area run:

| Practice area         | Covers                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ai-governance-legal` | AI inventory, use-case triage, AIA generation, vendor AI review, regulatory gap analysis, AI policy drafting/monitoring, matter workspaces                    |
| `commercial-legal`    | Vendor/NDA/SaaS-MSA review, amendment history, renewal tracking, escalation routing, stakeholder summaries                                                    |
| `corporate-legal`     | Diligence extraction, material contract schedules, closing checklists, written consents, entity compliance, M&A integration, board minutes                    |
| `employment-legal`    | Wage/hour Q&A, hiring & termination review, worker classification, policy drafting, leave tracking, internal investigations, international expansion          |
| `ip-legal`            | Trademark clearance, FTO triage, invention intake, cease-and-desist, takedowns, infringement triage, IP clause review, OSS compliance, portfolio tracking     |
| `law-student`         | Socratic drilling, case briefs, outlines, IRAC practice, legal writing feedback, cold-call prep, bar prep questions, flashcards, exam forecasting             |
| `legal-clinic`        | Client intake, comms logs, research, memos/drafts, client letters, case status/deadlines, supervisor review queues, semester handoff                          |
| `litigation-legal`    | Matter intake/briefing/close, demand letters, subpoena triage, legal holds, claim charts, chronologies, deposition prep, privilege log review, brief drafting |
| `privacy-legal`       | Use-case triage, PIA/DPIA generation, DPA review, DSAR response, regulatory gap analysis, policy monitoring                                                   |
| `product-legal`       | Launch review, marketing claims review, feature risk assessment                                                                                               |
| `regulatory-legal`    | Regulatory feed watching, policy diffing, gap surfacing, policy redrafting, comment tracking                                                                  |

## Skala — startup/VC legal pack (Apache License 2.0)

```bash
npx skills add skala-io/legal-skills
```

Repo: [skala-io/legal-skills](https://github.com/skala-io/legal-skills). Targets
startup founders, investors, and their counsel: `jurisdiction-advisor`,
`term-sheet-review`, `safe-review`, `saft-review`, `reg-s-offering`,
`startup-due-diligence`, `open-source-license`, `client-alert-drafting`.

## Community skills (check the license before use)

Discovered via
[HAQQ's legal skills directory](https://www.haqq.ai/best-legal-skills?category=domain),
which aggregates 100+ independently authored legal skills. Two with confirmed
public repos:

- [zubair-trabzada/ai-legal-claude](https://github.com/zubair-trabzada/ai-legal-claude)
  — contract review, risk analysis, plain-English translation, agreement
  generation, orchestrated under a "Legal" main skill.
- [evolsb/claude-legal-skill](https://github.com/evolsb/claude-legal-skill) —
  general contract/NDA review.

For the rest (jurisdiction-specific tools — French labor law, Icelandic company
formation, Connecticut divorce planning, GDPR/EU AI Act specialists, and more),
browse HAQQ's directory directly and check each repo's license before installing
it into a commercial or redistributed context.

## Which one to reach for

- In-house legal team or law firm operations → `claude-for-legal`, matching
  practice area.
- Startup/VC-stage legal (term sheets, SAFEs, incorporation) → Skala.
- One-off contract/NDA review with no ongoing practice setup → a community
  contract-review skill, after a license check.
- Bar prep or law school study → `claude-for-legal`'s `law-student` practice
  area.

## Verification

- `claude plugin list` shows `claude-for-legal` installed.
- Invoking a practice-area skill (e.g.
  `/ai-governance-legal:cold-start-interview`) runs without missing-config
  errors.

## Source Attribution

Directory compiled from
[HAQQ's legal skills listing](https://www.haqq.ai/best-legal-skills?category=domain),
[anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal)
(Apache License 2.0), and
[skala-io/legal-skills](https://github.com/skala-io/legal-skills) (Apache
License 2.0).
