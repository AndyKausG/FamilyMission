"""Approval list helpers of the parents and kids cards (2.14.0): name stripping, grouping, day labels.

The helpers are extracted from the card files and run with node (skipped without node).
Both cards carry identical copies; the test checks that they stay in sync.
"""

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

WWW = Path(__file__).resolve().parents[1] / "custom_components" / "family_mission" / "www"
NAMES = ("apStrip", "apGroup", "apWhen")


def _func(src, name):
    start = src.index(f"function {name}(")
    depth, i = 0, src.index("{", start)
    while True:
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                return src[start:i + 1]
        i += 1


def _helpers(card, suffix):
    src = (WWW / f"family-mission-{card}.js").read_text(encoding="utf-8")
    return "\n".join(_func(src, n + suffix) for n in NAMES)


def test_cards_share_identical_helpers():
    parents = _helpers("parents", "Parents").replace("Parents", "X")
    kids = _helpers("kids", "Kids").replace("Kids", "X")
    assert parents == kids


def test_i18n_keys_in_both_languages():
    for card, keys in (("parents", ("ap_waiting", "ap_with", "ap_all", "ap_all_confirm", "toast_approved_many", "toast_approved_some")),
                       ("kids", ("ap_with", "ap_all", "ap_all_confirm", "ap_toast_many", "ap_toast_some"))):
        src = (WWW / f"family-mission-{card}.js").read_text(encoding="utf-8")
        for key in keys:
            assert len(re.findall(rf"\b{key}: \"", src)) == 2, (card, key)


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_helpers_behaviour():
    script = _helpers("parents", "Parents") + r"""
const out = {};
out.strip = ['Juri: Hausaufgaben / Lernzeit Juri', 'Eigene Wäsche einräumen Juri', 'Tisch (Juri)',
  'Abend-Mission - juri', 'Juri', 'Majuri putzen', 'Juri Hausaufgaben'].map(t => apStripParents(t, 'Juri'));
out.noName = apStripParents('Tisch decken', '');
const groups = apGroupParents([
  { id: 'a1', kid_id: 'a', task_id: 't1', points: 3 },
  { id: 'b1', kid_id: 'b', task_id: 't1', points: 3 },
  { id: 'a2', kid_id: 'a', task_id: 't1', points: 4 },
  { id: 'a3', kid_id: 'a', task_id: 't2', points: 3, helpers: ['b'] },
]);
out.groups = groups.map(g => [g.kidId, g.ids, g.tasks.map(t => [t.items.map(i => i.id), t.samePoints])]);
const now = new Date(2026, 10, 21, 9, 0);
out.today = apWhenParents(new Date(2026, 10, 21, 7, 5).toISOString(), 'de', now);
out.yesterday = apWhenParents(new Date(2026, 10, 20, 23, 30).toISOString(), 'de', now);
out.older = apWhenParents(new Date(2026, 10, 18, 17, 42).toISOString(), 'de', now);
out.bad = apWhenParents('nonsense', 'de', now);
console.log(JSON.stringify(out));
"""
    res = subprocess.run(["node", "-e", script], capture_output=True, text=True, check=True)
    out = json.loads(res.stdout)
    assert out["strip"] == ["Hausaufgaben / Lernzeit", "Eigene Wäsche einräumen", "Tisch",
                            "Abend-Mission", "Juri", "Majuri putzen", "Juri Hausaufgaben"]
    assert out["noName"] == "Tisch decken"
    assert out["groups"] == [["a", ["a1", "a2", "a3"], [[["a1", "a2"], False], [["a3"], True]]],
                             ["b", ["b1"], [[["b1"], True]]]]
    assert out["today"].startswith("Heute ") and out["today"].endswith("07:05")
    assert out["yesterday"].startswith("Gestern ") and out["yesterday"].endswith("23:30")
    assert "18.11." in out["older"] and out["older"].endswith("17:42")
    assert out["bad"] == ""
