import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from validate_run import main  # noqa: E402


def plan(symbol="LULU", decision="NO_TRADE", **o):
    p = {
        "symbol": symbol, "horizon": "swing", "thesis": "t",
        "evidence": ["e"], "counterevidence": ["c"], "catalyst": "cat",
        "entry_condition": "ec", "invalidation": "inv",
        "max_position_pct": 12, "confidence": "low",
        "decision": decision, "score": 40, "quote_age_seconds": 10,
    }
    p.update(o)
    return p


def sell(symbol, qty, price):
    return plan(symbol=symbol, decision="PROPOSE_ORDER", score=84,
                order={"action": "sell", "order_type": "limit", "quantity": qty,
                       "limit_price": price, "time_in_force": "gfd"})


def run_file(tmp_path, plans, portfolio=None):
    body = {"session": "t", "plans": plans}
    if portfolio is not None:
        body["portfolio"] = portfolio
    f = tmp_path / "run.json"
    f.write_text(json.dumps(body))
    return str(f)


PORTFOLIO = {"equity_value": 1000.0,
             "positions": {"LCID": {"quantity": 2.1, "value": 8.7}}}


class TestValidateRun:
    def test_all_abstentions_are_valid(self, tmp_path):
        assert main(["v", run_file(tmp_path, [plan(), plan("AMC")])]) == 0

    def test_malformed_plan_invalidates_the_run(self, tmp_path):
        bad = plan()
        del bad["thesis"]
        assert main(["v", run_file(tmp_path, [bad])]) == 1

    def test_sell_of_a_held_position_validates(self, tmp_path):
        """Regression: an empty portfolio made every sell look like a short."""
        f = run_file(tmp_path, [sell("LCID", 2.1, 4.14)], PORTFOLIO)
        assert main(["v", f]) == 0

    def test_gate_refusal_does_not_invalidate_the_run(self, tmp_path, capsys):
        """A well-formed proposal the policy refuses is the gate working.

        Treating it as a failed run would make the routine discard every
        session in which the agent proposes something the policy blocks.
        """
        f = run_file(tmp_path, [sell("AMC", 5, 2.9)], PORTFOLIO)
        assert main(["v", f]) == 0
        out = capsys.readouterr().out
        assert "refused by policy" in out
        assert "1 refused by the gate" in out

    def test_shipped_session_files_validate(self):
        runs = Path(__file__).resolve().parents[1] / "runs"
        for f in sorted(runs.glob("2026-*.json")):
            if f.name.endswith("-market.json"):
                continue
            assert main(["v", str(f)]) == 0, f.name
