---
name: workflow-app-store-release
description:
  'End-to-end App Store Connect release pipeline: preflight a build, distribute
  via TestFlight, sync metadata/screenshots/localization, submit for review, and
  monitor to Approved/Live or triage a rejection. Built on the official rorkai
  `asc` skill pack. Triggers: ship a new build, release to the App Store, submit
  for review, push to TestFlight.'
triggers:
  - 'When asked to ship/release a new iOS/macOS/tvOS/visionOS build'
  - 'When a submission needs monitoring or a rejection needs triage'
  - 'When this workflow is referenced by another skill or agent'
---

# App Store Release Pipeline

Takes a build from "ready to ship" to Approved/Live using the
[App Store Connect CLI](https://github.com/rorkai/App-Store-Connect-CLI) and its
official skill pack. Built on top of the
[app-store-connect-cli](../app-store-connect-cli/SKILL.md) skill and the
[app-store-release-manager](../../agents/app-store-release-manager.md) agent.

## Phase 1: Preflight

1. Confirm `asc` auth is live and no credential file is tracked in git (see the
   `app-store-connect-cli` skill's Credential Safety section).
2. Confirm version/build number and signing are correct (`asc-signing-setup`).
3. Check for unresolved crashes from the previous TestFlight build
   (`asc-crash-triage`).

## Phase 2: Upload & TestFlight

1. Archive/export via `asc-xcode-build`.
2. Upload and distribute to the intended beta group(s) via `asc-release-flow` /
   `asc-testflight-orchestration`.
3. Give testers time to surface regressions before submitting to review.

## Phase 3: Metadata & Screenshots

1. Sync app info/keywords/localized copy — `asc-metadata-sync` /
   `asc-localize-metadata`.
2. Generate release notes — `asc-whats-new-writer`.
3. Update screenshots/previews per locale — `asc-shots-pipeline`.

## Phase 4: Submit

1. Trigger the `app-store-release-manager` agent (or `asc-release-flow`
   directly) to submit for review.
2. Treat submission as a confirm-before-execute step — it's hard to undo.

## Phase 5: Monitor

1. `asc status --watch` until a terminal state.
2. On rejection, run `asc-submission-health` to diagnose the blocker, fix it,
   and loop back to the relevant earlier phase rather than resubmitting
   unchanged.

## Companion Resources

- Skill: [app-store-connect-cli](../app-store-connect-cli/SKILL.md)
- Agent: [app-store-release-manager](../../agents/app-store-release-manager.md)
- Official skill pack:
  [rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills)
