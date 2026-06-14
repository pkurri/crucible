---
name: security-audit
description:
  Automated security scanning and vulnerability assessment platform. Use when
  conducting security audits, scanning for vulnerabilities, checking
  dependencies, or implementing security controls.
triggers:
  - 'security audit'
  - 'vulnerability scan'
  - 'security check'
  - 'OWASP'
  - 'penetration test'
---

# Security Audit Platform

Automated security scanning platform for continuous vulnerability assessment and
compliance monitoring.

## Capabilities

- **Vulnerability Scanning**: Detect known CVEs in dependencies
- **Static Analysis**: SAST for code vulnerabilities
- **Secrets Detection**: Find exposed API keys and credentials
- **Compliance Checking**: SOC2, GDPR, HIPAA controls
- **Dependency Audit**: Check for outdated packages

## Usage

```markdown
@skill security-audit

Scan my repository for security vulnerabilities:

- Repository: github.com/org/project
- Scan types: dependencies, secrets, SAST
- Compliance: SOC2
```

## Scan Types

### 1. Dependency Audit

```typescript
import {auditDependencies} from './security/dependencies'

const results = await auditDependencies({
  packageJson: './package.json',
  lockFile: './package-lock.json',
  severityThreshold: 'medium',
})

// Returns: CVE list, severity scores, remediation steps
```

### 2. Secret Detection

```typescript
import {scanSecrets} from './security/secrets'

const secrets = await scanSecrets({
  paths: ['./src', './config'],
  patterns: ['api_key', 'password', 'token'],
})
```

### 3. SAST (Static Analysis)

```typescript
import {runSAST} from './security/sast'

const vulnerabilities = await runSAST({
  codePath: './src',
  rules: ['sqli', 'xss', 'csrf', 'rce'],
})
```

## Reporting

Generate security reports:

```markdown
## Security Audit Report

**Repository**: org/project **Date**: 2024-01-15 **Overall Score**: 85/100

### Findings

- **High**: 2 SQL injection vulnerabilities
- **Medium**: 5 outdated dependencies
- **Low**: 12 hardcoded strings

### Recommendations

1. Update lodash to v4.17.21
2. Use parameterized queries
3. Move secrets to environment variables
```

## Integration

- GitHub Actions: Automated PR scanning
- CI/CD: Pipeline security gates
- Slack: Alert notifications
- Jira: Ticket creation

## Compliance

Built-in checks for:

- **OWASP Top 10**
- **CIS Benchmarks**
- **SOC 2 Controls**
- **GDPR Article 32**
- **HIPAA Security Rules**
