---
description:
  AI-native SDLC playbook (intent → design → build → test → deploy → maintain)
  for any new or existing repo.
---

# AI-native SDLC

Runs Anthropic Academy's AI-native SDLC playbook on any repo. Intent lives in
version-controlled files (`INTENT.md` and `docs/intents/`) instead of in chat.
Full detail is in `skills/workflow-ai-native-sdlc/SKILL.md`. The runnable script
is `skills/workflow-ai-native-sdlc/ai-native-sdlc.workflow.js`, which
`install-claude-skills.sh` installs as the `ai-native-sdlc` workflow.

## Mode: audit (read-only)

1. Score the repo for each stage (plan, design, build, test, deploy, maintain).
   Each item gets pass, partial or missing, with evidence.
2. Return the 3 to 5 fixes with the most leverage.

## Mode: bootstrap

1. **Recon:** four parallel readers cover commands and verification,
   architecture, product intent from docs and git history, and risks and gates.
2. **Write:** create or merge `INTENT.md`, `CLAUDE.md` and `docs/intents/`. Keep
   every line that is still true, and list each correction. For a new repo,
   write from `idea`.
3. **Check:** an adversarial pass verifies every claim against the repo, then a
   fix pass. Nothing is committed.

## Mode: feature

1. **Intent:** write `docs/intents/<date>-<slug>.md`. Stop on any conflict with
   an INTENT.md non-negotiable.
2. **Design:** a plan with the alternative it rejected. **Stops here for human
   approval.**
3. **Build:** with `intentPath`, implement on `intent/<slug>` and commit
   locally.
4. **Test:** run the Done-when checks for real, with up to two fix rounds.
5. **Review:** correctness, security, and intent and scope, in parallel. Fix the
   high and medium findings.
6. **Ship:** only with `openPr`: push the branch and open a PR. Never merge.

## Mode: maintain

1. Investigate a production signal (a metric, incident or user report),
   separating evidence from guesses.
2. Write a draft feature intent, and feed it back into feature mode.
