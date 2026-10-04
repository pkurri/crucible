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
- Logs: `~/Library/Logs/trading-agent-shadow/<date>.log`.

Stop it: `launchctl bootout gui/$(id -u)/ai.omilos.trading-agent-shadow`
