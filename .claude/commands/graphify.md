# graphify

Map your project into a queryable knowledge graph.

## Description

The /graphify command analyzes your entire workspace — including code, documentation, and media — to create a structural and conceptual map. It identifies "God nodes" (core components) and "Surprising connections" (unexpected cross-module dependencies).

## Usage

```markdown
/graphify .
```

## Features

- **🌐 Graph Build**: Generates an interactive `graph.html` for visual navigation.
- **📄 Report Generation**: Produces a `GRAPH_REPORT.md` summarizing architecture and design rationale.
- **🧩 Multi-modal**: Links SQL schemas, API docs, and video assets to their implementation code.
- **🔍 Navigational Hook**: Once installed, the assistant will check the graph before performing deep file searches.
