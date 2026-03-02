---
name: ai-code-reviewer
description: AI-powered code review automation. Analyzes pull requests for bugs, security issues, performance problems, and style violations. Use when reviewing code, analyzing PRs, or conducting automated code quality checks.
triggers:
  - "review code"
  - "analyze PR"
  - "code review"
  - "check for bugs"
  - "security review"
---

# AI Code Reviewer

Automated code review powered by AI. Analyzes code for bugs, security vulnerabilities, performance issues, and style violations.

## Capabilities

- **Bug Detection**: Identify logical errors and potential bugs
- **Security Scanning**: Detect OWASP Top 10 vulnerabilities
- **Performance Analysis**: Find inefficient code patterns
- **Style Enforcement**: Check coding standards compliance
- **Multi-Language**: JavaScript, TypeScript, Python, Go, Rust

## Usage

```markdown
@skill ai-code-reviewer

Review this PR for security issues: https://github.com/org/repo/pull/123
```

## Workflow

### 1. Fetch PR Files

```typescript
const files = await getPullRequestFiles(owner, repo, prNumber);
```

### 2. Analyze Each File

```typescript
for (const file of files) {
  const analysis = await analyzeCode(file.content, file.language);
  issues.push(...analysis.issues);
}
```

### 3. Generate Report

```markdown
## Code Review Report

**Summary**: Found 3 high-severity issues

### Issues
- **Line 42**: Potential SQL injection (HIGH)
- **Line 58**: Unused variable (LOW)
- **Line 120**: Inefficient loop (MEDIUM)

### Recommendations
1. Use parameterized queries
2. Remove unused imports
3. Use map() instead of forEach
```

## Integration

- GitHub Webhooks: Auto-review on PR creation
- GitLab MR: Native integration
- CI/CD: Pipeline integration

## Resources

- `references/owasp-top-10.md`: Security guidelines
- `scripts/analyze.ts`: Analysis script
- `examples/review-examples.md`: Sample reviews
