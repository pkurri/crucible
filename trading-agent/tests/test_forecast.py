import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from forecast import (  # noqa: E402
    DOWN,
    FLAT,
    UP,
    ForecastError,
    brier,
    calibration,
    due,
    load,
    realized_direction,
    register_entry,
    render,
    score,
    settle_entry,
)


def make(**o):
    base = dict(
        symbol="AAPL", direction=UP, probability=0.7, horizon_days=14,
        reference_price=100.0, made_on="2026-09-23", session="s1",
        rationale="because",
    )
    base.update(o)
    return register_entry(**base)


class TestRegistration:
    def test_settlement_date_is_derived(self):
        assert make(horizon_days=14)["settles_on"] == "2026-10-07"

    def test_starts_unsettled(self):
        e = make()
        assert e["settled"] is False and e["hit"] is None

    @pytest.mark.parametrize("p", [0.0, 0.3, 0.49, 1.0, 1.5])
    def test_probability_outside_the_useful_range_is_refused(self, p):
        with pytest.raises(ForecastError):
            make(probability=p)

    def test_probability_below_half_is_refused_as_a_mislabelled_direction(self):
        """p<0.5 on 'up' is really a forecast of 'down'. Say that instead."""
        with pytest.raises(ForecastError):
            make(direction=UP, probability=0.4)

    def test_certainty_is_refused(self):
        with pytest.raises(ForecastError):
            make(probability=1.0)

    def test_bad_direction_refused(self):
        with pytest.raises(ForecastError):
            make(direction="sideways")

    @pytest.mark.parametrize("h", [0, -5])
    def test_nonpositive_horizon_refused(self, h):
        with pytest.raises(ForecastError):
            make(horizon_days=h)

    def test_nonpositive_reference_price_refused(self):
        with pytest.raises(ForecastError):
            make(reference_price=0.0)


class TestRealizedDirection:
    def test_move_above_band_is_up(self):
        assert realized_direction(100.0, 102.0) == UP

    def test_move_below_band_is_down(self):
        assert realized_direction(100.0, 98.0) == DOWN

    @pytest.mark.parametrize("p", [100.0, 100.9, 99.1])
    def test_small_move_is_flat(self, p):
        assert realized_direction(100.0, p) == FLAT

    def test_band_edges_are_flat_not_directional(self):
        assert realized_direction(100.0, 101.0) == FLAT
        assert realized_direction(100.0, 99.0) == FLAT


class TestSettlement:
    def test_cannot_settle_before_the_date(self):
        with pytest.raises(ForecastError, match="cannot settle before"):
            settle_entry(make(), 110.0, "2026-09-30")

    def test_can_settle_on_the_date(self):
        s = settle_entry(make(), 110.0, "2026-10-07")
        assert s["settled"] is True and s["hit"] is True

    def test_can_settle_after_the_date(self):
        assert settle_entry(make(), 110.0, "2026-10-20")["settled"] is True

    def test_cannot_settle_twice(self):
        s = settle_entry(make(), 110.0, "2026-10-07")
        with pytest.raises(ForecastError, match="already settled"):
            settle_entry(s, 120.0, "2026-10-08")

    def test_wrong_direction_is_a_miss(self):
        s = settle_entry(make(direction=UP), 90.0, "2026-10-07")
        assert s["hit"] is False and s["realized"] == DOWN

    def test_flat_outcome_misses_a_directional_call(self):
        s = settle_entry(make(direction=UP), 100.5, "2026-10-07")
        assert s["hit"] is False and s["realized"] == FLAT

    def test_settling_does_not_mutate_the_original(self):
        e = make()
        settle_entry(e, 110.0, "2026-10-07")
        assert e["settled"] is False

    def test_nonpositive_settle_price_refused(self):
        with pytest.raises(ForecastError):
            settle_entry(make(), 0.0, "2026-10-07")


class TestScoring:
    def settled(self, specs):
        out = []
        for p, hit in specs:
            e = make(probability=p, direction=UP)
            out.append(settle_entry(e, 110.0 if hit else 90.0, "2026-10-07"))
        return out

    def test_perfect_confident_forecaster_scores_near_zero(self):
        assert brier(self.settled([(0.95, True)] * 10)) == pytest.approx(0.0025)

    def test_confidently_wrong_scores_terribly(self):
        assert brier(self.settled([(0.95, False)] * 10)) == pytest.approx(0.9025)

    def test_a_coin_flipper_scores_a_quarter(self):
        b = brier(self.settled([(0.5, True), (0.5, False)]))
        assert b == pytest.approx(0.25)

    def test_brier_of_nothing_is_none(self):
        assert brier([]) is None

    def test_calibration_reports_the_gap(self):
        rows = self.settled([(0.7, True)] * 7 + [(0.7, False)] * 3)
        c = calibration(rows)
        assert len(c) == 1
        assert c[0]["stated"] == pytest.approx(0.7)
        assert c[0]["realized"] == pytest.approx(0.7)
        assert c[0]["gap"] == pytest.approx(0.0)

    def test_overconfidence_shows_as_a_negative_gap(self):
        rows = self.settled([(0.9, True)] * 5 + [(0.9, False)] * 5)
        assert calibration(rows)[0]["gap"] < 0

    def test_underconfidence_shows_as_a_positive_gap(self):
        rows = self.settled([(0.6, True)] * 10)
        assert calibration(rows)[0]["gap"] > 0

    def test_open_forecasts_are_excluded_from_accuracy(self):
        s = score(self.settled([(0.7, True)]) + [make()])
        assert s["settled"] == 1 and s["open"] == 1 and s["accuracy"] == 1.0

    def test_weakest_symbols_are_surfaced_not_hidden(self):
        good = settle_entry(make(symbol="GOOD"), 110.0, "2026-10-07")
        bad = settle_entry(make(symbol="BAD"), 90.0, "2026-10-07")
        s = score([good, bad])
        assert s["weakest_symbols"][0]["symbol"] == "BAD"


class TestRendering:
    def test_unsettled_register_makes_no_accuracy_claim(self):
        text = render(score([make(), make(symbol="MSFT")]))
        assert "Nothing has settled yet" in text
        assert "accuracy" not in text.lower().split("no accuracy")[0][-40:]

    def test_worse_than_coin_flip_is_called_out(self):
        rows = [settle_entry(make(probability=0.9), 90.0, "2026-10-07")]
        text = render(score(rows))
        assert "not adding information" in text


class TestDue:
    def test_nothing_due_before_the_date(self):
        assert due([make()], on="2026-10-01") == []

    def test_due_on_the_date(self):
        assert len(due([make()], on="2026-10-07")) == 1

    def test_settled_entries_are_never_due(self):
        s = settle_entry(make(), 110.0, "2026-10-07")
        assert due([s], on="2026-10-20") == []


class TestShippedRegister:
    def test_register_exists_and_is_unsettled(self):
        entries = load()
        if not entries:
            pytest.skip("no register yet")
        assert all(not e["settled"] for e in entries), (
            "nothing can be settled before 2026-10-07"
        )

    def test_no_forecast_claims_certainty(self):
        entries = load()
        if not entries:
            pytest.skip("no register yet")
        assert all(0.5 <= e["probability"] <= 0.99 for e in entries)

    def test_ionq_was_abstained_on(self):
        entries = load()
        if not entries:
            pytest.skip("no register yet")
        assert "IONQ" not in {e["symbol"] for e in entries}, (
            "IONQ had an unexplained volume spike; forecasting it would be invention"
        )

    def test_every_forecast_carries_a_rationale(self):
        entries = load()
        if not entries:
            pytest.skip("no register yet")
        assert all(len(e["rationale"]) > 20 for e in entries)
