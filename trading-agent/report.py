"""Promotion-readiness report over the shadow ledger.

Answers one question from evidence rather than opinion: may this project be
promoted out of shadow? Every hard gate must pass and the session count must
be met. A single policy bypass fails the report outright and restarts the
shadow period.

The metric names follow the rollout plan's own list, so the report can be read
against it line by line.

Usage: python report.py
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

BASE_DIR = Path(__file__).parent
LEDGER_PATH = BASE_DIR / "shadow_ledger.jsonl"
STATE_PATH = BASE_DIR / "state.json"
POLICY_PATH = BASE_DIR / "POLICY.yaml"

# Reasons that indicate the agent tried to act on data it should have refused.
DATA_QUALITY_MARKERS = ("stale", "required to propose")

# Map a rejection reason onto the rule that produced it. Matched in order, so
# put the more specific patterns first. Aggregating on the rule rather than on
# the raw string keeps symbols, prices and ids out of the summary -- otherwise
# every rejection looks unique and the counts say nothing.
REASON_RULES: tuple[tuple[str, str], ...] = (
    ("duplicate proposal", "duplicate proposal"),
    ("not on the approved watchlist", "symbol off watchlist"),
    ("sizing comes from policy", "model tried to choose position size"),
    ("below threshold", "score below threshold"),
    ("quote is stale", "stale quote"),
    ("required to propose an order", "required field missing"),
    ("only exits are permitted", "position-count limit reached"),
    ("of the account, over", "concentration cap"),
    ("exceeds max_order_usd", "order-size cap"),
    ("exceeds available cash", "insufficient cash"),
    ("forbids shorting", "cannot sell what is not held"),
    ("available", "oversell: more than held"),
    ("daily loss", "daily loss limit"),
    ("does not permit order proposals", "mode forbids proposals"),
    ("is not the policy's", "wrong order type"),
    ("requires an 'order'", "PROPOSE_ORDER without an order object"),
    # Schema violations. A malformed plan is a different failure from a plan
    # the risk gate refuses, so it gets its own bucket rather than being
    # folded in with the policy rejections.
    ("missing required field", "schema: required field missing"),
    ("unknown field", "schema: unknown field"),
    ("must be one of", "schema: value outside the allowed set"),
    ("must be number", "schema: wrong type"),
    ("must be string", "schema: wrong type"),
    ("must be array", "schema: wrong type"),
    ("must be object", "schema: wrong type"),
    ("is shorter than", "schema: value too short"),
    ("needs at least", "schema: too few items"),
    ("does not match", "schema: pattern mismatch"),
    ("must be >", "schema: value out of range"),
    ("must be <", "schema: value out of range"),
)


def classify_reason(reason: str) -> str:
    for needle, rule in REASON_RULES:
        if needle in reason:
            return rule
    return "unclassified: " + reason[:48]


def load_ledger(path: Path = LEDGER_PATH) -> list[dict]:
    if not path.exists():
        return []
    rows = []
    for line in path.read_text().splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


def load_state(path: Path = STATE_PATH) -> dict:
    return json.loads(path.read_text()) if path.exists() else {}


def load_policy(path: Path = POLICY_PATH) -> dict:
    import yaml

    return yaml.safe_load(path.read_text())


def pct(n: int, d: int) -> float:
    return (n / d * 100) if d else 0.0


def analyze(rows: list[dict], state: dict, policy: dict) -> dict:
    sessions = sorted({r["session"] for r in rows})
    total = len(rows)
    allowed = [r for r in rows if r.get("allowed")]
    rejected = [r for r in rows if not r.get("allowed")]

    # --- hard gates: any failure here is disqualifying ---------------------
    bypasses = [r for r in rows if r.get("placed") or r.get("placement_enabled")]

    # Every row must carry a frozen id and an order; a row without one means
    # something reached the ledger without going through the freeze.
    unfrozen = [r for r in rows if not r.get("proposal_id") or not r.get("order")]

    # A passing proposal must have a recorded simulated outcome; a rejected
    # one must not. Either way round is an unexplained state change.
    unreconciled = [
        r
        for r in rows
        if (r.get("allowed") and r.get("simulated") is None)
        or ((not r.get("allowed")) and r.get("simulated") is not None)
    ]

    # --- counted metrics ---------------------------------------------------
    duplicates = [
        r for r in rejected
        if any("duplicate proposal" in x for x in r.get("reasons", []))
    ]
    stale_or_missing = [
        r for r in rejected
        if any(m in x for x in r.get("reasons", []) for m in DATA_QUALITY_MARKERS)
    ]

    reason_counts: Counter[str] = Counter()
    for r in rejected:
        for reason in r.get("reasons", []):
            reason_counts[classify_reason(reason)] += 1

    sim = [r.get("simulated") or {} for r in allowed]
    fills = [s for s in sim if s.get("filled") is True]
    no_fills = [s for s in sim if s.get("filled") is False]
    unknown = [s for s in sim if s.get("filled") is None]

    buys = [r for r in rows if (r.get("order") or {}).get("action") == "buy"]
    sells = [r for r in rows if (r.get("order") or {}).get("action") == "sell"]

    done = state.get("sessions_completed", {}).get("shadow", 0)
    required = policy.get("shadow", {}).get("sessions_required", 20)

    hard_gates = [
        ("zero policy bypasses", len(bypasses) == 0, f"{len(bypasses)} found"),
        ("every proposal frozen", len(unfrozen) == 0, f"{len(unfrozen)} unfrozen"),
        (
            "every outcome reconciled",
            len(unreconciled) == 0,
            f"{len(unreconciled)} unreconciled",
        ),
        (
            "placement disabled throughout",
            all(r.get("placement_enabled") is False for r in rows),
            "a row reported placement enabled",
        ),
        (
            f"{required} shadow sessions logged",
            done >= required,
            f"{done} of {required}",
        ),
    ]

    return {
        "sessions": sessions,
        "sessions_done": done,
        "sessions_required": required,
        "rows": total,
        "allowed": len(allowed),
        "rejected": len(rejected),
        "buys": len(buys),
        "sells": len(sells),
        "bypasses": len(bypasses),
        "duplicates": len(duplicates),
        "stale_or_missing": len(stale_or_missing),
        "unfrozen": len(unfrozen),
        "unreconciled": len(unreconciled),
        "fills": len(fills),
        "no_fills": len(no_fills),
        "unknown_fills": len(unknown),
        "reason_counts": reason_counts,
        "hard_gates": hard_gates,
        "anomalies": state.get("anomalies", []),
        "ready": all(ok for _, ok, _ in hard_gates),
    }


def render(a: dict) -> str:
    L = []
    L.append("SHADOW PERIOD — PROMOTION READINESS")
    L.append("=" * 52)
    L.append("")
    L.append(f"sessions logged     {a['sessions_done']} of {a['sessions_required']}")
    L.append(f"ledger rows         {a['rows']}  ({a['buys']} buy, {a['sells']} sell)")
    L.append(f"passed the gate     {a['allowed']}")
    L.append(f"rejected            {a['rejected']}")
    L.append("")

    L.append("HARD GATES")
    for name, ok, detail in a["hard_gates"]:
        mark = "PASS" if ok else "FAIL"
        L.append(f"  [{mark}] {name:<34} {'' if ok else detail}")
    L.append("")

    L.append("AGENT QUALITY")
    rows, rejected = a["rows"], a["rejected"]
    L.append(f"  policy rejection rate      {pct(rejected, rows):5.1f}%  "
             f"({rejected}/{rows})")
    L.append(f"  duplicate proposal rate    {pct(a['duplicates'], rows):5.1f}%  "
             f"({a['duplicates']}/{rows})")
    L.append(f"  missing/stale-data rate    {pct(a['stale_or_missing'], rows):5.1f}%  "
             f"({a['stale_or_missing']}/{rows})")
    L.append(f"  unreconciled outcomes      {pct(a['unreconciled'], rows):5.1f}%  "
             f"({a['unreconciled']}/{rows})")
    L.append("")

    L.append("SIMULATED OUTCOMES (proposals that passed)")
    allowed = a["allowed"]
    L.append(f"  filled                     {a['fills']}  "
             f"({pct(a['fills'], allowed):.0f}% of passing)")
    L.append(f"  did not fill               {a['no_fills']}")
    if a["unknown_fills"]:
        L.append(f"  outcome unknown            {a['unknown_fills']}  "
                 "(no two-sided quote recorded)")
    L.append("")

    if a["reason_counts"]:
        L.append("WHY PROPOSALS WERE REJECTED")
        for reason, n in a["reason_counts"].most_common():
            L.append(f"  {n:>3}x  {reason}")
        L.append("")

    if a["anomalies"]:
        L.append("RECORDED ANOMALIES")
        for an in a["anomalies"]:
            counts = an.get("counts_toward_shadow_period")
            tag = "" if counts is None else f"  [counts: {counts}]"
            L.append(f"  {an.get('utc', '?')}{tag}")
            note = an.get("note", "")
            for i in range(0, len(note), 68):
                L.append(f"    {note[i:i + 68]}")
        L.append("")

    L.append("=" * 52)
    if a["ready"]:
        L.append("VERDICT: shadow evidence bar met. Phase 3 may be considered.")
        L.append("Promotion still requires a deliberate mode change and the")
        L.append("kill switch rehearsed.")
    else:
        missing = [n for n, ok, _ in a["hard_gates"] if not ok]
        L.append("VERDICT: NOT READY. Outstanding:")
        for m in missing:
            L.append(f"  - {m}")
    return "\n".join(L)


def main(argv: list[str]) -> int:
    rows = load_ledger()
    if not rows:
        print("No ledger rows yet. Run shadow.py on a session first.")
        return 2
    a = analyze(rows, load_state(), load_policy())
    print(render(a))
    return 0 if a["ready"] else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
