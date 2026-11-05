# INTENT — [Project name]

What we want, why, and the constraints it must hold under. This is the
product-level intent. Every feature starts from a feature intent
(`docs/intents/`) that must not contradict this file. If a change does
contradict it, change this file first, in its own PR.

_Last brought up to date: [YYYY-MM-DD], from <the code / merged PRs through #N /
the founding idea>._

## What

<One paragraph: what the product is, in the user's terms. Then the surfaces it
ships as, one bullet each, with the path that implements it.>

## Why

<The problem, who has it, and why the existing alternatives fail them. One
paragraph. No feature list.>

## Who

- **[User type]:** <who they are, and constraints such as age, language or
  device>.
- **[Operator or editor type]:** <what they do, and how their rights are
  checked>.

## Non-negotiables

These win over speed, scope and convenience. Breaking one is a bug, even if the
feature works. Each one names the code or document that enforces it.

1. **[Rule in one line].** <How it is enforced: `path/to/file`, gate, CI check.>
2. ...

## What exists today, and the intent behind it

<For an existing project: one sub-section per capability. Say what it is, why it
is built that way, and the decisions now locked in. Point to the code. Leave out
changelog detail. For a new project: "Nothing yet." plus the first milestone.>

### [Capability]

- ...

## Constraints

- **Architecture:** [invariants that every change must keep].
- **Team and cost:** [size, budget, hosting limits].

## What success looks like

- [Outcome, observable from production or from a check.]

Targets with numbers: [set them, or say "not set yet" and who decides].

## Out of scope

- [What the product deliberately does not do.]

## Open decisions

- **[Decision]:** [who decides it, and what it blocks].
