# Skill Authoring Guide

A skill is a SKILL.md file that teaches Claude how to handle a specific type of task.
This guide explains how to write skills that actually work.

---

## How Claude Loads Skills

When you ask Claude something, it:
1. Reads the `description` field of every available skill
2. Checks if any trigger phrases match your request
3. Loads the full SKILL.md of relevant skills
4. Uses that context to respond

**This means:** The `description` and `triggers` are the most important parts. If they're wrong, the skill never loads.

---

## Anatomy of a Skill

```markdown
---
name: skill-name
description: >
  What this skill does and when to use it.
  This is read by Claude to decide relevance.
  Be specific. Include the main use case.
triggers:
  - "phrase that activates this"
  - "another trigger phrase"
---

# Skill Title

Body content: instructions, patterns, code examples.
```

---

## Writing Good Descriptions

**Bad description:**
> "Helps with Neon database stuff."

**Good description:**
> "Deep knowledge of Neon Postgres: serverless connection pooling, database branching for dev/test/preview environments, Drizzle ORM integration, migrations, and Row Level Security patterns. Use whenever Neon is in the stack."

Good descriptions are:
- Specific about what the skill covers
- Explicit about when to use it
- Long enough to be useful, short enough to scan

---

## Writing Good Triggers

Triggers are phrases Claude looks for in your message. Include:
- The service/tool name: `"neon"`, `"stripe"`, `"cloudflare"`
- Task-oriented phrases: `"send email"`, `"subscription"`, `"database branch"`
- Problem descriptions: `"before I refactor"`, `"will this scale"`

---

## Skill Body Best Practices

### Always include:
- **Setup section** — install commands, environment variables
- **Core patterns** — the 2-3 things people do 80% of the time
- **Output format** — what the skill's response should look like
- **Working code** — tested, copy-pasteable examples

### Never include:
- Vague guidance ("make sure to handle errors")
- Opinions without explanation
- Untested code
- Docs summaries (link to docs instead)

---

## Testing Your Skill

1. Install it to `~/.claude/skills/`
2. Open Claude Code in a project that would use this skill
3. Ask something that should trigger it
4. Verify Claude uses the skill's patterns correctly
5. Try edge cases and failure modes

A skill is done when you can't improve Claude's output by adding more to it.
