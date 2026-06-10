---
name: deploy-production-ready
description: >
  Checklist-driven skill for ensuring web applications and APIs are ready for
  production. Covers environment parity, security hardening, performance
  budgets, observability, and fallback strategies.
triggers:
  - 'production ready'
  - 'deploy to prod'
  - 'deployment checklist'
  - 'launch product'
  - 'pre-flight check'
  - 'hardening'
---

# Skill: Deploy Production-Ready

Ensure your application meets the high standards required for production
environments. This skill enforces a "Pre-flight Checklist" pattern before any
deployment.

## 📋 The Production Checklist

### 1. Environment & Config
- [ ] **Env Parity**: All `.env.example` variables have production equivalents.
- [ ] **Secret Hardening**: Secrets are stored in a secure Vault/Secrets Manager,
      not in code or simple `.env` files.
- [ ] **CORS/CSP**: Content Security Policy and CORS origins are strictly
      defined.

### 2. Performance & UX
- [ ] **Performance Budget**: Lighthouse scores > 90 for mobile/desktop.
- [ ] **Layout Stability**: No layout shifts (CLS < 0.1).
- [ ] **Loading States**: All async operations have skeletons or spinners.
- [ ] **Bundle Audit**: Zero unused heavy dependencies in production bundle.

### 3. Reliability & Observability
- [ ] **Error Tracking**: Sentry/LogRocket/Datadog integrated and reporting.
- [ ] **Health Checks**: `/api/health` endpoint verifies DB, Cache, and APIs.
- [ ] **Rate Limiting**: Protection against DDoS and API abuse is active.
- [ ] **Rollback Plan**: Verified procedure to revert to the previous version in
      < 2 mins.

### 4. Security
- [ ] **Dependency Audit**: `pnpm audit` or `npm audit` shows 0 high/critical
      vulnerabilities.
- [ ] **SQLi/XSS**: All user inputs sanitized and parameterized.
- [ ] **Auth Hardening**: Session timeouts, CSRF protection, and Secure/HttpOnly
      cookies active.

## 🛠️ Tools

- `prod_preflight_check`: Run an automated scan of the codebase against the
  checklist.
- `prod_verify_env`: Verify that all required production environment variables
  are present (without logging values).
- `prod_audit_bundle`: Analyze the build artifacts for size and leakage issues.
- `prod_generate_runbook`: Create a deployment runbook for the current release.

## ⚙️ Recommended Skill Chain

- `review-security` for a final code audit.
- `observer` to record the deployment event and any issues found.
- `lighthouse-optimizer` for performance verification.
