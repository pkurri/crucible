---
name: Sentinel Guard
description:
  Autonomously scans logs for system instabilities and generates self-healing
  payloads.
triggers:
  - 'When the system detects higher than normal error rates'
  - 'When requested by the Reactor agent'
  - 'When a new forge event is logged'
---

# Sentinel Guard

This is an autonomously generated skill placeholder representing the Reactor's
self-healing monitoring and policy enforcement capabilities.

## Active Policies

### [AUTH-001] Global Git Authorship

- **Author**: `Prasad Kurri <prasad.rkurri@gmail.com>`
- **Enforcement**: All commits must be made using this identity to satisfy
  Vercel Hobby deployment constraints.
- **Action**: The system will automatically configure `--global user.email` and
  `--global user.name` upon activation.
