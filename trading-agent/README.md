# Robinhood Trading Agent

A policy-driven market-analysis agent for a single Robinhood Agentic account,
built to the implementation playbook in `robinhood-trading-agent-guide.pdf`.

Currently in **Phase 2: shadow** (entered 2026-09-23). The agent reads market
and portfolio data, produces structured trade plans, and forms exact
hypothetical orders that are frozen, gated and simulated against the quote. It
has no order tools and places nothing.

Phase 1 closed with a validated research pass: 10 plans, 10 schema-valid, 0
proposals, 10 abstentions — see `runs/2026-09-23.json`.

**Entries and exits are gated differently.** The account holds 19 positions
against `max_positions: 1`, and its largest holding is ~49% against
`max_position_pct: 12`. Both are standing breaches, recorded deliberately rather
than papered over. The consequence: no buy passes the gate until they are cured,
and only exits can cure them. Raising a limit to admit a buy is forbidden.

This is a personal project. It is not part of the Crucible skill pack.

## Not a growth-target machine

There is no dollar target anywhere in this project, by design. Sizing comes from
`POLICY.yaml`, never from the model's confidence, and never from how far the
account is from a goal. A published strategy's median replicated Sharpe is 0.37
and roughly half of published strategies cannot be distinguished from zero —
assume an idea does not work until an out-of-sample backtest says otherwise.

## Layout

| Path                            | What it is                                                            |
| ------------------------------- | --------------------------------------------------------------------- |
| `AGENT.md`                      | The agent's operating contract: guardrails, workflow, output contract |
| `POLICY.yaml`                   | Hard limits. The agent may never edit this while running              |
| `WATCHLIST.yaml`                | The only universe the agent may analyze. Edit this yourself           |
| `policy.py`                     | Deterministic risk gate — pure functions, no model in the loop        |
| `context.py`                    | Market regime from fixed thresholds — step 2 of the analysis loop     |
| `backtest.py`                   | Walk-forward lab: fit on train, score only out-of-sample, gate on it  |
| `shadow.py`                     | Shadow session runner: freeze → gate → simulate → ledger              |
| `report.py`                     | Promotion readiness from the ledger — hard gates and quality rates    |
| `forecast.py`                   | Forecast register: state a probability, settle it, score calibration  |
| `validate_run.py`               | Checks a run file against schema and gate                             |
| `schema/trade_plan.schema.json` | Required shape of every decision                                      |
| `runs/`                         | One JSON file per analysis session                                    |
| `shadow_ledger.jsonl`           | Append-only record of every frozen proposal and simulated outcome     |
| `JOURNAL.md`                    | Append-only human-readable audit trail                                |
| `state.json`                    | Run counters, open proposal ids, anomalies                            |
| `tests/test_policy.py`          | Proves the gate rejects every forbidden case                          |

## Running a session

```bash
python context.py runs/2026-09-23-market.json          # establish the regime
python backtest.py runs/2026-09-23-market.json         # walk-forward a strategy
uv run --with pyyaml python validate_run.py runs/2026-09-23.json
uv run --with pyyaml python shadow.py runs/2026-09-23-shadow-01.json
uv run --with pyyaml python report.py                   # may we promote yet?
python forecast.py due                                  # anything to settle?
python forecast.py                                      # calibration record
```

`context.py` and `backtest.py` need only the standard library. `backtest.py`
exits non-zero when the strategy fails the gate, so it can sit in a pipeline.

`shadow.py` refuses to run in any mode other than `shadow`, and refuses again if
the mode could place orders. It reports policy bypasses and duplicate proposals
every session; a bypass fails the run and restarts the shadow period.

## Setup

The Robinhood Trading MCP is not configured in this repo. Connect it once, on a
desktop device (Robinhood requires desktop for authentication and Agentic
account opening):

```bash
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
```

Then run `/mcp`, select `robinhood-trading`, and authenticate. Confirm the
dedicated Agentic account appears and record its identifier privately — never in
this repo, a prompt, or the journal.

Note that Robinhood's read scope is wider than its trade scope: the connected AI
may read _all_ your Robinhood accounts, while it may only trade in the Agentic
one. Keep logs private accordingly.

Running the tests needs `pytest` and `pyyaml`:

```bash
uv run --with pytest --with pyyaml python -m pytest tests/ -q
```

## Running a research session

Point Claude at `AGENT.md` with the MCP connected and ask for a watchlist pass.
Good prompts:

- "Analyze only my approved watchlist. Rank evidence quality, not upside. Return
  no trade unless every required field is present."
- "For each current position, show concentration, catalyst risk, earnings
  proximity, thesis break, and one argument against holding it."

Prompts that break the contract — do not use these:

- "Find the best stock and make money today."
- "Trade until you recover yesterday's loss."
- "Do whatever is necessary; don't ask me again."

## Promotion gates

Each phase is a `mode` change in `POLICY.yaml`, and only after the evidence bar
below is met. Never loosen a limit to let a proposal through.

| Phase                  | `mode`               | Required before promotion                                                                           |
| ---------------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| 1 · Research           | `research_only`      | Outputs validate against the schema every run; no invented fields; abstention demonstrably works    |
| 2 · Shadow             | `shadow`             | ≥20 market sessions logged; zero policy bypasses, duplicate proposals, or unexplained state changes |
| 3 · Tiny live          | `tiny_live`          | Every order reconciles; journal complete; kill switch tested; no unintended trade                   |
| 4 · Limited automation | `limited_automation` | Separate written approval; monitoring proven; rollback rehearsed                                    |

The backtest lab (`backtest.py`) is built and wired in. No live capital until a
strategy survives walk-forward testing on data it never saw during development —
and note what the lab can currently do: with only months of history it can
**refute** a strategy, not confirm one. Demonstrating a Sharpe of 0.4 takes
roughly 24 years of data. Treat a "PASS" on short history with the same
suspicion as a failure.

## Kill switch

1. Disconnect the MCP (`claude mcp remove robinhood-trading`).
2. Cancel any open orders in the Robinhood app directly.
3. Set `mode: research_only` in `POLICY.yaml`.

## Current limits

Set in `POLICY.yaml` and enforced against every proposal from Phase 2 onward:

- Budget: $2,600 — treat as fully disposable
- Max order: $312, max position: 12% of account (smaller wins)
- One open position at a time, long equities only, limit orders only
- Daily loss limit: 3% of start-of-day account value
- Regular market hours only; no scheduled or unattended execution
- Shadow simulates against a notional $500 that exists only in the simulation —
  the real account holds $10.80 in cash and is untouched

Two of these are in standing breach (19 positions, ~49% concentration). That is
recorded, not resolved, and it is why no buy currently passes the gate.

---

This project is an implementation and risk-control plan, not investment advice.
Automated strategies can lose money quickly, and Robinhood holds you responsible
for orders an agent places.
