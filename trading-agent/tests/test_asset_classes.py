import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from policy import (  # noqa: E402
    BUY,
    PROPOSE_ORDER,
    cap_for,
    evaluate,
    is_diversified,
    load_diversified_funds,
    load_policy,
    load_schema,
    load_single_names,
    load_watchlist,
)

SCHEMA = load_schema()
FUNDS = ["VOO", "SGOV"]
WATCHLIST = ["LULU", "AMC", "VOO", "SGOV"]


def policy(**o):
    p = {
        "mode": "shadow", "order_type": "limit",
        "max_position_pct": 12, "max_position_pct_diversified": 85,
        "agent_sleeve_usd": 450, "max_positions": 4, "max_order_usd": 312,
        "daily_loss_limit_pct": 3, "min_score_to_propose": 70,
        "max_quote_age_seconds": 120,
        "settlement": {"reuse_unsettled_proceeds": False},
    }
    p.update(o)
    return p


def plan(symbol="LULU", pct=12, qty=1.0, price=100.0, **o):
    p = {
        "symbol": symbol, "horizon": "swing", "thesis": "t",
        "evidence": ["e"], "counterevidence": ["c"], "catalyst": "cat",
        "entry_condition": "ec", "invalidation": "inv",
        "max_position_pct": pct, "confidence": "medium",
        "decision": PROPOSE_ORDER, "score": 78, "quote_age_seconds": 12,
        "order": {"action": BUY, "order_type": "limit", "quantity": qty,
                  "limit_price": price, "time_in_force": "gfd"},
    }
    p.update(o)
    return p


def pf(positions=None, cash=5000.0, equity=0.0):
    return {"positions": positions or {}, "cash": cash,
            "equity_value": equity, "unsettled_cash": 0.0}


def ev(p, pol=None, port=None):
    return evaluate(p, pol or policy(), WATCHLIST, schema=SCHEMA,
                    portfolio=port or pf(), diversified_funds=FUNDS)


class TestClassification:
    def test_fund_is_diversified(self):
        assert is_diversified("VOO", FUNDS) is True

    def test_single_name_is_not(self):
        assert is_diversified("LULU", FUNDS) is False

    def test_cap_differs_by_class(self):
        assert cap_for("VOO", policy(), FUNDS) == 85
        assert cap_for("LULU", policy(), FUNDS) == 12

    def test_missing_diversified_cap_falls_back_to_the_strict_one(self):
        pol = {"max_position_pct": 12}
        assert cap_for("VOO", pol, FUNDS) == 12


class TestIndexCoreIsAllowedToBeTheCore:
    def test_fund_may_hold_a_share_that_would_refuse_a_single_name(self):
        """$280 of VOO against $200 of other equity is ~58% -- fine for a
        fund, far over the 12% cap for a company."""
        v = ev(plan(symbol="VOO", pct=85, qty=0.4, price=700.0),
               port=pf(cash=5000.0, equity=200.0))
        assert v.allowed is True, v.reasons

    def test_same_size_single_name_is_refused(self):
        v = ev(plan(symbol="LULU", pct=12, qty=2.8, price=100.0),
               port=pf(cash=5000.0, equity=200.0))
        assert v.allowed is False
        assert any("single-name cap" in r for r in v.reasons)

    def test_fund_still_has_a_ceiling(self):
        v = ev(plan(symbol="VOO", pct=85, qty=0.4, price=700.0),
               port=pf(cash=5000.0, equity=1.0))
        assert v.allowed is False
        assert any("diversified cap" in r for r in v.reasons)

    def test_model_must_use_the_class_cap_not_the_other_one(self):
        v = ev(plan(symbol="VOO", pct=12, qty=0.4, price=700.0),
               port=pf(cash=5000.0, equity=200.0))
        assert any("does not match the policy cap 85" in r for r in v.reasons)

    def test_agent_cannot_buy_a_core_sized_fund_position(self):
        """The order cap binds funds too, and that is deliberate.

        A ~$2,000 index core is the USER's purchase, made manually. The agent
        operates inside its sleeve; letting it move core-sized money would make
        it exactly the thing the playbook warns against -- a connection to the
        whole portfolio with no blast-radius limit.
        """
        v = ev(plan(symbol="VOO", pct=85, qty=3.0, price=700.0),
               port=pf(cash=9000.0, equity=200.0))
        assert v.allowed is False
        assert any("max_order_usd" in r for r in v.reasons)


class TestAgentSleeve:
    def test_single_name_inside_the_sleeve_passes(self):
        v = ev(plan(symbol="LULU", qty=1.0, price=100.0),
               port=pf(cash=5000.0, equity=3000.0,
                       positions={"VOO": {"quantity": 4, "value": 2800.0}}))
        assert v.allowed is True, v.reasons

    def test_single_name_over_the_sleeve_is_refused(self):
        v = ev(plan(symbol="LULU", qty=3.0, price=100.0),
               port=pf(cash=5000.0, equity=3000.0,
                       positions={"AMC": {"quantity": 1, "value": 300.0}}))
        assert v.allowed is False
        assert any("agent sleeve" in r for r in v.reasons)

    def test_the_index_core_does_not_consume_the_sleeve(self):
        """A large VOO holding must not starve the agent's single-name budget."""
        v = ev(plan(symbol="LULU", qty=1.0, price=100.0),
               port=pf(cash=5000.0, equity=9000.0,
                       positions={"VOO": {"quantity": 12, "value": 8500.0}}))
        assert not any("sleeve" in r for r in v.reasons), v.reasons

    def test_buying_the_fund_itself_is_not_sleeve_constrained(self):
        v = ev(plan(symbol="VOO", pct=85, qty=1.0, price=700.0),
               port=pf(cash=5000.0, equity=2000.0,
                       positions={"LULU": {"quantity": 4, "value": 440.0}}))
        assert not any("sleeve" in r for r in v.reasons), v.reasons


class TestShippedConfig:
    def test_funds_and_single_names_are_disjoint(self):
        assert set(load_diversified_funds()).isdisjoint(set(load_single_names()))

    def test_watchlist_is_the_union(self):
        assert set(load_watchlist()) == set(load_single_names()) | set(
            load_diversified_funds()
        )

    def test_no_leveraged_product_reached_the_fund_list(self):
        banned = {"NAIL", "SOLT", "HIMZ", "XXRP", "TSLQ", "TQQQ", "SQQQ", "SOXL"}
        assert banned.isdisjoint(set(load_diversified_funds()))

    def test_position_count_was_set_deliberately(self):
        assert load_policy()["max_positions"] == 4

    def test_diversified_cap_is_higher_than_the_single_name_cap(self):
        p = load_policy()
        assert p["max_position_pct_diversified"] > p["max_position_pct"]

    def test_sleeve_is_smaller_than_the_budget(self):
        p = load_policy()
        assert 0 < p["agent_sleeve_usd"] < p["budget_usd"]
