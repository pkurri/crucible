"""Step 3a of the analysis loop: check the evidence before trusting it.

Pure functions over the quotes and daily bars the session pulled. A model
reasons fluently over a bad number -- a stale quote, a split the history was
not adjusted for, a missing week of bars -- and the policy gate cannot tell,
because it only sees the plan. This module looks at the inputs themselves and
marks a symbol unusable for the day when they do not hold together.

A blocking flag stops any proposal on that symbol; it never stops abstaining.
Missing data is a flag, not a default: a symbol with no record is refused.

Thresholds are conventions. Changing one means bumping RULES_VERSION and
saying so in the journal, as with context.py.
"""

from __future__ import annotations

import json
import math
import statistics
import sys
from datetime import date
from pathlib import Path
from typing import Any

RULES_VERSION = "1.0.0"

# Enough sessions to estimate normal daily movement.
MIN_BARS = 21
# Consecutive daily bars further apart than this mean sessions are missing.
# Four calendar days covers a weekend next to a single-day holiday.
MAX_BAR_GAP_DAYS = 4
# The newest bar must be this recent relative to the session date.
MAX_HISTORY_AGE_DAYS = 5
# A move from the last close counts as a jump only if it is this many times
# the symbol's own recent daily volatility AND at least this large in absolute
# terms, so quiet names are not flagged for ordinary noise.
JUMP_SIGMAS = 4.0
JUMP_FLOOR_PCT = 5.0
# A move this large is treated as a likely data error (unadjusted split,
# wrong instrument) and blocks even when a catalyst is confirmed.
SPLIT_SUSPECT_PCT = 40.0

BLOCKING = {
    "missing_quote",
    "bad_price",
    "stale_quote",
    "insufficient_history",
    "history_gap",
    "history_stale",
    "unexplained_jump",
    "split_suspect",
}


def daily_sigma_pct(closes: list[float]) -> float | None:
    """Standard deviation of daily log returns over the last 20 sessions, in %."""
    window = closes[-(MIN_BARS):]
    if len(window) < MIN_BARS or any(c <= 0 for c in window):
        return None
    rets = [math.log(b / a) for a, b in zip(window, window[1:])]
    return statistics.stdev(rets) * 100


def largest_gap_days(dates: list[date]) -> int:
    return max(((b - a).days for a, b in zip(dates, dates[1:])), default=0)


def check_symbol(
    record: dict[str, Any] | None,
    session: date,
    max_quote_age_seconds: float,
) -> dict[str, Any]:
    """Return {ok, flags, blocking, ...} for one symbol's pulled data."""
    flags: list[str] = []
    out: dict[str, Any] = {"move_pct": None, "sigma_pct": None, "bars": 0}

    if not record:
        flags.append("missing_quote")
        return _finish(out, flags)

    price = record.get("last_price")
    age = record.get("quote_age_seconds")
    bars = record.get("bars") or []
    out["bars"] = len(bars)

    if price is None or age is None:
        flags.append("missing_quote")
    elif age > max_quote_age_seconds:
        flags.append("stale_quote")

    closes = [b.get("close") for b in bars]
    if (price is not None and price <= 0) or any(c is None or c <= 0 for c in closes):
        flags.append("bad_price")
        return _finish(out, flags)

    if len(bars) < MIN_BARS:
        flags.append("insufficient_history")
    else:
        dates = [date.fromisoformat(b["date"]) for b in bars]
        if dates != sorted(dates) or largest_gap_days(dates) > MAX_BAR_GAP_DAYS:
            flags.append("history_gap")
        if (session - dates[-1]).days > MAX_HISTORY_AGE_DAYS:
            flags.append("history_stale")

        sigma = daily_sigma_pct(closes)
        out["sigma_pct"] = round(sigma, 2) if sigma is not None else None
        if price is not None:
            move = abs(price / closes[-1] - 1) * 100
            out["move_pct"] = round(move, 2)
            if move >= SPLIT_SUSPECT_PCT:
                flags.append("split_suspect")
            elif sigma is not None and move > max(JUMP_SIGMAS * sigma, JUMP_FLOOR_PCT):
                # A dated, verified catalyst explains a jump; a guess does not.
                flags.append(
                    "explained_jump" if record.get("catalyst_confirmed") is True
                    else "unexplained_jump"
                )

    return _finish(out, flags)


def _finish(out: dict[str, Any], flags: list[str]) -> dict[str, Any]:
    blocking = [f for f in flags if f in BLOCKING]
    return {"ok": not blocking, "flags": flags, "blocking": blocking, **out}


def check_all(data: dict[str, Any], max_quote_age_seconds: float) -> dict[str, Any]:
    """Check every symbol in a session's symbol-data file."""
    session = date.fromisoformat(data["session"])
    symbols = data.get("symbols") or {}
    return {
        "rules_version": RULES_VERSION,
        "session": data["session"],
        "symbols": {
            sym: check_symbol(rec, session, max_quote_age_seconds)
            for sym, rec in symbols.items()
        },
    }


def load_for_run(run: dict[str, Any], base: Path, max_quote_age_seconds: float) -> dict[str, Any] | None:
    """Per-symbol quality for a run, or None when the run names no symbol data.

    ``symbol_data`` is a file name resolved against the run file's directory.
    """
    ref = run.get("symbol_data")
    if not ref:
        return None
    data = json.loads((base / ref).read_text())
    return check_all(data, max_quote_age_seconds)["symbols"]


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2
    from policy import load_policy

    data = json.loads(Path(argv[1]).read_text())
    result = check_all(data, load_policy()["max_quote_age_seconds"])
    print(json.dumps(result, indent=2))
    bad = {s: r["blocking"] for s, r in result["symbols"].items() if not r["ok"]}
    print()
    if bad:
        for sym, why in bad.items():
            print(f"  unusable today: {sym:<6} {', '.join(why)}")
    else:
        print("  all symbols usable")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
