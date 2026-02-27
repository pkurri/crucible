---
name: deployment-commander
description: >
  Safe deployment orchestration with pre-flight checks. Verifies git status,
  branch, test results before any deployment. Post-deploy health verification.
  Use before running any deployment script or pushing to production.
triggers:
  - "deploy"
  - "deploy to production"
  - "ship to prod"
  - "release"
  - "push to production"
  - "go live"
---

# Skill: Deployment Commander

Safe, verified deployments. Never deploy without pre-flight checks.

---

## Pre-Flight Protocol (MANDATORY)

Run ALL checks before any deployment. Block if any fail.

### Check 1: Git Status
```bash
# Must be clean — no uncommitted changes
git status --porcelain
# Expected: empty output
# Fail if: any modified/untracked files
```

### Check 2: Correct Branch
```bash
git branch --show-current
# Expected: main (or production, release/x.y.z)
# Fail if: on feature branch or develop
```

### Check 3: Tests Passed
```bash
pnpm test
# Fail if: any test failures
# Also check: pnpm tsc --noEmit && pnpm lint
```

### Check 4: No Pending Migrations
```bash
pnpm db:status
# Fail if: pending migrations not applied to staging
```

---

## Deployment Workflow

```
You: "Deploy to production"

Commander:
  1. ✅ Git status — clean
  2. ✅ Branch — on main
  3. ✅ Tests — all passing
  4. ✅ Migrations — none pending
  5. 📋 Propose: "Ready to deploy. Shall I proceed?"
  6. [User approves]
  7. 🚀 Execute deployment
  8. 🔍 Post-deploy health check
  9. 📊 Report: success/failure with logs
```

**Never auto-deploy without user confirmation.** Always propose → wait → execute.

---

## Deployment Scripts

### Vercel
```bash
#!/bin/bash
set -euo pipefail

echo "🚀 Deploying to Vercel..."
pnpm dlx vercel --prod --yes

echo "🔍 Health check..."
sleep 5
curl -f -I https://your-app.vercel.app/api/health || {
  echo "❌ Health check failed!"
  exit 1
}
echo "✅ Deployment successful"
```

### Cloudflare Workers
```bash
#!/bin/bash
set -euo pipefail

echo "🚀 Deploying to Cloudflare Workers..."
pnpm dlx wrangler deploy

echo "🔍 Health check..."
sleep 3
curl -f https://your-worker.your-subdomain.workers.dev/health || {
  echo "❌ Health check failed — consider rollback"
  exit 1
}
echo "✅ Deployment successful"
```

### Run Migrations in Production
```bash
#!/bin/bash
set -euo pipefail

echo "⚠️  Running DB migrations in production..."
echo "Current migration status:"
pnpm db:status

read -p "Proceed? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

pnpm db:migrate:prod
echo "✅ Migrations complete"
```

---

## Post-Deployment Verification

Always verify after deploying:

```bash
# 1. Health endpoint
curl -f -I https://your-app.com/api/health

# 2. Check error rate in Sentry (open dashboard)
echo "Check Sentry: https://sentry.io/organizations/your-org/issues/"

# 3. Check logs
vercel logs --app your-app --since 5m

# 4. Smoke test critical paths
curl -f https://your-app.com/api/users  # authenticated endpoint
```

---

## Rollback Plan

Always have a rollback ready before deploying:

```bash
# Vercel — instant rollback to previous deployment
vercel rollback

# Cloudflare Workers — rollback to previous version  
wrangler rollback

# Database — run rollback migration if prepared
pnpm db:rollback
```

**Rule:** If health check fails within 5 minutes of deploy → rollback immediately, investigate after.
