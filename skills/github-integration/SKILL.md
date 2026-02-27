---
name: github-integration
description: >
  Deep GitHub automation: auto-create issues as Epics/Stories/Tasks with labels,
  milestones, and project fields. GitHub Actions for CI/CD, PR automation,
  auto-assignment, labeling workflows. Use when automating GitHub project management
  or setting up issue-driven development workflows.
triggers:
  - "github"
  - "github issues"
  - "github actions"
  - "auto-create issues"
  - "project automation"
  - "PR automation"
  - "labels"
  - "milestones"
---

# Service: GitHub Integration

Deep GitHub automation patterns — from issue creation to full project management workflows.

---

## Setup

```bash
pnpm add @octokit/rest @octokit/graphql
```

```typescript
// src/lib/github.ts
import { Octokit } from '@octokit/rest'

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})
```

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxx   # needs: repo, project, workflow scopes
GITHUB_OWNER=pkurri
GITHUB_REPO=my-repo
```

---

## Issue Hierarchy: Epic → Story → Task

PrismCode uses a 3-level hierarchy. Mirror it with labels:

```typescript
// src/lib/issues.ts
import { octokit } from './github'

type IssueType = 'epic' | 'story' | 'task'

const LABELS: Record<IssueType, { color: string; description: string }> = {
  epic:  { color: '7C3AED', description: 'Strategic initiative spanning multiple sprints' },
  story: { color: '06B6D4', description: 'User-facing feature or capability' },
  task:  { color: '10B981', description: 'Implementation work item' },
}

// Create all labels in one shot
export async function setupLabels(owner: string, repo: string) {
  const domainLabels = {
    frontend:      { color: 'EC4899', description: 'Frontend/UI work' },
    backend:       { color: '8B5CF6', description: 'Backend/API work' },
    database:      { color: 'F59E0B', description: 'Database schema or queries' },
    devops:        { color: '6366F1', description: 'CI/CD, deployment, infrastructure' },
    'priority:high':   { color: 'D73A4A', description: 'High priority' },
    'priority:medium': { color: 'FFA500', description: 'Medium priority' },
    'priority:low':    { color: '90EE90', description: 'Low priority' },
  }

  const allLabels = { ...LABELS, ...domainLabels }

  for (const [name, { color, description }] of Object.entries(allLabels)) {
    await octokit.issues.createLabel({ owner, repo, name, color, description })
      .catch(() => {}) // Ignore if already exists
  }
}

// Create an Epic
export async function createEpic(owner: string, repo: string, epic: {
  title: string
  goal: string
  successMetrics: string[]
  timeline: string
  effort: number
}) {
  const body = `## 🎯 Goal\n${epic.goal}\n\n## ✅ Success Metrics\n${
    epic.successMetrics.map(m => `- ${m}`).join('\n')
  }\n\n## 📅 Timeline\n${epic.timeline}\n\n## 📊 Effort\n${epic.effort} story points`

  return octokit.issues.create({
    owner, repo,
    title: `[EPIC] ${epic.title}`,
    body,
    labels: ['epic'],
  })
}

// Create a Story linked to an Epic
export async function createStory(owner: string, repo: string, story: {
  epicNumber: number
  title: string
  asA: string
  iWant: string
  soThat: string
  acceptanceCriteria: string[]
  storyPoints: number
  priority: 'high' | 'medium' | 'low'
}) {
  const body = `## 👤 User Story\nAs a **${story.asA}**, I want **${story.iWant}** so that **${story.soThat}**\n\n` +
    `## ✅ Acceptance Criteria\n${story.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}\n\n` +
    `## 🔗 Epic\n#${story.epicNumber}\n\n## 📊 Story Points: ${story.storyPoints}`

  return octokit.issues.create({
    owner, repo,
    title: `[STORY] ${story.title}`,
    body,
    labels: ['story', `priority:${story.priority}`],
  })
}

// Bulk import issues from JSON
export async function bulkCreateIssues(owner: string, repo: string, issues: Array<{
  title: string
  body: string
  labels: string[]
}>) {
  const results = []
  for (const issue of issues) {
    const result = await octokit.issues.create({ owner, repo, ...issue })
    results.push(result.data)
    await new Promise(r => setTimeout(r, 500)) // Rate limiting: 2/sec
  }
  return results
}
```

---

## GitHub Actions: CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

---

## GitHub Actions: PR Automation

```yaml
# .github/workflows/pr-automation.yml
name: PR Automation

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  auto-label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          configuration-path: .github/labeler.yml

  auto-assign:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/auto-assign-action@v2
        with:
          configuration-path: .github/auto_assign.yml
```

```yaml
# .github/labeler.yml
frontend:
  - changed-files:
    - any-glob-to-any-file: ['src/app/**', 'src/components/**']

backend:
  - changed-files:
    - any-glob-to-any-file: ['src/app/api/**', 'src/lib/**']

database:
  - changed-files:
    - any-glob-to-any-file: ['src/db/**', 'drizzle/**']
```

---

## GitHub Actions: Auto-Assign by IDE

```yaml
# .github/workflows/ide-auto-assign.yml
# Detects which IDE agent created the PR and assigns accordingly
name: IDE Agent Auto-Assign

on:
  pull_request:
    types: [opened]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - name: Assign based on branch prefix
        uses: actions/github-script@v7
        with:
          script: |
            const branch = context.payload.pull_request.head.ref;
            const assignees = [];

            if (branch.startsWith('antigravity/')) assignees.push('antigravity-bot');
            if (branch.startsWith('windsurf/')) assignees.push('windsurf-bot');
            if (branch.startsWith('feature/')) assignees.push(context.payload.pull_request.user.login);

            if (assignees.length > 0) {
              await github.rest.issues.addAssignees({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.pull_request.number,
                assignees
              });
            }
```

---

## Issue Templates

```markdown
<!-- .github/ISSUE_TEMPLATE/epic.md -->
---
name: Epic
about: Strategic initiative spanning multiple sprints
labels: epic
---

## 🎯 Goal
[What strategic objective does this achieve?]

## ✅ Success Metrics
- [ ] Metric 1
- [ ] Metric 2

## 📋 Stories
- [ ] #story-number

## 📅 Timeline
[Sprint X - Sprint Y]
```

```markdown
<!-- .github/ISSUE_TEMPLATE/task.md -->
---
name: Task
about: Implementation work item
labels: task
---

## 📋 Description
[What needs to be implemented?]

## ✅ Checklist
- [ ] Step 1
- [ ] Step 2
- [ ] Tests written
- [ ] PR opened

## 🔗 Story
#story-number

## ⏱ Estimate
[X hours]
```

---

## PR Template

```markdown
<!-- .github/pull_request_template.md -->
## Summary
[What does this PR do?]

## Related Issues
Closes #[issue-number]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Tested manually

## Screenshots (if UI change)
```
