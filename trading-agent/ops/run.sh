#!/bin/bash
# Weekday shadow session for the trading agent, run by launchd.
# Lives outside the repo on purpose: the agent can write trading-agent/,
# so it must not be able to edit the script that launches it.
set -u
REPO="/Users/aak/CascadeProjects/crucible/.worktrees/shadow"
LOG_DIR="$HOME/Library/Logs/trading-agent-shadow"
export PATH="/Users/aak/.nvm/versions/node/v24.14.1/bin:/Users/aak/.local/bin:/opt/homebrew/bin:/Library/Frameworks/Python.framework/Versions/3.13/bin:/usr/bin:/bin:/usr/sbin:/sbin"
mkdir -p "$LOG_DIR"
exec >>"$LOG_DIR/$(TZ=America/New_York date +%F).log" 2>&1
echo "=== start $(date -u +%FT%TZ) ==="

# Regular hours only. A Mac that wakes late must not run a session on
# quotes the policy would reject as stale. FORCE_WINDOW=1 is for testing.
dow=$(TZ=America/New_York date +%u); hm=$(TZ=America/New_York date +%H%M)
if [ "${FORCE_WINDOW:-0}" != "1" ] && { [ "$dow" -gt 5 ] || [ "$hm" -lt 945 ] || [ "$hm" -gt 1530 ]; }; then
  echo "outside weekday 09:45-15:30 ET (day $dow, $hm); skipped"; exit 0
fi

notify() { osascript -e "display notification \"$1\" with title \"Trading agent shadow\"" >/dev/null 2>&1 || true; }

# Long-lived token from `claude setup-token`, if present. The keychain login
# can be unavailable to launchd while the Mac is locked (2026-10-05 session
# was lost to "Not logged in"); a token file does not depend on it.
TOKEN_FILE="$HOME/Library/Application Support/trading-agent-shadow/oauth-token"
if [ -f "$TOKEN_FILE" ]; then
  if [ "$(stat -f %Lp "$TOKEN_FILE")" != "600" ]; then echo "token file not mode 600; refusing"; notify "token file permissions wrong"; exit 1; fi
  CLAUDE_CODE_OAUTH_TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"; export CLAUDE_CODE_OAUTH_TOKEN
fi

# Auth preflight with retries, so a login failure is loud instead of a
# four-second run that logs success.
authed=0
for attempt in 1 2 3; do
  if claude -p "reply ok" --model haiku --no-session-persistence --strict-mcp-config --tools "" < /dev/null >/dev/null 2>&1; then authed=1; break; fi
  echo "auth preflight failed (attempt $attempt)"; sleep 60
done
if [ "$authed" != "1" ]; then echo "not authenticated; session NOT run"; notify "Session NOT run: Claude not logged in"; exit 1; fi

cd "$REPO" || { echo "worktree missing"; exit 1; }
if [ -n "$(git status --porcelain)" ]; then echo "worktree dirty; refusing"; exit 1; fi
git fetch -q origin trading-agent-phase2 && git merge --ff-only -q origin/trading-agent-phase2 \
  || { echo "cannot fast-forward to origin; refusing"; exit 1; }

RH=mcp__robinhood-trading
DENY=""
for t in place_equity_order place_option_order place_crypto_order review_equity_order \
  review_option_order preview_crypto_order cancel_equity_order cancel_option_order \
  cancel_crypto_order exercise_option cancel_option_exercise create_watchlist update_watchlist \
  add_to_watchlist remove_from_watchlist add_option_to_watchlist remove_option_from_watchlist \
  follow_watchlist unfollow_watchlist create_alert update_alert delete_alert mark_alerts_read \
  create_scan update_scan_config update_scan_filters; do DENY="$DENY ${RH}__$t"; done

# Explicit read-only allowlist. A server-wide rule ("mcp__robinhood-trading")
# does not admit the tools under dontAsk, so each read tool is named.
ALLOW_RH=""
for t in get_accounts get_portfolio get_equity_positions get_equity_quotes \
  get_equity_fundamentals get_equity_historicals get_equity_tradability get_indexes \
  get_index_quotes get_financials get_earnings_calendar get_earnings_results \
  get_equity_analyst_ratings get_equity_technical_indicators get_equity_price_book; do
  ALLOW_RH="$ALLOW_RH ${RH}__$t"; done

PROMPT='You are running one scheduled shadow session for a policy-gated trading agent. You start with no context. You are already on branch trading-agent-phase2 in a dedicated worktree; skip any git fetch or checkout step. Read trading-agent/ROUTINE.md in full and execute the prompt in its "The prompt" section exactly. The Robinhood tools here are named mcp__robinhood-trading__*. Absolute rules: read-only Robinhood tools only; never place, review, preview or cancel an order; never modify a watchlist, alert or scan; never invent a number; never edit POLICY.yaml or WATCHLIST.yaml; commit nothing if any step or test fails; push only with a plain `git push origin trading-agent-phase2`.'

claude -p "$PROMPT" < /dev/null \
  --model sonnet --max-budget-usd 6 --no-session-persistence \
  --strict-mcp-config \
  --mcp-config '{"mcpServers":{"robinhood-trading":{"type":"http","url":"https://agent.robinhood.com/mcp/trading"}}}' \
  --permission-mode dontAsk \
  --allowedTools ToolSearch Read Glob Grep "Edit(trading-agent/**)" "Write(trading-agent/**)" $ALLOW_RH \
    "Bash(git:*)" "Bash(uv:*)" "Bash(python3:*)" "Bash(date:*)" "Bash(TZ=America/New_York date:*)" \
    "Bash(ls:*)" "Bash(cat:*)" "Bash(head:*)" "Bash(tail:*)" "Bash(wc:*)" "Bash(jq:*)" \
    "Bash(grep:*)" "Bash(echo:*)" "Bash(npx prettier:*)" "Bash(npx markdownlint:*)" \
  --disallowedTools $DENY "Bash(git push --force:*)" "Bash(git push -f:*)" \
    "Bash(git reset --hard:*)" "Bash(git config:*)" "Bash(git stash:*)"
rc=$?
[ "$rc" != "0" ] && notify "Session exited with code $rc; check the log"
echo "=== end $(date -u +%FT%TZ) exit=$rc ==="
exit "$rc"
