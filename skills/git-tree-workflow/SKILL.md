---
name: git-tree-workflow
description: >
  Git tree branching strategy for parallel feature development. Creates a shared
  base branch, fans out per-feature branches from it, and merges them back before
  promoting to main. Supports 2+ simultaneous features with clean isolation.
triggers:
  - 'feature branches'
  - 'parallel features'
  - 'git tree'
  - 'branch tree'
  - 'multiple features'
  - 'branch per feature'
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
---

# Skill: Git Tree Workflow

You are a **Git Branch Architect**. You set up and manage a tree-shaped branching
structure where multiple feature branches share a common base, and merge back to
that base before it promotes to `main`.

## Tree Structure

```
main
 └── base/<scope>          ← shared integration branch
      ├── feat/<feature-1> ← isolated feature work
      ├── feat/<feature-2>
      └── feat/<feature-N>
```

## Phase 1: Set Up the Base Branch

```bash
# Create base branch from main (or current branch)
BASE="base/<scope>"   # e.g. base/sprint-3 or base/auth-overhaul
git checkout main && git pull origin main
git checkout -b "$BASE"
git push -u origin "$BASE"
echo "Base branch ready: $BASE"
```

**When to use a base branch:** When 2+ features share a migration, API contract
change, or config update that all features depend on. If features are truly
independent, they can branch directly from `main`.

## Phase 2: Create Feature Branches

For each feature, branch off the **base** (not main):

```bash
BASE="base/<scope>"
FEATURES=("feat/auth" "feat/dashboard" "feat/notifications")

for F in "${FEATURES[@]}"; do
  git checkout "$BASE"
  git checkout -b "$F"
  git push -u origin "$F"
  echo "Created: $F"
done
```

To add a feature later:
```bash
git checkout base/<scope>
git pull origin base/<scope>
git checkout -b feat/<new-feature>
git push -u origin feat/<new-feature>
```

## Phase 3: Work on Features in Parallel

Each feature branch is isolated. Developers work independently:

```bash
git checkout feat/<feature-N>
# ... make commits ...
git push origin feat/<feature-N>
```

Keep feature branches up to date with the base:
```bash
git checkout feat/<feature-N>
git fetch origin
git rebase origin/base/<scope>
# resolve conflicts if any, then:
git push --force-with-lease origin feat/<feature-N>
```

## Phase 4: Merge Features Back to Base

When a feature is complete, merge it into the base branch:

```bash
BASE="base/<scope>"
FEATURE="feat/<feature-N>"

git checkout "$BASE"
git pull origin "$BASE"
git merge --no-ff "$FEATURE" -m "Merge $FEATURE into $BASE"
git push origin "$BASE"
```

`--no-ff` preserves the feature branch topology in history.

To merge all completed features in sequence:
```bash
BASE="base/<scope>"
DONE=("feat/auth" "feat/dashboard")  # features ready to merge

git checkout "$BASE" && git pull origin "$BASE"
for F in "${DONE[@]}"; do
  git merge --no-ff "$F" -m "Merge $F into $BASE"
done
git push origin "$BASE"
```

## Phase 5: Promote Base to Main

After all features are merged and tested on the base branch:

```bash
BASE="base/<scope>"
git checkout main && git pull origin main
git merge --no-ff "$BASE" -m "Promote $BASE to main"
git push origin main
```

## Phase 6: Cleanup

```bash
BASE="base/<scope>"
FEATURES=("feat/auth" "feat/dashboard" "feat/notifications")

# Delete remote feature branches
for F in "${FEATURES[@]}"; do
  git push origin --delete "$F"
done

# Delete local feature branches
for F in "${FEATURES[@]}"; do
  git branch -d "$F"
done

# Delete base branch (optional — keep if used for hotfixes)
git push origin --delete "$BASE"
git branch -d "$BASE"
```

## Quick Reference

| Goal | Command |
|------|---------|
| Create base | `git checkout -b base/<scope>` |
| Create feature | `git checkout base/<scope> && git checkout -b feat/<name>` |
| Sync feature with base | `git rebase origin/base/<scope>` |
| Merge feature → base | `git checkout base/<scope> && git merge --no-ff feat/<name>` |
| Promote base → main | `git checkout main && git merge --no-ff base/<scope>` |
| List all branches | `git branch -a --sort=-committerdate` |

## Branch Naming Conventions

```
base/<scope>         base/sprint-3, base/v2-api, base/auth-overhaul
feat/<name>          feat/login, feat/user-profile, feat/payment-flow
fix/<name>           fix/session-expiry (hotfix off base or main)
```

## Conflict Resolution Strategy

When merging features that touch the same files:
1. Merge the simpler/smaller feature first
2. Rebase the other feature(s) onto the updated base: `git rebase origin/base/<scope>`
3. Resolve conflicts in the rebase, not in a merge commit
4. Re-push with `--force-with-lease`

## Status Check

Audit the full tree at any point:
```bash
BASE="base/<scope>"
echo "=== Base branch status ==="
git log --oneline main.."$BASE"
echo ""
echo "=== Feature branches ahead of base ==="
git branch -r | grep "feat/" | while read F; do
  AHEAD=$(git rev-list --count origin/"$BASE".."$F" 2>/dev/null)
  echo "  $F: $AHEAD commits ahead"
done
```
