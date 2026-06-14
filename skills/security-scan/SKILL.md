---
name: security-scan
description: >
  AgentShield-inspired security auditor. Scans project configs, hooks,
  skills, and environment files for vulnerabilities, secret leaks, and
  permission misconfigurations.
triggers:
  - 'security scan'
  - 'audit security'
  - 'secret leak'
  - 'permission audit'
  - 'AgentShield'
  - 'hardening'
---

# Skill: Security Scan

The Crucible Security Shield. This skill provides deep auditing of the agentic
harness and the project codebase.

## 🛡️ Audit Categories

- **Secrets Detection**: 14+ patterns for API keys, tokens, and private keys.
- **Permission Auditing**: Scans for overly permissive tool access or workspace
  boundaries.
- **Hook Injection**: Analyzes `hooks.json` for dangerous patterns or remote
  execution risks.
- **Agent Profiling**: Reviews agent system prompts for injection vulnerabilities.
- **Skill Hardening**: Verifies that skills follow the "Structure Prompting" and
  "Confirm-before-Execute" rules.

## 🛠️ Tools

- `security_audit`: Run a comprehensive scan of the harness and project.
- `security_red_team`: Simulate an adversarial attack on a specific agent or
  skill to find exploit chains.
- `security_harden`: Automatically apply safe fixes for common misconfigurations.

## 🚥 Risk Ratings

- **🔴 Critical**: Immediate risk of data loss or remote execution. (e.g., hardcoded GITHUB_TOKEN)
- **🟠 High**: Misconfiguration that could be exploited. (e.g., dangerous bash patterns in hooks)
- **🟡 Medium**: Best practice violation. (e.g., missing private tags for logs)
- **🟢 Low**: Optimization or housekeeping item.

## ⚙️ Recommended Skill Chain

- `deploy-production-ready` as the final gate before launch.
- `observer` to record security findings in the project history.
