---
description: Mandatory structured prompting workflow for every user request
---

# Structured Prompting — Global Rule

For EVERY user request (unless it is a simple confirmation like "yes",
"continue", or a trivial greeting), you MUST strictly follow this 2-step
process.

## Step 1: Draft Structured Prompt

Do NOT start coding immediately. First, analyze the user's raw request and draft
a **Structured Prompt** using the schema below. Present this draft to the user
for confirmation.

**Schema:**

```markdown
# **Role:**

[Define the persona, e.g., "Senior React Dev"]

# **Objective:**

[One clear sentence stating the goal]

# **Context:**

[Background information, file paths, current state]

# **Instructions:**

## **Instruction 1:** [Step Name]

[Details]

## **Instruction 2:** [Step Name]

[Details] ...
```

## Step 2: Execute

Only AFTER the user confirms or provides ready-to-use structured input, proceed
with the actual tool calls and coding.

## Exception

If the user explicitly provides a prompt that ALREADY follows the schema above
(starts with `# **Role:**`), you may skip Step 1 and execute immediately.
