"""Shadow-mode session runner.

Freezes each proposal, runs it through the policy gate, simulates the fill,
and appends the result to the shadow ledger. It imports nothing that can
reach the broker: there is no code path from this file to an order tool.

Usage: python shadow.py runs/2026-09-24.json
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from policy import (
    BUY,
    NO_TRADE,
    PROPOSE_ORDER,
    SELL,
    evaluate,
    freeze,
    load_policy,
    load_schema,
    load_watchlist,
    may_place,
)

BASE_DIR = Path(__file__).parent
STATE_PATH = BASE_DIR / "state.json"
LEDGER_PATH = BASE_DIR / "shadow_ledger.jsonl"


def load_state() -> dict:
    return json.loads(STATE_PATH.read_text())


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2) + "\n")


def carry_forward(state: dict, current_session: str) -> list[dict]:
    """Proposals still live against a new session.

    A proposal is not live forever. A filled one is done. A good-for-day order
    dies at the close of the session that raised it, so an identical order on a
    later day is a NEW proposal, not a duplicate -- the duplicate gate exists to
    stop the same order running twice at once, not to ban a symbol for good.
    Only an unfilled GTC order survives into the next session.
    """
    live = []
    for p in state.get("open_proposals", []):
        if p.get("filled"):
            continue
        if p.get("tif") == "gfd" and p.get("session") != current_session:
            continue
        live.append(p)
    return live


def build_portfolio(run: dict, policy: dict) -> dict:
    """Portfolio as the gate should see it in shadow mode.

    Positions are the real ones -- they count toward limits by policy. Cash is
    the notional shadow balance, never the real balance, because the real
    account holds too little to exercise the buy path at all.
    """
    snap = run.get("portfolio") or {}
    return {
        "positions": {
            sym: {"quantity": float(p["quantity"]), "value": float(p["value"])}
            for sym, p in (snap.get("positions") or {}).items()
        },
        "equity_value": float(snap.get("equity_value", 0.0)),
        "cash": float(policy["shadow"]["notional_cash_usd"]),
        "unsettled_cash": 0.0,
    }


def simulate_fill(order: dict, market: dict | None) -> dict:
    """Would this limit order have filled at the quoted market?

    A buy fills when the ask is at or below the limit; a sell fills when the
    bid is at or above it. Without a two-sided quote the outcome is unknown,
    which is recorded as unknown rather than guessed.
    """
    if not market:
        return {"filled": None, "why": "no quote recorded; outcome unknown"}

    bid, ask = market.get("bid"), market.get("ask")
    limit = order["limit_price"]

    if order["action"] == BUY:
        if not ask:
            return {"filled": None, "why": "no ask recorded; outcome unknown"}
        ok = ask <= limit
        return {
            "filled": ok,
            "fill_price": ask if ok else None,
            "why": f"ask {ask} {'<=' if ok else '>'} limit {limit}",
        }

    if not bid:
        return {"filled": None, "why": "no bid recorded; outcome unknown"}
    ok = bid >= limit
    return {
        "filled": ok,
        "fill_price": bid if ok else None,
        "why": f"bid {bid} {'>=' if ok else '<'} limit {limit}",
    }


def run_session(run_path: Path) -> int:
    policy = load_policy()
    if policy["mode"] != "shadow":
        print(f"Refusing to run: mode is {policy['mode']!r}, not 'shadow'.")
        return 2
    if may_place(policy):
        print("Refusing to run: this mode can place orders. Shadow must not.")
        return 2

    run = json.loads(run_path.read_text())
    watchlist = load_watchlist()
    schema = load_schema()
    state = load_state()
    portfolio = build_portfolio(run, policy)
    live = carry_forward(state, run["session"])
    open_ids = tuple(p["id"] for p in live)
    expired = len(state.get("open_proposals", [])) - len(live)
    markets = run.get("markets") or {}

    stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    entries = []
    bypasses = 0
    duplicates = 0
    proposals = 0
    abstentions = 0

    for plan in run["plans"]:
        symbol = plan.get("symbol", "?")

        if plan.get("decision") == NO_TRADE:
            abstentions += 1
            print(f"  abstain  {symbol:<8} NO_TRADE")
            continue

        proposals += 1
        verdict = evaluate(
            plan,
            policy,
            watchlist,
            schema=schema,
            portfolio=portfolio,
            open_proposal_ids=open_ids,
        )
        order = plan.get("order") or {}
        pid = verdict.proposal_id or (freeze(order) if order else None)

        entry = {
            "session": run["session"],
            "recorded_utc": stamp,
            "symbol": symbol,
            "proposal_id": pid,
            "order": order,
            "score": plan.get("score"),
            "allowed": verdict.allowed,
            "reasons": list(verdict.reasons),
            "placed": False,
            "placement_enabled": False,
        }

        if any("duplicate proposal" in r for r in verdict.reasons):
            duplicates += 1

        if verdict.allowed:
            entry["simulated"] = simulate_fill(order, markets.get(symbol))
            side = "BUY " if order.get("action") == BUY else "SELL"
            fill = entry["simulated"]
            shown = {True: "filled", False: "no fill", None: "unknown"}[fill["filled"]]
            print(f"  pass     {symbol:<8} {side} {pid}  -> {shown} ({fill['why']})")
        else:
            entry["simulated"] = None
            print(f"  REJECT   {symbol:<8} {pid}")
            for r in verdict.reasons:
                print(f"             - {r}")

        entries.append(entry)

    # A bypass is an order recorded as placed while placement is disabled.
    # It must always be zero; the check exists so the ledger can prove it.
    for e in entries:
        if e["placed"] or e["placement_enabled"]:
            bypasses += 1

    with LEDGER_PATH.open("a") as fh:
        for e in entries:
            fh.write(json.dumps(e) + "\n")

    sessions = state.setdefault("sessions_completed", {})
    sessions["shadow"] = sessions.get("shadow", 0) + 1
    state["mode"] = policy["mode"]
    state["policy_version"] = policy["policy_version"]
    state["last_run_utc"] = stamp
    raised = [
        {
            "id": e["proposal_id"],
            "session": e["session"],
            "symbol": e["symbol"],
            "tif": (e["order"] or {}).get("time_in_force"),
            "filled": bool((e.get("simulated") or {}).get("filled")),
        }
        for e in entries
        if e["allowed"] and e["proposal_id"]
    ]
    state["open_proposals"] = live + raised
    state["open_proposal_ids"] = sorted({p["id"] for p in state["open_proposals"]})
    save_state(state)

    required = policy["shadow"]["sessions_required"]
    done = sessions["shadow"]

    print()
    print(f"{proposals} proposals, {abstentions} abstentions, "
          f"{sum(1 for e in entries if e['allowed'])} passed the gate")
    print(f"policy bypasses: {bypasses}   duplicate proposals: {duplicates}")
    if expired:
        print(f"expired from prior sessions: {expired} (GFD orders die at the close)")
    print(f"shadow sessions: {done} of {required} required before Phase 3")

    if bypasses:
        print("\nBYPASS DETECTED — shadow period must restart.")
        return 1
    return 0


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2
    return run_session(Path(argv[1]))


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
