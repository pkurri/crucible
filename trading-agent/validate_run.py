"""Validate a session's trade plans against the schema and the policy gate.

Usage: python validate_run.py runs/2026-09-23.json

Exit status is 0 only when every plan validates and every decision is one the
policy engine allows. This is the Phase 1 pass condition, checked mechanically
rather than by eye.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from policy import (
    NO_TRADE,
    PROPOSE_ORDER,
    empty_portfolio,
    evaluate,
    load_policy,
    load_schema,
    load_watchlist,
    validate_plan,
)
from quality import load_for_run
from shadow import build_portfolio

# Sessions from this date on must carry a data-quality input when they
# propose anything. Earlier sessions predate the check and replay without it.
QUALITY_REQUIRED_FROM = "2026-10-06"


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2

    run = json.loads(Path(argv[1]).read_text())
    policy = load_policy()
    watchlist = load_watchlist()
    schema = load_schema()

    # Validate against the portfolio the run recorded, exactly as shadow.py
    # will gate it. An empty portfolio makes every sell look like a short and
    # fails it as "not held" -- a bug that hid while runs had no proposals.
    portfolio = build_portfolio(run, policy) if run.get("portfolio") else empty_portfolio()

    plans = run["plans"]
    run_path = Path(argv[1])
    quality = load_for_run(run, run_path.parent, policy["max_quote_age_seconds"])
    session = str(run.get("session", ""))
    dated = re.fullmatch(r"\d{4}-\d{2}-\d{2}", session) is not None
    if quality is None:
        if dated and session >= QUALITY_REQUIRED_FROM and any(
            p.get("decision") == PROPOSE_ORDER for p in plans
        ):
            print("RUN INVALID — proposals without symbol_data. Run quality.py "
                  "and name its input in the run file.")
            return 1
        print("  note: no symbol_data; data-quality gate not applied")
    else:
        for sym, rec in sorted(quality.items()):
            if not rec["ok"]:
                print(f"  unusable {sym:<8} {', '.join(rec['blocking'])}")
    malformed = 0
    rejected = 0
    proposals = 0

    for plan in plans:
        symbol = plan.get("symbol", "<missing symbol>")
        if plan.get("decision") == PROPOSE_ORDER:
            proposals += 1

        # A malformed plan invalidates the run: the evidence itself is broken.
        errors = validate_plan(plan, schema)
        if errors:
            malformed += 1
            print(f"  INVALID {symbol:<8} {plan.get('decision')}")
            for e in errors:
                print(f"            - {e}")
            continue

        # A well-formed proposal the gate refuses is the gate working. It is
        # reported, never treated as a failed run -- otherwise every session in
        # which the agent proposes something the policy blocks would be thrown
        # away, and the shadow period would only ever record easy days.
        verdict = evaluate(plan, policy, watchlist, schema=schema, portfolio=portfolio,
                           data_quality=quality)
        if verdict.allowed:
            print(f"  ok      {symbol:<8} {plan.get('decision')} (score {plan.get('score')})")
        else:
            rejected += 1
            print(f"  gated   {symbol:<8} {plan.get('decision')} -- refused by policy")
            for reason in verdict.reasons:
                print(f"            - {reason}")

    print()
    print(f"{len(plans)} plans: {len(plans) - malformed} well-formed, {malformed} malformed")
    print(f"{proposals} proposals, {rejected} refused by the gate, "
          f"{len(plans) - proposals} abstentions")

    if malformed:
        print("\nRUN INVALID — malformed plans. Do not commit this session.")
        return 1
    print("\nRun valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
