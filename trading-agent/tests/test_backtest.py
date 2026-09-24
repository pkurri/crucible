import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backtest import (  # noqa: E402
    MIN_OOS_SHARPE,
    MIN_T_STAT,
    Result,
    buy_and_hold,
    evaluate,
    returns_from,
    run_positions,
    score,
    sma_cross,
    walk_forward,
)

GRID = [{"fast": f, "slow": s} for f in (5, 10) for s in (20, 30)]


def rising(n=300, start=100.0, rate=0.003):
    out = [start]
    for _ in range(n - 1):
        out.append(out[-1] * (1 + rate))
    return out


def always_long(window, params):
    return 1


def always_flat(window, params):
    return 0


class TestNoLookahead:
    def test_strategy_only_ever_sees_prior_closes(self):
        seen = []

        def spy_strategy(window, params):
            seen.append(len(window))
            return 0

        closes = rising(50)
        run_positions(closes, spy_strategy, {})
        # Decision i must see exactly i+1 closes -- never the bar it is paid on.
        assert seen == list(range(1, len(closes)))

    def test_decision_cannot_see_its_own_outcome(self):
        """A strategy that peeks at the last close it is given still cannot
        see the return it earns, because that return needs the NEXT close."""
        closes = [100.0, 110.0, 90.0, 95.0]
        captured = []

        def peeker(window, params):
            captured.append(window[-1])
            return 1

        run_positions(closes, peeker, {})
        assert captured == [100.0, 110.0, 90.0]
        assert 95.0 not in captured


class TestScoring:
    def test_returns_from_series(self):
        assert returns_from([100.0, 110.0]) == pytest.approx([0.1])

    def test_flat_strategy_earns_nothing(self):
        closes = rising(100)
        result, _, _ = evaluate(closes, always_flat, {})
        assert result.total_return_pct == pytest.approx(0.0)
        assert result.trades == 0
        assert result.exposure_pct == 0.0

    def test_always_long_equals_buy_and_hold(self):
        closes = rising(100)
        result, _, _ = evaluate(closes, always_long, {})
        bh = buy_and_hold(closes)
        assert result.total_return_pct == pytest.approx(bh.total_return_pct)
        assert result.exposure_pct == 100.0

    def test_one_entry_counts_as_one_trade(self):
        positions = [0, 1, 1, 1, 0]
        assert score([0.0] * 5, positions).trades == 1

    def test_re_entry_counts_again(self):
        positions = [1, 0, 1]
        assert score([0.0] * 3, positions).trades == 2

    def test_drawdown_is_positive_when_equity_falls(self):
        r = score([0.1, -0.5, 0.1], [1, 1, 1])
        assert r.max_drawdown_pct > 0

    def test_empty_input_is_safe(self):
        r = score([], [])
        assert r.bars == 0 and r.sharpe == 0.0


class TestGate:
    def good(self):
        return Result(bars=300, trades=25, total_return_pct=30.0, sharpe=1.2,
                      t_stat=2.5, max_drawdown_pct=10.0, hit_rate_pct=55.0,
                      exposure_pct=60.0)

    def test_strong_result_passes(self):
        ok, failures = self.good().passes()
        assert ok and failures == []

    def test_low_sharpe_fails(self):
        r = Result(**{**self.good().__dict__, "sharpe": 0.1})
        ok, failures = r.passes()
        assert not ok and any("Sharpe" in f for f in failures)

    def test_insignificant_t_stat_fails(self):
        r = Result(**{**self.good().__dict__, "t_stat": 1.0})
        ok, failures = r.passes()
        assert not ok
        assert any("not distinguishable from zero" in f for f in failures)

    def test_deep_drawdown_fails(self):
        r = Result(**{**self.good().__dict__, "max_drawdown_pct": 60.0})
        assert not r.passes()[0]

    def test_too_few_trades_fails(self):
        r = Result(**{**self.good().__dict__, "trades": 3})
        ok, failures = r.passes()
        assert not ok and any("too few" in f for f in failures)

    def test_a_great_looking_but_insignificant_result_still_fails(self):
        """The specific trap: high Sharpe on a handful of bars."""
        r = Result(bars=12, trades=2, total_return_pct=40.0, sharpe=3.0,
                   t_stat=1.1, max_drawdown_pct=2.0, hit_rate_pct=90.0,
                   exposure_pct=50.0)
        assert not r.passes()[0]

    def test_thresholds_are_the_documented_ones(self):
        assert MIN_OOS_SHARPE == 0.5
        assert MIN_T_STAT == 1.96


class TestWalkForward:
    def test_test_windows_are_contiguous_and_disjoint(self):
        closes = rising(300)
        folds, _ = walk_forward(closes, sma_cross, GRID, train=60, test=20)
        assert len(folds) > 1
        for a, b in zip(folds, folds[1:]):
            assert b.train_end == a.test_end

    def test_training_window_never_overlaps_its_own_test_window(self):
        closes = rising(300)
        folds, _ = walk_forward(closes, sma_cross, GRID, train=60, test=20)
        for f in folds:
            assert f.train_end <= f.test_end
            assert f.train_start < f.train_end

    def test_stitched_oos_covers_every_fold(self):
        closes = rising(300)
        folds, oos = walk_forward(closes, sma_cross, GRID, train=60, test=20)
        assert oos.bars == sum(f.out_of_sample.bars for f in folds)

    def test_a_chosen_param_set_comes_from_the_grid(self):
        closes = rising(300)
        folds, _ = walk_forward(closes, sma_cross, GRID, train=60, test=20)
        assert all(f.chosen in GRID for f in folds)

    def test_series_too_short_yields_no_folds(self):
        folds, oos = walk_forward(rising(40), sma_cross, GRID, train=60, test=20)
        assert folds == [] and oos.bars == 0

    def test_trending_series_lets_a_trend_follower_stay_long(self):
        closes = rising(300)
        _, oos = walk_forward(closes, sma_cross, GRID, train=60, test=20)
        assert oos.exposure_pct > 50


class TestRecordedBacktest:
    """The real SPY walk-forward this project ran on 2026-09-23."""

    def test_sma_cross_on_real_spy_fails_the_gate(self):
        import json

        path = Path(__file__).resolve().parents[1] / "runs" / "2026-09-23-market.json"
        closes = json.loads(path.read_text())["spy_closes"]
        grid = [{"fast": f, "slow": s} for f in (5, 10, 20) for s in (30, 50) if f < s]
        folds, oos = walk_forward(closes, sma_cross, grid, train=60, test=20)

        assert len(folds) == 3
        ok, failures = oos.passes()
        assert not ok, "this strategy must not be recorded as passing"
        assert failures

    def test_in_sample_looked_better_than_out_of_sample(self):
        """The overfitting signature the lab exists to catch."""
        import json

        path = Path(__file__).resolve().parents[1] / "runs" / "2026-09-23-market.json"
        closes = json.loads(path.read_text())["spy_closes"]
        grid = [{"fast": f, "slow": s} for f in (5, 10, 20) for s in (30, 50) if f < s]
        folds, _ = walk_forward(closes, sma_cross, grid, train=60, test=20)
        for f in folds:
            assert f.in_sample_sharpe > f.out_of_sample.sharpe
