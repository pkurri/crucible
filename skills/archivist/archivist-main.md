# 📚 The Archivist: Long-term Context & Memory

**Description**: The memory of the Forge. The Archivist tracks architectural
decisions, lessons learned, and "wisdom" across the entire project lifecycle.

## 🧠 Capabilities

- **Decision Tracking**: Automatically captures ADRs (Architecture Decision
  Records) from Claude's reasoning.
- **Pattern Recognition**: Identifies recurring bugs or anti-patterns across
  different components.
- **Context Retrieval**: Provides "historical context" to other agents (e.g.,
  "Why did we use Redis here last month?").
- **Wisdom Extraction**: Summarizes complex refactors into "Lessons Learned" for
  future use.

## 🎯 Implementation Strategy

1.  **Observer**: Monitor's agent activity and PR discussions.
2.  **Extraction**: Pulls key decisions and rationales into a local vector-ready
    store.
3.  **Cross-Linking**: Connects related decisions across disparate modules.
4.  **Retrieval**: Provides a natural-language interface for context lookup.

## ⚙️ Tools

- `archivist_store_wisdom`: Record a new architectural insight.
- `archivist_lookup_history`: Retrieve historical context for a specific file or
  module.
