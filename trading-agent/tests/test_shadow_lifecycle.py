import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from shadow import carry_forward  # noqa: E402

S1, S2 = "2026-09-23-shadow-01", "2026-09-24-shadow-02"


def prop(**o):
    p = {"id": "abc", "session": S1, "symbol": "AMC", "tif": "gfd", "filled": False}
    p.update(o)
    return p


class TestProposalLifecycle:
    def test_filled_proposal_does_not_carry_forward(self):
        assert carry_forward({"open_proposals": [prop(filled=True)]}, S2) == []

    def test_filled_proposal_is_closed_even_within_the_same_session(self):
        assert carry_forward({"open_proposals": [prop(filled=True)]}, S1) == []

    def test_gfd_expires_at_the_next_session(self):
        assert carry_forward({"open_proposals": [prop(tif="gfd")]}, S2) == []

    def test_gfd_is_still_live_within_its_own_session(self):
        live = carry_forward({"open_proposals": [prop(tif="gfd")]}, S1)
        assert len(live) == 1

    def test_unfilled_gtc_survives_into_the_next_session(self):
        live = carry_forward({"open_proposals": [prop(tif="gtc")]}, S2)
        assert len(live) == 1 and live[0]["tif"] == "gtc"

    def test_filled_gtc_still_closes(self):
        assert carry_forward({"open_proposals": [prop(tif="gtc", filled=True)]}, S2) == []

    def test_empty_state_is_safe(self):
        assert carry_forward({}, S2) == []

    def test_mixed_book_keeps_only_the_live_gtc(self):
        book = [
            prop(id="a", tif="gfd", filled=True),
            prop(id="b", tif="gfd", filled=False),
            prop(id="c", tif="gtc", filled=False),
            prop(id="d", tif="gtc", filled=True),
        ]
        live = carry_forward({"open_proposals": book}, S2)
        assert [p["id"] for p in live] == ["c"]


class TestShippedStateAfterMigration:
    def test_yesterdays_gfd_proposals_no_longer_block_today(self):
        import json

        st = json.loads((Path(__file__).resolve().parents[1] / "state.json").read_text())
        assert carry_forward(st, "2026-09-24-shadow-02") == [], (
            "a GFD order from a prior session must not reject today's identical order"
        )

    def test_the_bug_is_recorded_as_an_anomaly(self):
        import json

        st = json.loads((Path(__file__).resolve().parents[1] / "state.json").read_text())
        notes = " ".join(a.get("note", "") for a in st.get("anomalies", []))
        assert "lifecycle" in notes.lower()
