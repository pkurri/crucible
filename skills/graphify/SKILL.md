---
name: graphify
description: >
  Turn any folder of code, schemas, docs, and media into a queryable knowledge
  graph. Maps cross-module dependencies, extracted rationale, and surprising
  connections.
triggers:
  - 'map project'
  - 'knowledge graph'
  - 'visualize dependencies'
  - 'understand codebase'
  - 'graphify'
---

# Skill: Graphify

Convert your complex codebase into a queryable knowledge graph. Instead of
grepping through thousands of files, use the graph to navigate by concept,
rationale, and dependency.

## 🚀 Capabilities

- **Multi-Modal Mapping**: Indexes code, SQL schemas, docs, PDFs, images, and
  videos into one unified graph.
- **Rationale Extraction**: Automatically links `NOTE`, `WHY`, and `HACK`
  comments to the code they explain.
- **God-Node Detection**: Identifies the most-connected core concepts in your
  project.
- **Visual Exploration**: Generates an interactive HTML graph for browser-based
  navigation.
- **Graph-First Search**: Forces the assistant to read the graph report before
  performing file-based research.

## 🛠️ Usage

1.  **Build the Graph**:
    ```bash
    /graphify .
    ```
2.  **View Results**:
    - `graphify-out/graph.html`: Interactive visualization.
    - `graphify-out/GRAPH_REPORT.md`: Highlights and suggested questions.
    - `graphify-out/graph.json`: Machine-readable graph state.

## 📋 Installation

```bash
uv tool install graphifyy && graphify install
graphify antigravity install
```

## ⚙️ Recommended Skill Chain

- `search-first` (Phase 0) for initial requirement auditing.
- `archivist` for long-term technical debt and decision tracking.
- `gaming-studio` for mapping complex inter-departmental game systems.
