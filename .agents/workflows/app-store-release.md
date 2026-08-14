---
description: App Store Connect release pipeline (build to Approved/Live).
---

# App Store Release Pipeline

Takes a build from ready-to-ship to Approved/Live using the App Store Connect
CLI (`asc`) and its official rorkai skill pack.

## Phase 1: Preflight

1. **Verify credentials & signing**: `asc` auth live, no credential file tracked
   in git, version/build number and signing correct.

## Phase 2: Upload & TestFlight

1. **Trigger app-store-release-manager**: archive/export (`asc-xcode-build`),
   then distribute to TestFlight
   (`asc-release-flow`/`asc-testflight-orchestration`).

## Phase 3: Metadata & Screenshots

1. Sync metadata/localization (`asc-metadata-sync`, `asc-localize-metadata`,
   `asc-whats-new-writer`, `asc-shots-pipeline`).

## Phase 4: Submit

1. Submit for review via `asc-release-flow`; confirm before this step — it's
   hard to undo.

## Phase 5: Monitor

1. `asc status --watch`; on rejection, diagnose with `asc-submission-health` and
   loop back rather than resubmitting blind.

---

// See skills/workflow-app-store-release/SKILL.md and
agents/app-store-release-manager.md for details.
