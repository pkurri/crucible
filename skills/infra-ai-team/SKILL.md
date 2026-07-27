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

A specialized AI agent team that runs a self-hosted stack: overlay mesh,
secrets vault, compute substrate, public edge, LAN, telemetry/SIEM, and
workflow runtime.

## Why split one agent into eleven

A monolithic agent loads its full context on every request. Specialists are
80-150 lines each, dispatched by intent, which is what makes daily use
affordable: a DNS lookup shouldn't load a 400-line spec covering secrets
rotation and SIEM correlation too.

| Tier | Model | Use |
| --- | --- | --- |
| 1 | haiku | reads, classification, templated calls |
| 2 | sonnet | planned changes, multi-step coordination |
| 3 | opus | parent-invoked only, multi-domain incidents |

Default fleet: 7x haiku, 5x sonnet, 0x opus (opus is reserved for incident
command — never dispatch to it directly).

## The agents

Dispatch through `agents/infra-router.md` first for any ambiguous request —
it returns `{specialist, tier, reason}` and never executes domain operations
itself. See `references/policies/dispatch.md` for the full routing rules.

| Agent | Domain |
| --- | --- |
| `infra-router` | Decision-only routing wrapper |
| `infra-mesh` | Overlay mesh (peer enrollment, routes, setup keys) |
| `infra-vault` | Secrets (machine identity, rotations, break-glass) |
| `infra-substrate` | Compute/SSH topology (VM/container lifecycle) |
| `infra-edge` | Public surface (DNS, tunnels, access policies) |
| `infra-lan` | Internal network (switches, APs, internal DNS) |
| `infra-telemetry` | Observability/SIEM (alert triage, correlation) |
| `infra-flow` | Workflow runtime (scheduled jobs, webhooks) |
| `infra-docs` | Documentation/audit (drift sweep, journal reconciliation) |
| `infra-security` | Security triage and hardening |
| `infra-threat-detection` | Active alert correlation, peer to infra-security |
| `infra-vuln-management` | CVE prioritization and patch sequencing |

## Cross-cutting policies

Every agent operates under the shared rules in `references/policies/`:

- `confirmation-gate.md` — what requires explicit confirmation before acting
- `dispatch.md` — how the router picks a specialist and tier
- `audit-trail.md` — the append-only journal every agent writes to
- `drift-detection.md` — the weekly sweep that catches config drift
- `injection-defense.md` — guardrails against prompt injection from scanned
  infra state (logs, DNS records, alert payloads)
- `model-routing-policy.md` — the tier-selection rules behind the table above

## Building the stack from scratch

If there's no existing self-hosted stack to operate yet, `references/sections/`
holds the full build-out guide in reading order: start with
`00-prerequisites.md` and `07-the-agent.md`, then walk `01`-`06` for the
substrate itself, then `08`-`13` to split into this agent team, add memory,
the journal, the drift sweep, and the guardrails.

`references/diagrams/topology.svg` shows the architecture on one page.
`references/examples/` has ready-to-adapt configs.
