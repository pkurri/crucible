# security-scan

AgentShield-inspired security auditor for Crucible.

## Description

The security-scan command performs a deep audit of your Crucible setup. It checks for leaked secrets, insecure hooks, and overly permissive agent configurations.

## Usage

```markdown
/security-scan
```

## Features

- **🔑 Secret Scanner**: Finds hardcoded API keys and tokens.
- **🛡️ Hook Audit**: Scans for shell injection risks in hooks.json.
- **🕵️ Red-Teaming**: Simulates attacks to test agent boundaries.
- **✅ Auto-Harden**: Proposes secure configuration fixes.
