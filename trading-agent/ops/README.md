# Local session runner

Reference copies of how the daily shadow session runs on the owner's Mac.
Editing these files changes nothing: the **live** copies are outside the repo.

| Live file                                                     | Copy here                              |
| ------------------------------------------------------------- | -------------------------------------- |
| `~/Library/Application Support/trading-agent-shadow/run.sh`   | `run.sh`                               |
| `~/Library/LaunchAgents/ai.omilos.trading-agent-shadow.plist` | `ai.omilos.trading-agent-shadow.plist` |

The launcher lives outside the repo on purpose. The agent can write to
`trading-agent/`, so it must never be able to edit the script that launches it
outside the sandbox.

- Runs weekdays at 15:10 local time (America/New_York). launchd uses local time,
  so daylight saving needs no adjustment.
- Exits unless it is a weekday between 09:45 and 15:30 ET, so a Mac that wakes
  late cannot run a session on stale quotes.
- Runs in the dedicated worktree `.worktrees/shadow`, never the main checkout,
  and refuses to start if that worktree is dirty or cannot fast-forward.
- Loads only the Robinhood MCP server (`--strict-mcp-config`), allows an
  explicit list of read-only Robinhood tools under `--permission-mode dontAsk`,
  and denies all 26 write tools plus force-push, hard reset, `git config` and
  `git stash`.
- Authenticates before starting: a one-line Haiku call, retried three times a
  minute apart. If all fail, the session is not run, a macOS notification is
  posted, and the launcher exits non-zero. The log's `exit=` is the real exit
  code (before 2026-10-05 it always read 0).
- Optional long-lived token, so runs do not depend on the login keychain being
  available while the Mac is locked. Run `claude setup-token` yourself, then
  save the token it prints to
  `~/Library/Application Support/trading-agent-shadow/oauth-token` with mode 600
  (`chmod 600 <file>`). The launcher refuses a token file with any other mode.
  Never put the token in the repo.
- Logs: `~/Library/Logs/trading-agent-shadow/<date>.log`.

Stop it: `launchctl bootout gui/$(id -u)/ai.omilos.trading-agent-shadow`
