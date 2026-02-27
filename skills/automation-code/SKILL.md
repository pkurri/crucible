---
name: automation-code
description: >
  Best practices for shell scripting, CI/CD pipelines, and task automation.
  Covers safety-first bash patterns, idempotency, Python automation, and CI ordering.
  Use when writing shell scripts, GitHub Actions, or any automation logic.
triggers:
  - "shell script"
  - "bash script"
  - "automate"
  - "ci/cd"
  - "pipeline"
  - "github actions"
  - "automation"
---

# Skill: Automation Code

Safe, idempotent, reliable automation scripts.

---

## Shell Scripting Rules

### 1. Safety First — Always Start With

```bash
#!/bin/bash
set -e          # Exit immediately on error
set -o pipefail # Catch errors in pipes
set -u          # Treat unset variables as errors
```

### 2. Idempotency — Safe to Run Multiple Times

```bash
# Bad — fails if dir exists
mkdir dir

# Good — succeeds if dir exists
mkdir -p dir

# Bad — fails if file exists
cp file dest

# Good — overwrites safely
cp -f file dest

# Bad — fails if user exists
useradd myuser

# Good — only adds if not present
id myuser &>/dev/null || useradd myuser
```

### 3. User Feedback with Color

```bash
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}✅ Success!${NC}"
echo -e "${RED}❌ Failed!${NC}"
echo -e "${YELLOW}⚠️  Warning${NC}"
```

### 4. Error Handling

```bash
# Trap errors with context
trap 'echo "❌ Error on line $LINENO. Exit code: $?"' ERR

# Cleanup on exit
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT
```

### 5. Secrets — Never Print

```bash
# Bad — leaks secret to logs
echo "Using token: $API_TOKEN"

# Good — acknowledge without exposing
echo "Using API token: [set]"

# Validate secret exists without printing it
if [ -z "$API_TOKEN" ]; then
  echo "❌ API_TOKEN is not set"
  exit 1
fi
```

---

## Python Automation

Prefer Python over Bash for complex logic.

```python
#!/usr/bin/env python3
"""Script description here."""

import subprocess
import sys
from pathlib import Path

def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run a command with error handling."""
    print(f"Running: {' '.join(cmd)}")
    return subprocess.run(cmd, check=check, capture_output=False)

def main():
    # Use pathlib over os.path
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    # subprocess.run with check=True raises on non-zero exit
    run(["pnpm", "lint"])
    run(["pnpm", "test"])
    run(["pnpm", "build"])

    print("✅ All steps completed")

if __name__ == "__main__":
    main()
```

---

## CI/CD Patterns

### Fail Fast Ordering (GitHub Actions)

```yaml
jobs:
  quality:
    steps:
      - name: Type check      # Fastest — fail first
        run: pnpm tsc --noEmit
      - name: Lint            # Fast
        run: pnpm lint
      - name: Unit tests      # Medium
        run: pnpm test
      - name: Build           # Slow — run last
        run: pnpm build
      - name: E2E tests       # Slowest — only if everything passes
        run: pnpm test:e2e
```

### Secrets — Use GitHub Secrets, Never Hardcode

```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}   # ✅ from GitHub Secrets
  run: ./deploy.sh
  # Never: API_KEY=hardcoded_value
```

### Caching for Speed

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: pnpm          # Cache node_modules automatically
```
