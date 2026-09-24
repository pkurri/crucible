"""Walk-forward backtest lab.

Sits between the thesis engine and the risk gate. A strategy idea is coded,
fitted on a training window, and scored only on data that window never saw.
The in-sample result is discarded; only the out-of-sample record can support
a proposal.

Why the bar is set where it is: across 4,843 replicated published strategies
the median lands at a Sharpe of about 0.37, and only ~48% clear a t-statistic
of 1.96 -- half cannot be distinguished from zero. So the default gate wants
a positive out-of-sample Sharpe AND a t-stat clearing 1.96, and treats
anything less as "not shown to work" rather than "nearly works".

No dependencies beyond the standard library, so the lab runs anywhere the
agent runs.
"""

from __future__ import annotations

import json
import math
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Callable, Iterable, Sequence

TRADING_DAYS = 252

# Default promotion gate.
MIN_OOS_SHARPE = 0.5
MIN_T_STAT = 1.96
MAX_DRAWDOWN_PCT = 35.0


@dataclass(frozen=True)
class Result:
    """Performance of one equity curve. All figures are out-of-sample."""

    bars: int
    trades: int
    total_return_pct: float
    sharpe: float
    t_stat: float
    max_drawdown_pct: float
    hit_rate_pct: float
    exposure_pct: float

    def passes(
        self,
        min_sharpe: float = MIN_OOS_SHARPE,
        min_t: float = MIN_T_STAT,
        max_dd: float = MAX_DRAWDOWN_PCT,
    ) -> tuple[bool, list[str]]:
        failures = []
        if self.sharpe < min_sharpe:
            failures.append(f"Sharpe {self.sharpe:.2f} below {min_sharpe}")
        if abs(self.t_stat) < min_t:
            failures.append(
                f"t-stat {self.t_stat:.2f} below {min_t}: not distinguishable from zero"
            )
        if self.max_drawdown_pct > max_dd:
            failures.append(
                f"max drawdown {self.max_drawdown_pct:.1f}% exceeds {max_dd}%"
            )
        if self.trades < 10:
            failures.append(f"only {self.trades} trades: too few to mean anything")
        return (not failures), failures


def returns_from(closes: Sequence[float]) -> list[float]:
    return [
        (closes[i] - closes[i - 1]) / closes[i - 1] for i in range(1, len(closes))
    ]


def score(strategy_returns: Sequence[float], positions: Sequence[int]) -> Result:
    """Score a realized return stream. `positions` aligns 1:1 with returns."""
    n = len(strategy_returns)
    if n == 0:
        return Result(0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)

    mean = sum(strategy_returns) / n
    var = sum((r - mean) ** 2 for r in strategy_returns) / (n - 1) if n > 1 else 0.0
    sd = math.sqrt(var)

    sharpe = (mean / sd) * math.sqrt(TRADING_DAYS) if sd > 0 else 0.0
    t_stat = (mean / (sd / math.sqrt(n))) if sd > 0 else 0.0

    equity, peak, max_dd = 1.0, 1.0, 0.0
    for r in strategy_returns:
        equity *= 1 + r
        peak = max(peak, equity)
        max_dd = max(max_dd, (peak - equity) / peak * 100)

    active = [r for r, p in zip(strategy_returns, positions) if p]
    wins = sum(1 for r in active if r > 0)
    hit = (wins / len(active) * 100) if active else 0.0

    trades = sum(
        1
        for i in range(len(positions))
        if positions[i] and (i == 0 or not positions[i - 1])
    )

    return Result(
        bars=n,
        trades=trades,
        total_return_pct=(equity - 1) * 100,
        sharpe=sharpe,
        t_stat=t_stat,
        max_drawdown_pct=max_dd,
        hit_rate_pct=hit,
        exposure_pct=sum(positions) / n * 100,
    )


# --------------------------------------------------------------------------
# strategies
# --------------------------------------------------------------------------

# A strategy maps (closes, params) -> a position for the bar AFTER each close.
# It may only read closes[:i+1] when deciding position i. That restriction is
# what keeps lookahead out; `run_positions` enforces it by construction.
Strategy = Callable[[Sequence[float], dict], int]


def sma_cross(window: Sequence[float], params: dict) -> int:
    """Long while the fast mean is above the slow mean."""
    fast, slow = params["fast"], params["slow"]
    if len(window) < slow:
        return 0
    f = sum(window[-fast:]) / fast
    s = sum(window[-slow:]) / slow
    return 1 if f > s else 0


def run_positions(
    closes: Sequence[float],
    strategy: Strategy,
    params: dict,
    lo: int = 0,
    hi: int | None = None,
) -> list[int]:
    """Positions for the return periods [lo, hi), decided only on prior closes.

    Position i is decided from `closes[:i+1]` and earns the return from
    `closes[i]` to `closes[i+1]`, so a decision never sees its own outcome.

    `lo`/`hi` bound only which returns are *scored*. The strategy always sees
    the full history up to each decision point, because an indicator needs a
    warm-up period that a scoring window has no business truncating.
    """
    hi = len(closes) - 1 if hi is None else hi
    return [strategy(closes[: i + 1], params) for i in range(lo, hi)]


def evaluate(
    closes: Sequence[float],
    strategy: Strategy,
    params: dict,
    lo: int = 0,
    hi: int | None = None,
) -> tuple[Result, list[int], list[float]]:
    """Score a strategy over the return periods [lo, hi)."""
    hi = len(closes) - 1 if hi is None else hi
    positions = run_positions(closes, strategy, params, lo, hi)
    strat_rets = [
        p * (closes[i + 1] - closes[i]) / closes[i]
        for p, i in zip(positions, range(lo, hi))
    ]
    return score(strat_rets, positions), positions, strat_rets


# --------------------------------------------------------------------------
# walk forward
# --------------------------------------------------------------------------


@dataclass
class Fold:
    index: int
    train_start: int
    train_end: int
    test_end: int
    chosen: dict
    in_sample_sharpe: float
    out_of_sample: Result


def walk_forward(
    closes: Sequence[float],
    strategy: Strategy,
    grid: Iterable[dict],
    *,
    train: int = 60,
    test: int = 20,
) -> tuple[list[Fold], Result]:
    """Fit on each training window, score on the untouched window that follows.

    Returns the per-fold record and the stitched out-of-sample result, which
    is the only number that may support a proposal.
    """
    grid = list(grid)
    folds: list[Fold] = []
    stitched_returns: list[float] = []
    stitched_positions: list[int] = []

    start = 0
    index = 0
    last = len(closes) - 1  # highest valid return start index
    while start + train + test <= last:
        train_lo, train_hi = start, start + train
        test_lo, test_hi = train_hi, min(train_hi + test, last)

        best, best_sharpe = None, -math.inf
        for params in grid:
            r, _, _ = evaluate(closes, strategy, params, train_lo, train_hi)
            if r.sharpe > best_sharpe:
                best, best_sharpe = params, r.sharpe

        oos, positions, rets = evaluate(closes, strategy, best, test_lo, test_hi)
        stitched_returns.extend(rets)
        stitched_positions.extend(positions)

        folds.append(
            Fold(
                index=index,
                train_start=train_lo,
                train_end=train_hi,
                test_end=test_hi,
                chosen=best,
                in_sample_sharpe=round(best_sharpe, 3),
                out_of_sample=oos,
            )
        )
        start += test
        index += 1

    return folds, score(stitched_returns, stitched_positions)


def buy_and_hold(closes: Sequence[float]) -> Result:
    rets = returns_from(closes)
    return score(rets, [1] * len(rets))


def report(name: str, closes: Sequence[float], folds: list[Fold], oos: Result) -> str:
    ok, failures = oos.passes()
    bh = buy_and_hold(closes)
    lines = [
        f"strategy        {name}",
        f"folds           {len(folds)}",
        f"oos bars        {oos.bars}",
        "",
        "OUT OF SAMPLE (the only figures that count)",
        f"  total return  {oos.total_return_pct:+.2f}%",
        f"  sharpe        {oos.sharpe:.2f}",
        f"  t-stat        {oos.t_stat:.2f}",
        f"  max drawdown  {oos.max_drawdown_pct:.1f}%",
        f"  hit rate      {oos.hit_rate_pct:.1f}%",
        f"  trades        {oos.trades}",
        f"  exposure      {oos.exposure_pct:.0f}% of bars",
        "",
        "BUY AND HOLD over the same closes",
        f"  total return  {bh.total_return_pct:+.2f}%",
        f"  sharpe        {bh.sharpe:.2f}",
        "",
    ]
    if ok:
        lines.append("GATE: PASS — may support a shadow proposal.")
    else:
        lines.append("GATE: FAIL — not shown to work. Must not support a proposal.")
        for f in failures:
            lines.append(f"  - {f}")
    if oos.sharpe <= bh.sharpe:
        lines.append(
            "  - note: does not beat buy-and-hold on this data, so the signal "
            "is adding nothing."
        )
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2

    data = json.loads(Path(argv[1]).read_text())
    closes = data["spy_closes"]

    grid = [
        {"fast": f, "slow": s}
        for f in (5, 10, 20)
        for s in (30, 50)
        if f < s
    ]
    folds, oos = walk_forward(closes, sma_cross, grid, train=60, test=20)

    print(report("sma_cross on SPY", closes, folds, oos))
    print()
    print("per fold:")
    for f in folds:
        print(
            f"  fold {f.index}  params {f.chosen}  "
            f"is_sharpe {f.in_sample_sharpe:+.2f}  "
            f"oos_sharpe {f.out_of_sample.sharpe:+.2f}  "
            f"oos_return {f.out_of_sample.total_return_pct:+.2f}%"
        )

    ok, _ = oos.passes()
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
