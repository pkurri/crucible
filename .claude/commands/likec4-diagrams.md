---
name: likec4-diagrams
description:
  "Author and maintain LikeC4 architecture-as-code diagrams (AOD — Architecture
  Overview Diagrams, this repo's convention for the
  context/container/component/deployment view set LikeC4 renders) using the
  LikeC4 DSL, CLI, and MCP server. Covers project setup, the
  specification/model/views blocks, live preview, validation, and exporting to
  PNG/SVG/JSON/Mermaid/D2/PlantUML/draw.io. Triggers: architecture diagram, C4
  diagram, AOD, likec4, system diagram, container diagram."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
triggers:
  - 'When creating or updating an architecture diagram (AOD)'
  - 'When the user mentions likec4, C4 model, or system/container diagrams'
  - 'When this skill is referenced by another agent or workflow'
---

# LikeC4 Architecture Diagrams (AOD)

[LikeC4](https://likec4.dev) is "Architecture as Code": a DSL + CLI/VS Code
extension/live preview for defining a C4-style architecture model once and
rendering it into always-current diagrams, instead of hand-drawn images that
drift from reality.

> **AOD** = **A**rchitecture **O**verview **D**iagram(s) — this repo's name for
> the diagram set a LikeC4 project produces (context, container, component,
> and/or deployment views). LikeC4 itself doesn't use this term; it's the label
> adopted here so skill/agent/workflow names stay consistent.

Defer to the official `likec4-dsl` skill (see Setup below) for exhaustive DSL
syntax — this skill covers repo conventions, the CLI/MCP workflow, and how an
AOD gets produced and kept in sync here.

## Setup (once per repo)

1. **Install the CLI**: `npm install -D likec4` (or `pnpm add -D likec4` /
   `yarn add -D likec4`).
2. **Install the official DSL reference skill** so syntax guidance stays
   accurate without duplicating it here:

   ```bash
   npx skills add https://likec4.dev/
   ```

3. **Register the MCP server** so agents can query the model instead of grepping
   `.c4` files by hand:

   ```bash
   claude mcp add likec4 -- npx -y @likec4/mcp
   ```

   Exposes: `list-projects`, `read-project-summary`, `search-element`,
   `read-element`, `read-deployment`, `read-view`, `find-relationships`,
   `query-graph`. Prefer these tools over manual file reads once registered.

## File Layout Convention

The CLI recursively discovers any `*.c4`/`*.likec4` files, so layout is a
convention, not a hard requirement. This repo uses:

```text
architecture/
  specification.c4   # element kinds, relationship kinds, tags
  model.c4            # elements + relationships
  views.c4             # views: context / container / component / deployment
```

## DSL Orientation

- `specification { ... }` — declares element kinds (e.g. `actor`, `system`,
  `container`, `component`), relationship kinds, and tags.
- `model { ... }` — declares elements and relationships using the kinds declared
  in `specification`.
- `views { ... }` — declares views (`view index`, `view of <element>`,
  deployment views), `include`/`exclude` predicates, layout hints, styling.

## Common Commands

| Command                              | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| `likec4 start` / `dev`               | Live-reload preview server                     |
| `likec4 build -o ./dist`             | Static site build for hosting                  |
| `likec4 export png\|jpg -o ./assets` | Screenshot views (Puppeteer)                   |
| `likec4 export json -o dump.json`    | Full model dump                                |
| `likec4 export drawio -o ./diagrams` | draw.io export                                 |
| `likec4 gen mmd\|dot\|d2\|plantuml`  | Generate Mermaid/Graphviz/D2/PlantUML          |
| `likec4 validate`                    | Syntax + layout check, exits non-zero on error |
| `likec4 format [--check]`            | Format `.c4` files (CI-friendly check mode)    |
| `likec4 mcp [--http]`                | Run the MCP server (stdio by default)          |

## Workflow for Producing an AOD Here

1. Query the model before editing — `read-project-summary` / `search-element`
   via MCP (or `likec4 export json` if MCP isn't registered) — to avoid
   re-declaring elements that already exist.
2. Edit `architecture/model.c4` to add/update elements and relationships.
3. Edit `architecture/views.c4` to add or adjust the view(s) covering the
   change.
4. `npx likec4 validate` — must exit `0` before continuing.
5. `npx likec4 start` for live preview while iterating.
6. Export final diagrams: `npx likec4 export svg -o docs/architecture/` (or
   `png`/`json` as needed).
7. Embed the exported diagram in the relevant README/doc with a relative link,
   noting the source view name so it can be regenerated.

## Verification

- `likec4 validate` exits `0`.
- Exported files exist under `docs/architecture/`.
- If MCP is registered, `read-view` on the changed view returns nodes/edges
  matching intent.

## Companion Resources

- Agent: [likec4-architect](../../agents/likec4-architect.md) — reviews model
  changes for drift against actual code structure.
- Workflow: `/workflow-likec4-aod-pipeline` — intake → model → render → review →
  publish pipeline.
- Official DSL reference: `npx skills add https://likec4.dev/`.
