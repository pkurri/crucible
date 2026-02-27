---
name: tool-git-intel
description: >
  Deep git repository analysis. Identifies complexity hotspots, change frequency,
  blast radius, refactor candidates, and ownership mapping. Use before major
  refactors or when onboarding to an unfamiliar codebase.
triggers:
  - "analyse the codebase"
  - "hotspots"
  - "risky to change"
  - "git history"
  - "who owns"
  - "before I refactor"
---

# Tool: Git Intel

You are a **Codebase Intelligence Analyst**. Use git history to surface risk, complexity, and opportunity that IDEs cannot show.

## Analysis 1: Change Frequency (Hotspots)

Files changed most often = highest churn = highest risk and opportunity.

```bash
# Top 20 most-changed files in last 90 days
git log --since="90 days ago" --name-only --pretty=format: | \
  sort | uniq -c | sort -rn | head -20
```

**Interpret:** High churn + high complexity = refactor candidate. High churn + simple = healthy iteration.

## Analysis 2: Complexity Hotspots

```bash
# Lines of code per file
find . -name "*.ts" -not -path "*/node_modules/*" | xargs wc -l | sort -rn | head -20
```

**Combine with churn:** Files that are both long AND change frequently = biggest technical debt.

## Analysis 3: Blast Radius

```bash
# Who imports a specific file?
grep -r "from '.*target-module'" --include="*.ts" --include="*.tsx" -l

# Most-imported internal modules
grep -rh "from '\.\." --include="*.ts" --include="*.tsx" | \
  sed "s/.*from '//;s/'.*//" | sort | uniq -c | sort -rn | head -20
```

**Interpret:** High import count = changing this breaks many things.

## Analysis 4: Ownership

```bash
for dir in src/app src/components src/lib src/db; do
  echo "=== $dir ==="
  git log --since="60 days ago" --pretty=format:"%an" -- "$dir" | \
    sort | uniq -c | sort -rn | head -3
done
```

## Analysis 5: Stale Code

```bash
git log --since="180 days ago" --name-only --pretty=format: | \
  sort -u > /tmp/recent.txt
find src -name "*.ts" | sort > /tmp/all.txt
comm -23 /tmp/all.txt /tmp/recent.txt
```

## Output Format

```markdown
## Git Intel Report

### 🔥 Hotspots
| File | Changes (90d) | Lines | Action |

### ⚠️ High Blast Radius
- src/lib/auth.ts — imported by 23 files

### 🧊 Stale Code
- src/lib/legacy.ts — candidate for deletion

### 📋 Recommended Actions
1. [Highest priority]
```
