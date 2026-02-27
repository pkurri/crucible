# Contributing to Crucible

Thank you for making Crucible better. Here's how.

## The Bar for Inclusion

Every skill or template must answer yes to:

> *"Would this save an experienced engineer 30+ minutes on a real project?"*

No theoretical skills. No documentation summaries. Only battle-tested patterns.

---

## Adding a Skill

### 1. Pick the right prefix

| Prefix | When Claude loads it |
|---|---|
| `workflow-` | When asked to build, ship, or orchestrate |
| `tool-` | When a specific diagnostic is needed |
| `review-` | During code review or pre-ship audit |
| `<service>` | When the service is detected or mentioned |

### 2. Create the skill directory

```bash
mkdir skills/your-skill-name
touch skills/your-skill-name/SKILL.md
```

### 3. Write the SKILL.md

Every skill must have:

```yaml
---
name: skill-name
description: >
  One concise paragraph. This is what Claude reads to decide if it's relevant.
  Include what it does and when to use it.
triggers:
  - "keyword or phrase that activates this skill"
  - "another trigger"
---
```

Then the body: concrete, copy-pasteable patterns. No vague guidance.

### 4. Self-review checklist

- [ ] Does the frontmatter description clearly state what the skill does?
- [ ] Are there 3+ trigger phrases?
- [ ] Is all code tested and working?
- [ ] Is there an output format section?
- [ ] Are there no opinions without explanation?

---

## Adding a Template

Templates must:
- Be runnable with `pnpm install && pnpm dev` after setting `.env.local`
- Include `.env.example` with all required variables and placeholder values
- Include a `README.md` explaining the stack and structure
- Make real architectural decisions, not leave them for the user

---

## PR Process

1. Fork → feature branch → PR to `main`
2. Title format: `skill: add neon` or `template: add event-pipeline`
3. Describe what problem this solves and why it meets the bar

---

## What We Don't Want

- Skills that just summarize docs (link to docs instead)
- Templates that are "hello world" with a services logo
- Anything that requires manual steps beyond `.env.local` setup
- Untested code
