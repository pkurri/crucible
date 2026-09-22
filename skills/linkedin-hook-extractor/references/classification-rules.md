# Hook Formula Classification Rules

Features extracted from a post and how they map to formulas.

## Feature extraction

### Hook features (first 2 lines)

- `anaphora_count`: number of parallel "X can Y" style lines at the top
- `leads_with_number`: does line 1 start with a dollar figure or stat?
- `question_hook`: is line 1 a question?
- `confession_phrase`: "I stopped", "I was wrong", "for years I"
- `obituary_phrase`: "R.I.P.", "dying since", "cause of death"
- `time_anchor`: "{N} {days|months|years} ago"
- `year_over_year`: "In {2024|2025}, I ... In {2025|2026}, I'm"
- `curiosity_gap`: short incomplete tease (<8 words, no noun specified)
- `free_reversal`: "I charge X. Today it's free."
- `public_commitment`: "For the next 24 hours, I will"

### Body features

- `has_numbered_list`: 1., 2., 3., ... with ≥4 items
- `has_dated_receipts`: multiple "{Month Year} — {event}" lines
- `has_ledger`: line-item dollar amounts (non-rounded)
- `has_teardown`: screenshot references or annotations
- `has_checklist`: named steps with instructions

### Close features

- `mirror_question`: "What's your {last→this} pivot?"
- `identity_reframe`: "If you're X, you already lost"
- `commitment_close`: "If I'm wrong, I owe you a post"
- `soft_offer`: "Connect + DM me for X"
- `comment_gate`: "Comment KEYWORD below"

### F11-F16 features (2026 corpus set — shorter, more emotional)

- `in_medias_res_open`: line 1 drops into an emotional peak (breaking, loss,
  impossible odds) with no setup line before it
- `permission_phrase`: "I don't know who needs to hear this today, but..."
- `fake_bad_news`: "Enough is enough. No more {perk/practice}..." followed by a
  reveal that the change is actually positive
- `named_tribute`: "To {Name}, {Name}, and {Name}: thank you for..." — 2+ real
  people named by name
- `explain_to_kids_phrase`: "{jargon term} explained to kids" opener, or an
  emoji-anchored glossary body (`{emoji} {term} = {plain meaning}`, 3+ lines)
- `status_strip_contrast`: "Outside, I get called {title}. At home, none of
  that survives {moment}."

### F17-F20 features (structural formulas — shape logic, not topic)

- `controlled_ab`: two outcomes stated back to back that differ by exactly one
  named variable ("Same X. Same Y. The only variable is Z.")
- `false_binary_kill`: "Everyone reaches for one of two answers" (or
  equivalent), then both named options are explicitly killed ("{Option A}? ...
  {Option B}? ...") before a third option is proposed
- `evidence_arrow_stack`: 3+ consecutive `→` (or `-`/bullet) lines, each citing
  a real number, following a "turns out it was already measured" style bridge
- `diverging_curves`: two named approaches/trajectories described moving in
  opposite directions over an explicit timeline ("Month one, X. Month six,
  Y."), closing on a one-line maxim

## Mapping features → formulas

```python
FORMULA_RULES = {
    "F1_anaphora": {
        "required": ["anaphora_count >= 3"],
        "boost": ["has_numbered_list", "metaphor_close"],
    },
    "F2_rip_obituary": {
        "required": ["obituary_phrase"],
        "boost": ["has_numbered_list", "identity_reframe"],
    },
    "F3_year_over_year": {
        "required": ["year_over_year"],
        "boost": ["mirror_question"],
    },
    "F4_time_anchor_confession": {
        "required": ["time_anchor OR confession_phrase"],
        "boost": ["mirror_question"],
    },
    "F5_self_proving_meta": {
        "required": ["public_commitment"],
        "boost": ["commitment_close", "has_numbered_list"],
    },
    "F6_comment_gate": {
        "required": ["comment_gate"],
        "boost": ["has_numbered_list"],
    },
    "F7_odd_precision_money": {
        "required": ["leads_with_number", "has_ledger"],
        "boost": ["identity_reframe"],
    },
    "F8_paid_vs_free_reversal": {
        "required": ["free_reversal"],
        "boost": ["has_checklist", "soft_offer"],
    },
    "F9_curiosity_gap": {
        "required": ["curiosity_gap"],
        "boost": [],
    },
    "F10_contrarian_historical": {
        "required": ["has_dated_receipts"],
        "boost": ["identity_reframe"],
    },
    "F11_emotional_cold_open": {
        "required": ["in_medias_res_open"],
        "boost": [],
        "primary_goal": "likes",
    },
    "F12_permission_slip": {
        "required": ["permission_phrase"],
        "boost": [],
        "primary_goal": "comments",
    },
    "F13_bait_and_switch": {
        "required": ["fake_bad_news"],
        "boost": [],
        "primary_goal": "likes",
    },
    "F14_named_gratitude": {
        "required": ["named_tribute"],
        "boost": [],
        "primary_goal": "reposts",
    },
    "F15_explain_to_kids": {
        "required": ["explain_to_kids_phrase"],
        "boost": [],
        "primary_goal": "saves",
    },
    "F16_status_strip": {
        "required": ["status_strip_contrast"],
        "boost": [],
        "primary_goal": "likes",
    },
    "F17_controlled_ab": {
        "required": ["controlled_ab"],
        "boost": ["mirror_question"],
        "primary_goal": "comments",
    },
    "F18_false_binary": {
        "required": ["false_binary_kill"],
        "boost": ["mirror_question"],
        "primary_goal": "comments_reposts",
    },
    "F19_evidence_bridge": {
        "required": ["evidence_arrow_stack"],
        "boost": [],
        "primary_goal": "comments_saves",
    },
    "F20_diverging_curves": {
        "required": ["diverging_curves"],
        "boost": [],
        "primary_goal": "reposts",
    },
}
```

F11-F20 carry no `boost`-driven confidence bump beyond 1.0 in most cases —
their required feature is a strong, low-ambiguity structural signal on its own
(unlike F1-F10's shorter anaphora/number cues, which benefit from a
corroborating boost). F17 and F18 keep `mirror_question` as an optional boost
since both close on an operational or identity question in the reference
skeletons.

**Structural-formula pairing note (from the Density rule):** F17-F20 shape a
post's *logic*, and the source material (`hook-formulas.md`) explicitly warns
against stacking two of them — e.g. a post should not read as both F18
(false-binary dissolve) and F20 (diverging-curves close) at once. If a post's
features satisfy two structural formulas simultaneously, report both but flag
that the source post is double-stacking contrasts, which the 2026 reach notes
treat as a penalty, not a stronger signal.

## Confidence scoring

```python
def score_formula(post_features: dict, rules: dict) -> float:
    required_met = sum(1 for r in rules["required"] if eval_feature(post_features, r))
    if required_met < len(rules["required"]):
        return 0.0
    boost = sum(1 for b in rules["boost"] if post_features.get(b))
    return 1.0 + 0.15 * boost  # cap at 1.6
```

Return top 2 formulas with score > 0.8.

## Edge cases

- **Hybrid hooks:** when a post mixes two formulas (e.g., F4 confession + F3
  year-over-year), return both with split confidence.
- **Narrative-only posts:** if no structural hook fires, classify as "free-form
  narrative" and skip formula assignment.
- **Non-English:** skip classification, return structural breakdown only.
