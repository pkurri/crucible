# Journal

Append-only. One entry per analysis session, newest at the bottom. Never record
account numbers, balances, or transaction history here — reference the account
by role only.

Entry template:

```text
## YYYY-MM-DD HH:MM ET — <market session>

- agent/policy version: <agent> / <policy_version>
- data sources + freshness: <tools used, max quote age observed>
- symbols analyzed: <list>
- decisions: <SYMBOL: NO_TRADE|PROPOSE_ORDER (score)>
- abstentions + reasons: <symbol: why>
- anomalies: <stale data, tool errors, unexpected state, or "none">
```

---

<!-- entries below -->

## 2026-09-23 14:47 ET — regular session

- agent/policy version: AGENT.md Phase 1 / policy 1.0.0
- data sources + freshness: `get_accounts`, `get_portfolio`,
  `get_equity_positions`, `get_equity_quotes` on the Agentic account; quotes
  live, max observed age under 60s
- symbols analyzed: 19 held positions, universe review only
- decisions: NO_TRADE on all 19 — mode is `research_only` and no order tool
  exists in this phase
- watchlist rebuilt: 10 analyzable holdings retained; 3 bankruptcy shells, 1
  sub-$1 microcap, and 5 daily-rebalanced leveraged/inverse products moved to
  documented exclusion lists
- abstentions + reasons: user requested a liquidate-and-rotate plan framed as
  covering prior losses. Declined per the recover-losses guardrail; the prior
  loss is not an input to any forward decision. Position-quality review
  delivered instead.
- anomalies: account state contradicts three POLICY.yaml assumptions — 19 open
  positions against `max_positions: 1`, largest holding near 49% of equity
  against `max_position_pct: 12`, and the Agentic account is limited_margin
  rather than the cash account the pilot assumed. Flagged to user; policy not
  edited by the agent.

## 2026-09-23 15:34 ET — regular session

- agent/policy version: AGENT.md Phase 1 / policy 1.0.0 / watchlist 2.0.0
- data sources + freshness: `get_equity_tradability`, `get_equity_fundamentals`
  on the 10 watchlist names; quotes from the prior pass, max age 18s
- symbols analyzed: LULU, FUBO, PSFE, IONQ, QS, NIO, SPCE, AMC, LCID, RVII
- decisions: NO_TRADE on all 10. Output written to `runs/2026-09-23.json` and
  validated with `validate_run.py` — 10 plans, 10 schema-valid, 0 failed, 0
  proposals, 10 abstentions
- scores: LULU 58 (highest) down to RVII 0. None cleared the configured
  threshold of 70, so abstention was reached on the merits rather than only by
  the research_only mode gate
- abstentions + reasons: LCID and AMC hard-stopped on negative stated book value
  (P/B -1.61 and -1.82). IONQ stopped on a 3.6x volume spike with no retrieved
  cause — analyzing it would have required inventing a reason. FUBO's P/E of
  2.35 is almost certainly a one-time gain, unverifiable without the income
  statement. QS and SPCE are pre-revenue, so the fundamental workflow has no
  earnings to read. NIO carries ADR risk this workflow cannot price. LULU scored
  best on a single-digit P/E but has no dated catalyst and made a new 52-week
  low six sessions ago.
- watchlist correction: RVII removed. It is a closed-end BDC, not an operating
  company — no P/E, no employees, no CEO reported. The v2.0 watchlist was wrong
  to include it; caught by the first real analysis pass.
- self-correction: an earlier draft of the PSFE plan claimed its volume failed
  the liquid-universe rule. At the $312 policy order size, 330k shares/day on a
  0.3% spread is ample. The claim was overstated and was removed before the run
  was journaled.
- anomalies: no broad-market, volatility or sector series was pulled, so step 2
  (context) of the analysis loop was not satisfied this session. Recorded on
  every plan as a data-quality limitation rather than assumed away. This is a
  gap to close before the shadow period begins.

## 2026-09-23 15:42 ET — Phase 1 closed, Phase 2 entered

- Phase 1 pass condition met: `runs/2026-09-23.json` validated 10/10 against the
  schema with 0 proposals and 10 abstentions. Abstention was reached on the
  merits — the top score was 58 against a threshold of 70 — not only by the mode
  gate.
- User decisions recorded: existing holdings count toward every limit; shadow
  mode simulates against a notional $500 that exists nowhere but the simulation;
  the account is recorded as limited margin with settlement modelled and margin
  borrowing explicitly disabled.
- Policy 1.0.0 → 2.0.0, mode `research_only` → `shadow`.
- Engine change: entries and exits now gate differently. Exposure limits
  (position count, concentration, order size, cash) constrain only
  exposure-adding proposals, because a sell that reduces exposure cannot breach
  an exposure cap. Exits are still bound by watchlist, staleness, score,
  duplicates and the daily loss limit, and cannot short. This is what lets the
  agent work an account that is already over its limits without either loosening
  a limit or being frozen.
- Standing breaches, recorded not papered over: 19 positions against a cap of 1,
  and NAIL at ~49% against a cap of 12%. No buy can pass the gate until they are
  cured.
- Proposal freezing added: a SHA-256 over symbol, action, order type, quantity,
  limit price and time-in-force. Any change to those produces a different id,
  invalidating any prior approval.
- Score semantics clarified in AGENT.md: the score measures conviction in the
  action proposed, not the quality of the company. LCID scores 18 as a holding
  and 84 as an exit; both are true, and they are claims about different actions.
- Tests: 121 → 152, covering exit-vs-entry asymmetry, freezing, duplicates,
  settlement, and the shipped config.

## 2026-09-23 15:42 ET — shadow session 01

- run file: `runs/2026-09-23-shadow-01.json`; ledger: `shadow_ledger.jsonl`
- 3 proposals, 1 abstention, 2 passed the gate, 0 policy bypasses
- LCID sell 2.1 @ 4.14 (`eb5e57c1b84d18d4`) — passed, simulated filled, bid
  4.15 >= limit 4.14
- AMC sell 46.54036 @ 2.90 (`d9bb337d0e95d81f`) — passed, simulated no fill, bid
  2.87 < limit 2.90. A limit set above the bid is expected not to fill; recorded
  rather than retried at a worse price.
- LULU buy 3 @ 102.00 (`5aac3006cd3f6448`) — rejected on three independent
  grounds at once: score 58 below the threshold of 70, 19 open positions against
  the cap of 1, and the position would be 21.7% of the account against the 12%
  cap. This is the intended behaviour, not a failure.
- IONQ — NO_TRADE, volume spike cause still unretrieved.
- verification: `shadow.py` was re-run on the same file to exercise the
  duplicate gate. Both open proposals were correctly rejected as duplicates. The
  session counter self-incremented to 2 and was corrected back to 1 by hand —
  re-running one session file is not a second market session. Recorded in
  `state.json` anomalies with `counts_toward_shadow_period: false`.
- anomalies: step 2 (context) still unsatisfied — no broad-market, volatility or
  sector series pulled. Carried forward as an open Phase 2 task. Also
  outstanding: the backtest lab the rollout plan requires between the thesis
  engine and the risk gate.
- shadow sessions: 1 of 20.

## 2026-09-23 16:05 ET — context gap closed

- `context.py` added: step 2 of the analysis loop is now a computation, not a
  narration. Fixed thresholds (VIX buckets at 15/20/30, a ±1% neutral band
  around the 50-day mean, shock at a 2% session move or VIX 25) so the same data
  always yields the same regime. Changing one means bumping `RULES_VERSION` and
  saying so here.
- Market data recorded to `runs/2026-09-23-market.json`: 128 daily SPY and QQQ
  closes from 2026-03-20 via `get_equity_historicals`, plus VIX 15.23 from
  `get_index_quotes`. Live index levels at capture: SPX 7704.34, NDX 30458.30.
- Regime for this session: **uptrend, +1.68% above the 50-day mean; volatility
  normal (VIX 15.23); risk appetite risk-on; 0.58% off the period high; no event
  shock; entries supported.**
- Consequence recorded honestly: the LULU buy rejected in shadow session 01 was
  _not_ rejected because of the regime. The regime supports entries. It failed
  on score, position count and concentration — which is the stricter and correct
  reason.
- AGENT.md now forbids describing the regime in prose, and blocks any buy
  proposal when `entries_supported` is false.

## 2026-09-23 16:18 ET — backtest lab built, first strategy failed

- `backtest.py` added: walk-forward harness, standard library only. Fits a
  parameter grid on a training window, scores only on the window that follows,
  and stitches the out-of-sample folds into the one result that may support a
  proposal.
- Gate: out-of-sample Sharpe ≥ 0.5, |t-stat| ≥ 1.96, max drawdown ≤ 35%, and at
  least 10 trades. A failure reads "not shown to work", never "nearly works".
- **Bug found and fixed before any result was recorded.** The first
  implementation sliced the test window to 21 bars and handed only that slice to
  the strategy, so a 30- or 50-day mean could never warm up and every fold
  returned zero trades. The gate caught it as "0 trades" rather than letting a
  plausible-looking number through. `run_positions` now takes scoring bounds
  while the strategy still sees full history to each decision point.
- First strategy through the lab — SMA crossover on SPY, grid of fast (5/10/20)
  against slow (30/50), train 60 / test 20, three folds:

  | fold | params | in-sample Sharpe | out-of-sample Sharpe |
  | ---- | ------ | ---------------- | -------------------- |
  | 0    | 10/30  | +1.70            | −3.90                |
  | 1    | 10/30  | +0.91            | −0.75                |
  | 2    | 20/50  | +0.84            | −2.50                |

  Stitched out-of-sample: −3.98% return, Sharpe −2.27, t-stat −1.11, 3 trades.
  Buy-and-hold over the same closes returned +19.24% at Sharpe 2.65.

- **GATE: FAIL.** Positive in-sample on every fold, negative out-of-sample on
  every fold — the overfitting signature the lab exists to catch, found on the
  very first strategy tried.
- Honest caveat, recorded so it is not forgotten: 60 out-of-sample bars proves
  nothing in either direction. The t-stat of −1.11 means even the negative
  result is not significant. Per the replication literature, demonstrating a
  Sharpe of 0.4 needs roughly 24 years of data. This lab can currently refute a
  strategy, not confirm one. Treat every "PASS" from it on short history with
  the same suspicion.
- Tests: 152 → 200. New coverage includes a no-lookahead proof (the strategy is
  asserted to see exactly i+1 closes at decision i, never the bar it is paid
  on), the "high Sharpe on twelve bars still fails" trap, walk-forward window
  disjointness, and both recorded real-data results pinned as regression tests.

## 2026-09-23 16:40 ET — promotion readiness report

- `report.py` added. Reads the ledger and `state.json` and answers one question
  from evidence: may this be promoted out of shadow? Five hard gates (zero
  bypasses, every proposal frozen, every outcome reconciled, placement disabled
  throughout, session count met) plus the rollout plan's own agent-quality
  rates.
- Current verdict: **NOT READY — 1 of 20 sessions.** Four of the five hard gates
  already pass; the outstanding one is time, not defect. Zero bypasses, zero
  unfrozen proposals, zero unreconciled outcomes.
- Rejection reasons aggregate by _rule_, not by raw string. A first cut grouped
  on naive string splits and produced nonsense labels like "2x LULU" and "2x
  score 58" — leaking symbols and figures into what should be a rule tally, and
  making every rejection look unique.
- **A test caught a real gap while being written.**
  `test_no_reason_is_unclassified` drives every rejection path in `policy.py`
  and asserts the report can name each reason it gets back. It failed
  immediately on schema type errors ("'score' must be number, got NoneType"),
  which had no bucket. Schema violations are now their own category — a
  malformed plan is a different failure from one the risk gate refuses on merit.
  The test exists because a reworded message in `policy.py` would otherwise
  silently degrade the promotion summary to "unclassified" with nothing going
  red.
- Tests: 200 → 220.
- Standing note on cadence: a market session is a trading day. One session is
  logged for 2026-09-23, and no second session can honestly be run today.
  Sessions 02 through 20 are calendar-bound, not effort-bound.

## 2026-09-23 17:05 ET — forecast register opened

- Checked whether anything could be pulled from OmniQuant. It has **no public
  API, no export and no developer docs** — a $9.99/month web-only product. So
  nothing to integrate. What is worth taking is its method, which the playbook
  recommended for exactly this: "probabilities, not promises", forecasts
  "settled against the tape and published, right or wrong", and an explicit
  ABSTAIN tier alongside HIGH/MEDIUM/LOW.
- This exposed a real hole. The shadow ledger records whether an **order would
  have filled**. It says nothing about whether the **analysis was right**. The
  `confidence: low|medium|high` field is a narrative label, not a claim that can
  ever be scored. Twenty shadow sessions on that basis would prove the agent
  obeys its policy and nothing about the quality of its thinking.
- The fix had to happen before the remaining 19 sessions, not after: calibration
  cannot be reconstructed retrospectively. A probability stated once the outcome
  is known is not a forecast.
- `forecast.py` added. A forecast carries symbol, direction, probability,
  horizon, reference price and a settlement date, and **refuses to settle before
  that date**. Scoring is Brier plus a calibration table (stated against
  realized, bucketed), directional accuracy, and a weakest-symbols list that is
  published rather than suppressed.
- Two deliberate constraints on what may be registered: probability must sit in
  [0.5, 0.99] — below 0.5 you are forecasting the opposite direction and should
  say so, and 1.0 is not a forecast but a claim of certainty. A realized move
  inside ±1% settles as flat, so a directional call on a quiet fortnight is a
  miss.
- **First cohort registered**, 8 forecasts at a 14-day horizon, settling
  2026-10-07, referenced to regular-session last trades:

  | symbol | call | p    | reference |
  | ------ | ---- | ---- | --------- |
  | LCID   | down | 0.58 | 4.16      |
  | AMC    | down | 0.57 | 2.865     |
  | SPCE   | down | 0.57 | 3.12      |
  | QS     | down | 0.55 | 4.91      |
  | NIO    | down | 0.55 | 3.665     |
  | LULU   | up   | 0.55 | 102.32    |
  | FUBO   | up   | 0.55 | 9.635     |
  | PSFE   | up   | 0.54 | 6.43      |

- The probabilities are deliberately close to a coin flip, because that is the
  honest state of the evidence. If there is no edge here the Brier score will
  land at or above 0.25 and the report will say so in those words. Claiming 0.8
  would look better today and be exposed as overconfidence in three weeks.
- IONQ was **not** forecast. Its 3.6x volume spike had no retrievable cause, so
  there is nothing to attach a probability to. That is the ABSTAIN tier working
  in the register as well as in the gate.
- Tests: 220 → 265, including refusal to settle early, refusal to settle twice,
  flat-band edges, and that confidently-wrong scores ~0.90 on Brier while a coin
  flipper scores exactly 0.25.
- Nothing can be claimed about accuracy until 2026-10-07, and the report says so
  rather than showing an empty table.

## 2026-09-24 09:25 ET — pre-market; proposal lifecycle bug fixed

- Robinhood MCP reconnected, now as the locally registered `robinhood-trading`
  server rather than the claude.ai connector. The published console artifact
  still declares the connector, which is the right dependency for a page running
  in the claude.ai viewer; left unchanged.
- **Session 02 not run.** It is 09:25 ET, pre-market, and `regular_hours_only`
  is true. Beyond the rule, the pre-market book is not simulatable: PSFE quotes
  6.11 / 7.00, a 14% spread, and FUBO 9.56 / 10.00. Filling against those would
  manufacture outcomes rather than measure them.
- **Bug found before it could corrupt the record.** `open_proposal_ids`
  accumulated without expiry, so yesterday's two GFD proposals were still listed
  as open. An identical order today would have been rejected as a duplicate —
  and over twenty sessions the duplicate rate would have climbed toward
  meaningless while genuinely new proposals were silently blocked.
- The rule now: a filled proposal is done; a good-for-day order dies at the
  close of the session that raised it; only an unfilled GTC survives. The
  duplicate gate exists to stop the same order running twice at once, not to ban
  a symbol for good.
- `state.json` migrated from the ledger into richer `open_proposals` records
  carrying session, symbol, time-in-force and fill status. Both of yesterday's
  entries now correctly expire: LCID because it filled, AMC because its GFD
  expired. Nothing in the ledger was altered — the rows are the record.
- Recorded in `state.json` anomalies with `counts_toward_shadow_period: false`.
- Tests: 265 → 275. New coverage: GFD expiry across a session boundary, GFD
  still live within its own session, unfilled GTC surviving, filled GTC still
  closing, and an assertion against the shipped state that yesterday's proposals
  cannot block today's.
- shadow sessions: still 1 of 20. Session 02 can run after the 09:30 open.

## 2026-09-24 09:40 ET — policy 3.0.0: asset classes, sleeve, position count

User chose the index-core-plus-agent-sleeve structure, asset-class-aware caps,
and setting the position count deliberately now. All three implemented.

- **Position count 1 → 4**, set with nothing pending: two diversified core funds
  plus two agent positions. The rule against loosening a limit is about not
  bending one to admit a specific blocked order; choosing a number that fits the
  intended structure, in advance, is design. The distinction is the whole point
  and is written into POLICY.yaml so a later reader sees which kind of change
  this was.
- **Caps now differ by asset class.** A 500-company index fund and a penny stock
  are not the same risk, and one number for both flagged the safest available
  holding as the riskiest thing in the account. Single names stay at 12%; broad
  index and treasury funds get 85%. Membership is an explicit list in
  `WATCHLIST.yaml` under `diversified_funds`, not a heuristic — a sector or
  thematic ETF is a single bet wearing a fund's clothing and stays a single
  name. Leveraged products remain excluded outright.
- **Agent sleeve, $450.** Single-name exposure the agent opens is capped
  independently of the account, so the index core can never be drawn down by an
  agent decision. The playbook's framing: a dedicated, capped-risk experiment,
  not a connection to the whole portfolio.
- **A test caught a design question I had not settled.** `max_order_usd: 312`
  refuses a $700 VOO order, which failed my first draft test. The gate was right
  and the test was wrong: a ~$2,000 index core is the _user's_ purchase, made
  manually, and an agent able to move core-sized money is precisely the
  unbounded-blast-radius case. The order cap binds funds too. That invariant now
  has its own test rather than being an accident of configuration.
- Policy 2.0.0 → 3.0.0, watchlist 2.0.0 → 3.0.0.
- Tests: 275 → 294.
- Unchanged: mode is still `shadow`, placement still disabled, no order has been
  placed, and the 19 legacy positions remain a standing breach against the new
  count of 4 exactly as they were against 1.

## 2026-09-25 21:10 ET — routine created; test exposed a silent failure

- Cloud routine `trig_01Lg2i92vgz7TDsFaTinecYX` created, disabled pending
  verification. It checks out `trading-agent-phase2` and executes `ROUTINE.md`,
  so prompt edits take effect without reconfiguring it.
- Creating it auto-attached every claude.ai connector on the account (Gmail,
  publora, apify, Gamma and more). Stripped to Robinhood only, and Robinhood
  restricted via `permitted_tools` to nine read-only tools. Whether the platform
  enforces that list is not yet verified; every run now reports the tools it can
  see so the allowlist is audited each time.
- **Test run `cse_01JkhijDtSvGJE5D7EwfV5LH` found a bug that would have silently
  voided the whole shadow period.** The holiday check compared SPY's
  `close.date` with today's date. The official close is posted hours late: close
  to five hours after Friday's close, `close.date` still read 2026-09-24. The
  schedule fires 70 minutes after the close, so every weekday would have been
  skipped as a "non-trading day" and reported as success. The run also evaluated
  "today" in UTC, and it was already Saturday in UTC.
- Fixed: dates are now always America/New_York, and the check uses SPY's last
  regular-session trade time (`venue_last_trade_time`), which correctly showed
  Friday 19:59:59 UTC.
- The run itself behaved correctly under the rule it was given: one read-only
  call, no files changed, nothing committed. `uv` 0.8.17 is present in the cloud
  image. Push access from the cloud is still unverified because no commit was
  attempted.
- shadow sessions: still 1 of 20.

## 2026-09-25 22:05 ET — test run 2: two more bugs, one security finding

Run `cse_017o7f3eHCK31i6iZSEgdfUy`, 13 minutes, fired manually after the close
on a real trading day. It committed nothing, which is correct under its rules,
so session 02 is **not** recorded. Still 1 of 20.

- **Security: the connector allowlist is not enforced.** The run's tool audit
  found Robinhood's full write-capable toolset available, including
  `place_equity_order` and every cancel and watchlist-write tool, despite
  `permitted_tools` listing nine read-only tools. The run called none of them.
  An attempt to use `tool_policy_overrides` instead was abandoned: the API
  accepted fields and then silently dropped them, so any override was of unknown
  effect and was cleared. The routine stays **disabled** until this has a
  verified answer.
- **Schedule contradicted the freshness gate.** Running after the close made
  every quote ~21,000 seconds old against a 120-second limit; both exit
  proposals (LCID, AMC) were rejected as stale. Every after-close run would have
  done the same. It also broke `regular_hours_only`. Schedule moved to 19:10
  UTC, inside market hours year-round.
- **`validate_run.py` checked plans against an empty portfolio**, so every sell
  failed as "not held". Hidden until now because Phase 1 runs had no proposals.
  The cloud agent found it and confirmed it reproduced on session 01's file.
- **Found while fixing that:** `validate_run.py` also treated a gate refusal as
  an invalid run. Combined with the routine's commit-nothing-on-failure rule,
  every session in which the agent proposed something the policy refused would
  have been discarded, leaving the shadow period to record only easy days. Now
  only malformed plans invalidate a run; refusals are reported.
- The agent's analysis used quarterly financials for the first time: LCID exit
  scored 83 (negative book, widening losses), AMC 72 (negative book, narrowing
  losses). Regime: chop, +0.79% vs 50d, VIX 14.87. QS reports 2026-10-21 pm —
  the watchlist's first dated catalyst.
- It resisted a stop hook demanding a commit, holding to the routine's rule. Its
  push-notification tool errored in the cloud environment.
- Tests: 294 → 299.
