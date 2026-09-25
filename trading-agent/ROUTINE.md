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

IS THE MARKET OPEN TODAY?
Call get_equity_quotes on SPY. If `close.date` is not today's date, the market
did not trade today. Exit immediately: change nothing, commit nothing, and
report "non-trading day, skipped". Do NOT run shadow.py — a holiday must not
consume one of the twenty sessions.

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

Weekdays, shortly after the US close (16:00 ET), so the session sees a full
trading day. 16:40 ET = 20:40 UTC → `40 20 * * 1-5`.

Running after the close rather than during the session also means quotes are
settled rather than moving underneath the analysis.
