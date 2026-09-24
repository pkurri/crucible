"""Deterministic policy engine for the Robinhood agent.

The model writes proposals. This module decides whether a proposal is allowed.
Nothing here consults the model, and no function in this file places an order.

Entries and exits are gated differently on purpose: an exposure limit
constrains how much risk may be added, so a sell that reduces exposure cannot
breach it. That asymmetry is what lets the agent work an account that is
already over its limits without either loosening the limits or being frozen.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).parent
POLICY_PATH = BASE_DIR / "POLICY.yaml"
WATCHLIST_PATH = BASE_DIR / "WATCHLIST.yaml"
SCHEMA_PATH = BASE_DIR / "schema" / "trade_plan.schema.json"

NO_TRADE = "NO_TRADE"
PROPOSE_ORDER = "PROPOSE_ORDER"

BUY = "buy"
SELL = "sell"

# Modes in which a proposal may be formed at all.
PROPOSAL_MODES = frozenset({"shadow", "tiny_live", "limited_automation"})
# Modes in which an order may actually reach the broker.
EXECUTION_MODES = frozenset({"tiny_live", "limited_automation"})

MCP_TOOL_PREFIX = "mcp__claude_ai_robinhood__"

# Tools that move capital or stand on the direct path to it. Names taken from
# the live Robinhood Trading MCP catalog, not from the playbook's prose.
ORDER_TOOLS = frozenset(
    {
        "place_equity_order",
        "place_option_order",
        "place_crypto_order",
        "review_equity_order",
        "review_option_order",
        "preview_crypto_order",
        "cancel_equity_order",
        "cancel_option_order",
        "cancel_crypto_order",
        "exercise_option",
        "cancel_option_exercise",
    }
)

# Tools that mutate durable account state. They spend no money, but AGENT.md
# forbids the agent editing its own watchlist, alerts, or scans in any phase.
ACCOUNT_MUTATION_TOOLS = frozenset(
    {
        "create_watchlist",
        "update_watchlist",
        "add_to_watchlist",
        "remove_from_watchlist",
        "add_option_to_watchlist",
        "remove_option_from_watchlist",
        "follow_watchlist",
        "unfollow_watchlist",
        "create_alert",
        "update_alert",
        "delete_alert",
        "mark_alerts_read",
        "create_scan",
        "update_scan_config",
        "update_scan_filters",
    }
)

# The fields whose values define a proposal's identity. Changing any of them
# produces a different proposal id, which invalidates any prior approval.
FROZEN_FIELDS = ("symbol", "action", "order_type", "quantity", "limit_price", "time_in_force")


def normalize_tool_name(tool_name: str) -> str:
    """Accept either the bare MCP tool name or its namespaced form."""
    return tool_name.removeprefix(MCP_TOOL_PREFIX)


@dataclass(frozen=True)
class Verdict:
    """Result of a policy evaluation.

    `allowed` means the proposal is within policy, not that it may be placed.
    Placement is a separate question answered by `may_place`.
    """

    allowed: bool
    decision: str
    reasons: tuple[str, ...]
    proposal_id: str | None = None


def load_yaml(path: Path) -> dict[str, Any]:
    import yaml

    return yaml.safe_load(path.read_text())


def load_policy(path: Path = POLICY_PATH) -> dict[str, Any]:
    return load_yaml(path)


def load_watchlist(path: Path = WATCHLIST_PATH) -> list[str]:
    return list(load_yaml(path)["symbols"])


def load_schema(path: Path = SCHEMA_PATH) -> dict[str, Any]:
    return json.loads(path.read_text())


def may_call_order_tool(tool_name: str, policy: dict[str, Any]) -> Verdict:
    """Gate every write-capable MCP tool on the configured mode.

    Order tools are permitted only in an execution mode. Account-mutation
    tools are never permitted in any mode -- the agent does not edit its own
    watchlist, alerts, or scans.
    """
    mode = policy.get("mode")
    name = normalize_tool_name(tool_name)

    if name in ACCOUNT_MUTATION_TOOLS:
        return Verdict(
            False,
            NO_TRADE,
            (f"tool {name!r} mutates account state and is never permitted",),
        )

    if name in ORDER_TOOLS and mode not in EXECUTION_MODES:
        return Verdict(
            False,
            NO_TRADE,
            (f"tool {name!r} is forbidden in mode {mode!r}",),
        )

    return Verdict(True, PROPOSE_ORDER, ())


def may_place(policy: dict[str, Any]) -> bool:
    """Whether the configured mode permits an order to reach the broker."""
    return policy.get("mode") in EXECUTION_MODES


def freeze(order: dict[str, Any]) -> str:
    """Stable id over the fields that define a proposal.

    Any change to symbol, side, size, order type, price or time-in-force
    produces a different id, so a prior approval cannot carry over to it.
    """
    canonical = json.dumps(
        {k: order.get(k) for k in FROZEN_FIELDS},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]


# --------------------------------------------------------------------------
# schema validation
# --------------------------------------------------------------------------


def validate_plan(plan: Any, schema: dict[str, Any]) -> list[str]:
    """Validate a trade plan against the subset of JSON Schema we author.

    Returns a list of human-readable errors; empty means valid.
    """
    return _validate_object("plan", plan, schema)


def _validate_object(path: str, value: Any, schema: dict[str, Any]) -> list[str]:
    if not isinstance(value, dict):
        return [f"{path} must be an object, got {type(value).__name__}"]

    errors: list[str] = []
    properties: dict[str, Any] = schema.get("properties", {})

    for field in schema.get("required", []):
        if field not in value:
            errors.append(f"missing required field {_join(path, field)!r}")

    if schema.get("additionalProperties") is False:
        for field in value:
            if field not in properties:
                errors.append(f"unknown field {_join(path, field)!r}")

    for field, item in value.items():
        spec = properties.get(field)
        if spec is not None:
            errors.extend(_validate_value(_join(path, field), item, spec))

    return errors


def _join(path: str, field: str) -> str:
    return field if path == "plan" else f"{path}.{field}"


def _validate_value(field: str, value: Any, spec: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    if "enum" in spec and value not in spec["enum"]:
        errors.append(f"{field!r} must be one of {spec['enum']}, got {value!r}")

    expected = spec.get("type")
    if expected and not _type_matches(value, expected):
        errors.append(f"{field!r} must be {expected}, got {type(value).__name__}")
        return errors

    if expected == "object":
        errors.extend(_validate_object(field, value, spec))

    if expected == "string":
        if len(value) < spec.get("minLength", 0):
            errors.append(f"{field!r} is shorter than minLength")
        pattern = spec.get("pattern")
        if pattern and not re.fullmatch(pattern, value):
            errors.append(f"{field!r} does not match {pattern}")

    if expected == "array":
        if len(value) < spec.get("minItems", 0):
            errors.append(f"{field!r} needs at least {spec['minItems']} item(s)")
        item_spec = spec.get("items")
        if item_spec:
            for index, item in enumerate(value):
                errors.extend(_validate_value(f"{field}[{index}]", item, item_spec))

    if expected == "number":
        if "exclusiveMinimum" in spec and not value > spec["exclusiveMinimum"]:
            errors.append(f"{field!r} must be > {spec['exclusiveMinimum']}")
        if "minimum" in spec and value < spec["minimum"]:
            errors.append(f"{field!r} must be >= {spec['minimum']}")
        if "maximum" in spec and value > spec["maximum"]:
            errors.append(f"{field!r} must be <= {spec['maximum']}")

    return errors


def _type_matches(value: Any, expected: str) -> bool:
    if expected == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if expected == "string":
        return isinstance(value, str)
    if expected == "array":
        return isinstance(value, list)
    if expected == "object":
        return isinstance(value, dict)
    raise ValueError(f"unsupported schema type {expected!r}")


# --------------------------------------------------------------------------
# the gate
# --------------------------------------------------------------------------


def empty_portfolio() -> dict[str, Any]:
    return {"positions": {}, "equity_value": 0.0, "cash": 0.0, "unsettled_cash": 0.0}


def evaluate(
    plan: Any,
    policy: dict[str, Any],
    watchlist: list[str],
    *,
    schema: dict[str, Any] | None = None,
    portfolio: dict[str, Any] | None = None,
    open_proposal_ids: tuple[str, ...] = (),
    daily_loss_pct: float = 0.0,
) -> Verdict:
    """Decide whether a proposal may stand.

    A plan that says NO_TRADE is always allowed -- abstaining is never a
    violation. A PROPOSE_ORDER plan must clear every applicable gate, and
    which gates apply depends on whether it adds or reduces exposure.
    """
    schema = schema if schema is not None else load_schema()
    portfolio = portfolio if portfolio is not None else empty_portfolio()

    schema_errors = validate_plan(plan, schema)
    if schema_errors:
        return Verdict(False, NO_TRADE, tuple(schema_errors))

    if plan["decision"] == NO_TRADE:
        return Verdict(True, NO_TRADE, ())

    reasons: list[str] = []
    mode = policy["mode"]

    if mode not in PROPOSAL_MODES:
        return Verdict(
            False,
            NO_TRADE,
            (f"mode {mode!r} does not permit order proposals",),
        )

    order = plan.get("order")
    if not isinstance(order, dict):
        return Verdict(
            False, NO_TRADE, ("PROPOSE_ORDER requires an 'order' object",)
        )

    proposal_id = freeze(order)
    action = order["action"]
    symbol = plan["symbol"]
    positions = portfolio.get("positions", {})
    held = positions.get(symbol)

    # --- gates that apply to every proposal ---------------------------------

    if symbol not in watchlist:
        reasons.append(f"{symbol} is not on the approved watchlist")

    if order["order_type"] != policy["order_type"]:
        reasons.append(
            f"order type {order['order_type']!r} is not the policy's "
            f"{policy['order_type']!r}"
        )

    if plan["max_position_pct"] != policy["max_position_pct"]:
        reasons.append(
            f"max_position_pct {plan['max_position_pct']} does not match policy "
            f"value {policy['max_position_pct']}; sizing comes from policy, "
            "not the model"
        )

    score = plan.get("score")
    if score is None:
        reasons.append("score is required to propose an order")
    elif score < policy["min_score_to_propose"]:
        reasons.append(
            f"score {score} is below threshold {policy['min_score_to_propose']}"
        )

    quote_age = plan.get("quote_age_seconds")
    if quote_age is None:
        reasons.append("quote_age_seconds is required to propose an order")
    elif quote_age > policy["max_quote_age_seconds"]:
        reasons.append(
            f"quote is stale: {quote_age}s older than "
            f"{policy['max_quote_age_seconds']}s limit"
        )

    if proposal_id in open_proposal_ids:
        reasons.append(f"duplicate proposal {proposal_id} is already open")

    if daily_loss_pct >= policy["daily_loss_limit_pct"]:
        reasons.append(
            f"daily loss {daily_loss_pct}% has reached the "
            f"{policy['daily_loss_limit_pct']}% limit"
        )

    notional = order["quantity"] * order["limit_price"]

    # --- gates that apply only to exposure-adding proposals -----------------

    if action == BUY:
        open_count = len(positions)
        if open_count >= policy["max_positions"]:
            reasons.append(
                f"{open_count} open position(s) at or over the limit of "
                f"{policy['max_positions']}; only exits are permitted"
            )

        if notional > policy["max_order_usd"]:
            reasons.append(
                f"order ${notional:,.2f} exceeds max_order_usd "
                f"${policy['max_order_usd']:,.2f}"
            )

        equity = portfolio.get("equity_value", 0.0)
        existing = held["value"] if held else 0.0
        total_after = equity + notional
        if total_after > 0:
            pct_after = (existing + notional) / total_after * 100
            if pct_after > policy["max_position_pct"]:
                reasons.append(
                    f"{symbol} would be {pct_after:.1f}% of the account, over "
                    f"the {policy['max_position_pct']}% cap"
                )

        available = portfolio.get("cash", 0.0)
        settlement = policy.get("settlement", {})
        if settlement.get("reuse_unsettled_proceeds"):
            available += portfolio.get("unsettled_cash", 0.0)
        if notional > available:
            reasons.append(
                f"order ${notional:,.2f} exceeds available cash ${available:,.2f}"
            )

    # --- gates that apply only to exposure-reducing proposals ---------------

    elif action == SELL:
        if not held:
            reasons.append(
                f"cannot sell {symbol}: not held, and long_only forbids shorting"
            )
        elif order["quantity"] > held["quantity"]:
            reasons.append(
                f"cannot sell {order['quantity']} of {symbol}: only "
                f"{held['quantity']} available"
            )

    if reasons:
        return Verdict(False, NO_TRADE, tuple(reasons), proposal_id)
    return Verdict(True, PROPOSE_ORDER, (), proposal_id)
