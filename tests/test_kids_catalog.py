"""Tests for the kids quick-start wizard catalog and proposal engine (pure Python)."""

import importlib.util
from datetime import date
from pathlib import Path

import pytest

# Load the module without importing the package (Home Assistant is not needed)
_spec = importlib.util.spec_from_file_location(
    "kids_catalog_under_test",
    Path(__file__).resolve().parents[1] / "custom_components" / "task_organizer" / "kids_catalog.py",
)
kc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kc)

ANNA, BEN, CLARA, DAVID = "person.anna", "person.ben", "person.clara", "person.david"
KIDS = [
    {"id": ANNA, "name": "Anna", "birth_year": 2014},
    {"id": BEN, "name": "Ben", "birth_year": 2016},
    {"id": CLARA, "name": "Clara", "birth_year": 2017},
    {"id": DAVID, "name": "David", "birth_year": 2020},
]
FEATURES = ["school", "dishwasher", "dryer", "washer", "robot_vacuum", "garden", "driveway"]
FIRST = date(2026, 11, 1)


def proposal(start=FIRST, phase="start", **kw):
    kw.setdefault("current_year", 2026)
    return kc.build_proposal(KIDS, FEATURES, start, phase, **kw)


def kid(p, kid_id):
    return next(k for k in p["kids"] if k["id"] == kid_id)


def keys(k):
    return {t["catalog_key"] for t in k["tasks"]}


def test_catalog_is_consistent():
    assert len({e["key"] for e in kc.CATALOG}) == len(kc.CATALOG)
    for e in kc.CATALOG:
        assert e["name_de"] and e["name_en"] and e["icon"].startswith("mdi:")
        assert e["mode"] in ("each", "rotation", "open")
        assert e["category"] in ("basis", "bonus", "auftrag")
        assert e["requires"] is None or e["requires"] in kc.FEATURE_KEYS
        assert 1 <= e["points"] <= 10
    assert {f["key"] for f in kc.FEATURES} == {
        "school", "dishwasher", "dryer", "washer", "robot_vacuum", "garden", "driveway", "pets"}
    client = kc.catalog_for_client()
    assert len(client["catalog"]) == len(kc.CATALOG) and len(client["features"]) == 8
    assert {c["key"] for c in client["catalog"] if c["has_trigger"]} == set(kc.OPEN_BONUS_KEYS)


def test_david_tasks():
    p = proposal()
    david = kid(p, DAVID)
    assert david["age"] == 6
    assert keys(david) == {
        "morning", "evening", "room_blitz_small", "table_set",
        "table_clear", "plants", "room_deep", "own_laundry"}
    for missing in ("room_blitz", "dishwasher_load", "garden", "driveway", "bedding"):
        assert missing not in keys(david)
    deep = next(t for t in david["tasks"] if t["catalog_key"] == "room_deep")
    assert [s["title"] for s in deep["subtasks"]] == ["Boden frei", "Regal ordnen", "Müll raus"]
    assert deep["name"] == "Zimmer gründlich David" and deep["kid_id"] == DAVID
    evening = next(t for t in david["tasks"] if t["catalog_key"] == "evening")
    assert [s["title"] for s in evening["subtasks"]] == [
        "Schulranzen packen", "Schuhe & Jacke an ihren Platz", "Schmutzwäsche in den Korb"]
    anna_deep = next(t for t in kid(p, ANNA)["tasks"] if t["catalog_key"] == "room_deep")
    assert "Staubsaugen" in [s["title"] for s in anna_deep["subtasks"]]


def test_older_kids_get_big_room_blitz_and_no_small():
    p = proposal()
    for kid_id in (ANNA, BEN, CLARA):
        ks = keys(kid(p, kid_id))
        assert {"room_blitz", "dishwasher_load", "garden", "driveway", "bedding"} <= ks
        assert "room_blitz_small" not in ks
    morning = next(t for t in kid(p, ANNA)["tasks"] if t["catalog_key"] == "morning")
    assert morning["name"] == "Morgen-Mission Anna"
    assert morning["wizard_key"] == "morning:person.anna"
    assert morning["kid_id"] == ANNA and morning["interval"] == 1 and morning["points"] == 2


def test_table_set_rotation_among_four_kids():
    p = proposal()
    order = [(o["name"], o["due_date"]) for o in next(r for r in p["rotation"] if r["catalog_key"] == "table_set")["order"]]
    # oldest first, staggered by the base interval (1 day)
    assert order == [("Anna", "2026-11-01"), ("Ben", "2026-11-02"), ("Clara", "2026-11-03"), ("David", "2026-11-04")]
    for k in p["kids"]:
        t = next(t for t in k["tasks"] if t["catalog_key"] == "table_set")
        assert t["interval"] == 4 and t["rotation_size"] == 4
        assert t["name"] == f"Tisch decken {k['name']}"


def test_dishwasher_rotation_among_three():
    p = proposal()
    rot = next(r for r in p["rotation"] if r["catalog_key"] == "dishwasher_load")
    assert [o["name"] for o in rot["order"]] == ["Anna", "Ben", "Clara"]
    assert rot["interval"] == 3
    assert not any(t["catalog_key"] == "dishwasher_load" for t in kid(p, DAVID)["tasks"])
    plants = next(r for r in p["rotation"] if r["catalog_key"] == "plants")
    assert plants["interval"] == 28
    assert [o["due_date"] for o in plants["order"]] == ["2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28"]


def test_household_features_gate_tasks():
    p = kc.build_proposal(KIDS, [], FIRST, "start", current_year=2026)
    all_keys = {t["catalog_key"] for k in p["kids"] for t in k["tasks"]} | {t["catalog_key"] for t in p["open_tasks"]}
    evening = next(t for t in p["kids"][0]["tasks"] if t["catalog_key"] == "evening")
    assert "Schulranzen packen" not in [s["title"] for s in evening["subtasks"]]   # no school
    for gated in ("dishwasher_load", "garden", "driveway", "own_laundry", "dishwasher_unload",
                  "dryer_empty", "washer_hang", "vacuum_prep", "pet_feed"):
        assert gated not in all_keys
    assert {"trash", "groceries", "bottles"} <= all_keys
    pets = kc.build_proposal(KIDS, ["pets"], FIRST, "start", current_year=2026)
    assert "pet_feed" in {t["catalog_key"] for t in kid(pets, DAVID)["tasks"]}
    # pet_clean only ab 9 -> Anna, Ben, Clara
    clean = next(r for r in pets["rotation"] if r["catalog_key"] == "pet_clean")
    assert len(clean["order"]) == 3 and clean["interval"] == 21


def test_open_bonus_tasks_are_unassigned_and_not_due():
    p = proposal()
    names = {t["catalog_key"]: t for t in p["open_tasks"]}
    assert set(names) == {"dishwasher_unload", "dryer_empty", "washer_hang", "vacuum_prep", "trash",
                          "groceries", "bottles"}
    t = names["dishwasher_unload"]
    assert t["kid_id"] is None and t["interval"] == 365 and t["category"] == "bonus"
    assert t["due_date"] == "2027-11-01" and t["wizard_key"] == "dishwasher_unload:open"
    assert t["trigger_hint"] == "Spülprogramm fertig"
    assert [s["title"] for s in t["subtasks"]] == ["Besteck", "Unterkorb", "Oberkorb"]


def test_open_bonus_needs_old_enough_kid():
    little = [{"id": "a", "name": "A", "birth_year": 2020}]
    p = kc.build_proposal(little, FEATURES, FIRST, "start", current_year=2026)
    assert "bottles" not in {t["catalog_key"] for t in p["open_tasks"]}
    assert "groceries" in {t["catalog_key"] for t in p["open_tasks"]}


def test_auftrag_only_as_templates():
    p = proposal()
    assert {t["catalog_key"] for t in p["templates"]} == {"cooking", "car", "windows", "sink"}
    assert all(t["category"] == "auftrag" for t in p["templates"])
    assert not any(t["category"] == "auftrag" for k in p["kids"] for t in k["tasks"])
    assert p["counts"]["templates"] == 4


def test_english_names():
    p = proposal(lang="en")
    assert next(t for t in kid(p, ANNA)["tasks"] if t["catalog_key"] == "morning")["name"] == "Morning mission Anna"
    assert next(t for t in p["open_tasks"] if t["catalog_key"] == "trash")["name"] == "Take out the trash"


def test_goals_follow_formula():
    p = proposal(FIRST, "start")
    # Anna: Σ points*30/interval over her basis tasks
    expected = sum(t["points"] * 30 / t["interval"] for t in kid(p, ANNA)["tasks"])
    assert kid(p, ANNA)["max_points"] == pytest.approx(expected, abs=0.1)
    assert kid(p, ANNA)["goal"] == kc.round_to(expected * 0.6, 5)
    assert kid(p, ANNA)["goal"] % 5 == 0
    normal = proposal(FIRST, "normal")
    assert kid(normal, ANNA)["goal"] == kc.round_to(expected * 0.75, 5)
    assert normal["family_goal"] == kc.round_to(0.8 * sum(k["goal"] for k in normal["kids"]), 10)
    assert normal["family_goal"] % 10 == 0
    assert kid(p, DAVID)["goal"] < kid(p, ANNA)["goal"]
    # Concrete numbers of the Eich family (hand-checked)
    assert [k["goal"] for k in p["kids"]] == [215, 215, 215, 170]
    assert p["family_goal"] == 650


def test_goals_are_prorated_mid_month():
    full = proposal(date(2026, 11, 1), "start")
    half = proposal(date(2026, 11, 16), "start")   # 15 of 30 days left
    assert half["prorate"] == 0.5
    assert kid(half, ANNA)["goal"] == kc.round_to(kid(full, ANNA)["max_points"] * 0.6 * 0.5, 5)
    assert half["family_goal"] < full["family_goal"]
    assert kc.prorate_factor(date(2026, 11, 1)) == 1.0
    assert kc.prorate_factor(date(2026, 10, 29)) == pytest.approx(3 / 31)


def test_rounding_helpers():
    assert kc.round_to(12.5, 5) == 15 and kc.round_to(12.4, 5) == 10 and kc.round_to(5, 10) == 10
    assert kc.round_to(4.9, 10) == 0
    assert kc.calc_goal(0, "start", FIRST) == 0
    assert kc.calc_goal(3, "start", FIRST) == 5          # never 0 when there is something to earn
    assert kc.calc_family_goal([]) == 0 and kc.calc_family_goal([5]) == 10


def test_load_warnings_and_recommendation():
    assert kc.recommended_minutes(6) == 20 and kc.recommended_minutes(7) == 20
    assert kc.recommended_minutes(8) == 30 and kc.recommended_minutes(9) == 30
    assert kc.recommended_minutes(10) == 40 and kc.recommended_minutes(14) == 40
    p = proposal()
    warned = {w["kid_id"]: w for w in p["warnings"] if w["type"] == "load"}
    assert set(warned) == {CLARA, DAVID}
    assert warned[DAVID]["recommended"] == 20 and warned[DAVID]["minutes"] == 25.4
    assert warned[CLARA]["recommended"] == 30 and warned[CLARA]["minutes"] == 35.9
    assert kid(p, ANNA)["minutes_per_day"] == 35.9 and kid(p, ANNA)["recommended_minutes"] == 40


def test_deselecting_removes_load_and_goal():
    base = proposal()
    off = proposal(excluded={"room_deep:person.david", "own_laundry:person.david", "plants:person.david"})
    assert kid(off, DAVID)["minutes_per_day"] < kid(base, DAVID)["minutes_per_day"]
    assert kid(off, DAVID)["goal"] < kid(base, DAVID)["goal"]
    # no warning for David any more? 25.4 - 4.3 - 1.4 - 0.2 = 19.5 <= 20
    assert not any(w["kid_id"] == DAVID for w in off["warnings"] if w["type"] == "load")
    deep = next(t for t in kid(off, DAVID)["tasks"] if t["catalog_key"] == "room_deep")
    assert deep["selected"] is False
    assert off["counts"]["tasks"] == base["counts"]["tasks"] - 3


def test_excluding_a_rotation_member_rebuilds_the_rotation():
    p = proposal(excluded={"table_set:person.david"})
    rot = next(r for r in p["rotation"] if r["catalog_key"] == "table_set")
    assert [o["name"] for o in rot["order"]] == ["Anna", "Ben", "Clara"] and rot["interval"] == 3
    david_task = next(t for t in kid(p, DAVID)["tasks"] if t["catalog_key"] == "table_set")
    assert david_task["selected"] is False and david_task["due_date"] is None
    anna_task = next(t for t in kid(p, ANNA)["tasks"] if t["catalog_key"] == "table_set")
    assert anna_task["interval"] == 3


def test_rotation_with_single_kid_and_none():
    one = kc.build_proposal([KIDS[0]], FEATURES, FIRST, "start", current_year=2026)
    t = next(t for t in one["kids"][0]["tasks"] if t["catalog_key"] == "plants")
    assert t["interval"] == 7 and t["due_date"] == "2026-11-07"   # household day (Saturday)
    # nobody eligible -> rotation skipped
    toddler = kc.build_proposal([KIDS[3]], FEATURES, FIRST, "start", current_year=2026)
    assert "dishwasher_load" not in {r["catalog_key"] for r in toddler["rotation"]}


def test_point_overrides_clamped():
    p = proposal(points={"morning:person.anna": 5, "evening:person.anna": 99, "plants:person.anna": "x"})
    tasks = {t["catalog_key"]: t for t in kid(p, ANNA)["tasks"]}
    assert tasks["morning"]["points"] == 5 and tasks["morning"]["default_points"] == 2
    assert tasks["evening"]["points"] == 10
    assert tasks["plants"]["points"] == 2
    assert kid(p, ANNA)["max_points"] > kid(proposal(), ANNA)["max_points"]


def test_kid_without_birth_year_gets_warning_and_no_tasks():
    p = kc.build_proposal([{"id": "x", "name": "X", "birth_year": None}], FEATURES, FIRST, "start")
    assert p["kids"][0]["tasks"] == [] and p["warnings"][0]["type"] == "no_birth_year"


def test_every_task_has_wizard_key():
    p = proposal()
    keys_ = [t["wizard_key"] for k in p["kids"] for t in k["tasks"]] + [t["wizard_key"] for t in p["open_tasks"]]
    assert len(keys_) == len(set(keys_))
    assert all(":" in k for k in keys_)
    assert set(keys_) | {t["wizard_key"] for t in p["templates"]} == kc.all_candidate_keys(p)
    assert kc.split_key("morning:person.anna") == ("morning", "person.anna")


def test_profile_suggestions_are_distinct():
    s = kc.suggest_profiles(["a", "b", "c", "d"])
    assert len({v["avatar"] for v in s.values()}) == 4 and len({v["color"] for v in s.values()}) == 4
    assert all(kc.AVATARS and v["color"].startswith("#") and len(v["color"]) == 7 for v in s.values())
    s2 = kc.suggest_profiles(["a"], taken_avatars=["🦊"], taken_colors=["#ff7043"])
    assert s2["a"]["avatar"] != "🦊" and s2["a"]["color"].lower() != "#ff7043"
    assert len(kc.AVATARS) >= 8 and len(set(kc.COLORS)) >= 8


def test_interval_labels():
    assert kc.interval_label(1) == "täglich" and kc.interval_label(7) == "wöchentlich"
    assert kc.interval_label(4, "de", True) == "alle 4 Tage (Rotation)"
    assert kc.interval_label(28, "en", True) == "every 4 weeks (rotation)"
    assert kc.interval_label(1, "de", True) == "täglich"


# ---------------------------------------------------------------------------
# Suggested default selection (gentle ramp-up)
# ---------------------------------------------------------------------------

def _suggested(phase):
    ex = kc.suggest_excluded(proposal(phase=phase), phase)
    return proposal(phase=phase, excluded=ex)


def selected(k):
    return {t["catalog_key"] for t in k["tasks"] if t["selected"]}


def test_suggestion_start_phase_keeps_core_and_stays_within_load():
    p = _suggested("start")
    for k in p["kids"]:
        assert selected(k) == {"morning", "evening", "table_set"}   # three cards to start
        assert k["minutes_per_day"] <= k["recommended_minutes"]
        # bigger chores and extras wait for the normal phase
        assert not selected(k) & {"dishwasher_load", "room_deep", "garden", "driveway", "bedding"}
    assert not [w for w in p["warnings"] if w["type"] == "load"]


def test_suggestion_normal_phase_adds_bigger_chores_within_load():
    p = _suggested("normal")
    assert "dishwasher_load" in selected(kid(p, ANNA))
    assert "room_deep" in selected(kid(p, ANNA))
    assert not selected(kid(p, ANNA)) & {"garden", "driveway", "bedding"}
    for k in p["kids"]:
        assert k["minutes_per_day"] <= k["recommended_minutes"]


def test_suggestion_always_keeps_priority_one_even_over_budget():
    p = proposal()
    for k in p["kids"]:
        k["recommended_minutes"] = 0
    ex = set(kc.suggest_excluded(p, "start"))
    for k in p["kids"]:
        for t in k["tasks"]:
            if kc.TASK_PRIORITY.get(t["catalog_key"]) == 1:
                assert t["wizard_key"] not in ex


# -- step 2: exact age + level-up ------------------------------------------------

def test_proposal_uses_exact_age_when_given():
    kid = {"id": "k", "name": "K", "birth_year": 2018, "age": 7}
    p = kc.build_proposal([kid], FEATURES, FIRST, "start", current_year=2026)
    assert p["kids"][0]["age"] == 7                           # not 2026 - 2018 = 8
    keys = {t["catalog_key"] for t in p["kids"][0]["tasks"]}
    assert "room_blitz_small" in keys and "room_blitz" not in keys
    p = kc.build_proposal([{"id": "k", "name": "K", "birth_year": 2018}], FEATURES, FIRST, "start", current_year=2026)
    assert p["kids"][0]["age"] == 8                           # year fallback
    p = kc.build_proposal([{"id": "k", "name": "K", "birth_year": 2018, "age": None}], FEATURES, FIRST, "start", current_year=2026)
    assert p["kids"][0]["age"] == 8


def test_newly_unlocked_replaces_outgrown_entries():
    names = [e["name"] for e in kc.newly_unlocked(7, 8, FEATURES, "de")]
    assert "Zimmer-Blitz (10 Minuten)" in names                # replaces the 5 minute blitz
    assert "Zimmer-Blitz (5 Minuten)" not in names
    assert "Wäsche aus dem Trockner + falten" in names           # dryer, min_age 8
    names_en = [e["name"] for e in kc.newly_unlocked(7, 8, FEATURES, "en")]
    assert "Empty the dryer + fold" in names_en
    # features: no dryer in the household -> not listed; unknown features -> only feature-free entries
    assert "Empty the dryer + fold" not in [e["name"] for e in kc.newly_unlocked(7, 8, ["school"], "en")]
    unknown = [e["name"] for e in kc.newly_unlocked(7, 8, None, "en")]
    assert "Empty the dryer + fold" not in unknown and "Take out the trash" in unknown
    assert kc.newly_unlocked(8, 8, FEATURES, "de") == []
    assert [e["key"] for e in kc.newly_unlocked(9, 10, [], "de")] == ["bottles", "windows", "sink"]


# ---------------------------------------------------------------------------
# default time windows, "replaced by" and the spread of weekly duties
# ---------------------------------------------------------------------------

WINDOWS = {
    "morning": ("05:00", "10:00"), "evening": ("17:00", "21:00"),
    "room_blitz": ("14:00", "19:30"), "room_blitz_small": ("14:00", "19:30"),
    "table_set": ("17:00", "19:30"), "table_clear": ("18:00", "20:30"),
    "dishwasher_load": ("18:00", "21:00"), "plants": ("14:00", "19:00"),
    "own_laundry": ("14:00", "19:30"), "room_deep": ("09:00", "18:00"),
    "bedding": ("09:00", "18:00"), "garden": ("10:00", "18:00"),
    "driveway": ("10:00", "18:00"), "pet_feed": ("07:00", "19:00"),
    "pet_clean": ("10:00", "18:00"),
}


def test_all_basis_tasks_have_a_default_window():
    for entry in kc.CATALOG:
        if entry["category"] == "basis":
            assert (entry["available_from"], entry["available_until"]) == WINDOWS[entry["key"]], entry["key"]
    p = kc.build_proposal(KIDS, FEATURES + ["pets"], FIRST, "normal", current_year=2026)
    for k in p["kids"]:
        for t in k["tasks"]:
            assert (t["available_from"], t["available_until"]) == WINDOWS[t["catalog_key"]]


def test_blitz_is_replaced_by_room_deep():
    assert kc.CATALOG_BY_KEY["room_blitz"]["replaced_by"] == "room_deep"
    assert kc.CATALOG_BY_KEY["room_blitz_small"]["replaced_by"] == "room_deep"
    assert kc.CATALOG_BY_KEY["room_deep"]["replaced_by"] is None
    p = proposal()
    for k in p["kids"]:
        for t in k["tasks"]:
            expected = "room_deep" if t["catalog_key"].startswith("room_blitz") else None
            assert t["replaced_by_key"] == expected


def test_weekly_tasks_of_a_kid_are_spread_over_the_week():
    p = proposal(date(2026, 10, 29))                      # Thursday, household day Saturday
    anna = {t["catalog_key"]: t["due_date"] for t in kid(p, ANNA)["tasks"]}
    assert anna["room_deep"] == "2026-10-31"              # household day
    assert anna["own_laundry"] == "2026-10-30"            # the day before
    assert anna["bedding"] == "2026-11-01"                # one day after
    assert len({anna["room_deep"], anna["own_laundry"], anna["bedding"]}) == 3
    ben = {t["catalog_key"]: t["due_date"] for t in kid(p, BEN)["tasks"]}
    assert ben["bedding"] == "2026-11-08"                 # bi-weekly alternates by kid


def test_spread_never_starts_before_the_start_date():
    p = proposal(date(2026, 10, 31))                      # start on the household day itself
    anna = {t["catalog_key"]: t["due_date"] for t in kid(p, ANNA)["tasks"]}
    assert anna["room_deep"] == "2026-10-31"
    assert anna["own_laundry"] == "2026-11-06"            # Friday before would be in the past
    assert anna["bedding"] == "2026-11-01"
    assert all(t["due_date"] >= "2026-10-31" for t in kid(p, ANNA)["tasks"])


def test_catalog_allow_together_flags():
    by_key = kc.CATALOG_BY_KEY
    shared = ("dishwasher_load", "table_set", "table_clear", "garden", "driveway", "plants", "pet_feed", "pet_clean")
    personal = ("morning", "evening", "room_blitz", "room_blitz_small", "room_deep", "own_laundry", "bedding")
    assert all(by_key[k]["allow_together"] for k in shared)
    assert not any(by_key[k]["allow_together"] for k in personal)
    assert all(e["allow_together"] for e in kc.CATALOG if e["category"] != "basis")
