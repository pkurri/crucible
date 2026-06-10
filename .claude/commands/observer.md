# observer

Persistent memory and session observation system for Crucible.

## Description

The Observer automatically captures everything the agent does during coding sessions, compresses it with AI, and injects relevant context back into future sessions. It follows a token-efficient 3-layer retrieval pattern to keep context windows lean while maintaining deep project knowledge.

## Features

- **🧠 Persistent Memory**: Context survives across sessions and restarts.
- **📊 Progressive Disclosure**: Layered memory retrieval (Search -> Timeline -> Detail).
- **🔒 Privacy Control**: Use `<private>` tags to exclude sensitive data from long-term storage.
- **🤖 Automatic Operation**: Captures tool observations and user intent without manual intervention.
- **🔗 Semantic Search**: Hybrid keyword + vector search for finding past decisions.

## Usage

### Searching Memory

```markdown
/observer search "how did we fix the auth bug last week"
```

### Viewing Timeline

```markdown
/observer timeline id=obs_123 range=5
```

### Protecting Secrets

```markdown
<private>
My API key is sk-12345
</private>
```

## Examples

### Case 1: Resuming Work
"What was the state of the database migration when we left off?"
The Observer retrieves the last 5 observations related to `migration` and `database`.

### Case 2: Historical Context
"Why did we choose Vitest over Jest?"
The Observer searches for `Vitest` and `decision` labels to find the ADR recorded in a previous session.
