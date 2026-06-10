---
name: search-first
description: >
  Research-driven development workflow. Enforces documentation lookup,
  API reference auditing, and requirement clarification BEFORE any code
  is generated.
triggers:
  - 'research'
  - 'lookup'
  - 'how does X work'
  - 'API reference'
  - 'search first'
  - 'audit docs'
---

# Skill: Search-First

Stop guessing. Start searching. This skill enforces a research-before-coding
discipline to prevent implementation errors and technical debt.

## 🚀 The Research Pipeline

1.  **Search**: Query documentation, issues, and codebases for the target feature.
2.  **Audit**: Analyze findings for compatibility, security, and performance.
3.  **Plan**: Document the research findings in a `RESEARCH.md` or as a summary.
4.  **Execute**: Implement code based ONLY on the verified research findings.

## 🛠️ Tools

- `research_lookup`: Search external documentation, API references, and GitHub
  issues.
- `research_audit_deps`: Specifically audit a new dependency's documentation for
  security/performance warnings.
- `research_summarize`: Condense research findings into an actionable
  implementation plan.

## 🛑 The Quality Gate

You must NOT write code for a new feature until a research summary has been
presented to and confirmed by the user.

## ⚙️ Recommended Skill Chain

- `web-app-builder` for the implementation phase.
- `observer` to record the research journey for future session context.
