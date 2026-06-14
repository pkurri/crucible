# token-status

Check token efficiency and cost-saving metrics.

## Description

The /token-status command provides a diagnostic report on current token usage and the effectiveness of cost-saving protocols (Caching hit rate, Routing logic, and Batching opportunities).

## Usage

```markdown
/token-status
```

## Features

- **📉 Efficiency Audit**: Analyzes current context window usage and identifies "prompt bloat."
- **⚡ Caching Insight**: Identifies blocks of static context that should be marked for Prompt Caching.
- **🛣️ Routing Recommendation**: Suggests if the current task should be down-routed to a cheaper model (e.g., Haiku).
- **📦 Batching Check**: Scans for pending large-scale tasks that can be moved to the Message Batches API (50% discount).
