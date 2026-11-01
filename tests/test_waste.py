"""2.4.0: waste collection bonus - pure helpers (no Home Assistant needed)."""

import importlib.util
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

_spec = importlib.util.spec_from_file_location(
    "waste_under_test",
    Path(__file__).resolve().parents[1] / "custom_components" / "family_mission" / "waste.py",
)
w = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(w)

TZ = timezone(timedelta(hours=1))
COLLECTION = date(2026, 11, 4)   # Wednesday


def _settings(**kw):
    raw = {
        "waste_enabled": True,
        "waste_types": {"Restmüll": {"kids": True}, "Gelber Sack": {"kids": True}, "Glas": {"kids": False}},
    }
    raw.update(kw)
    return w.normalize_waste_settings(raw)


def _events(day=COLLECTION, *types):
    return [{"start": day.isoformat(), "end": (day + timedelta(days=1)).isoformat(), "summary": t} for t in types]


def _at(day, hh, mm=0):
    return datetime(day.year, day.month, day.day, hh, mm, tzinfo=TZ)


def test_defaults_and_validation():
    s = w.normalize_waste_settings(None)
    assert s["waste_enabled"] is False and s["waste_min_age"] == 6 and s["waste_points_per_bin"] == 1
    assert s["waste_approval"] is True and s["waste_out_time"] == "17:00" and s["waste_in_until"] == "21:00"
    s = w.normalize_waste_settings({
        "waste_enabled": "yes", "waste_min_age": 99, "waste_points_per_bin": 0, "waste_approval": False,
        "waste_out_time": "25:00", "waste_calendars": ["calendar.abfall", "sensor.x", 3, "calendar.abfall"],
        "waste_types": {" Glas ": {"kids": True}, "": {"kids": True}, "Bio": "x"},
    })
    assert s["waste_enabled"] is False and s["waste_min_age"] == 18 and s["waste_points_per_bin"] == 1
    assert s["waste_approval"] is False and s["waste_out_time"] == "17:00"
    assert s["waste_calendars"] == ["calendar.abfall"]
    assert s["waste_types"] == {"Glas": {"kids": True}, "Bio": {"kids": False}}


def test_sanitize_only_touches_given_keys():
    incoming = {"waste_min_age": "7", "other": 1}
    w.sanitize_waste_input(incoming)
    assert incoming == {"waste_min_age": 7, "other": 1}
    untouched = {"night_mode": True}
    w.sanitize_waste_input(untouched)
    assert untouched == {"night_mode": True}


def test_grouping_and_types():
    events = _events(COLLECTION, "Restmüll", "Glas", "Restmüll") + _events(COLLECTION + timedelta(days=7), "Bio")
    events.append({"start": "2026-11-04T06:00:00+01:00", "summary": "Gelber Sack"})
    events.append({"start": "kaputt", "summary": "X"})
    by_day = w.collections_by_day(events)
    assert by_day[COLLECTION] == ["Restmüll", "Glas", "Gelber Sack"]
    assert w.known_types(events) == ["Bio", "Gelber Sack", "Glas", "Restmüll"]
    assert w.kid_types(by_day[COLLECTION], _settings()) == ["Restmüll", "Gelber Sack"]


def test_out_window_evening_before_until_morning():
    s = _settings()
    events = _events(COLLECTION, "Restmüll", "Glas")
    day_before = COLLECTION - timedelta(days=1)
    assert w.due_waste_jobs(events, s, _at(day_before, 16, 59)) == []
    jobs = w.due_waste_jobs(events, s, _at(day_before, 17, 0))
    assert [j["key"] for j in jobs] == ["waste:out:2026-11-04"]
    assert jobs[0]["bins"] == ["Restmüll"] and jobs[0]["expires_at"] == _at(COLLECTION, 7)
    # still due after midnight (e.g. restart), gone at the expiry
    assert [j["kind"] for j in w.due_waste_jobs(events, s, _at(COLLECTION, 6, 59))] == ["out"]
    assert w.due_waste_jobs(events, s, _at(COLLECTION, 7)) == []


def test_in_window_on_collection_day():
    s = _settings()
    events = _events(COLLECTION, "Restmüll", "Gelber Sack")
    jobs = w.due_waste_jobs(events, s, _at(COLLECTION, 16))
    assert [j["key"] for j in jobs] == ["waste:in:2026-11-04"]
    assert jobs[0]["expires_at"] == _at(COLLECTION, 21)
    assert w.due_waste_jobs(events, s, _at(COLLECTION, 21)) == []
    # "until" before "from": runs into the next day
    s2 = _settings(waste_in_time="22:00", waste_in_until="06:00")
    jobs = w.due_waste_jobs(events, s2, _at(COLLECTION, 23))
    assert jobs[0]["expires_at"] == _at(COLLECTION + timedelta(days=1), 6)


def test_only_glass_gives_no_job():
    events = _events(COLLECTION, "Glas")
    assert w.due_waste_jobs(events, _settings(), _at(COLLECTION - timedelta(days=1), 18)) == []
    # unknown types are not released
    assert w.due_waste_jobs(_events(COLLECTION, "Sperrmüll"), _settings(), _at(COLLECTION, 17)) == []


def test_points_per_bin_and_clamp():
    job = {"bins": ["A", "B", "C"], "kind": "out"}
    assert w.task_points(job, _settings(waste_points_per_bin=2)) == 6
    assert w.task_points(job, _settings(waste_points_per_bin=5)) == 10


def test_build_out_task():
    s = _settings(waste_min_age=6, waste_points_per_bin=2, waste_approval=False)
    job = w.due_waste_jobs(_events(COLLECTION, "Restmüll", "Gelber Sack"), s, _at(COLLECTION - timedelta(days=1), 18))[0]
    task = w.build_waste_task(job, s, "de", "t1", "2026-11-03T17:00:00+00:00", "2026-11-04T06:00:00+00:00")
    assert task["name"] == "Mülltonnen rausstellen" and task["category"] == "bonus" and task["adhoc"] is True
    assert task["complexity"] == 4 and task["min_age"] == 6 and task["requires_approval"] is False
    assert task["allow_together"] is True and task["waste_key"] == "waste:out:2026-11-04"
    assert task["expires_at"] == "2026-11-04T06:00:00+00:00" and task["interval"] == 0
    assert [st["title"] for st in task["subtasks"]] == [
        "Mülleimer in der Wohnung leeren", "Restmüll rausstellen", "Gelber Sack rausstellen",
        "Prüfen, ob noch Platz in den Tonnen ist",
    ]
    assert all(st["done"] is False for st in task["subtasks"])
    assert task["description"] == "Morgen wird geleert: Restmüll und Gelber Sack"
    assert w.announcement(job, s, "de") == (
        "Morgen wird Restmüll und Gelber Sack geleert. Wer stellt die Tonnen raus? 4 Punkte.")


def test_build_in_task_english():
    s = _settings()
    job = w.due_waste_jobs(_events(COLLECTION, "Restmüll"), s, _at(COLLECTION, 17))[0]
    task = w.build_waste_task(job, s, "en", "t2", "x", "y")
    assert task["name"] == "Bring the bins in" and task["requires_approval"] is True
    assert [st["title"] for st in task["subtasks"]] == ["Bring in: Restmüll"]
    assert w.announcement(job, s, "en").endswith("Who brings them in? 1 point.")


def test_points_phrase_and_prune():
    assert w.points_phrase(1, "de") == "1 Punkt" and w.points_phrase(2.5, "de") == "2.5 Punkte"
    assert w.points_phrase(3, "en") == "3 points"
    keys = ["waste:out:2026-10-30", "waste:in:2026-11-01", "waste:in:2026-11-01", "bad", 5, "waste:out:2026-11-05"]
    assert w.prune_done(keys, date(2026, 11, 4)) == ["waste:in:2026-11-01", "waste:out:2026-11-05"]
