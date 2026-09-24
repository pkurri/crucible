import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from policy import (  # noqa: E402
    ACCOUNT_MUTATION_TOOLS,
    BUY,
    EXECUTION_MODES,
    MCP_TOOL_PREFIX,
    NO_TRADE,
    ORDER_TOOLS,
    PROPOSAL_MODES,
    PROPOSE_ORDER,
    SELL,
    evaluate,
    freeze,
    load_policy,
    load_schema,
    load_watchlist,
    may_call_order_tool,
    may_place,
    validate_plan,
)

SCHEMA = load_schema()
WATCHLIST = ["AAPL", "MSFT"]


def make_policy(**overrides):
    policy = {
        "mode": "shadow",
        "order_type": "limit",
        "max_position_pct": 12,
        "max_order_usd": 312,
        "max_positions": 1,
        "daily_loss_limit_pct": 3,
        "min_score_to_propose": 70,
        "max_quote_age_seconds": 120,
        "settlement": {"reuse_unsettled_proceeds": True},
    }
    policy.update(overrides)
    return policy


def make_order(**overrides):
    order = {
        "action": BUY,
        "order_type": "limit",
        "quantity": 1.0,
        "limit_price": 182.00,
        "time_in_force": "gfd",
    }
    order.update(overrides)
    return order


def make_plan(order=None, **overrides):
    plan = {
        "symbol": "AAPL",
        "horizon": "swing",
        "thesis": "Margin expansion is not yet in the price.",
        "evidence": ["gross margin up 200bps YoY"],
        "counterevidence": ["multiple is above its 5-year median"],
        "catalyst": "Q4 earnings in 9 days",
        "entry_condition": "limit at or below 182.00",
        "invalidation": "guidance cut, or close below 175.00",
        "max_position_pct": 12,
        "confidence": "medium",
        "decision": PROPOSE_ORDER,
        "score": 78,
        "quote_age_seconds": 12,
        "order": make_order() if order is None else order,
    }
    plan.update(overrides)
    return plan


def portfolio(positions=None, cash=1000.0, equity=5000.0, unsettled=0.0):
    return {
        "positions": positions or {},
        "cash": cash,
        "equity_value": equity,
        "unsettled_cash": unsettled,
    }


def held(qty=10.0, value=1000.0):
    return {"quantity": qty, "value": value}


class TestOrderToolGate:
    @pytest.mark.parametrize("tool", sorted(ORDER_TOOLS))
    @pytest.mark.parametrize("mode", ["research_only", "shadow"])
    def test_order_tools_forbidden_outside_execution_modes(self, tool, mode):
        verdict = may_call_order_tool(tool, make_policy(mode=mode))
        assert verdict.allowed is False
        assert tool in verdict.reasons[0]

    @pytest.mark.parametrize("mode", sorted(EXECUTION_MODES))
    def test_execution_modes_permit_order_tools(self, mode):
        assert may_call_order_tool("place_equity_order", make_policy(mode=mode)).allowed

    @pytest.mark.parametrize("tool", sorted(ORDER_TOOLS))
    def test_namespaced_tool_names_are_gated_too(self, tool):
        verdict = may_call_order_tool(MCP_TOOL_PREFIX + tool, make_policy(mode="shadow"))
        assert verdict.allowed is False

    @pytest.mark.parametrize("tool", sorted(ACCOUNT_MUTATION_TOOLS))
    @pytest.mark.parametrize("mode", ["research_only", "shadow", "tiny_live"])
    def test_account_mutation_forbidden_in_every_mode(self, tool, mode):
        verdict = may_call_order_tool(tool, make_policy(mode=mode))
        assert verdict.allowed is False
        assert "mutates account state" in verdict.reasons[0]

    @pytest.mark.parametrize(
        "tool",
        ["get_equity_quotes", "get_portfolio", "get_equity_fundamentals", "search"],
    )
    def test_read_tools_are_never_gated(self, tool):
        for mode in ("research_only", "shadow", "tiny_live"):
            assert may_call_order_tool(tool, make_policy(mode=mode)).allowed

    def test_order_and_mutation_sets_are_disjoint(self):
        assert ORDER_TOOLS.isdisjoint(ACCOUNT_MUTATION_TOOLS)

    @pytest.mark.parametrize(
        "mode,expected",
        [("research_only", False), ("shadow", False), ("tiny_live", True)],
    )
    def test_may_place_only_in_execution_modes(self, mode, expected):
        assert may_place(make_policy(mode=mode)) is expected


class TestProposalFreezing:
    def test_same_order_same_id(self):
        assert freeze(make_order()) == freeze(make_order())

    def test_key_order_does_not_change_id(self):
        a = {"action": BUY, "order_type": "limit", "quantity": 1.0,
             "limit_price": 5.0, "time_in_force": "gfd"}
        b = {"time_in_force": "gfd", "limit_price": 5.0, "quantity": 1.0,
             "order_type": "limit", "action": BUY}
        assert freeze(a) == freeze(b)

    @pytest.mark.parametrize(
        "change",
        [{"action": SELL}, {"quantity": 2.0}, {"limit_price": 183.0},
         {"time_in_force": "gtc"}],
    )
    def test_any_material_change_breaks_the_id(self, change):
        assert freeze(make_order()) != freeze(make_order(**change))

    def test_verdict_carries_the_id(self):
        v = evaluate(make_plan(), make_policy(), WATCHLIST, schema=SCHEMA,
                     portfolio=portfolio())
        assert v.proposal_id == freeze(make_order())


class TestSchemaValidation:
    def test_valid_plan_has_no_errors(self):
        assert validate_plan(make_plan(), SCHEMA) == []

    @pytest.mark.parametrize("field", SCHEMA["required"])
    def test_each_missing_required_field_forces_no_trade(self, field):
        plan = make_plan()
        del plan[field]
        verdict = evaluate(plan, make_policy(), WATCHLIST, schema=SCHEMA)
        assert verdict.allowed is False
        assert verdict.decision == NO_TRADE
        assert any(field in r for r in verdict.reasons)

    @pytest.mark.parametrize(
        "field", ["action", "order_type", "quantity", "limit_price", "time_in_force"]
    )
    def test_missing_order_field_rejected(self, field):
        order = make_order()
        del order[field]
        errors = validate_plan(make_plan(order=order), SCHEMA)
        assert any(field in e for e in errors)

    def test_unknown_order_field_rejected(self):
        errors = validate_plan(make_plan(order=make_order(stop_price=1.0)), SCHEMA)
        assert any("stop_price" in e for e in errors)

    def test_market_order_rejected_by_schema(self):
        errors = validate_plan(make_plan(order=make_order(order_type="market")), SCHEMA)
        assert any("order_type" in e for e in errors)

    def test_negative_quantity_rejected(self):
        errors = validate_plan(make_plan(order=make_order(quantity=-1)), SCHEMA)
        assert any("quantity" in e for e in errors)

    def test_empty_counterevidence_rejected(self):
        assert any("counterevidence" in e
                   for e in validate_plan(make_plan(counterevidence=[]), SCHEMA))

    def test_unknown_top_level_field_rejected(self):
        assert any("price_target" in e
                   for e in validate_plan(make_plan(price_target=250), SCHEMA))

    def test_bad_enum_rejected(self):
        assert any("decision" in e
                   for e in validate_plan(make_plan(decision="BUY"), SCHEMA))

    def test_non_object_plan_rejected(self):
        assert validate_plan("NO_TRADE", SCHEMA) != []

    def test_propose_order_without_order_object_rejected(self):
        plan = make_plan()
        del plan["order"]
        verdict = evaluate(plan, make_policy(), WATCHLIST, schema=SCHEMA)
        assert verdict.allowed is False
        assert any("requires an 'order'" in r for r in verdict.reasons)


class TestModeGate:
    def test_research_only_forbids_any_proposal(self):
        verdict = evaluate(make_plan(), make_policy(mode="research_only"), WATCHLIST,
                           schema=SCHEMA, portfolio=portfolio())
        assert verdict.allowed is False
        assert any("does not permit order proposals" in r for r in verdict.reasons)

    @pytest.mark.parametrize("mode", sorted(PROPOSAL_MODES))
    def test_proposal_modes_allow_a_clean_proposal(self, mode):
        verdict = evaluate(make_plan(), make_policy(mode=mode), WATCHLIST,
                           schema=SCHEMA, portfolio=portfolio())
        assert verdict.allowed is True
        assert verdict.decision == PROPOSE_ORDER


class TestBuyGates:
    def test_buy_blocked_when_at_position_limit(self):
        p = portfolio({"MSFT": held()}, equity=1000.0)
        verdict = evaluate(make_plan(), make_policy(), WATCHLIST, schema=SCHEMA,
                           portfolio=p)
        assert verdict.allowed is False
        assert any("only exits are permitted" in r for r in verdict.reasons)

    def test_buy_blocked_when_legacy_book_is_far_over_limit(self):
        # The real situation: 19 positions against a cap of 1.
        positions = {"S%02d" % i: held() for i in range(19)}
        verdict = evaluate(make_plan(), make_policy(), WATCHLIST, schema=SCHEMA,
                           portfolio=portfolio(positions, equity=19000.0))
        assert verdict.allowed is False
        assert any("19 open position" in r for r in verdict.reasons)

    def test_oversized_order_rejected(self):
        verdict = evaluate(
            make_plan(order=make_order(quantity=10.0)),
            make_policy(max_positions=5), WATCHLIST, schema=SCHEMA,
            portfolio=portfolio(cash=10000.0))
        assert verdict.allowed is False
        assert any("max_order_usd" in r for r in verdict.reasons)

    def test_concentration_cap_enforced(self):
        # A $182 buy into a $200 account would be ~91% of it.
        verdict = evaluate(make_plan(), make_policy(), WATCHLIST, schema=SCHEMA,
                           portfolio=portfolio(cash=500.0, equity=200.0))
        assert verdict.allowed is False
        assert any("of the account, over" in r for r in verdict.reasons)

    def test_insufficient_cash_rejected(self):
        verdict = evaluate(make_plan(), make_policy(), WATCHLIST, schema=SCHEMA,
                           portfolio=portfolio(cash=10.80, equity=5000.0))
        assert verdict.allowed is False
        assert any("exceeds available cash" in r for r in verdict.reasons)

    def test_unsettled_proceeds_usable_under_limited_margin(self):
        p = portfolio(cash=10.0, unsettled=400.0, equity=5000.0)
        verdict = evaluate(make_plan(), make_policy(), WATCHLIST, schema=SCHEMA,
                           portfolio=p)
        assert not any("available cash" in r for r in verdict.reasons)

    def test_unsettled_proceeds_ignored_when_settlement_forbids(self):
        pol = make_policy(settlement={"reuse_unsettled_proceeds": False})
        p = portfolio(cash=10.0, unsettled=400.0, equity=5000.0)
        verdict = evaluate(make_plan(), pol, WATCHLIST, schema=SCHEMA, portfolio=p)
        assert any("available cash" in r for r in verdict.reasons)


class TestSellGates:
    def test_exit_allowed_even_when_far_over_position_limit(self):
        positions = {"AAPL": held(qty=10.0, value=1800.0)}
        positions.update({"S%02d" % i: held() for i in range(18)})
        verdict = evaluate(
            make_plan(order=make_order(action=SELL, quantity=10.0)),
            make_policy(), WATCHLIST, schema=SCHEMA,
            portfolio=portfolio(positions, cash=0.0, equity=19800.0))
        assert verdict.allowed is True
        assert verdict.decision == PROPOSE_ORDER

    def test_exit_not_blocked_by_zero_cash(self):
        verdict = evaluate(
            make_plan(order=make_order(action=SELL, quantity=1.0)),
            make_policy(), WATCHLIST, schema=SCHEMA,
            portfolio=portfolio({"AAPL": held()}, cash=0.0, equity=1000.0))
        assert verdict.allowed is True

    def test_cannot_sell_what_is_not_held(self):
        verdict = evaluate(
            make_plan(order=make_order(action=SELL)),
            make_policy(), WATCHLIST, schema=SCHEMA, portfolio=portfolio())
        assert verdict.allowed is False
        assert any("forbids shorting" in r for r in verdict.reasons)

    def test_cannot_sell_more_than_held(self):
        verdict = evaluate(
            make_plan(order=make_order(action=SELL, quantity=50.0)),
            make_policy(), WATCHLIST, schema=SCHEMA,
            portfolio=portfolio({"AAPL": held(qty=10.0)}, equity=1000.0))
        assert verdict.allowed is False
        assert any("only 10.0 available" in r for r in verdict.reasons)

    def test_exit_still_bound_by_watchlist_and_staleness(self):
        verdict = evaluate(
            make_plan(symbol="GME", quote_age_seconds=900,
                      order=make_order(action=SELL)),
            make_policy(), WATCHLIST, schema=SCHEMA,
            portfolio=portfolio({"GME": held()}, equity=1000.0))
        assert verdict.allowed is False
        assert any("watchlist" in r for r in verdict.reasons)
        assert any("stale" in r for r in verdict.reasons)


class TestSharedGates:
    def test_symbol_off_watchlist_rejected(self):
        verdict = evaluate(make_plan(symbol="GME"), make_policy(), WATCHLIST,
                           schema=SCHEMA, portfolio=portfolio())
        assert verdict.allowed is False

    def test_model_chosen_position_size_rejected(self):
        verdict = evaluate(make_plan(max_position_pct=40), make_policy(), WATCHLIST,
                           schema=SCHEMA, portfolio=portfolio())
        assert any("sizing comes from policy" in r for r in verdict.reasons)

    def test_score_below_threshold_rejected(self):
        verdict = evaluate(make_plan(score=55), make_policy(), WATCHLIST,
                           schema=SCHEMA, portfolio=portfolio())
        assert verdict.allowed is False

    def test_stale_quote_rejected(self):
        verdict = evaluate(make_plan(quote_age_seconds=900), make_policy(), WATCHLIST,
                           schema=SCHEMA, portfolio=portfolio())
        assert any("stale" in r for r in verdict.reasons)

    def test_duplicate_proposal_rejected(self):
        pid = freeze(make_order())
        verdict = evaluate(make_plan(), make_policy(), WATCHLIST, schema=SCHEMA,
                           portfolio=portfolio(), open_proposal_ids=(pid,))
        assert verdict.allowed is False
        assert any("duplicate proposal" in r for r in verdict.reasons)

    def test_daily_loss_limit_rejected(self):
        verdict = evaluate(make_plan(), make_policy(), WATCHLIST, schema=SCHEMA,
                           portfolio=portfolio(), daily_loss_pct=3.4)
        assert verdict.allowed is False

    def test_all_reasons_reported_not_just_first(self):
        verdict = evaluate(make_plan(symbol="GME", score=10), make_policy(),
                           WATCHLIST, schema=SCHEMA,
                           portfolio=portfolio({"X": held()}, equity=1000.0))
        assert len(verdict.reasons) >= 3


class TestAbstention:
    def test_no_trade_always_allowed(self):
        plan = make_plan(decision=NO_TRADE, symbol="MSFT")
        verdict = evaluate(plan, make_policy(mode="research_only"), WATCHLIST,
                           schema=SCHEMA)
        assert verdict.allowed is True
        assert verdict.reasons == ()

    def test_no_trade_allowed_even_off_watchlist(self):
        plan = make_plan(decision=NO_TRADE, symbol="GME")
        assert evaluate(plan, make_policy(), WATCHLIST, schema=SCHEMA).allowed


class TestShippedConfig:
    def test_shipped_policy_is_shadow(self):
        assert load_policy()["mode"] == "shadow"

    def test_shipped_policy_cannot_place(self):
        assert may_place(load_policy()) is False

    def test_shipped_policy_has_no_unset_placeholders(self):
        assert "USER_DEFINED_REQUIRED" not in str(load_policy())

    def test_shipped_policy_forbids_unattended_execution(self):
        policy = load_policy()
        assert policy["allow_scheduled_execution"] is False
        assert policy["require_human_approval"] is True
        assert policy["long_only"] is True
        assert policy["shadow"]["placement_enabled"] is False

    def test_shipped_policy_records_real_account_type(self):
        policy = load_policy()
        assert policy["account_type"] == "limited_margin"
        assert policy["settlement"]["margin_borrowing_enabled"] is False

    def test_legacy_positions_count(self):
        assert load_policy()["legacy_positions_count_toward_limits"] is True

    def test_shipped_watchlist_is_small_and_uppercase(self):
        watchlist = load_watchlist()
        assert 1 <= len(watchlist) <= 15
        assert all(s.isupper() for s in watchlist)
