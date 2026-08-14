---
name: app-store-connect-cli
description:
  "Automate iOS/macOS/tvOS/visionOS release operations with the App Store
  Connect CLI (`asc`): builds, TestFlight, metadata/localization, screenshots,
  submissions, signing/certs, and Apple Ads. Wires up the official 30-skill
  rorkai pack rather than duplicating its command reference. Covers this repo's
  credential-safety convention for the Apple API private key. Triggers: App
  Store Connect, TestFlight, asc cli, app submission, release to App Store, ios
  release."
allowed-tools:
  - Read
  - Bash
  - WebFetch
triggers:
  - 'When automating an iOS/macOS/tvOS/visionOS App Store Connect release'
  - 'When the user mentions asc cli, TestFlight, or App Store submission'
  - 'When this skill is referenced by another agent or workflow'
---

# App Store Connect CLI (`asc`)

[App Store Connect CLI](https://github.com/rorkai/App-Store-Connect-CLI) is a
fast, scriptable CLI for iOS/macOS/tvOS/visionOS release workflows: builds,
TestFlight, metadata/localization, screenshots, submissions, signing/certs,
analytics, and Apple Ads — without the App Store Connect web UI.

Its authors also publish an official 30-skill pack
([rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills)).
Defer to that pack for command syntax and workflow detail — this skill covers
installing it, this repo's credential-safety convention, and how the companion
agent/workflow here orchestrate it for a full release.

## Setup

1. **Install the CLI**: `brew install asc`, the install script, or WinGet
   (Windows).
2. **Install the official skill pack** — pick whichever matches the agent in
   use:

   ```bash
   npx skills add rorkai/app-store-connect-cli-skills   # generic installer
   claude plugin install asc@rorkai                     # Claude Code plugin
   asc install-skills                                    # via the CLI itself
   ```

3. **Authenticate**: generate an API key in App Store Connect (Users and Access
   → Keys), then:

   ```bash
   asc auth login --key-id "<KEY_ID>" --issuer-id "<ISSUER_ID>" \
     --private-key /path/to/AuthKey_<KEY_ID>.p8
   ```

   Locally this stores credentials in the OS keychain. In CI, `asc` also
   supports config-file storage — see Credential Safety below before wiring that
   up.

## Credential Safety

The `.p8` private key is the actual secret (the key ID and issuer ID are
identifiers, not secrets, but still shouldn't be hardcoded into scripts). Follow
this repo's existing credential convention (see `.claude/CLAUDE.md` →
Credentials, and the `youtube-token.json` pattern):

- Never commit the `.p8` file or a populated `asc` config file — gitignore them
  the same way `client_secret.json` / `youtube-token.json` are gitignored here.
- In CI, write the `.p8` from a GitHub Secret at job runtime and delete it after
  the job (matching the `Setup YouTube Credentials` step pattern in
  `.github/workflows/youtube-empire-fleet.yml`), rather than storing it in a
  tracked config file.
- After adding a new local credential file, confirm it's actually untracked
  (`git status`) — this repo has had real keys committed before despite
  `.gitignore` coverage.

## Official Skill Pack — What's Available

The rorkai pack ships ~30 skills grouped by area; install it (Setup above)
rather than relying on this summary for exact syntax:

| Area                    | Example skills                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Core automation         | `asc-cli-usage`, `asc-workflow`                                                       |
| Build & distribution    | `asc-xcode-build`, `asc-build-lifecycle`, `asc-testflight-orchestration`              |
| Metadata & localization | `asc-metadata-sync`, `asc-localize-metadata`, `asc-whats-new-writer`, `asc-aso-audit` |
| Submissions & health    | `asc-release-flow`, `asc-submission-health`                                           |
| Signing & security      | `asc-signing-setup`, `asc-notarization`                                               |
| Monetization            | `asc-ppp-pricing`, `asc-subscription-localization`, `asc-revenuecat-catalog-sync`     |
| Apple Ads               | `asc-apple-ads`                                                                       |
| Testing & quality       | `asc-crash-triage`, `asc-shots-pipeline`                                              |
| Utility                 | `asc-id-resolver`, `asc-app-create-ui`, `asc-analytics-reports`, `asc-wall-submit`    |

## Verification

- `asc auth login` (or equivalent status command) confirms the active credential
  without printing the private key.
- `asc status --watch` reflects the expected build/submission state after any
  release action.
- No `.p8` or populated `asc` config file appears in `git status`.

## Companion Resources

- Agent: [app-store-release-manager](../../agents/app-store-release-manager.md)
  — orchestrates a full release using the official skill pack.
- Workflow: `/workflow-app-store-release` — preflight → TestFlight → metadata →
  submit → monitor pipeline.
- Official skill pack:
  [rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills).
