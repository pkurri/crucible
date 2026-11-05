# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What this is

[Two or three sentences: the product, the stack, and the layout of the repo.]

**Read `INTENT.md` first.** It says what we are building, why, and the
non-negotiables. If a request conflicts with it, stop and say so. Don't quietly
trade a non-negotiable for scope.

## Commands

```bash
<install>
<dev server>
<build>
<typecheck / lint>
<tests>
```

<Commands that are dangerous, or that look right but are wrong. For example:
"`db:seed` clears tables. Never point it at a shared database.">

### Verification (your feedback loop)

<What proves a change works here: the test command, the CI checks, and checks
that apply only to some changes. If there is no test framework, say so and say
what stands in for it.>

Report what you ran and what it printed. Say "not verified" when you couldn't
run it.

## Architecture

<Only the invariants that a reader can't see from one file: where the source of
truth is, the one function every write must go through, the module that pages
may import. One short paragraph each.>

## How we work (plan → design → build → test → deploy → maintain)

- **Plan:** any non-trivial change starts from an intent: `INTENT.md` for the
  product, or `docs/intents/YYYY-MM-DD-<slug>.md` for a feature. If there isn't
  one, draft it and get it confirmed before building.
- **Design and build:** start in plan mode. Name the files and the
  non-negotiables that apply. Change only what was asked. Use subagents only for
  independent tracks.
- **Test:** close the loop with the verification above before saying something
  is done.
- **Deploy:** [branch → PR → which environment each merge reaches]. Never push
  straight to [protected branches].
- **Maintain:** when a production metric or a user report shows something wrong,
  write a feature intent for it. Don't patch blind.

**Where knowledge goes.**

- `CLAUDE.md`: short, always-true facts and rules for every session in this
  repo.
- A **skill** (`.claude/skills/`): a repeatable procedure with its own detail.
- A **hook** (`.claude/settings.json`): a rule that must never depend on memory.
- `docs/`: long-form background.

## Deployment

<The pipeline, the environments, and the traps (for example a deploy that
deletes untracked files, or env changes that need a reload).>
