import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from context import (  # noqa: E402
    RULES_VERSION,
    classify_trend,
    classify_volatility,
    compute_regime,
    sma,
    summarize,
)


def rising(n=120, start=100.0, step=1.0):
    return [start + i * step for i in range(n)]


def falling(n=120, start=200.0, step=1.0):
    return [start - i * step for i in range(n)]


def flat(n=120, level=100.0):
    return [level] * n


class TestPrimitives:
    def test_sma_needs_enough_data(self):
        assert sma([1, 2, 3], 5) is None

    def test_sma_value(self):
        assert sma([1, 2, 3, 4], 2) == 3.5

    @pytest.mark.parametrize(
        "vix,expected",
        [(9.0, "calm"), (14.99, "calm"), (15.0, "normal"), (19.9, "normal"),
         (20.0, "elevated"), (29.9, "elevated"), (30.0, "stressed"), (80.0, "stressed")],
    )
    def test_volatility_buckets(self, vix, expected):
        assert classify_volatility(vix) == expected


class TestTrend:
    def test_rising_series_is_uptrend(self):
        trend, gap = classify_trend(rising())
        assert trend == "uptrend"
        assert gap > 0

    def test_falling_series_is_downtrend(self):
        trend, gap = classify_trend(falling())
        assert trend == "downtrend"
        assert gap < 0

    def test_flat_series_is_chop(self):
        trend, gap = classify_trend(flat())
        assert trend == "chop"
        assert gap == pytest.approx(0.0)

    def test_short_history_is_unestablished(self):
        trend, gap = classify_trend([100.0] * 10)
        assert trend == "unestablished"
        assert gap is None


class TestRegime:
    def test_calm_uptrend_supports_entries(self):
        r = compute_regime(rising(), rising(), 12.0)
        assert r["trend"] == "uptrend"
        assert r["volatility"] == "calm"
        assert r["event_shock"] is False
        assert r["entries_supported"] is True

    def test_downtrend_does_not_support_entries(self):
        r = compute_regime(falling(), falling(), 12.0)
        assert r["entries_supported"] is False

    def test_high_vix_is_a_shock_even_in_an_uptrend(self):
        r = compute_regime(rising(), rising(), 31.0)
        assert r["event_shock"] is True
        assert r["entries_supported"] is False
        assert "EVENT SHOCK" in summarize(r)

    def test_large_single_session_move_is_a_shock(self):
        closes = rising(119) + [rising(119)[-1] * 0.95]
        r = compute_regime(closes, closes, 12.0)
        assert r["event_shock"] is True
        assert r["entries_supported"] is False

    def test_risk_appetite_reads_relative_strength(self):
        spy = rising(120, 100.0, 1.0)
        qqq_strong = rising(120, 100.0, 3.0)
        qqq_weak = rising(120, 100.0, 0.1)
        assert compute_regime(spy, qqq_strong, 12.0)["risk_appetite"] == "risk_on"
        assert compute_regime(spy, qqq_weak, 12.0)["risk_appetite"] == "risk_off"

    def test_drawdown_is_measured_from_the_period_high(self):
        closes = rising(119) + [rising(119)[-1] * 0.99]
        r = compute_regime(closes, closes, 12.0)
        assert r["drawdown_from_period_high_pct"] < 0

    def test_rules_version_is_reported(self):
        assert compute_regime(rising(), rising(), 12.0)["rules_version"] == RULES_VERSION

    def test_summary_is_a_single_line(self):
        assert "\n" not in summarize(compute_regime(rising(), rising(), 12.0))


class TestRecordedSession:
    """The regime this project actually recorded on 2026-09-23."""

    def setup_method(self):
        import json

        path = Path(__file__).resolve().parents[1] / "runs" / "2026-09-23-market.json"
        self.data = json.loads(path.read_text())

    def test_recorded_market_data_produces_a_regime(self):
        r = compute_regime(
            self.data["spy_closes"], self.data["qqq_closes"], self.data["vix"]
        )
        assert r["trend"] in ("uptrend", "downtrend", "chop")
        assert r["sessions_used"] > 50
        assert isinstance(r["entries_supported"], bool)

    def test_series_are_the_same_length(self):
        assert len(self.data["spy_closes"]) == len(self.data["qqq_closes"])
