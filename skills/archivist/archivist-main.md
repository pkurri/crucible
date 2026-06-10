# 📚 The Archivist: Long-term Context & Memory

**Description**: The memory of the Forge. The Archivist tracks architectural
decisions, lessons learned, and "wisdom" across the entire project lifecycle.

## 🧠 Capabilities

- **Decision Tracking**: Automatically captures ADRs (Architecture Decision Records) from agent reasoning and user confirmations.
- **Pattern Recognition**: Identifies recurring bugs, anti-patterns, or successful refactors across modules.
- **Context Retrieval**: Provides "historical context" for specific files or modules (e.g., "Why did we use Redis here?").
- **Wisdom Extraction**: Distills complex technical debt resolutions into "Lessons Learned" for the project knowledge base.
- **Dependency Evolution**: Tracks how system boundaries and interfaces have changed over time.

## 🎯 Implementation Strategy

1.  **Observer Integration**: Connects to the `observer` skill to feed on raw session data.
2.  **Semantic Distillation**: Uses AI to filter "noise" from sessions and extract high-value decisions.
3.  **ADR Generation**: Formats extracted decisions into standard Markdown ADRs in `docs/adr/`.
4.  **Cross-Linking**: Connects related decisions, issues, and code changes in a knowledge graph.
5.  **Retrieval API**: Provides a natural-language interface for "Project Wisdom" lookups.
6.  **Vector Embeddings**: Stores project history in a vector database for semantic search.

## ⚙️ Tools

- `archivist_store_wisdom`: Record a new architectural insight, lesson learned, or pattern.
- `archivist_lookup_history`: Retrieve historical context and decisions for a specific file, module, or feature.
  triggers:
  - 'When an agent needs historical context'
  - 'When searching past deployments or decisions'
  - 'When consolidating documentation'
  - 'ADR'
  - 'architectural decision'
  - 'lesson learned'
  - 'why did we'
- `archivist_generate_adr`: Formalize a recent decision into a persistent ADR file.
- `archivist_summarize_refactor`: Analyze a recent batch of changes and extract core architectural shifts.
- `archivist_search_graph`: Query the knowledge graph for related components and legacy decisions.
