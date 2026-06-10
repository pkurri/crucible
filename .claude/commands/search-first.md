# search-first

Research-before-coding workflow for Crucible.

## Description

The search-first command initiates a research cycle. It forces the agent to look up documentation, check issues, and verify API signatures before writing a single line of code.

## Usage

```markdown
/search-first "implement stripe checkout with recurring billing"
```

## Features

- **📚 Doc Audit**: Automatically searches official documentation.
- **🔍 Issue Check**: Scans GitHub issues for known bugs in targeted libraries.
- **📝 Research Plan**: Generates a summary of findings before implementation.
- **🚧 Implementation Gate**: Blocks coding until research is validated.
