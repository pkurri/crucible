# Scheduled shadow session — routine prompt

The prompt below is what a scheduled cloud agent runs once per trading day. It
is kept here so it is reviewable and version-controlled rather than living only
in a routine's configuration.

A cloud agent starts with **zero context**. Everything it needs is in the prompt
or in this repository.

## Standing constraints

- It may call **read-only** Robinhood tools only. Any order, cancel, review or
  watchlist-mutating tool is forbidden — `policy.py` blocks them and `shadow.py`
  refuses to run outside shadow mode, but the prompt states it too so there is
  no ambiguity at any layer.
- **Missing data is never invented.** A required input that cannot be retrieved
  produces `NO_TRADE` with the reason recorded.
- **Non-trading days must not count.** Cron fires on weekdays; markets close for
  holidays. If the latest quote's official close date is not today, the market
  did not trade and the routine exits without touching state.
- **Nothing is committed if anything failed.** A partial session is worse than
  no session, because the ledger is the evidence.

## The prompt

```text
You are running one scheduled shadow session for a policy-gated trading agent.
You have no prior context. Everything you need is in this repository.

SETUP
1. Work on the branch `trading-agent-phase2`, in the `trading-agent/` directory.
2. Read AGENT.md, POLICY.yaml and WATCHLIST.yaml in full before anything else.
   AGENT.md is your operating contract. Follow it exactly.
3. Confirm POLICY.yaml says `mode: shadow`. If it does not, stop and report.

HARD RULES
- Call READ-ONLY Robinhood tools only. Never call any tool that places,
  reviews, cancels or previews an order, and never modify a watchlist, alert
  or scan. If you find yourself reaching for one, stop and report.
- Never invent a number. If a required input is unavailable, the decision is
  NO_TRADE and the reason is recorded.
- Never edit POLICY.yaml or WATCHLIST.yaml.
- A growth or recovery target is never an input to a decision.

AUDIT YOUR TOOLS FIRST
Run ToolSearch for "+robinhood" and list every Robinhood tool available to you
in your final report. Only read-only tools should appear. If ANY tool that can
place, review, preview or cancel an order, or edit a watchlist, alert or scan,
is available, do not use it — and flag it prominently at the top of your
report, because it means the connector allowlist is not being enforced.

DID THE MARKET TRADE TODAY?
All dates here are America/New_York, never UTC — this routine can run after
midnight UTC while it is still the same trading day in New York.
1. Compute today's date in America/New_York.
2. Call get_equity_quotes on SPY and read quote.venue_last_trade_time — the
   last REGULAR-session trade. Convert it to America/New_York and take its date.
3. If that date is today's New York date, the market traded today: continue.
   Otherwise it did not (weekend or holiday): exit immediately, change
   nothing, commit nothing, and report "non-trading day, skipped".
Do NOT use close.date for this check. The official close is posted hours
after the session ends, so close.date still shows the previous day when this
routine runs, and using it would skip every single trading day while
reporting success. Do NOT run shadow.py on a non-trading day — a holiday must
not consume one of the twenty sessions.

SESSION
4. Market context. Pull ~130 daily closes for SPY and QQQ via
   get_equity_historicals, and VIX via get_indexes + get_index_quotes. Write
   them to runs/<YYYY-MM-DD>-market.json in the same shape as the existing
   file, then run `python3 context.py` on it. Attach the regime it returns to
   the session. Do not describe the regime in your own words.
5. Portfolio. get_accounts, then get_equity_positions on the account whose
   nickname is "Agentic". Never write an account number into any file.
6. Evidence. get_equity_quotes and get_equity_fundamentals for the watchlist
   symbols. Record the age of every quote.
7. Analysis. For each symbol produce a plan conforming exactly to
   schema/trade_plan.schema.json, following AGENT.md's six-step loop. Score
   conviction in the ACTION proposed, not the quality of the company. Write
   the session to runs/<YYYY-MM-DD>-shadow-NN.json with `portfolio` and
   `markets` blocks, as the existing shadow run file does.
8. Gate it: `uv run --with pyyaml python validate_run.py runs/<file>.json`
   then `uv run --with pyyaml python shadow.py runs/<file>.json`.
9. Settle any due forecasts: `python3 forecast.py due`. For each, fetch the
   current price and settle it. Register new forecasts only where the evidence
   supports a probability between 0.5 and 0.99 — abstain otherwise.
10. Append a JOURNAL.md entry in the established format: sources and
    freshness, per-symbol decisions, every abstention with its reason, and any
    anomaly.

BEFORE COMMITTING
11. `uv run --with pytest --with pyyaml python -m pytest tests/ -q`. All tests
    must pass.
12. `uv run --with pyyaml python report.py` and include its output in your
    summary.
13. If ANY step failed, or any test failed, commit NOTHING and report what
    went wrong. A partial session corrupts the evidence the shadow period
    exists to produce.
14. Otherwise commit and push to `trading-agent-phase2` with the message
    `chore(trading-agent): shadow session <YYYY-MM-DD>`.

REPORT
State: the regime, how many proposals passed or were rejected and why, any
abstentions, the shadow session count, and anything that looked wrong. Be
brief and do not claim success for anything you did not verify.
```

## Schedule

Weekdays at 19:10 UTC: 15:10 ET under daylight saving, 14:10 ET after it ends on
1 November. Both are inside regular hours with close to an hour of margin before
the 16:00 bell; a full session took about 13 minutes in testing.

`10 19 * * 1-5`

It runs **during** the session, not after it, for two reasons that the second
test run exposed:

- The policy rejects any quote older than 120 seconds. After the close every
  quote is hours old, so an after-close schedule would have rejected every
  proposal as stale on every run, and twenty sessions would have logged without
  one proposal ever passing the gate.
- `regular_hours_only: true`. Simulating fills against after-hours bid/ask (LULU
  was 98.83 bid against a 101.30 last) measures nothing real.

Earlier drafts used 20:40 UTC and then 21:10 UTC, both after the close.

## Routine wrapper

The scheduled routine does not duplicate the prompt above. It checks out this
branch and executes this file, so editing the prompt here takes effect on the
next run without touching the routine's configuration.
