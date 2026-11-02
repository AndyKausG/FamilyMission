"""Static checks of the settings card (2.6.0): tabs, no TaskOrganizer leftovers, de/en parity."""

import re
from pathlib import Path

JS = (Path(__file__).resolve().parents[1] / "custom_components" / "family_mission" / "www"
      / "family-mission-settings.js").read_text(encoding="utf-8")


def _block(lang):
    start = JS.index(f"  {lang}: {{")
    end = JS.index("\n  }", start)
    return JS[start:end]


def _keys(block):
    plain = re.sub(r'"(?:[^"\\]|\\.)*"', '""', block)
    return set(re.findall(r"([a-z][a-z0-9_]*): (?:\"\"|\[)", plain))


def test_four_tabs_and_advanced_fold():
    for tab in ("family", "tasks", "notify", "device"):
        assert f"'{tab}'" in JS
    for key in ("tab_family", "tab_tasks", "tab_notify", "tab_device"):
        assert key in _keys(_block("en")) and key in _keys(_block("de"))
    assert "family_mission_settings_tab" in JS
    # export/import and the resets live in the "Advanced" fold, no card option needed
    assert "_section('adv'" in JS
    assert "this._config.show_advanced" not in JS


def test_taskorganizer_leftovers_removed():
    for needle in ("color_adjustments", "days_overdue", "transparency", "theme-toggle", "num-overdue", "point_goals_lbl", "show_advanced_lbl"):
        assert needle not in JS, needle


def test_every_used_key_is_translated():
    used = set(re.findall(r"localize\('([a-z0-9_]+)'\)", JS))
    for lang in ("en", "de"):
        keys = _keys(_block(lang))
        missing = {k for k in used if k not in keys}
        assert not missing, (lang, missing)


def test_en_de_keys_match():
    assert _keys(_block("en")) == _keys(_block("de"))
