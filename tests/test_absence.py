"""Standalone tests for the pure absence helpers (scope, is_paused, absent_kids, validation)."""

import importlib.util
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

_BASE = Path(__file__).resolve().parents[1] / "custom_components" / "family_mission"
_spec = importlib.util.spec_from_file_location("family_mission_kids_absence", _BASE / "kids.py")
kids = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kids)
_cspec = importlib.util.spec_from_file_location("family_mission_catalog_absence", _BASE / "kids_catalog.py")
catalog = importlib.util.module_from_spec(_cspec)
_cspec.loader.exec_module(catalog)

DAY = date(2026, 11, 10)
HOME = {"scope": "home"}
PERSONAL = {"scope": "personal"}


def _a(kind="away", kids_=("a",), start="2026-11-09", end="2026-11-12", **kw):
    return {"id": "x", "kind": kind, "kids": list(kids_) if kids_ != "all" else "all", "from": start, "to": end, **kw}


def test_scope_derivation_from_catalog_keys():
    assert kids.scope_for_key("morning") == "personal"
    assert kids.scope_for_key("evening") == "personal"
    assert kids.scope_for_key("table_set") == "home"
    assert kids.scope_for_key("unknown_thing") == "home"
    assert kids.scope_for_key(None) == "home"
    # every personal key that exists in the catalog is a basis routine of the kid, nothing else is personal
    personal = {e["key"] for e in catalog.CATALOG if kids.scope_for_key(e["key"]) == "personal"}
    assert {"morning", "evening", "room_blitz", "room_deep", "own_laundry", "bedding"} <= personal
    assert all(catalog.CATALOG_BY_KEY[k]["mode"] == catalog.MODE_EACH for k in personal)
    assert not any(catalog.CATALOG_BY_KEY[k]["mode"] != catalog.MODE_EACH for k in kids.PERSONAL_CATALOG_KEYS if k in catalog.CATALOG_BY_KEY)


def test_migrate_task_like_adds_scope_and_keeps_explicit_scope():
    wizard = {"wizard_key": "morning:person.lena"}
    kids.migrate_task_like(wizard)
    assert wizard["scope"] == "personal"
    chore = {"wizard_key": "table_set:rot"}
    kids.migrate_task_like(chore)
    assert chore["scope"] == "home"
    handmade = {"name": "Reading"}
    kids.migrate_task_like(handmade)
    assert handmade["scope"] == "home"
    explicit = {"wizard_key": "morning:x", "scope": "home"}
    kids.migrate_task_like(explicit)
    assert explicit["scope"] == "home"
    bad = {"scope": "weird", "wizard_key": "evening:x"}
    kids.migrate_task_like(bad)
    assert bad["scope"] == "personal"


def test_is_paused_away_pauses_everything_of_the_kid():
    ab = [_a("away", ("a",))]
    assert kids.is_paused(HOME, "a", DAY, ab) and kids.is_paused(PERSONAL, "a", DAY, ab)
    assert not kids.is_paused(HOME, "b", DAY, ab)
    assert not kids.is_paused(HOME, "a", date(2026, 11, 13), ab)
    assert not kids.is_paused(HOME, "a", date(2026, 11, 8), ab)
    # away never keeps the personal tasks, whatever the flag says
    ab = [_a("away", ("a",), personal=True)]
    assert kids.is_paused(PERSONAL, "a", DAY, ab)


def test_is_paused_trip_pauses_home_and_by_default_personal():
    ab = [_a("trip", "all")]
    assert kids.is_paused(HOME, "a", DAY, ab) and kids.is_paused(HOME, "b", DAY, ab)
    assert kids.is_paused(PERSONAL, "a", DAY, ab)
    ab = [_a("trip", "all", personal=True)]
    assert kids.is_paused(HOME, "a", DAY, ab)
    assert not kids.is_paused(PERSONAL, "a", DAY, ab)
    # a task without scope counts as home; parents (any id) are covered by a trip
    assert kids.is_paused({}, "an-adult", DAY, ab)


def test_is_paused_sick_keeps_personal_only_with_the_option():
    assert kids.is_paused(HOME, "a", DAY, [_a("sick", ("a",))])
    assert kids.is_paused(PERSONAL, "a", DAY, [_a("sick", ("a",))])
    assert not kids.is_paused(PERSONAL, "a", DAY, [_a("sick", ("a",), personal=True)])
    assert not kids.is_paused(HOME, "b", DAY, [_a("sick", ("a",))])


def test_absent_kids_by_scope():
    ab = [_a("sick", ("a",), personal=True), _a("away", ("b",))]
    assert kids.absent_kids(DAY, ab, "home") == {"a", "b"}
    assert kids.absent_kids(DAY, ab, "personal") == {"b"}
    assert kids.absent_kids(date(2026, 11, 1), ab, "home") == set()
    trip = [_a("trip", "all")]
    assert kids.absent_kids(DAY, trip, "home") == set()                      # "all" needs the kid list
    assert kids.absent_kids(DAY, trip, "home", ["a", "b", "c"]) == {"a", "b", "c"}


def test_care_pause_follows_kind_and_flag():
    assert not kids.care_paused("a", DAY, [_a("trip", "all", care=True)])
    assert not kids.care_paused("a", DAY, [_a("sick", ("a",), care=True)])
    assert kids.care_paused("a", DAY, [_a("away", ("a",), care=False)])
    assert not kids.care_paused("a", DAY, [_a("away", ("a",), care=True)])
    assert not kids.care_paused("b", DAY, [_a("away", ("a",), care=False)])
    # a missing flag falls back to the kind default
    assert kids.care_paused("a", DAY, [_a("away", ("a",))])
    assert not kids.care_paused("a", DAY, [_a("sick", ("a",))])


def test_normalize_absence_validation():
    ok = kids.normalize_absence({"kind": "away", "kids": ["a"], "from": "2026-11-09", "to": "2026-11-12", "note": " Oma "}, ["a", "b"])
    assert ok["kids"] == ["a"] and ok["note"] == "Oma" and ok["personal"] is False and ok["care"] is False
    trip = kids.normalize_absence({"kind": "trip", "kids": ["a"], "from": "2026-11-09", "to": "2026-11-09"}, ["a"])
    assert trip["kids"] == "all" and trip["care"] is True            # a trip covers everybody, medication continues
    sick = kids.normalize_absence({"kind": "sick", "kids": ["a"], "from": "2026-11-09", "to": "2026-11-10", "personal": True})
    assert sick["personal"] is True and sick["care"] is True
    bad = [
        {"kind": "holiday", "kids": ["a"], "from": "2026-11-09", "to": "2026-11-10"},
        {"kind": "away", "kids": ["a"], "from": "2026-11-10", "to": "2026-11-09"},       # to before from
        {"kind": "away", "kids": ["a"], "from": "2026-11-09", "to": "2027-03-30"},       # more than 120 days
        {"kind": "away", "kids": [], "from": "2026-11-09", "to": "2026-11-10"},
        {"kind": "away", "kids": ["zz"], "from": "2026-11-09", "to": "2026-11-10"},
        {"kind": "away", "kids": ["a", "a"], "from": "2026-11-09", "to": "2026-11-10"},
        {"kind": "away", "kids": ["a"], "from": "9.11.2026", "to": "2026-11-10"},
        {"kind": "away", "kids": ["a"], "from": "2026-11-31", "to": "2026-12-01"},
        "nonsense",
    ]
    for raw in bad:
        assert kids.normalize_absence(raw, ["a", "b"]) is None, raw
    longest = kids.normalize_absence({"kind": "trip", "from": "2026-11-01", "to": "2027-02-28"})
    assert longest is not None                                   # exactly 120 days
    assert kids.normalize_absence({"kind": "trip", "from": "2026-11-01", "to": "2027-03-01"}) is None


def test_first_unpaused_day_and_trip_active():
    ab = [_a("trip", "all", start="2026-11-09", end="2026-11-14")]
    assert kids.first_unpaused_day(HOME, ["a"], DAY, ab) == date(2026, 11, 15)
    assert kids.first_unpaused_day(HOME, ["a"], date(2026, 11, 20), ab) == date(2026, 11, 20)
    # two kids: free as soon as one of them is back
    mixed = [_a("away", ("a",), end="2026-11-14")]
    assert kids.first_unpaused_day(HOME, ["a", "b"], DAY, mixed) == DAY
    assert kids.trip_active(DAY, ab) is ab[0]
    assert kids.trip_active(DAY, mixed) is None
    assert kids.trip_active(date(2026, 11, 15), ab) is None


def test_rotation_skips_absent_members_and_possible_points_drop():
    rotation = {"members": ["a", "b", "c"], "index": 0}
    skip = kids.absent_kids(DAY, [_a("away", ("a",))], "home", rotation["members"])
    assert kids.rotation_member(rotation, skip) == "b"
    task = {"category": "basis", "complexity": 2, "interval": 1, "assignees": ["a"], "scope": "home",
            "due_date": datetime(2026, 11, 1, tzinfo=timezone.utc).isoformat(), "min_age": 0}
    tasks = {"t": task}
    people = {"a": {"birth_year": 2014}}
    now = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    full = kids.possible_points(tasks, people, date(2026, 11, 1), date(2026, 11, 30), now)
    cut = kids.possible_points(tasks, people, date(2026, 11, 1), date(2026, 11, 30), now,
                               absences=[_a("away", ("a",), start="2026-11-10", end="2026-11-19")])
    assert full == 60 and cut == 40


def test_open_basis_tasks_and_eligibility_ignore_paused_tasks():
    tz = timezone.utc
    now = datetime(2026, 11, 10, 9, 0, tzinfo=tz)
    task = {"id": "t", "category": "basis", "complexity": 2, "interval": 1, "assignees": ["a"], "scope": "home",
            "due_date": datetime(2026, 11, 10, tzinfo=tz).isoformat(), "min_age": 0}
    tasks = {"t": task}
    assert kids.open_basis_tasks_for(tasks, "a", now, 5)
    away = [_a("away", ("a",))]
    assert kids.open_basis_tasks_for(tasks, "a", now, 5, None, away) == []
    assert kids.check_eligibility(task, "a", {}, tasks, {}, now) is None
    assert kids.check_eligibility(task, "a", {}, tasks, {}, now, away) == kids.ERR_NOT_ELIGIBLE
