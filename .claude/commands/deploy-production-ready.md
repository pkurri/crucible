# deploy-production-ready

Checklist-driven skill for production deployment readiness.

## Description

This skill ensures that your application or service is actually ready for production. It moves beyond "it works on my machine" to a rigorous verification of security, performance, observability, and environment configuration.

## Features

- **📋 Automated Checklist**: Scans the project for production anti-patterns.
- **🔐 Security Hardening**: Verifies CORS, CSP, and secret management.
- **📊 Performance Budgets**: Enforces Lighthouse and bundle size limits.
- **🛠️ Reliability Checks**: Ensures health endpoints and error tracking are active.
- **🔄 Rollback Strategy**: Formalizes the "Plan B" before deployment.

## Usage

### Running Pre-flight

```markdown
/deploy-production-ready preflight
```

### Auditing Bundle

```markdown
/deploy-production-ready audit-bundle
```

### Generating Runbook

```markdown
/deploy-production-ready generate-runbook
```

## Recommended Workflow

1. Finish feature development.
2. Run `/deploy-production-ready preflight`.
3. Fix identified high-risk gaps.
4. Run `/deploy-production-ready audit-bundle` to verify performance.
5. Execute deployment using the generated runbook.
