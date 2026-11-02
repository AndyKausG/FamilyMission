"""Standalone tests for 2.6 step 10: weekend windows, the ``after_key`` dependency (room blitz after homework),
school holidays, the catalog entries and the live medication stock merge (pure Python, no Home Assistant)."""

import importlib.util
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

_BASE = Path(__file__).resolve().parents[1] / "custom_components" / "family_mission"
_spec = importlib.util.spec_from_file_location("family_mission_kids_windows", _BASE / "kids.py")
kids = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kids)
_cspec = importlib.util.spec_from_file_location("family_mission_catalog_windows", _BASE / "kids_catalog.py")
catalog = importlib.util.module_from_spec(_cspec)
_cspec.loader.exec_module(catalog)

TZ = timezone(timedelta(hours=1))
THU = date(2026, 11, 5)       # Thursday
SAT = date(2026, 11, 7)
SUN = date(2026, 11, 8)
MON = date(2026, 11, 9)
LENA, MAX_ = "person.lena", "person.max"


def _at(day, hh, mm=0):
    return datetime(day.year, day.month, day.day, hh, mm, tzinfo=TZ)


def _due(day):
    return datetime(day.year, day.month, day.day, tzinfo=TZ).isoformat()


def _task(key, kid=LENA, due=THU, **kw):
    base = {
        "name": key, "category": "basis", "assignees": [kid], "due_date": _due(due), "paused_until": None,
        "wizard_key": f"{key}:{kid}", "interval": 1, "complexity": 2, "min_age": 0,
    }
    base.update(kw)
    return base


def _tasks(*items):
    return {f"t{i}": t for i, t in enumerate(items)}


# -- weekend windows ----------------------------------------------------------

def test_weekend_window_replaces_the_normal_one_on_saturday_and_sunday():
    task = {"available_from": "05:00", "available_until": "10:00", "available_from_we": "06:00", "available_until_we": "11:00"}
    assert kids.task_window(task, 0) == ("05:00", "10:00") and kids.task_window(task, 4) == ("05:00", "10:00")
    assert kids.task_window(task, 5) == ("06:00", "11:00") and kids.task_window(task, 6) == ("06:00", "11:00")
    assert kids.task_window(task, None) == ("05:00", "10:00")
    # 05:30 is inside the weekday window, too early on Saturday; 10:30 is too late on a weekday, fine on Sunday
    assert kids.window_state(task, _at(THU, 5, 30)) == kids.WINDOW_OPEN
    assert kids.window_state(task, _at(SAT, 5, 30)) == kids.WINDOW_NOT_YET
    assert kids.window_state(task, _at(THU, 10, 30)) == kids.WINDOW_TOO_LATE
    assert kids.window_state(task, _at(SUN, 10, 30)) == kids.WINDOW_OPEN
    assert kids.window_state(task, _at(SUN, 11, 0)) == kids.WINDOW_TOO_LATE
    assert kids.in_window(task, _at(SAT, 6, 0))


def test_without_a_weekend_window_the_same_window_applies_every_day():
    task = {"available_from": "16:00", "available_until": "19:30"}
    for day in (THU, SAT, SUN):
        assert kids.window_state(task, _at(day, 15, 0)) == kids.WINDOW_NOT_YET
        assert kids.window_state(task, _at(day, 17, 0)) == kids.WINDOW_OPEN
    # invalid weekend values count as absent
    task = {**task, "available_from_we": "9", "available_until_we": ""}
    assert kids.window_state(task, _at(SAT, 17, 0)) == kids.WINDOW_OPEN
    assert kids.window_state(task, _at(SAT, 15, 0)) == kids.WINDOW_NOT_YET


def test_one_sided_weekend_window():
    task = {"available_from": "16:00", "available_until": "19:00", "available_until_we": "17:00"}
    assert kids.window_state(task, _at(SAT, 8, 0)) == kids.WINDOW_OPEN          # no start on the weekend
    assert kids.window_state(task, _at(SAT, 17, 0)) == kids.WINDOW_TOO_LATE
    assert kids.window_state(task, _at(THU, 17, 0)) == kids.WINDOW_OPEN


def test_migrate_normalizes_the_new_fields_only_when_present():
    item = {"name": "x"}
    kids.migrate_task_like(item)
    assert "available_from_we" not in item and "after_key" not in item
    item = {"name": "x", "available_from_we": "07:00", "available_until_we": "bad", "after_key": "homework"}
    kids.migrate_task_like(item)
    assert item["available_from_we"] == "07:00" and item["available_until_we"] is None and item["after_key"] == "homework"
    assert kids.normalize_after_key("Homework!") is None and kids.normalize_after_key(5) is None
    assert kids.normalize_after_key("homework") == "homework"


# -- after_key: room blitz after homework ----------------------------------------

def _pair(**blitz):
    homework = _task("homework", weekdays=[0, 1, 2, 3, 4], available_from="13:30", available_until="18:00")
    room = _task("room_blitz", after_key="homework", available_from="16:00", available_until="19:30", **blitz)
    return homework, room


def test_task_waits_for_the_homework_of_the_same_kid():
    homework, room = _pair()
    tasks = _tasks(homework, room)
    now = _at(THU, 16, 30)
    assert kids.after_pending(room, LENA, tasks, now)
    assert kids.after_blockers(room, LENA, tasks, now) == [homework]
    # not for the other kid, not for a task without after_key
    assert not kids.after_pending(room, MAX_, tasks, now)
    assert not kids.after_pending(homework, LENA, tasks, now)


def test_homework_done_or_not_due_today_releases_the_task():
    homework, room = _pair()
    tasks = _tasks(homework, room)
    now = _at(THU, 16, 30)
    homework["due_date"] = _due(THU + timedelta(days=1))               # done: due tomorrow
    assert not kids.after_pending(room, LENA, tasks, now)
    # Friday evening done -> next due Monday: on Saturday the blitz is free
    homework["due_date"] = _due(MON)
    assert not kids.after_pending(room, LENA, tasks, _at(SAT, 11, 0))
    # paused (absence): not pending
    homework["due_date"] = _due(THU)
    assert kids.after_pending(room, LENA, tasks, now)
    away = [{"id": "a", "kind": "away", "kids": [LENA], "from": THU.isoformat(), "to": THU.isoformat()}]
    assert not kids.after_pending(room, LENA, tasks, now, absences=away)
    # school holiday pauses the homework
    holiday = [{"id": "h", "kind": "school_holiday", "kids": "all", "from": THU.isoformat(), "to": THU.isoformat()}]
    assert not kids.after_pending(room, LENA, tasks, now, absences=holiday)
    # homework window over and still not done: it cannot be done any more, so it does not block
    assert not kids.after_pending(room, LENA, tasks, _at(THU, 18, 30))


def test_early_homework_before_its_window_still_blocks():
    homework, room = _pair()
    assert kids.after_pending(room, LENA, _tasks(homework, room), _at(THU, 9, 0))


def test_eligibility_after_pending_and_open_basis_tasks():
    homework, room = _pair()
    tasks = _tasks(homework, room)
    now = _at(THU, 17, 0)
    profile = {"birth_year": 2014}
    assert kids.check_eligibility(room, LENA, profile, tasks, {}, now) == kids.ERR_AFTER_PENDING == "after_pending"
    assert kids.check_eligibility(homework, LENA, profile, tasks, {}, now) is None
    open_ids = {id(t) for t in kids.open_basis_tasks_for(tasks, LENA, now, 5)}
    assert id(room) not in open_ids and id(homework) in open_ids
    homework["due_date"] = _due(THU + timedelta(days=1))
    assert kids.check_eligibility(room, LENA, profile, tasks, {}, now) is None
    assert id(room) in {id(t) for t in kids.open_basis_tasks_for(tasks, LENA, now, 5)}


def test_catalog_key_comes_from_catalog_key_or_wizard_key():
    assert kids.task_catalog_key({"catalog_key": "homework"}) == "homework"
    assert kids.task_catalog_key({"wizard_key": "homework:person.lena"}) == "homework"
    assert kids.task_catalog_key({"name": "x"}) == ""
    hand = {"name": "Hausaufgaben", "catalog_key": "homework", "assignees": [LENA], "due_date": _due(THU), "category": "basis"}
    _, room = _pair()
    assert kids.after_pending(room, LENA, _tasks(hand, room), _at(THU, 16, 30))


# -- school holidays --------------------------------------------------------------

def test_school_holiday_absence_is_valid_for_all_or_chosen_kids():
    full = kids.normalize_absence({"kind": "school_holiday", "kids": "all", "from": "2026-11-02", "to": "2026-11-13"})
    assert full["kind"] == "school_holiday" and full["kids"] == "all" and full["care"] is True and full["personal"] is False
    some = kids.normalize_absence({"kind": "school_holiday", "kids": [LENA], "from": "2026-11-02", "to": "2026-11-13"}, [LENA, MAX_])
    assert some["kids"] == [LENA]
    assert kids.normalize_absence({"kind": "school_holiday", "from": "2026-11-02", "to": "2026-11-13"}) is None
    assert "school_holiday" in kids.ABSENCE_KINDS


def test_school_holiday_pauses_only_what_needs_school():
    absences = [{"id": "h", "kind": "school_holiday", "kids": [LENA], "from": "2026-11-05", "to": "2026-11-06"}]
    homework = {"wizard_key": f"homework:{LENA}", "scope": "personal"}
    by_catalog_key = {"catalog_key": "homework"}
    assert kids.task_requires_school(homework) and kids.task_requires_school(by_catalog_key)
    assert kids.is_paused(homework, LENA, THU, absences) and kids.is_paused(by_catalog_key, LENA, THU, absences)
    assert not kids.is_paused(homework, MAX_, THU, absences)                        # another kid
    assert not kids.is_paused(homework, LENA, MON, absences)                        # another day
    for key in ("morning", "evening", "room_blitz", "table_set", "trash"):
        assert not kids.is_paused({"wizard_key": f"{key}:{LENA}", "scope": kids.scope_for_key(key)}, LENA, THU, absences), key
    assert kids.school_holiday(LENA, THU, absences) and not kids.school_holiday(MAX_, THU, absences)
    assert not kids.care_paused(LENA, THU, absences)                                # medication continues
    assert kids.absent_kids(THU, absences, "personal", [LENA, MAX_]) == set()      # nobody else is "absent"


def test_school_steps_are_not_required_in_the_holidays():
    task = {"subtasks": [
        {"title": "Schulranzen packen", "done": False}, {"title": "Pack lunch box & water bottle", "done": False},
        {"title": "Zähne putzen", "done": False}, {"title": "Mein Schritt", "requires": "school", "done": False},
    ]}
    assert [s["title"] for s in kids.open_required_steps(task)] == [
        "Schulranzen packen", "Pack lunch box & water bottle", "Zähne putzen", "Mein Schritt"]
    assert [s["title"] for s in kids.open_required_steps(task, school_free=True)] == ["Zähne putzen"]
    assert kids.is_school_step({"title": " schulranzen PACKEN "}) and not kids.is_school_step({"title": "Zähne putzen"})


def test_school_constants_match_the_catalog():
    school_entries = {e["key"] for e in catalog.CATALOG if e["requires"] == "school"}
    assert kids.SCHOOL_CATALOG_KEYS == school_entries
    titles = {
        t.casefold() for e in catalog.CATALOG for st in e["subtasks"] if st["requires"] == "school"
        for t in (st["title_de"], st["title_en"])
    }
    assert titles == set(kids.SCHOOL_STEP_TITLES)
    assert kids.SCHOOL_CATALOG_KEYS <= kids.PERSONAL_CATALOG_KEYS


def test_day_ranges_and_calendar_days():
    days = [date(2026, 11, d) for d in (2, 3, 4, 9, 10, 4)]
    assert kids.day_ranges(days) == [(date(2026, 11, 2), date(2026, 11, 4)), (date(2026, 11, 9), date(2026, 11, 10))]
    events = [
        {"start": "2026-11-02", "end": "2026-11-05", "summary": "Herbstferien"},           # end exclusive: 2nd..4th
        {"start": "2026-11-09", "end": "2026-11-09", "summary": "Brückentag"},             # single day
        {"start": "2026-11-12T10:00:00+01:00", "end": "2026-11-12T11:00:00+01:00", "summary": "Elternabend"},   # timed: ignored
        {"start": "2026-10-30", "end": "2026-11-03", "summary": "overlaps the start"},
        {"summary": "no start"}, "junk",
    ]
    result = kids.all_day_event_days(events, date(2026, 11, 1), date(2026, 11, 8))
    assert result == [date(2026, 11, 1), date(2026, 11, 2), date(2026, 11, 3), date(2026, 11, 4)]
    assert kids.all_day_event_days(events, date(2026, 11, 9), date(2026, 11, 9)) == [date(2026, 11, 9)]


# -- catalog -----------------------------------------------------------------------

def test_catalog_windows_and_weekend_windows():
    by_key = catalog.CATALOG_BY_KEY
    window = lambda k: (by_key[k]["available_from"], by_key[k]["available_until"])
    weekend = lambda k: (by_key[k]["available_from_we"], by_key[k]["available_until_we"])
    assert window("morning") == ("05:00", "10:00") and weekend("morning") == ("06:00", "11:00")
    assert window("room_blitz") == ("16:00", "19:30") and weekend("room_blitz") == ("10:00", "18:00")
    assert window("room_blitz_small") == ("16:00", "19:30") and weekend("room_blitz_small") == ("10:00", "18:00")
    assert window("room_deep") == ("16:00", "19:00") and weekend("room_deep") == ("10:00", "17:00")
    assert window("evening") == ("17:00", "21:00") and weekend("evening") == ("17:00", "21:00")
    assert weekend("table_set") == (None, None)
    assert by_key["room_blitz"]["after_key"] == "homework" and by_key["room_blitz_small"]["after_key"] == "homework"
    assert by_key["morning"]["after_key"] is None


def test_homework_catalog_entry():
    e = catalog.CATALOG_BY_KEY["homework"]
    assert (e["category"], e["mode"], e["requires"], e["min_age"], e["interval"]) == ("basis", "each", "school", 6, 1)
    assert e["weekdays"] == [0, 1, 2, 3, 4] and e["points"] == 3 and e["requires_approval"] is False
    assert (e["available_from"], e["available_until"]) == ("13:30", "18:00") and e["available_from_we"] is None
    assert [s["title_de"] for s in e["subtasks"]] == [
        "Arbeitsplatz frei", "Hausaufgaben erledigt", "Hausaufgabenheft abhaken", "15 min lesen oder üben", "Mama/Papa kurz zeigen"]
    assert [s["min_age"] for s in e["subtasks"]] == [0, 0, 0, 8, 0]
    assert e["name_de"] == "Hausaufgaben / Lernzeit" and e["name_en"] == "Homework / study time"
    flow = next(x for x in catalog.flow_catalog("en", ["school"]) if x["key"] == "homework")
    assert flow["weekdays"] == [0, 1, 2, 3, 4] and flow["available"] is True and flow["name"] == "Homework / study time"
    blitz = next(x for x in catalog.flow_catalog("de") if x["key"] == "room_blitz")
    assert blitz["after_key"] == "homework" and blitz["available_from_we"] == "10:00"
    assert next(x for x in catalog.flow_catalog("de", []) if x["key"] == "homework")["available"] is False


def _kids(*ages):
    return [{"id": f"person.k{i}", "name": f"K{i}", "birth_year": 2026 - a} for i, a in enumerate(ages)]


def test_wizard_proposes_homework_only_with_the_school_feature():
    with_school = catalog.build_proposal(_kids(5, 6, 9), ["school"], date(2026, 11, 2), "start", current_year=2026)
    without = catalog.build_proposal(_kids(5, 6, 9), [], date(2026, 11, 2), "start", current_year=2026)
    keys = lambda p, i: {t["catalog_key"] for t in p["kids"][i]["tasks"]}
    assert "homework" not in keys(with_school, 0)                                   # too young
    assert "homework" in keys(with_school, 1) and "homework" in keys(with_school, 2)
    assert all("homework" not in keys(without, i) for i in range(3))
    task = next(t for t in with_school["kids"][1]["tasks"] if t["catalog_key"] == "homework")
    assert task["selected"] and task["weekdays"] == [0, 1, 2, 3, 4] and task["interval"] == 1
    assert task["name"] == "Hausaufgaben / Lernzeit K1"
    # selected by default, even in the gentle start phase, and not part of the chore load
    assert not any(k.endswith(":person.k1") and k.startswith("homework") for k in catalog.suggest_excluded(
        catalog.build_proposal(_kids(5, 6, 9), ["school"], date(2026, 11, 2), "start", current_year=2026), "start"))
    blitz = next(t for t in with_school["kids"][2]["tasks"] if t["catalog_key"] == "room_blitz")
    assert blitz["after_key"] == "homework" and blitz["available_from_we"] == "10:00"
    # the monthly points of a weekday task count 5/7
    assert catalog.monthly_max_points([{"points": 3, "category": "basis", "interval": 1, "weekdays": [0, 1, 2, 3, 4]}]) \
        == 3 * 30 * 5 / 7


def _generated_old(key, window, **extra):
    entry = catalog.CATALOG_BY_KEY[key]
    steps = [s["title_de"] for s in entry["subtasks"] if not s["requires"] and not s["min_age"]]
    return {
        "wizard_key": f"{key}:person.k0", "name": f"{entry['name_de']} K0", "complexity": entry["points"], "icon": entry["icon"],
        "category": entry["category"], "min_age": entry["min_age"], "allow_together": entry["allow_together"],
        "interval": entry["interval"], "available_from": window[0], "available_until": window[1],
        "requires_approval": entry["requires_approval"], "subtasks": [{"title": t, "done": False} for t in steps],
        "description": "", **extra,
    }


def test_new_windows_do_not_mark_old_uncustomized_tasks_as_customized():
    legacy = {"room_blitz": ("14:00", "19:30"), "room_blitz_small": ("14:00", "19:30"), "room_deep": ("09:00", "18:00")}
    for key, window in legacy.items():
        assert catalog.legacy_customized_fields(_generated_old(key, window)) == [], key
        # the current catalog window is uncustomized as well, any other window is a customization
        current = (catalog.CATALOG_BY_KEY[key]["available_from"], catalog.CATALOG_BY_KEY[key]["available_until"])
        assert catalog.legacy_customized_fields(_generated_old(key, current)) == [], key
        assert catalog.legacy_customized_fields(_generated_old(key, ("15:00", current[1]))) == ["available_from"], key
    # tasks from before 2.6 have no weekend window / after_key: that is not a customization, a different value is
    old = _generated_old("room_blitz", ("14:00", "19:30"))
    assert catalog.legacy_customized_fields({**old, "available_from_we": "10:00", "available_until_we": "18:00",
                                             "after_key": "homework"}) == []
    assert catalog.legacy_customized_fields({**old, "available_from_we": "08:00"}) == ["available_from_we"]
    assert catalog.legacy_customized_fields({**old, "after_key": None}) == ["after_key"]
    assert catalog.legacy_customized_fields({**old, "after_key": "other"}) == ["after_key"]
    # the morning mission keeps its weekday window and only gained the weekend one
    morning = _generated_old("morning", ("05:00", "10:00"))
    assert catalog.legacy_customized_fields(morning) == []
    for field in ("available_from_we", "available_until_we", "after_key"):
        assert field in catalog.CUSTOM_FIELDS
    # a fresh homework task (weekdays Mon-Fri) is uncustomized, other weekdays are a customization
    homework = _generated_old("homework", ("13:30", "18:00"), weekdays=[0, 1, 2, 3, 4])
    assert catalog.legacy_customized_fields(homework) == []
    assert catalog.legacy_customized_fields({**homework, "weekdays": [0, 2]}) == ["weekdays"]


# -- live medication stock ---------------------------------------------------------

def _care(**kw):
    return {"id": "pill", "label": "Tablette", "anchor": "time", "time": "08:00", **kw}


def test_stock_reconcile_only_restarts_the_live_counter_when_the_entered_stock_changed():
    now = "2026-11-05T12:00:00+00:00"
    entries, live = kids.care_stock_reconcile(None, [_care(stock=30)], now)
    assert entries[0]["stock"] == 30 and entries[0]["stock_set_at"] == now
    assert live == {"pill": {"remaining": 30, "set_at": now}}
    stored = entries
    # the same value again (a stale draft): the live counter is left alone
    entries, live = kids.care_stock_reconcile(stored, [_care(stock=30)], "2026-11-06T00:00:00+00:00")
    assert live == {} and entries[0]["stock_set_at"] == now
    entries, live = kids.care_stock_reconcile(stored, [_care(stock=30, stock_set_at=now)], "later")
    assert live == {} and entries[0]["stock_set_at"] == now
    # a different value restarts it with a new token
    entries, live = kids.care_stock_reconcile(stored, [_care(stock=50, stock_set_at=now)], "2026-11-07T00:00:00+00:00")
    assert live == {"pill": {"remaining": 50, "set_at": "2026-11-07T00:00:00+00:00"}} and entries[0]["stock"] == 50
    # the same value with a NEWER token (re-entered on purpose) restarts it with that token
    entries, live = kids.care_stock_reconcile(stored, [_care(stock=30, stock_set_at="2026-11-09T08:00:00+00:00")], "x")
    assert live == {"pill": {"remaining": 30, "set_at": "2026-11-09T08:00:00+00:00"}}
    # an OLDER token is a stale draft: nothing of it is taken over
    newer = [_care(stock=50, stock_set_at="2026-11-07T00:00:00+00:00")]
    entries, live = kids.care_stock_reconcile(newer, [_care(stock=30, stock_set_at=now)], "x")
    assert live == {} and entries[0]["stock"] == 50 and entries[0]["stock_set_at"] == "2026-11-07T00:00:00+00:00"
    # tracking switched off: no stock, no token
    entries, live = kids.care_stock_reconcile(stored, [_care()], now)
    assert "stock" not in entries[0] and "stock_set_at" not in entries[0] and live == {}
    # tracking switched on later
    entries, live = kids.care_stock_reconcile([_care()], [_care(stock=12)], now)
    assert live["pill"]["remaining"] == 12
