---
name: observer
description: >
  Persistent memory and session observation system. Automatically captures
  tool usage, generates semantic summaries, and provides token-efficient
  3-layer retrieval (Search -> Timeline -> Detail). Supports <private> tags
  for data protection.
triggers:
  - 'remember'
  - 'what did we do'
  - 'search history'
  - 'session history'
  - 'past observations'
  - 'private'
---

# Skill: Observer

The Observer seamlessly preserves context across sessions by capturing tool
usage, generating semantic summaries, and providing intelligent retrieval.

## 🧠 3-Layer Retrieval Pattern

To minimize token costs, use this progressive disclosure workflow:

1.  **Search**: Get a compact index of relevant observation IDs (~50-100 tokens).
2.  **Timeline**: Get chronological context around specific IDs to see what
    happened before/after.
3.  **Detail**: Fetch full observation details ONLY for the most relevant IDs
    (~500-1,000 tokens).

## 🔒 Privacy & Security

Use `<private>` tags in your thoughts or responses to exclude sensitive content
from the persistent index:

```markdown
<private>
The database password is: super-secret-123
</private>
```

Content inside these tags is captured for the current session but ignored by the
semantic summarizer and long-term storage.

## 🛠️ Tools

- `observer_search`: Search project history with natural language or filters.
- `observer_timeline`: Get context around a specific point in time or ID.
- `observer_get_details`: Retrieve full content for specific observation IDs.
- `observer_record`: Manually record a significant milestone or decision.

## ⚙️ Configuration

- `OBSERVER_STORAGE`: Path to SQLite/Vector storage (default: `.crucible/observer`).
- `OBSERVER_AUTO_RECORD`: Set to `true` to capture all tool outputs.
- `OBSERVER_SUMMARIZE_INTERVAL`: Frequency of semantic compression (default: 10 mins).
