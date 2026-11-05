---
name: workflow-ai-native-sdlc
description: >
  Run the AI-native SDLC playbook (Plan as INTENT.md → Design → Build → Test →
  Deploy with review and hook gates → Maintain, where a metric becomes a new
  intent) on any new or existing repo. Use to audit a repo's readiness, to
  bootstrap or refresh INTENT.md and CLAUDE.md, to take one feature from request
  to reviewed branch, or to turn a production metric, incident or user report
  into a new feature intent. Triggers: "ai-native sdlc", "intent.md", "set up
  the playbook", "bootstrap claude.md", "feature from intent", "metric to
  intent".
triggers:
  - 'ai-native sdlc'
  - 'sdlc playbook'
  - 'create intent.md'
  - 'bootstrap claude.md'
  - 'feature from intent'
  - 'turn this metric into an intent'
---

# Workflow: AI-native SDLC

Source: Anthropic Academy, _AI-native SDLC playbook_
(<https://academy.claude.com/courses/ai-native-sdlc-playbook>).

The idea in one line: **intent is a version-controlled file, not a chat
message.**

- Every change starts from a short `INTENT.md` (or a feature intent) that says
  what is wanted, why, and under which constraints.
- Plan mode turns the intent into a design.
- Claude builds against a feedback loop it can run.
- Reviews and hooks gate the deploy.
- Production signals become new intents.

## Files

| File                          | What it is                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `ai-native-sdlc.workflow.js`  | The runnable workflow (Workflow tool, `name: "ai-native-sdlc"`). Installed as `~/.claude/workflows/ai-native-sdlc.js`.        |
| `templates/INTENT.md`         | Product-level intent: What, Why, Who, Non-negotiables, What exists today, Constraints, Success, Out of scope, Open decisions. |
| `templates/CLAUDE.md`         | Repo guide: commands, verification loop, invariants, how we work, where knowledge goes.                                       |
| `templates/feature-intent.md` | One feature: What, Why, Who, Constraints, Done when, Out of scope, Open questions, Design.                                    |
| `templates/hooks.md`          | Hooks as approval gates, with a tested guard-script recipe.                                                                   |

## Install

There are two ways to install it.

- **One engineer, every project.** From the Crucible root, run
  `bash install-claude-skills.sh`. It installs this folder to
  `~/.claude/skills/workflow-ai-native-sdlc/` and the script to
  `~/.claude/workflows/ai-native-sdlc.js`. Restart Claude Code afterwards.
- **A whole team, one repo (enterprise).** Commit both into the repo, so that
  everyone who clones it gets the same gates and templates. Pass `templates` as
  `.claude/skills/workflow-ai-native-sdlc/templates` in args.

  ```bash
  mkdir -p .claude/skills .claude/workflows
  cp -R <crucible>/skills/workflow-ai-native-sdlc .claude/skills/
  cp <crucible>/skills/workflow-ai-native-sdlc/ai-native-sdlc.workflow.js \
     .claude/workflows/ai-native-sdlc.js
  ```

  For organisation-wide rollout, run the installer from your developer-machine
  provisioning, or keep a template repo that new projects start from.

## Related Crucible skills

- [`intent-driven-development`](../intent-driven-development/SKILL.md): turns
  one ambiguous change into acceptance criteria. Use it inside the Intent stage
  when a request is unclear.
- [`workflow-feature-cycle`](../workflow-feature-cycle/SKILL.md): spec →
  implement → review → ship in a single session. This workflow is the same
  cycle, held in files, with an approval stop, real verification and a
  three-lens review.
- `review-architecture` and `review-security`: deeper single-lens reviews to run
  on the branch before the PR.

## Choosing a mode

| Situation                                        | Mode                     | What it writes                                                                      |
| ------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------- |
| "Is this repo set up for this?"                  | `audit`                  | Nothing. Returns a scorecard per stage and the top fixes.                           |
| New repo, only an idea                           | `bootstrap` + `idea`     | INTENT.md, CLAUDE.md, `docs/intents/TEMPLATE.md`. Not committed.                    |
| Existing repo, no INTENT.md or a stale CLAUDE.md | `bootstrap`              | The same files, merged with what exists and adversarially checked. Not committed.   |
| A change to make                                 | `feature` + `request`    | The intent and design, then **stops for approval**.                                 |
| An approved intent to build                      | `feature` + `intentPath` | A branch with commits, test results and a three-lens review. A PR only if `openPr`. |
| A metric, incident or user report                | `maintain` + `signal`    | A new draft feature intent, grounded in evidence.                                   |

## How to run it

Invoking this skill is the user's opt-in to the workflow. Call the Workflow tool
with `name: "ai-native-sdlc"`. Pass `args` as a JSON object, not a string.
Always pass `today` (YYYY-MM-DD from the environment's date), because scripts
can't read the clock.

```jsonc
// Audit
{ "mode": "audit", "repo": "/abs/path" }

// Bootstrap an existing repo
{ "mode": "bootstrap", "repo": "/abs/path", "today": "2026-11-05" }

// Bootstrap a new repo
{ "mode": "bootstrap", "repo": "/abs/path", "today": "2026-11-05",
  "idea": "Who it is for, what it does, why now, known constraints" }

// Feature, first pass: stops after Design for human approval
{ "mode": "feature", "repo": "/abs/path", "today": "2026-11-05",
  "request": "Let readers export their bookmarks as PDF" }

// Feature, second pass: build, test and review the approved intent
{ "mode": "feature", "repo": "/abs/path", "today": "2026-11-05",
  "intentPath": "docs/intents/2026-11-05-bookmark-export.md" }
// add "stopAfter": "ship", "openPr": true to also push and open the PR (never merges)

// Maintain
{ "mode": "maintain", "repo": "/abs/path", "today": "2026-11-05",
  "signal": "Checkout conversion fell from 4.1% to 2.3% since 2 Nov; Sentry shows 502s on /api/checkout" }
```

Before running, do these yourself, without spending agents on them:

- Resolve `repo` to an absolute path.
- Check it is a git repo. For a new project, run `git init` first.
- For `feature`, check the working tree is clean.

After the run, relay the result to the user:

- files written
- stale facts corrected
- open questions
- hook candidates
- test results
- review findings and how each was resolved
- the `next` step

Don't summarise a stage that didn't run.

## The loop, end to end

1. `bootstrap` once per repo. Review the diff, answer the Open decisions, and
   commit.
2. For each change, run `feature` with `request`. Read the intent and its
   Design. Set `status: approved`, or edit it.
3. Run `feature` with `intentPath`. You get a branch that has passed its checks
   and a review.
4. Merge through the repo's normal PR process. A human approves.
5. When production disagrees with the intent, run `maintain` with the signal.
   That gives a new intent, which goes back to step 2.
6. Re-run `audit` now and then. Re-run `bootstrap` when INTENT.md or CLAUDE.md
   has drifted from the code.

## Where knowledge goes (the playbook's rule)

- **CLAUDE.md:** short, always-true facts and rules for every session.
- **A skill:** a repeatable procedure with enough detail that it would bloat
  CLAUDE.md.
- **A hook:** a rule that must never depend on memory, such as a
  protected-branch push, a destructive database or infra command, or a secret
  written to disk. See `templates/hooks.md`.

If a session keeps "forgetting" a CLAUDE.md rule, the rule belongs in a hook.

## Guardrails the workflow enforces

- Agents cite evidence for every claim, and mark anything they couldn't check as
  "unverified". Unset targets stay "not set yet".
- Never: push to a protected branch, force-push, merge, deploy, seed or reset a
  shared database, add dependencies, or touch secrets.
- Bootstrap merges into an existing CLAUDE.md. It keeps every still-true line
  and lists each correction it makes.
- Feature mode stops on any conflict with an INTENT.md non-negotiable, and after
  Design unless an approved `intentPath` is given.
- Test runs the checks for real. It gets at most two fix rounds, then hands back
  to a human.
- Review covers correctness, security, and intent and scope. Only high and
  medium findings with a failure scenario get fixed.

## Without the Workflow tool

If workflows are unavailable, follow the same stages by hand in the session:

1. Read the repo, then fill the templates.
2. Use plan mode for the design.
3. Build on a branch.
4. Run the Done-when checks.
5. Review the diff for correctness, security, and intent and scope.

The templates and the guardrails above still apply.
