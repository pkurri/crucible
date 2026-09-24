"""Forecast register: state a probability, settle it against the tape, score it.

Borrowed in method (not in data — it has no API) from OmniQuant, whose
discipline is "probabilities, not promises" and forecasts "settled against the
tape and published, right or wrong". Losing periods are not hidden here
either; a calibration report that omits them is worthless.

Why this exists. The shadow ledger records whether an ORDER would have filled.
That says nothing about whether the ANALYSIS was right. Without a settleable
forecast attached to every view, twenty shadow sessions prove only that the
agent obeys its policy. Calibration cannot be reconstructed after the fact:
a probability stated once the outcome is known is not a forecast.

A forecast is registered with a reference price and a settlement date, and can
only be settled on or after that date, against a price the register did not
choose.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).parent
REGISTER_PATH = BASE_DIR / "forecasts.jsonl"

UP, DOWN, FLAT = "up", "down", "flat"
DIRECTIONS = (UP, DOWN, FLAT)

# A move smaller than this counts as flat rather than as a direction.
FLAT_BAND_PCT = 1.0

# Calibration buckets, by stated probability.
BUCKETS = ((0.5, 0.6), (0.6, 0.7), (0.7, 0.8), (0.8, 0.9), (0.9, 1.01))


class ForecastError(ValueError):
    pass


def register_entry(
    *,
    symbol: str,
    direction: str,
    probability: float,
    horizon_days: int,
    reference_price: float,
    made_on: str,
    session: str,
    rationale: str,
) -> dict[str, Any]:
    """Build one forecast. Validation is strict: a sloppy forecast is unscoreable."""
    if direction not in DIRECTIONS:
        raise ForecastError(f"direction must be one of {DIRECTIONS}")
    if not 0.5 <= probability <= 0.99:
        # Below 0.5 you are forecasting the opposite direction; say that
        # instead. Above 0.99 is not a forecast, it is a claim of certainty.
        raise ForecastError("probability must be between 0.5 and 0.99")
    if horizon_days < 1:
        raise ForecastError("horizon_days must be at least 1")
    if reference_price <= 0:
        raise ForecastError("reference_price must be positive")

    made = date.fromisoformat(made_on)
    return {
        "symbol": symbol,
        "direction": direction,
        "probability": probability,
        "horizon_days": horizon_days,
        "reference_price": reference_price,
        "made_on": made_on,
        "settles_on": (made + timedelta(days=horizon_days)).isoformat(),
        "session": session,
        "rationale": rationale,
        "settled": False,
        "settle_price": None,
        "realized": None,
        "hit": None,
    }


def realized_direction(reference: float, settle: float) -> str:
    move = (settle - reference) / reference * 100
    if move > FLAT_BAND_PCT:
        return UP
    if move < -FLAT_BAND_PCT:
        return DOWN
    return FLAT


def settle_entry(entry: dict, settle_price: float, on: str) -> dict:
    """Settle one forecast against a price. Refuses to settle early."""
    if entry.get("settled"):
        raise ForecastError(f"{entry['symbol']} forecast already settled")
    if date.fromisoformat(on) < date.fromisoformat(entry["settles_on"]):
        raise ForecastError(
            f"cannot settle before {entry['settles_on']} (asked on {on})"
        )
    if settle_price <= 0:
        raise ForecastError("settle_price must be positive")

    realized = realized_direction(entry["reference_price"], settle_price)
    out = dict(entry)
    out.update(
        settled=True,
        settled_on=on,
        settle_price=settle_price,
        realized=realized,
        hit=realized == entry["direction"],
    )
    return out


# --------------------------------------------------------------------------
# scoring
# --------------------------------------------------------------------------


def brier(settled: list[dict]) -> float | None:
    """Mean squared error of the stated probability against the outcome.

    Lower is better. A forecaster who always says 0.7 and is right 70% of the
    time scores 0.21. Always saying 0.5 scores 0.25 — that is the bar a
    forecast has to beat to have said anything at all.
    """
    if not settled:
        return None
    return sum((f["probability"] - (1.0 if f["hit"] else 0.0)) ** 2 for f in settled) / len(
        settled
    )


def calibration(settled: list[dict]) -> list[dict]:
    """Stated probability against realized frequency, per bucket."""
    out = []
    for lo, hi in BUCKETS:
        rows = [f for f in settled if lo <= f["probability"] < hi]
        if not rows:
            continue
        stated = sum(f["probability"] for f in rows) / len(rows)
        realized = sum(1 for f in rows if f["hit"]) / len(rows)
        out.append(
            {
                "bucket": f"{int(lo * 100)}-{int(min(hi, 1.0) * 100)}%",
                "n": len(rows),
                "stated": round(stated, 3),
                "realized": round(realized, 3),
                "gap": round(realized - stated, 3),
            }
        )
    return out


def score(entries: list[dict]) -> dict[str, Any]:
    settled = [e for e in entries if e.get("settled")]
    open_ = [e for e in entries if not e.get("settled")]
    hits = [e for e in settled if e["hit"]]

    by_symbol: dict[str, list[dict]] = defaultdict(list)
    for e in settled:
        by_symbol[e["symbol"]].append(e)

    worst = sorted(
        (
            {
                "symbol": sym,
                "n": len(rows),
                "accuracy": round(sum(1 for r in rows if r["hit"]) / len(rows), 3),
            }
            for sym, rows in by_symbol.items()
        ),
        key=lambda r: r["accuracy"],
    )

    return {
        "registered": len(entries),
        "settled": len(settled),
        "open": len(open_),
        "hits": len(hits),
        "accuracy": round(len(hits) / len(settled), 3) if settled else None,
        "brier": round(brier(settled), 4) if settled else None,
        "coin_flip_brier": 0.25,
        "calibration": calibration(settled),
        "weakest_symbols": worst[:5],
    }


def render(s: dict[str, Any]) -> str:
    L = ["FORECAST RECORD", "=" * 52, ""]
    L.append(f"registered   {s['registered']}")
    L.append(f"settled      {s['settled']}")
    L.append(f"open         {s['open']}")
    L.append("")

    if not s["settled"]:
        L.append("Nothing has settled yet. No accuracy claim can be made,")
        L.append("and none will be made until forecasts reach their dates.")
        return "\n".join(L)

    L.append(f"directional accuracy   {s['accuracy']:.1%}  ({s['hits']}/{s['settled']})")
    L.append(f"Brier score            {s['brier']:.4f}  "
             f"(coin flip {s['coin_flip_brier']}; lower is better)")
    if s["brier"] >= s["coin_flip_brier"]:
        L.append("  -> at or worse than always saying 50%. The forecasts are")
        L.append("     not adding information.")
    L.append("")

    if s["calibration"]:
        L.append("CALIBRATION — stated against realized")
        L.append("  bucket      n   stated  realized     gap")
        for c in s["calibration"]:
            L.append(
                f"  {c['bucket']:<10} {c['n']:>2}   {c['stated']:>6.1%}  "
                f"{c['realized']:>7.1%}  {c['gap']:>+6.1%}"
            )
        L.append("  a positive gap is under-confidence; negative is over-confidence")
        L.append("")

    if s["weakest_symbols"]:
        L.append("WEAKEST SYMBOLS (published, not hidden)")
        for w in s["weakest_symbols"]:
            L.append(f"  {w['symbol']:<8} {w['accuracy']:>6.1%}  over {w['n']} settled")
    return "\n".join(L)


# --------------------------------------------------------------------------
# io
# --------------------------------------------------------------------------


def load(path: Path = REGISTER_PATH) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(l) for l in path.read_text().splitlines() if l.strip()]


def save(entries: list[dict], path: Path = REGISTER_PATH) -> None:
    path.write_text("".join(json.dumps(e) + "\n" for e in entries))


def append(entry: dict, path: Path = REGISTER_PATH) -> None:
    with path.open("a") as fh:
        fh.write(json.dumps(entry) + "\n")


def due(entries: list[dict], on: str | None = None) -> list[dict]:
    """Forecasts whose settlement date has arrived and are still open."""
    today = on or datetime.now().date().isoformat()
    return [
        e
        for e in entries
        if not e.get("settled")
        and date.fromisoformat(e["settles_on"]) <= date.fromisoformat(today)
    ]


def main(argv: list[str]) -> int:
    entries = load()
    if len(argv) > 1 and argv[1] == "due":
        pending = due(entries)
        if not pending:
            print("Nothing due for settlement.")
            return 0
        print(f"{len(pending)} forecast(s) due — settle against the tape:")
        for e in pending:
            print(f"  {e['symbol']:<8} {e['direction']:<5} p={e['probability']:.2f}  "
                  f"ref {e['reference_price']}  due {e['settles_on']}")
        return 0

    if not entries:
        print("No forecasts registered yet.")
        return 2
    print(render(score(entries)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
