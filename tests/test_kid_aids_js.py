"""Aids for young kids in the kids card (2.15.0): step emoji (picture mode) and time pie, run with node."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

JS = (Path(__file__).resolve().parents[1] / "custom_components" / "family_mission" / "www"
      / "family-mission-kids.js").read_text(encoding="utf-8")


def _block(start_marker, end_marker):
    start = JS.index(start_marker)
    return JS[start:JS.index(end_marker, start)]


def test_i18n_and_settings_keys():
    assert JS.count('pie_left: "') == 2
    settings = (Path(__file__).resolve().parents[1] / "custom_components" / "family_mission" / "www"
                / "family-mission-settings.js").read_text(encoding="utf-8")
    for key in ("kid_aids", "kid_aid_time_pie", "kid_aid_picture_steps", "kid_aid_speak_steps", "kid_aid_speak_hint"):
        assert settings.count(f'{key}: "') == 2, key


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_step_emoji_and_time_pie():
    code = _block("const KIDS_STEP_EMOJI", "/** Parses \"HH:MM\"") + r"""
const out = {};
out.emoji = ['🪥 Zähne putzen', 'Hände waschen', 'Schlafanzug anziehen', 'Get dressed', 'Ritual X', '👩‍👧 Kuscheln']
  .map(t => kidsStepEmoji(t));
out.pie = [
  kidsTimePie(400, 460, 450),     // 10 of 60 min left
  kidsTimePie(400, 460, 420),     // 40 of 60
  kidsTimePie(null, 460, 450),    // no start: last hour
  kidsTimePie(null, 460, 300),    // more than an hour left: full
  kidsTimePie(1380, 60, 1410),    // over midnight: 90 of 120
  kidsTimePie(400, null, 450),    // no end: no pie
  kidsTimePie(400, 460, 460),     // over
];
console.log(JSON.stringify(out));
"""
    res = subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True)
    out = json.loads(res.stdout)
    assert out["emoji"] == [
        {"emoji": "🪥", "title": "Zähne putzen"}, {"emoji": "🧼", "title": "Hände waschen"},
        {"emoji": "👚", "title": "Schlafanzug anziehen"}, {"emoji": "👕", "title": "Get dressed"},
        {"emoji": "", "title": "Ritual X"}, {"emoji": "👩‍👧", "title": "Kuscheln"},
    ]
    p = out["pie"]
    assert p[0]["left"] == 10 and p[0]["color"] == "#E53935"
    assert p[1]["left"] == 40 and p[1]["color"] == "#43A047"
    assert p[2]["left"] == 10 and abs(p[2]["frac"] - 10 / 60) < 1e-9
    assert p[3]["frac"] == 1
    assert p[4]["left"] == 90 and p[4]["frac"] == 0.75
    assert p[5] is None and p[6] is None
