"""Step 2 of the analysis loop: establish the market regime.

Pure functions over price series. The rules are fixed here rather than left to
the model's judgement, so "what regime were we in" has the same answer every
time it is asked of the same data. A strategy that works in a quiet trend
fails in an event shock, and until this module ran the agent could not tell
which one it was in.

Thresholds are conventions, not discoveries. They are written down so they
stay stable across sessions; changing one means bumping RULES_VERSION and
saying so in the journal.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

RULES_VERSION = "1.0.0"

# VIX level buckets.
VOL_CALM = 15.0
VOL_NORMAL = 20.0
VOL_ELEVATED = 30.0

# A single-session move at or beyond this is treated as a shock.
SHOCK_MOVE_PCT = 2.0
# VIX at or above this is treated as a shock regardless of the day's move.
SHOCK_VIX = 25.0

# How far above/below the 50-day mean counts as a real trend rather than noise.
TREND_BAND_PCT = 1.0


def sma(values: list[float], n: int) -> float | None:
    if len(values) < n:
        return None
    return sum(values[-n:]) / n


def pct_change(a: float, b: float) -> float:
    return (b - a) / a * 100 if a else 0.0


def classify_volatility(vix: float) -> str:
    if vix < VOL_CALM:
        return "calm"
    if vix < VOL_NORMAL:
        return "normal"
    if vix < VOL_ELEVATED:
        return "elevated"
    return "stressed"


def classify_trend(closes: list[float]) -> tuple[str, float | None]:
    """Trend from price against its 50-day mean, with a neutral band."""
    ma50 = sma(closes, 50)
    if ma50 is None:
        return "unestablished", None
    gap = pct_change(ma50, closes[-1])
    if gap > TREND_BAND_PCT:
        return "uptrend", gap
    if gap < -TREND_BAND_PCT:
        return "downtrend", gap
    return "chop", gap


def compute_regime(
    spy_closes: list[float],
    qqq_closes: list[float],
    vix: float,
) -> dict[str, Any]:
    """Return the regime record attached to every plan in a session."""
    trend, gap = classify_trend(spy_closes)
    vol = classify_volatility(vix)

    last_move = (
        pct_change(spy_closes[-2], spy_closes[-1]) if len(spy_closes) >= 2 else 0.0
    )
    period_high = max(spy_closes) if spy_closes else 0.0
    drawdown = pct_change(period_high, spy_closes[-1]) if period_high else 0.0

    # Relative strength of tech against the broad market over 20 sessions is
    # a crude but stable read on risk appetite.
    appetite = "unestablished"
    if len(spy_closes) >= 21 and len(qqq_closes) >= 21:
        spy_20 = pct_change(spy_closes[-21], spy_closes[-1])
        qqq_20 = pct_change(qqq_closes[-21], qqq_closes[-1])
        appetite = "risk_on" if qqq_20 > spy_20 else "risk_off"

    shock = abs(last_move) >= SHOCK_MOVE_PCT or vix >= SHOCK_VIX

    # Swing entries assume the trend persists over the holding period. That
    # assumption is not safe in a shock or while the broad market is falling.
    entries_supported = (not shock) and trend in ("uptrend", "chop")

    return {
        "rules_version": RULES_VERSION,
        "trend": trend,
        "gap_to_50d_pct": round(gap, 2) if gap is not None else None,
        "volatility": vol,
        "vix": vix,
        "last_session_move_pct": round(last_move, 2),
        "drawdown_from_period_high_pct": round(drawdown, 2),
        "risk_appetite": appetite,
        "event_shock": shock,
        "entries_supported": entries_supported,
        "sessions_used": len(spy_closes),
    }


def summarize(regime: dict[str, Any]) -> str:
    bits = [
        f"{regime['trend']} ({regime['gap_to_50d_pct']:+}% vs 50d)"
        if regime["gap_to_50d_pct"] is not None
        else regime["trend"],
        f"volatility {regime['volatility']} (VIX {regime['vix']})",
        f"risk appetite {regime['risk_appetite']}",
        f"{regime['drawdown_from_period_high_pct']:+}% from period high",
    ]
    line = "; ".join(bits)
    if regime["event_shock"]:
        return line + ". EVENT SHOCK — entries not supported."
    if not regime["entries_supported"]:
        return line + ". Entries not supported in this trend."
    return line + ". Entries supported."


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2
    data = json.loads(Path(argv[1]).read_text())
    regime = compute_regime(data["spy_closes"], data["qqq_closes"], data["vix"])
    print(json.dumps(regime, indent=2))
    print()
    print(summarize(regime))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
