import json
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from policy import evaluate, load_policy, load_watchlist  # noqa: E402
from quality import (  # noqa: E402
    MIN_BARS,
    check_all,
    check_symbol,
    daily_sigma_pct,
)
from validate_run import main as validate  # noqa: E402

SESSION = date(2026, 10, 6)  # a Tuesday


def weekdays_before(end: date, n: int) -> list[date]:
    out, d = [], end - timedelta(days=1)
    while len(out) < n:
        if d.weekday() < 5:
            out.append(d)
        d -= timedelta(days=1)
    return sorted(out)


def wiggle(n=40, level=100.0, amp=0.01):
    """Closes alternating +/-amp: a daily sigma of about 2%."""
    return [level * (1 + (amp if i % 2 else -amp)) for i in range(n)]


def record(price=100.0, age=10, closes=None, dates=None, **extra):
    closes = closes if closes is not None else wiggle()
    dates = dates if dates is not None else weekdays_before(SESSION, len(closes))
    rec = {"last_price": price, "quote_age_seconds": age,
           "bars": [{"date": d.isoformat(), "close": c} for d, c in zip(dates, closes)]}
    rec.update(extra)
    return rec


def check(rec):
    return check_symbol(rec, SESSION, 120)


class TestCleanData:
    def test_clean_record_is_usable(self):
        r = check(record(price=99.5))
        assert r["ok"] and r["flags"] == []

    def test_sigma_needs_min_bars(self):
        assert daily_sigma_pct([100.0] * (MIN_BARS - 1)) is None


class TestBlockingFlags:
    def test_missing_record(self):
        assert check(None)["blocking"] == ["missing_quote"]

    def test_missing_price(self):
        assert "missing_quote" in check(record(price=None))["blocking"]

    def test_stale_quote(self):
        assert "stale_quote" in check(record(age=121))["blocking"]

    def test_bad_price(self):
        assert check(record(price=0))["blocking"] == ["bad_price"]

    def test_bad_close_in_history(self):
        closes = wiggle()
        closes[5] = 0
        assert "bad_price" in check(record(closes=closes))["blocking"]

    def test_short_history(self):
        assert "insufficient_history" in check(record(closes=wiggle(10)))["blocking"]

    def test_missing_week_of_bars_is_a_gap(self):
        dates = weekdays_before(SESSION, 45)
        dates = dates[:20] + dates[25:]  # drop a full week
        rec = record(closes=wiggle(len(dates)), dates=dates)
        assert "history_gap" in check(rec)["blocking"]

    def test_weekend_plus_holiday_is_not_a_gap(self):
        dates = weekdays_before(SESSION, 40)
        dates.remove(date(2026, 9, 7))  # Labor Day: Fri -> Tue is 4 days
        r = check(record(closes=wiggle(len(dates)), dates=dates))
        assert "history_gap" not in r["flags"]

    def test_history_that_ends_weeks_ago_is_stale(self):
        dates = weekdays_before(SESSION - timedelta(days=14), 40)
        assert "history_stale" in check(record(dates=dates))["blocking"]


class TestJumps:
    def test_ordinary_move_is_not_a_jump(self):
        # last close is 101 (alternating series ends on +1%); 3% move ~ 1.5 sigma
        assert check(record(price=104.0))["ok"]

    def test_unexplained_jump_blocks(self):
        r = check(record(price=125.0))  # ~24% on a ~2% sigma name
        assert r["blocking"] == ["unexplained_jump"]

    def test_confirmed_catalyst_explains_a_jump(self):
        r = check(record(price=125.0, catalyst_confirmed=True))
        assert r["ok"] and r["flags"] == ["explained_jump"]

    def test_only_literal_true_confirms(self):
        r = check(record(price=125.0, catalyst_confirmed="yes"))
        assert "unexplained_jump" in r["blocking"]

    def test_split_sized_move_blocks_even_with_catalyst(self):
        r = check(record(price=50.0, catalyst_confirmed=True))
        assert "split_suspect" in r["blocking"]

    def test_quiet_name_needs_absolute_floor(self):
        # sigma ~0.2%: a 3% move is many sigmas but under the 5% floor
        r = check(record(price=103.0, closes=wiggle(amp=0.001)))
        assert r["ok"]


class TestCheckAll:
    def test_check_all_shape(self):
        out = check_all({"session": SESSION.isoformat(),
                         "symbols": {"LULU": record(), "AMC": record(age=999)}}, 120)
        assert out["symbols"]["LULU"]["ok"]
        assert not out["symbols"]["AMC"]["ok"]


def buy_plan(symbol="LULU"):
    return {
        "symbol": symbol, "horizon": "swing", "thesis": "t", "evidence": ["e"],
        "counterevidence": ["c"], "catalyst": "cat", "entry_condition": "ec",
        "invalidation": "inv", "max_position_pct": 12, "confidence": "high",
        "decision": "PROPOSE_ORDER", "score": 90, "quote_age_seconds": 10,
        "order": {"action": "buy", "order_type": "limit", "quantity": 1,
                  "limit_price": 50.0, "time_in_force": "gfd"},
    }


PORTFOLIO = {"equity_value": 2000.0, "cash": 2000.0, "positions": {}}


class TestGate:
    @pytest.fixture
    def policy(self):
        p = load_policy()
        p["mode"] = "shadow"
        return p

    def reasons(self, policy, dq):
        v = evaluate(buy_plan(), policy, load_watchlist(), portfolio=PORTFOLIO,
                     data_quality=dq)
        return [r for r in v.reasons if "data" in r]

    def test_no_quality_input_leaves_gate_unchanged(self, policy):
        assert self.reasons(policy, None) == []

    def test_usable_record_passes(self, policy):
        assert self.reasons(policy, {"LULU": {"ok": True, "blocking": []}}) == []

    def test_unusable_record_refuses(self, policy):
        r = self.reasons(policy, {"LULU": {"ok": False, "blocking": ["stale_quote"]}})
        assert r == ["data quality: stale_quote"]

    def test_missing_record_refuses(self, policy):
        assert self.reasons(policy, {}) == ["no data-quality record for LULU"]

    def test_abstention_never_blocked(self, policy):
        plan = buy_plan()
        plan["decision"] = "NO_TRADE"
        assert evaluate(plan, policy, load_watchlist(), data_quality={}).allowed


class TestValidateRunRequiresQuality:
    def write(self, tmp_path, session, symbol_data=None):
        body = {"session": session, "plans": [buy_plan()], "portfolio": PORTFOLIO}
        if symbol_data is not None:
            (tmp_path / "sym.json").write_text(json.dumps(symbol_data))
            body["symbol_data"] = "sym.json"
        f = tmp_path / "run.json"
        f.write_text(json.dumps(body))
        return str(f)

    def test_new_session_proposals_without_symbol_data_invalid(self, tmp_path):
        assert validate(["v", self.write(tmp_path, "2026-10-06")]) == 1

    def test_older_session_replays_without_symbol_data(self, tmp_path):
        assert validate(["v", self.write(tmp_path, "2026-09-23")]) == 0

    def test_unusable_symbol_is_reported_not_failed(self, tmp_path, capsys):
        data = {"session": "2026-10-06", "symbols": {"LULU": record(age=999)}}
        assert validate(["v", self.write(tmp_path, "2026-10-06", data)]) == 0
        out = capsys.readouterr().out
        assert "unusable LULU" in out and "data quality: stale_quote" in out
