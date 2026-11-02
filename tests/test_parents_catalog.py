"""Tests for the parents' task catalog and its pure helpers (no Home Assistant needed)."""

import importlib.util
from datetime import date, timedelta, timezone
from pathlib import Path

import pytest

_spec = importlib.util.spec_from_file_location(
    "parents_catalog_under_test",
    Path(__file__).resolve().parents[1] / "custom_components" / "family_mission" / "parents_catalog.py",
)
pc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pc)

ANNA, BEN = "uid-anna", "uid-ben"
TODAY = date(2026, 11, 4)          # Wednesday


def _items(*keys):
    return [pc.CATALOG_BY_KEY[k] for k in keys]


def test_catalog_structure():
    assert len(pc.CATALOG) == len(pc.CATALOG_BY_KEY) == 34
    assert {i["group"] for i in pc.CATALOG} == set(pc.GROUPS)
    for item in pc.CATALOG:
        assert item["name_de"] and item["name_en"]
        assert item["interval"] >= 1 and 1 <= item["minutes"] <= 600
        assert isinstance(item["planning"], bool)
    assert pc.CATALOG_BY_KEY["dinner"]["minutes"] == 45
    assert pc.CATALOG_BY_KEY["calendar"]["weekday"] == 6
    assert pc.CATALOG_BY_KEY["car"]["interval"] == 182
    assert set(pc.PRESELECTED_KEYS) == {
        "dinner", "kitchen", "bedtime", "meal_plan", "shopping_list", "shopping", "bins", "calendar",
        "exclusive_time"}
    planning = {i["key"] for i in pc.CATALOG if i["planning"]}
    assert {"meal_plan", "shopping_list", "calendar", "couple_checkin", "finances"} <= planning
    assert "shopping" not in planning and "dinner" not in planning
    # the client gets copies
    copy = pc.catalog_items()
    copy[0]["minutes"] = 999
    assert pc.CATALOG[0]["minutes"] != 999


def test_stagger_daily_and_two_day_start_today():
    starts = pc.stagger_start_dates(_items("dinner", "laundry", "kitchen"), TODAY)
    assert set(starts.values()) == {TODAY}


def test_stagger_weekday_counts_today():
    starts = pc.stagger_start_dates(_items("calendar", "couple_checkin"), TODAY)
    assert starts["calendar"] == date(2026, 11, 8) and starts["calendar"].weekday() == 6
    assert starts["couple_checkin"] == starts["calendar"]
    sunday = date(2026, 11, 8)
    assert pc.stagger_start_dates(_items("calendar"), sunday)["calendar"] == sunday


def test_stagger_other_weekly_spread_over_monday_to_saturday():
    keys = ("meal_plan", "shopping_list", "shopping", "bathrooms", "vacuum", "bins")
    starts = pc.stagger_start_dates(_items(*keys), TODAY)
    assert [starts[k].weekday() for k in keys] == [0, 1, 2, 3, 4, 5]
    assert all(TODAY <= d < TODAY + timedelta(days=7) for d in starts.values())
    assert starts["shopping"] == TODAY                   # Wednesday counts


def test_stagger_long_intervals_are_offset():
    keys = ("bed_linen", "finances", "windows", "car", "smoke_alarms")
    starts = pc.stagger_start_dates(_items(*keys), TODAY)
    for index, key in enumerate(keys):
        expected = (index * 7) % pc.CATALOG_BY_KEY[key]["interval"]
        assert starts[key] == TODAY + timedelta(days=expected)
    assert len({starts[k] for k in keys}) == len(keys)


def test_resolve_mode_with_partner():
    assert pc.resolve_mode("me", ANNA, BEN) == {"assignees": [ANNA], "parent_mode": "fixed", "parent_pair": None}
    assert pc.resolve_mode("you", ANNA, BEN) == {"assignees": [BEN], "parent_mode": "fixed", "parent_pair": None}
    assert pc.resolve_mode("alternate", ANNA, BEN) == {
        "assignees": [ANNA], "parent_mode": "alternate", "parent_pair": [ANNA, BEN]}


@pytest.mark.parametrize("mode", ["you", "alternate", "me", "nonsense"])
def test_resolve_mode_without_partner_is_me(mode):
    assert pc.resolve_mode(mode, ANNA, None) == {"assignees": [ANNA], "parent_mode": "fixed", "parent_pair": None}
    assert pc.resolve_mode(mode, ANNA, ANNA)["assignees"] == [ANNA]


def test_mode_of_and_pair_helpers():
    assert pc.mode_of({"assignees": [ANNA]}, ANNA) == "me"
    assert pc.mode_of({"assignees": [BEN]}, ANNA) == "you"
    assert pc.mode_of({"assignees": [BEN], "parent_mode": "alternate"}, ANNA) == "alternate"
    assert pc.mode_of({"assignees": [ANNA]}, None) == "me"
    assert pc.other_of_pair([ANNA, BEN], ANNA) == BEN
    assert pc.other_of_pair([ANNA, BEN], BEN) == ANNA
    assert pc.other_of_pair([ANNA, BEN], "x") is None and pc.other_of_pair(None, ANNA) is None
    assert pc.partner_of([ANNA, BEN], ANNA) == BEN
    assert pc.partner_of([ANNA], ANNA) is None
    assert pc.partner_of([ANNA, BEN, "uid-sam"], ANNA) is None


def test_rollover_sets_first_missed_day_and_keeps_it():
    assert pc.rollover(date(2026, 11, 2), None, TODAY) == ("2026-11-02", TODAY)
    assert pc.rollover(date(2026, 11, 3), "2026-10-30", TODAY) == ("2026-10-30", TODAY)
    assert pc.rollover(TODAY, None, TODAY) is None           # due today: not carried
    assert pc.rollover(date(2026, 11, 6), None, TODAY) is None
    assert pc.rollover(None, None, TODAY) is None


def test_hours_sum_window_and_types():
    tz = timezone(timedelta(hours=1))
    first, last = pc.last_seven_days(TODAY)
    assert (first, last) == (date(2026, 10, 29), TODAY)
    history = [
        {"type": "parent", "user_id": ANNA, "minutes": 30, "timestamp": "2026-11-04T10:00:00+00:00"},
        {"type": "parent", "user_id": ANNA, "minutes": 60, "timestamp": "2026-10-29T12:00:00+00:00"},
        {"type": "parent", "user_id": BEN, "minutes": 45, "timestamp": "2026-11-01T09:00:00+00:00"},
        {"type": "parent", "user_id": ANNA, "minutes": 99, "timestamp": "2026-10-28T12:00:00+00:00"},   # too old
        {"type": "task", "user_id": ANNA, "minutes": 500, "timestamp": "2026-11-02T12:00:00+00:00"},      # not parent
        {"type": "parent", "user_id": ANNA, "minutes": "x", "timestamp": "2026-11-02T12:00:00+00:00"},    # broken
        # 23:30 UTC on Oct 28 is already Oct 29 at UTC+1: inside; 23:30 UTC on Nov 4 is Nov 5: outside
        {"type": "parent", "user_id": BEN, "minutes": 15, "timestamp": "2026-10-28T23:30:00+00:00"},
        {"type": "parent", "user_id": BEN, "minutes": 77, "timestamp": "2026-11-04T23:30:00+00:00"},
    ]
    assert pc.minutes_by_user(history, first, last, tz) == {ANNA: 90, BEN: 60}
    assert pc.minutes_by_user(history, first, TODAY - timedelta(days=1), tz) == {ANNA: 60, BEN: 60}


def test_format_hours_and_summary_texts():
    assert pc.hours_of(390) == 6.5 and pc.hours_of(20) == 0.3
    assert pc.format_hours(390, "de") == "6,5 Std." and pc.format_hours(240, "de") == "4 Std."
    assert pc.format_hours(390, "en") == "6.5 h" and pc.format_hours(240, "en") == "4 h"
    rows = [{"name": "Anna", "minutes": 390}, {"name": "Ben", "minutes": 240}]
    title, text = pc.summary_texts(rows, ["Bäder", "Fenster"], "de")
    assert text == "Diese Woche: Anna 6,5 Std. · Ben 4 Std. Liegengeblieben: Bäder, Fenster."
    assert title == "Wochenrückblick"
    assert pc.summary_texts(rows, [], "de")[1] == "Diese Woche: Anna 6,5 Std. · Ben 4 Std. Nichts liegengeblieben."
    assert pc.summary_texts(rows, ["Windows"], "en")[1] == "This week: Anna 6.5 h · Ben 4 h Left over: Windows."
    # neutral: no rating words
    for word in ("mehr", "weniger", "besser", "fleißig", "more", "less", "better"):
        assert word not in text.lower().split()


def test_clock_helpers():
    assert pc.valid_clock("19:30", "18:00") == "19:30"
    for bad in (None, "", "25:00", "7:30", "ab:cd", 1900):
        assert pc.valid_clock(bad, "18:00") == "18:00"
    assert pc.clock_reached("18:00", "18:00") and pc.clock_reached("18:01", "18:00")
    assert not pc.clock_reached("17:59", "18:00")


def test_push_texts():
    assert pc.planning_reminder_texts("Essensplan", 20, "de")[1] == "Morgen dran: Essensplan (ca. 20 Min.)"
    assert "Meal plan" in pc.planning_reminder_texts("Meal plan", 20, "en")[1]
    title, text, take, decline = pc.handover_ask_texts("Anna", "Einkauf", "de")
    assert "Anna" in text and "Einkauf" in text and (take, decline) == ("Mach ich", "Geht nicht")
    assert pc.handover_decline_texts("Ben", "Einkauf", "de")[1] == "Ben kann gerade nicht: Einkauf"


# ---------------------------------------------------------------------------
# task list: dates, groups, digest (2.6)
# ---------------------------------------------------------------------------

def test_valid_date_and_due_time():
    assert pc.valid_date("2026-11-04") == date(2026, 11, 4)
    for bad in ("2026-13-01", "26-11-04", "2026-11-4", "", None, 5, "2026-11-04T10:00"):
        assert pc.valid_date(bad) is None
    assert pc.valid_due_time("07:30") == "07:30"
    for bad in ("24:00", "7:30", "07:60", "", None, "abc", 730):
        assert pc.valid_due_time(bad) is None


def test_list_state_one_time_and_recurring():
    t = TODAY
    assert pc.list_state(t - timedelta(days=2), 0, False, t) == pc.STATE_OVERDUE
    assert pc.list_state(t, 0, False, t) == pc.STATE_TODAY
    assert pc.list_state(t + timedelta(days=3), 0, False, t) == pc.STATE_UPCOMING
    assert pc.list_state(None, 0, True, t) == pc.STATE_SOMEDAY
    assert pc.list_state(None, 0, False, t) == pc.STATE_SOMEDAY
    # recurring tasks are only listed once they are due
    assert pc.list_state(t, 7, False, t) == pc.STATE_TODAY
    assert pc.list_state(t + timedelta(days=1), 7, False, t) == pc.STATE_HIDDEN
    assert pc.list_state(t - timedelta(days=1), 7, False, t) == pc.STATE_OVERDUE
    assert pc.list_state(None, 7, False, t) == pc.STATE_HIDDEN
    # paused tasks are never listed
    assert pc.list_state(t, 0, False, t, paused_until=t) == pc.STATE_HIDDEN
    assert pc.list_state(t, 0, False, t, paused_until=t - timedelta(days=1)) == pc.STATE_TODAY


def test_digest_counts_and_texts():
    states = [pc.STATE_TODAY, pc.STATE_TODAY, pc.STATE_OVERDUE, pc.STATE_SOMEDAY, pc.STATE_UPCOMING, pc.STATE_HIDDEN]
    assert pc.digest_counts(states) == (2, 1)
    assert pc.digest_texts(2, 1, "de")[1] == "Heute: 2 Aufgaben, 1 überfällig"
    assert pc.digest_texts(1, 0, "de")[1] == "Heute: 1 Aufgabe"
    assert pc.digest_texts(3, 2, "en")[1] == "Today: 3 tasks, 2 overdue"
    assert pc.digest_texts(1, 0, "en")[1] == "Today: 1 task"
    assert "07:30" in pc.due_time_texts("Arzt", "07:30", "de")[1]
    assert "07:30" in pc.due_time_texts("Doctor", "07:30", "en")[1]


# ---------------------------------------------------------------------------
# 2.6 step 9: checklists, weekdays, per-kid names, bins, batteries
# ---------------------------------------------------------------------------

def test_catalog_checklist_steps_de_en():
    expected = {"bathrooms": 5, "meal_plan": 3, "calendar": 5, "finances": 4, "fridge": 3,
                "vacuum": 3, "kids_clothes": 3, "checkups": 3, "holiday_care": 3}
    for key, count in expected.items():
        entry = pc.CATALOG_BY_KEY[key]
        assert len(pc.catalog_steps(entry, "de")) == count == len(pc.catalog_steps(entry, "en")), key
    assert pc.catalog_steps(pc.CATALOG_BY_KEY["bathrooms"], "de")[0] == "WC"
    assert pc.catalog_steps(pc.CATALOG_BY_KEY["dinner"], "de") == []
    assert pc.catalog_steps(pc.CATALOG_BY_KEY["finances"], "de")[-1] == "Taschengeld ausgezahlt?"
    assert pc.CATALOG_BY_KEY["fridge"]["steps_en"][2].startswith("Put what is missing")


def test_new_templates():
    for key, interval in (("medicine_cabinet", 182), ("season_check", 182), ("vet", 365)):
        assert pc.CATALOG_BY_KEY[key]["interval"] == interval
    assert pc.CATALOG_BY_KEY["vet"]["requires"] == "pets"
    assert pc.CATALOG_BY_KEY["family_council"]["weekday"] == 6 and pc.CATALOG_BY_KEY["family_council"]["planning"]
    assert pc.CATALOG_BY_KEY["me_time"]["planning"] and pc.CATALOG_BY_KEY["me_time"]["interval"] == 7
    excl = pc.CATALOG_BY_KEY["exclusive_time"]
    assert excl["per_kid"] and excl["preselected"] and excl["minutes"] == 30 and excl["interval"] == 7
    assert pc.catalog_name(excl, "de", "Lena") == "Exklusivzeit mit Lena"
    assert pc.catalog_name(excl, "en", "Lena") == "One-on-one time with Lena"
    assert pc.catalog_name(excl, "de") == "Exklusivzeit mit jedem Kind"          # without a kid: the general name
    assert pc.catalog_name(pc.CATALOG_BY_KEY["dinner"], "en", "Lena") == "Dinner"
    assert not [k for k in pc.PRESELECTED_KEYS if k in ("family_council", "me_time", "vet", "season_check", "medicine_cabinet")]


def test_normalize_steps_and_build_subtasks():
    assert pc.normalize_steps(["  a ", "", None, 5, "b", {"title": "c"}]) == ["a", "b", "c"]
    assert pc.normalize_steps("x") == [] and pc.normalize_steps(None) == []
    assert len(pc.normalize_steps([f"s{i}" for i in range(30)])) == 12
    assert pc.normalize_steps(["y" * 100]) == ["y" * 60]
    previous = [{"title": "a", "done": True}, {"title": "b", "done": False}]
    built = pc.build_subtasks(["b", "a", "new"], previous)
    assert built == [{"title": "b", "done": False}, {"title": "a", "done": True}, {"title": "new", "done": False}]
    assert pc.steps_progress(built) == (1, 3) and pc.steps_progress(None) == (0, 0)
    assert pc.subtask_titles(built) == ["b", "a", "new"]


def test_weekdays_helpers():
    assert pc.normalize_weekdays([4, 0, 2, 0]) == [0, 2, 4]
    for bad in ([7], [-1], ["a"], [True], "135", None, 3, [1.5]):
        assert pc.normalize_weekdays(bad) == [], bad
    assert pc.valid_weekdays(None) and pc.valid_weekdays([]) and pc.valid_weekdays([1, 3])
    assert not pc.valid_weekdays([9]) and not pc.valid_weekdays(["x"])
    mon_wed_fri = [0, 2, 4]
    assert pc.next_weekday_on_or_after(mon_wed_fri, TODAY) == TODAY                  # Wednesday
    assert pc.next_weekday_on_or_after([0], TODAY) == date(2026, 11, 9)
    assert pc.next_weekday_on_or_after([], TODAY) == TODAY


def test_next_due_after_a_completion():
    assert pc.next_due(TODAY, 7) == TODAY + timedelta(days=7)
    assert pc.next_due(TODAY, 7, [0, 2, 4]) == date(2026, 11, 6)                     # Wed -> Fri
    assert pc.next_due(date(2026, 11, 6), 7, [0, 2, 4]) == date(2026, 11, 9)         # Fri -> Mon
    assert pc.next_due(TODAY, 7, [2]) == date(2026, 11, 11)                          # only Wednesday: next week
    assert pc.next_due(TODAY, 3, "junk") == TODAY + timedelta(days=3)


def test_bins_target_and_texts():
    days = [date(2026, 11, 3), date(2026, 11, 10)]
    assert pc.bins_target(days, TODAY) == date(2026, 11, 10)
    assert pc.bins_target(days, date(2026, 11, 3)) == date(2026, 11, 3)               # the collection morning counts
    assert pc.bins_target(days, date(2026, 11, 11)) is None and pc.bins_target([], TODAY) is None
    assert pc.bins_texts("de")[1] == "Tonnen stehen noch nicht draußen"
    assert "not out yet" in pc.bins_texts("en")[1]
    assert pc.DEFAULT_BINS_CHECK_TIME == "19:30"


def test_battery_helpers():
    assert pc.battery_threshold(None) == 20 and pc.battery_threshold("x") == 20 and pc.battery_threshold(True) == 20
    assert pc.battery_threshold(1) == 5 and pc.battery_threshold(99) == 50 and pc.battery_threshold("35") == 35
    assert pc.battery_level("12.5") == 12.5 and pc.battery_level("0") == 0 and pc.battery_level("100") == 100
    for bad in ("unavailable", "unknown", "", "nan", "-1", "101", None, "low"):
        assert pc.battery_level(bad) is None, bad
    levels = {"a": 10.0, "b": 19.9, "c": 20.0, "d": 90.0}
    assert pc.battery_changes(levels, [], 20) == (["a", "b"], [])
    # hysteresis: a reported sensor is only released above threshold + 5
    assert pc.battery_changes({"a": 25.0, "b": 25.1, "x": 50.0}, ["a", "b", "gone2"], 20) == ([], ["b"])
    assert pc.battery_changes({"a": 10.0}, ["a"], 20) == ([], [])
    assert pc.battery_task_name("Rauchmelder", "de") == "🔋 Batterie Rauchmelder"
    assert pc.battery_task_name("Smoke", "en") == "🔋 Battery Smoke"
    assert pc.stock_task_name("Tablette", "Lena", "de") == "💊 Rezept/Nachkauf Tablette Lena"
    assert pc.stock_task_name("Pill", "Lena", "en") == "💊 Prescription / refill Pill Lena"
