---
name: continuous-learning-v2
description: >
  Instinct-based learning system that extracts patterns from sessions,
  assigns confidence scores, and evolves instincts into skills. Enables
  cross-project "wisdom" sharing.
triggers:
  - 'learn'
  - 'extract pattern'
  - 'instinct'
  - 'wisdom'
  - 'confidence score'
  - 'evolve'
---

# Skill: Continuous Learning v2

The Instinct-based learning system. Unlike static skills, instincts are
lightweight patterns extracted from real-world usage that evolve over time.

## 🧬 Instinct Lifecycle

1.  **Capture**: Extract a pattern from a successful tool execution or refactor.
2.  **Evaluate**: Assign a confidence score based on recurrence and success.
3.  **Refine**: Update instincts with new edge cases from subsequent sessions.
4.  **Evolve**: When confidence is high (>0.9), cluster instincts into a formal
    `.crucible/skills/` definition.

## 🛠️ Tools

- `instinct_status`: Show all learned instincts with their current confidence
  scores.
- `instinct_import`: Import an instinct collection (`.jsonl`) from another
  project or team member.
- `instinct_export`: Export current high-confidence instincts for sharing.
- `instinct_evolve`: Cluster related instincts and propose a new Crucible skill.

## 📂 Storage

Instincts are stored in `.crucible/instincts/` as `patterns.jsonl`:

```json
{"id": "inst_001", "pattern": "Vitest for API routes", "confidence": 0.95, "last_updated": "2026-05-09"}
```

## ⚙️ Recommended Skill Chain

- `observer` to provide the raw session data for extraction.
- `archivist` to store the distilled "wisdom" in the project knowledge graph.
