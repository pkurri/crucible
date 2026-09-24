"""Validate a session's trade plans against the schema and the policy gate.

Usage: python validate_run.py runs/2026-09-23.json

Exit status is 0 only when every plan validates and every decision is one the
policy engine allows. This is the Phase 1 pass condition, checked mechanically
rather than by eye.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from policy import (
    NO_TRADE,
    PROPOSE_ORDER,
    evaluate,
    load_policy,
    load_schema,
    load_watchlist,
)


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2

    run = json.loads(Path(argv[1]).read_text())
    policy = load_policy()
    watchlist = load_watchlist()
    schema = load_schema()

    plans = run["plans"]
    failures = 0
    proposals = 0

    for plan in plans:
        symbol = plan.get("symbol", "<missing symbol>")
        verdict = evaluate(plan, policy, watchlist, schema=schema)
        if plan.get("decision") == PROPOSE_ORDER:
            proposals += 1
        if verdict.allowed:
            print(f"  ok      {symbol:<8} {plan.get('decision')} (score {plan.get('score')})")
        else:
            failures += 1
            print(f"  FAILED  {symbol:<8} {plan.get('decision')}")
            for reason in verdict.reasons:
                print(f"            - {reason}")

    print()
    print(f"{len(plans)} plans, {len(plans) - failures} valid, {failures} failed")
    print(f"{proposals} proposals, {len(plans) - proposals} abstentions")

    if failures:
        print("\nRUN INVALID — Phase 1 pass condition not met.")
        return 1

    if proposals == 0:
        print("\nRun valid. Every plan abstained; abstention path exercised.")
    else:
        print("\nRun valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
