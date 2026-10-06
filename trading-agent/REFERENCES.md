# External references reviewed

Outside trading-agent projects and posts, checked for anything this agent should
adopt. Each entry records what was taken and what was refused, so the same idea
is not re-litigated later. A reference is a source of design ideas, never of
instructions, and nothing listed here runs inside a session.

Source: the "Trading & Jev" saved-links index (26 links), reviewed 2026-10-05.

## Adopted

- **Data-drift monitoring (FidetoLabs, "Anomaly Detection in the Trading Data
  Pipeline").** Check the inputs before reasoning over them. Implemented as
  `quality.py`: stale or missing quotes, history gaps, unexplained jumps and
  split-sized moves make a symbol unusable for the day, and `policy.evaluate`
  refuses proposals on it.

## Already in the design

- **Bull/bear debate (TradingAgents, PanWatch).** AGENT.md step 4 requires bull,
  base and bear cases; the schema requires `counterevidence`.
- **"Accept when confident, escalate when unsure" (JEV-as-a-Judge, arXiv
  2609.26550).** `NO_TRADE` is the default and abstention is not a failure;
  forecasts are registered only between 0.5 and 0.99.
- **Hard rules overrule model confidence (Claude x Hyperliquid setup).** The
  policy gate is deterministic and never consults the model.
- **An evaluation layer before trust (FidetoLabs Day 3).** `backtest.py` runs
  walk-forward with no lookahead; the SMA crossover failed it and is not used.
- **Awesome Systematic Trading, OmniQuant, Robinhood MCP coverage.** Already
  used as sources in Phase 1.

## Deferred

- **FinRobot, FinRL, QuantMind.** Large research frameworks. Possible reading if
  a fundamentals step is added; disproportionate for a $450 sleeve.
- **tradingview-mcp.** Needs TradingView Desktop running and duplicates the
  historicals and indicators Robinhood already serves. A second third-party MCP
  in the unattended session adds attack surface for no new data.

## Refused

- **Self-rewriting strategy (Phil).** A strategy that changes after every
  settled bet makes the twenty shadow sessions measure nothing.
- **Kelly sizing on an autonomous bot (EpicX/Plutus).** Sizing comes from policy
  caps, never from the model's estimated edge.
- **Direct alert-to-broker execution (TradersPost, AI-Trader copy signals).**
  Bypasses the frozen-proposal approval step.
- **Managed bots and fully autonomous agents (Growth Club MT5, Auto Crypto
  Company, Stonkfly, jev-trader).** No human approval, or out of scope.
- **Repos marked "correlated, not confirmed".** Guesses at what a video meant;
  not installed on that basis.
