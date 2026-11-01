"""Standalone tests for the pure family goal (percent) helpers."""

import importlib.util
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "family_mission" / "kids.py"
_spec = importlib.util.spec_from_file_location("family_mission_kids_goal", _PATH)
kids = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kids)

TZ = timezone(timedelta(hours=2))
NOW = datetime(2026, 11, 1, 9, 0, tzinfo=TZ)
START, END = date(2026, 11, 1), date(2026, 11, 30)       # Sunday .. Monday, 30 days
KIDS = {"a": {"birth_year": 2014}, "b": {"birth_year": 2014}}


def _day(d):
    return datetime(d.year, d.month, d.day, tzinfo=TZ).isoformat()


def _task(**kw):
    base = {"category": "basis", "complexity": 2, "interval": 1, "assignees": ["a"], "due_date": _day(START), "min_age": 0}
    base.update(kw)
    return base


def _p(tasks, **kw):
    return kids.possible_points(tasks, kw.pop("kids", KIDS), kw.pop("start", START), kw.pop("end", END), NOW, **kw)


def test_daily_interval():
    assert _p({"t": _task()}) == 60.0                                  # 30 days x 2


def test_interval_projected_from_due_date_in_both_directions():
    weekly = _task(interval=7, complexity=5, due_date=_day(date(2026, 11, 5)))      # 5, 12, 19, 26
    assert _p({"t": weekly}) == 20.0
    late = _task(interval=7, complexity=5, due_date=_day(date(2026, 10, 1)))        # Oct 1 + 7n -> 5, 12, 19, 26 too
    assert _p({"t": late}) == 20.0
    assert _p({"t": weekly}, start=date(2026, 11, 20)) == 5.0                       # only the 26th


def test_one_time_counts_once_when_due_in_range():
    assert _p({"t": _task(interval=0, due_date=_day(date(2026, 11, 9)))}) == 2.0
    assert _p({"t": _task(interval=0, due_date=_day(date(2026, 12, 9)))}) == 0.0
    assert _p({"t": _task(interval=0, due_date=None)}) == 0.0


def test_weekdays():
    mwf = _task(weekdays=[0, 2, 4], interval=1, due_date=None)
    assert _p({"t": mwf}) == 2.0 * 13                                  # November 2026: 5 Mon, 4 Wed, 4 Fri
    assert _p({"t": mwf}, start=date(2026, 11, 2), end=date(2026, 11, 8)) == 6.0


def test_rotation_counts_once_per_occurrence():
    rot = _task(assignees=["a", "b"], rotation={"members": ["a", "b"], "index": 0, "every": "occurrence"})
    assert _p({"t": rot}) == 60.0
    shared = _task(assignees=["a", "b"])
    assert _p({"t": shared}) == 60.0


def test_excluded_tasks():
    tasks = {
        "bonus": _task(category="bonus"), "auftrag": _task(category="auftrag"), "adhoc": _task(adhoc=True),
        "waste": _task(waste_key="x"), "parent": _task(parent_task=True), "trig": _task(), "nobody": _task(assignees=[]),
        "stranger": _task(assignees=["zz"]), "zero": _task(complexity=0), "ok": _task(),
    }
    assert _p(tasks, exclude_ids=["trig"]) == 60.0


def test_paused_days_are_not_counted():
    paused = _task(paused_until=_day(date(2026, 11, 10)))              # paused through the 10th
    assert _p({"t": paused}) == 2.0 * 20


def test_min_age_per_day():
    young = {"a": {"birthday": "2020-11-16"}}                          # turns 6 on Nov 16
    assert _p({"t": _task(min_age=6)}, kids=young, settings={"birthday_duty_free": False}) == 2.0 * 15   # 16th .. 30th
    assert _p({"t": _task(min_age=6)}, kids=young) == 2.0 * 14          # the birthday itself is duty-free
    assert _p({"t": _task(min_age=6, assignees=["a", "b"])}, kids={**young, "b": {"birth_year": 2014}}) == 60.0     # one eligible kid is enough
    assert _p({"t": _task(min_age=6)}, kids={"a": {}}) == 60.0           # unknown age: eligible


def test_birthday_duty_free():
    kid = {"a": {"birthday": "2016-11-10"}}
    assert _p({"t": _task()}, kids=kid) == 2.0 * 29
    assert _p({"t": _task()}, kids=kid, settings={"birthday_duty_free": False}) == 60.0
    shared = _task(assignees=["a", "b"])                               # not a single-kid duty: no duty-free day
    assert _p({"t": shared}, kids={**kid, "b": {"birth_year": 2014}}) == 60.0


def test_skip_days():
    skips = {"t": {date(2026, 11, 3), date(2026, 11, 4), date(2027, 1, 1)}}
    assert _p({"t": _task()}, skip_days=skips) == 2.0 * 28
    assert _p({"t": _task(interval=7, due_date=_day(date(2026, 11, 3)))}, skip_days=skips) == 2.0 * 3


def test_goal_target_rounding_and_minimum():
    assert kids.goal_target(75, 547) == 410
    assert kids.goal_target(75, 0) == 5
    assert kids.goal_target(10, 12) == 5
    assert kids.goal_target(150, 100) == 150
    assert kids.goal_target(75, 20) == 15


def test_normalizers():
    assert kids.normalize_goal_mode("percent") == "percent"
    assert kids.normalize_goal_mode("x") == "points" and kids.normalize_goal_mode(None) == "points"
    assert [kids.normalize_goal_percent(v) for v in (10, 150, 9, 151, "60", "x", None, True, 62.4)] == [10, 150, 75, 75, 60, 75, 75, 75, 62]


def test_ratchet_only_goes_down():
    snap = {"period": "2026-11", "possible": 547, "percent": 75, "target": 410}
    assert kids.goal_ratchet(snap, 75, 700)["target"] == 410           # more tasks: no raise
    assert kids.goal_ratchet(snap, 100, 547)["target"] == 410          # higher percent: next period
    assert kids.goal_ratchet(snap, 100, 547)["percent"] == 75
    assert kids.goal_ratchet(snap, 75, 400)["target"] == 300           # fewer tasks
    low = kids.goal_ratchet(snap, 50, 547)
    assert low["target"] == 275 and low["percent"] == 50               # lower percent applies now
    assert kids.goal_ratchet(low, 75, 547)["target"] == 275            # and stays low
