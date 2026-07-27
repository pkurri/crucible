---
name: infra-ai-team
description:
  'Personal AI infrastructure operations team. Orchestrates 11 specialized
  Claude Code agents (plus a routing wrapper) that operate a self-hosted
  stack: overlay mesh, secrets vault, compute substrate, public edge, LAN,
  telemetry/SIEM, and workflow runtime. Dispatches by intent to
  haiku-tier reads, sonnet-tier planned changes, and reserves opus for
  parent-invoked multi-domain incidents.'
license: 'MIT'
triggers:
  - 'When operating or troubleshooting a self-hosted infrastructure stack'
  - 'When triaging a security alert or SIEM correlation across infra domains'
  - 'When setting up a private mesh, secrets vault, or internal DNS'
  - 'When running a scheduled drift sweep or infra documentation audit'
---

# Infra AI Team

Operates a self-hosted infrastructure stack through eleven specialist agents
plus a routing wrapper, instead of one monolithic agent loading full context
on every request.

Start any ambiguous request at `infra-router` — it classifies the request and
returns `{specialist, tier, reason}` without executing anything itself.

## Specialists

- **Substrate & network**: `infra-mesh`, `infra-substrate`, `infra-edge`,
  `infra-lan`.
- **Secrets & workflow**: `infra-vault`, `infra-flow`.
- **Observability & security**: `infra-telemetry`, `infra-security`,
  `infra-threat-detection`, `infra-vuln-management`.
- **Documentation**: `infra-docs` (drift sweep, journal reconciliation).

## Model tiers

7x haiku (reads/classification) - 5x sonnet (planned changes) - 0x opus.
Opus is parent-invoked only, for multi-domain incidents — never dispatch to
it directly.

Full policies (confirmation gates, dispatch rules, audit trail, drift
detection, injection defense) and the complete build-out guide live in
`skills/infra-ai-team/references/`.
