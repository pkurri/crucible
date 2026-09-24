import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from policy import (  # noqa: E402
    BUY,
    PROPOSE_ORDER,
    SELL,
    evaluate,
    freeze,
    load_schema,
)
from report import analyze, classify_reason, render  # noqa: E402

SCHEMA = load_schema()
WATCHLIST = ["AAPL", "MSFT"]


def policy(**overrides):
    p = {
        "mode": "shadow",
        "order_type": "limit",
        "max_position_pct": 12,
        "max_order_usd": 312,
        "max_positions": 1,
        "daily_loss_limit_pct": 3,
        "min_score_to_propose": 70,
        "max_quote_age_seconds": 120,
        "settlement": {"reuse_unsettled_proceeds": False},
        "shadow": {"sessions_required": 20},
    }
    p.update(overrides)
    return p


def order(**o):
    base = {"action": BUY, "order_type": "limit", "quantity": 1.0,
            "limit_price": 182.0, "time_in_force": "gfd"}
    base.update(o)
    return base


def plan(**o):
    p = {
        "symbol": "AAPL", "horizon": "swing", "thesis": "t",
        "evidence": ["e"], "counterevidence": ["c"], "catalyst": "cat",
        "entry_condition": "ec", "invalidation": "inv",
        "max_position_pct": 12, "confidence": "medium",
        "decision": PROPOSE_ORDER, "score": 78, "quote_age_seconds": 12,
        "order": order(),
    }
    p.update(o)
    return p


def pf(positions=None, cash=1000.0, equity=5000.0, unsettled=0.0):
    return {"positions": positions or {}, "cash": cash,
            "equity_value": equity, "unsettled_cash": unsettled}


def row(**o):
    r = {
        "session": "s1", "recorded_utc": "2026-09-23T00:00:00+00:00",
        "symbol": "AAPL", "proposal_id": freeze(order()), "order": order(),
        "score": 78, "allowed": True, "reasons": [], "placed": False,
        "placement_enabled": False,
        "simulated": {"filled": True, "fill_price": 182.0, "why": "ok"},
    }
    r.update(o)
    return r


class TestReasonClassificationDoesNotDrift:
    """Every reason the gate can emit must map to a named rule.

    This is the test that catches wording drift: if policy.py rephrases a
    rejection, the report would silently bucket it as 'unclassified' and the
    promotion summary would stop meaning anything.
    """

    def collected_reasons(self):
        cases = [
            # off watchlist + stale + low score at once
            (plan(symbol="GME", score=10, quote_age_seconds=999), policy(), pf()),
            # model-chosen sizing
            (plan(max_position_pct=40), policy(), pf()),
            # missing score / missing quote age
            (plan(score=None), policy(), pf()),
            (plan(quote_age_seconds=None), policy(), pf()),
            # position count + concentration
            (plan(), policy(), pf({"X": {"quantity": 1, "value": 100}}, equity=200.0)),
            # order size
            (plan(order=order(quantity=10.0)), policy(max_positions=9), pf(cash=99999.0)),
            # insufficient cash
            (plan(), policy(), pf(cash=1.0)),
            # wrong order type is caught by schema, so use the policy mismatch
            (plan(), policy(order_type="market"), pf()),
            # cannot short / oversell
            (plan(order=order(action=SELL)), policy(), pf()),
            (plan(order=order(action=SELL, quantity=99.0)), policy(),
             pf({"AAPL": {"quantity": 2, "value": 400}})),
            # daily loss
            (plan(), policy(), pf()),
            # mode forbids proposals
            (plan(), policy(mode="research_only"), pf()),
        ]
        reasons = []
        for p, pol, port in cases:
            v = evaluate(p, pol, WATCHLIST, schema=SCHEMA, portfolio=port,
                         daily_loss_pct=0.0)
            reasons.extend(v.reasons)
        # daily loss needs its own call
        v = evaluate(plan(), policy(), WATCHLIST, schema=SCHEMA, portfolio=pf(),
                     daily_loss_pct=9.0)
        reasons.extend(v.reasons)
        # duplicate
        v = evaluate(plan(), policy(), WATCHLIST, schema=SCHEMA, portfolio=pf(),
                     open_proposal_ids=(freeze(order()),))
        reasons.extend(v.reasons)
        # PROPOSE_ORDER with no order object
        bare = plan()
        del bare["order"]
        v = evaluate(bare, policy(), WATCHLIST, schema=SCHEMA, portfolio=pf())
        reasons.extend(v.reasons)
        return reasons

    def test_reasons_were_actually_produced(self):
        assert len(self.collected_reasons()) > 12

    def test_no_reason_is_unclassified(self):
        unclassified = [
            r for r in self.collected_reasons()
            if classify_reason(r).startswith("unclassified")
        ]
        assert unclassified == [], (
            "policy.py emits reasons report.py cannot name: " + repr(unclassified)
        )

    def test_classification_hides_symbols_and_numbers(self):
        label = classify_reason("LULU would be 21.7% of the account, over the 12% cap")
        assert label == "concentration cap"
        assert "LULU" not in label and "21.7" not in label

    def test_duplicate_ids_collapse_to_one_rule(self):
        a = classify_reason("duplicate proposal abc123 is already open")
        b = classify_reason("duplicate proposal def456 is already open")
        assert a == b == "duplicate proposal"


class TestHardGates:
    def base(self, rows, state=None):
        return analyze(rows, state or {"sessions_completed": {"shadow": 20}}, policy())

    def test_clean_ledger_at_full_sessions_is_ready(self):
        a = self.base([row(), row(symbol="MSFT")])
        assert a["ready"] is True

    def test_placed_order_is_a_bypass(self):
        a = self.base([row(placed=True)])
        assert a["bypasses"] == 1
        assert a["ready"] is False

    def test_placement_enabled_is_a_bypass(self):
        a = self.base([row(placement_enabled=True)])
        assert a["ready"] is False

    def test_row_without_proposal_id_is_unfrozen(self):
        a = self.base([row(proposal_id=None)])
        assert a["unfrozen"] == 1 and a["ready"] is False

    def test_passing_row_without_simulation_is_unreconciled(self):
        a = self.base([row(simulated=None)])
        assert a["unreconciled"] == 1 and a["ready"] is False

    def test_rejected_row_with_simulation_is_unreconciled(self):
        a = self.base([row(allowed=False, reasons=["x"],
                           simulated={"filled": True})])
        assert a["unreconciled"] == 1

    def test_short_of_required_sessions_is_not_ready(self):
        a = analyze([row()], {"sessions_completed": {"shadow": 3}}, policy())
        assert a["ready"] is False
        assert any("shadow sessions logged" in n for n, ok, _ in a["hard_gates"] if not ok)


class TestMetrics:
    def test_counts_split_by_side(self):
        a = analyze([row(), row(order=order(action=SELL))], {}, policy())
        assert a["buys"] == 1 and a["sells"] == 1

    def test_duplicate_rate_counted(self):
        rows = [row(allowed=False, simulated=None,
                    reasons=["duplicate proposal abc is already open"])]
        a = analyze(rows, {}, policy())
        assert a["duplicates"] == 1

    def test_stale_data_counted(self):
        rows = [row(allowed=False, simulated=None,
                    reasons=["quote is stale: 900s older than 120s limit"])]
        a = analyze(rows, {}, policy())
        assert a["stale_or_missing"] == 1

    def test_fills_and_no_fills_split(self):
        rows = [row(), row(simulated={"filled": False, "why": "x"})]
        a = analyze(rows, {}, policy())
        assert a["fills"] == 1 and a["no_fills"] == 1

    def test_unknown_fill_is_tracked_separately(self):
        a = analyze([row(simulated={"filled": None, "why": "no quote"})], {}, policy())
        assert a["unknown_fills"] == 1


class TestRendering:
    def test_not_ready_report_names_what_is_missing(self):
        a = analyze([row()], {"sessions_completed": {"shadow": 1}}, policy())
        text = render(a)
        assert "NOT READY" in text
        assert "shadow sessions logged" in text

    def test_ready_report_still_requires_a_deliberate_promotion(self):
        a = analyze([row()], {"sessions_completed": {"shadow": 20}}, policy())
        text = render(a)
        assert "may be considered" in text
        assert "deliberate mode change" in text

    def test_anomalies_are_surfaced(self):
        state = {"sessions_completed": {"shadow": 20},
                 "anomalies": [{"utc": "2026-09-23T00:00:00+00:00",
                                "note": "something happened",
                                "counts_toward_shadow_period": False}]}
        text = render(analyze([row()], state, policy()))
        assert "RECORDED ANOMALIES" in text
        assert "counts: False" in text


class TestShippedLedger:
    def test_real_ledger_reports_not_ready(self):
        from report import load_ledger, load_policy, load_state

        rows = load_ledger()
        if not rows:
            pytest.skip("no ledger yet")
        a = analyze(rows, load_state(), load_policy())
        assert a["ready"] is False, "only 1 of 20 sessions has run"
        assert a["bypasses"] == 0
        assert a["unreconciled"] == 0
