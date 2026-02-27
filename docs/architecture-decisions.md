# Architecture Decisions

Key decisions made in Crucible's design.

---

## ADR-001: Skill File Format

**Decision:** Use YAML frontmatter + Markdown body for skill files.

**Rationale:** 
- YAML frontmatter is machine-readable for tooling (CI validation, registries)
- Markdown body is human-readable and renders nicely on GitHub
- Compatible with Claude Code's existing skill format expectations

**Alternatives considered:**
- JSON files: less readable, harder to include multiline code examples
- Plain markdown: no structured metadata, harder to parse programmatically

---

## ADR-002: Skill Naming Convention

**Decision:** Use prefixed naming (`workflow-`, `tool-`, `review-`, `<service>`).

**Rationale:**
- Prefixes convey intent at a glance
- Makes auto-triggering logic predictable
- Allows grouping in directory listings
- `workflow-` skills naturally load first (orchestration before execution)

---

## ADR-003: Template Structure

**Decision:** Templates are numbered (`001-ai-saas-core`) and opinionated.

**Rationale:**
- Numbering implies a recommended starting order
- Opinionated templates are more useful than "choose your own adventure" starters
- Real architectural decisions made upfront saves users hours of research

---

## ADR-004: No Template Generators

**Decision:** Templates are static file trees, not generators (no `create-crucible-app`).

**Rationale:**
- Generators add maintenance burden
- Static files are inspectable and understandable
- Claude Code can scaffold from templates without a generator
- Less moving parts = fewer things to break

