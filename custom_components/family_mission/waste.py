"""Waste collection bonus (2.4.0): pure logic, no Home Assistant imports.

Source: the calendar entities of the HACS integration *Waste Collection
Schedule* (all-day events, ``summary`` = waste type). The evening before a
collection a bonus task "put the bins out" opens, on the evening of the
collection day one for "bring the bins back in". Only waste types the parents
released for kids count (e.g. glass stays with the parents).
"""

from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import Any, Iterable

import re

WCS_PLATFORM = "waste_collection_schedule"

DEFAULT_MIN_AGE = 6
DEFAULT_POINTS_PER_BIN = 1
MAX_POINTS_PER_BIN = 5
MAX_TASK_POINTS = 10          # limit of a task's complexity
DEFAULT_OUT_TIME = "17:00"
DEFAULT_OUT_UNTIL = "07:00"
DEFAULT_IN_TIME = "16:00"
DEFAULT_IN_UNTIL = "21:00"
MAX_TYPE_LENGTH = 60
KEEP_DONE_DAYS = 3

JOB_OUT = "out"
JOB_IN = "in"

_DEFAULTS: dict[str, Any] = {
    "waste_enabled": False,
    "waste_calendars": [],
    "waste_types": {},
    "waste_min_age": DEFAULT_MIN_AGE,
    "waste_points_per_bin": DEFAULT_POINTS_PER_BIN,
    "waste_approval": True,
    "waste_out_time": DEFAULT_OUT_TIME,
    "waste_out_until": DEFAULT_OUT_UNTIL,
    "waste_in_time": DEFAULT_IN_TIME,
    "waste_in_until": DEFAULT_IN_UNTIL,
}
WASTE_KEYS = tuple(_DEFAULTS)


_CLOCK_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def valid_clock(value: Any, default: str) -> str:
    """``"HH:MM"`` of a setting, the default for anything else."""
    return value if isinstance(value, str) and _CLOCK_RE.match(value) else default


def _int_in(value: Any, default: int, low: int, high: int) -> int:
    if isinstance(value, bool):
        return default
    try:
        number = int(float(value))
    except (TypeError, ValueError, OverflowError):
        return default
    return max(low, min(high, number))


def _bool(value: Any, default: bool) -> bool:
    return value if isinstance(value, bool) else default


def clean_type(value: Any) -> str:
    """Waste type name as used for matching (trimmed, length limited)."""
    return str(value or "").strip()[:MAX_TYPE_LENGTH]


def normalize_waste_settings(raw: dict | None) -> dict:
    """All waste settings with valid values (anything invalid falls back to the default)."""
    raw = raw or {}
    calendars = raw.get("waste_calendars")
    calendars = [
        c for c in (calendars if isinstance(calendars, list) else [])
        if isinstance(c, str) and c.startswith("calendar.")
    ]
    types: dict[str, dict] = {}
    raw_types = raw.get("waste_types")
    if isinstance(raw_types, dict):
        for name, conf in raw_types.items():
            key = clean_type(name)
            if key:
                kids = conf.get("kids") if isinstance(conf, dict) else conf
                types[key] = {"kids": kids is True}
    return {
        "waste_enabled": _bool(raw.get("waste_enabled"), False),
        "waste_calendars": list(dict.fromkeys(calendars)),
        "waste_types": types,
        "waste_min_age": _int_in(raw.get("waste_min_age"), DEFAULT_MIN_AGE, 0, 18),
        "waste_points_per_bin": _int_in(
            raw.get("waste_points_per_bin"), DEFAULT_POINTS_PER_BIN, 1, MAX_POINTS_PER_BIN),
        "waste_approval": _bool(raw.get("waste_approval"), True),
        "waste_out_time": valid_clock(raw.get("waste_out_time"), DEFAULT_OUT_TIME),
        "waste_out_until": valid_clock(raw.get("waste_out_until"), DEFAULT_OUT_UNTIL),
        "waste_in_time": valid_clock(raw.get("waste_in_time"), DEFAULT_IN_TIME),
        "waste_in_until": valid_clock(raw.get("waste_in_until"), DEFAULT_IN_UNTIL),
    }


def sanitize_waste_input(incoming: dict) -> None:
    """Validate the waste keys of an incoming settings update in place."""
    if not any(k in incoming for k in WASTE_KEYS):
        return
    clean = normalize_waste_settings(incoming)
    for key in WASTE_KEYS:
        if key in incoming:
            incoming[key] = clean[key]


def _event_day(value: Any) -> date | None:
    """Day of an event start (``YYYY-MM-DD`` or an ISO date/time)."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str) and len(value) >= 10:
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def collections_by_day(events: Iterable[dict]) -> dict[date, list[str]]:
    """``{day: [waste types]}`` of calendar events (``start`` + ``summary``), types unique and in order."""
    result: dict[date, list[str]] = {}
    for event in events or []:
        if not isinstance(event, dict):
            continue
        day = _event_day(event.get("start"))
        name = clean_type(event.get("summary"))
        if day is None or not name:
            continue
        types = result.setdefault(day, [])
        if name not in types:
            types.append(name)
    return result


def known_types(events: Iterable[dict]) -> list[str]:
    """All waste types of the events (sorted, unique)."""
    names = {name for types in collections_by_day(events).values() for name in types}
    return sorted(names, key=str.lower)


def kid_types(types: Iterable[str], settings: dict) -> list[str]:
    """Waste types released for kids (unknown types are not released)."""
    released = settings.get("waste_types") or {}
    return [t for t in types if (released.get(t) or {}).get("kids") is True]


def _at(day: date, clock: str, tz) -> datetime:
    return datetime.combine(day, time(int(clock[:2]), int(clock[3:5])), tzinfo=tz)


def job_window(kind: str, day: date, settings: dict, tz) -> tuple[datetime, datetime]:
    """Open / expiry time of the job ``kind`` for the collection on ``day``.

    "out" opens the evening before at ``waste_out_time`` and ends on the
    collection day at ``waste_out_until``. "in" opens on the collection day at
    ``waste_in_time`` and ends at ``waste_in_until`` (next day if that is not
    later).
    """
    if kind == JOB_OUT:
        start = _at(day - timedelta(days=1), settings["waste_out_time"], tz)
        end = _at(day, settings["waste_out_until"], tz)
        if end <= start:  # nonsense setting: at least until the morning after
            end = start + timedelta(hours=12)
    else:
        start = _at(day, settings["waste_in_time"], tz)
        end = _at(day, settings["waste_in_until"], tz)
        if end <= start:
            end += timedelta(days=1)
    return start, end


def job_key(kind: str, day: date) -> str:
    return f"waste:{kind}:{day.isoformat()}"


def due_waste_jobs(events: Iterable[dict], settings: dict, now: datetime) -> list[dict]:
    """Jobs whose window contains ``now`` (``now`` must be timezone aware, local)."""
    jobs = []
    for day, types in sorted(collections_by_day(events).items()):
        bins = kid_types(types, settings)
        if not bins:
            continue
        for kind in (JOB_OUT, JOB_IN):
            start, end = job_window(kind, day, settings, now.tzinfo)
            if start <= now < end:
                jobs.append({
                    "key": job_key(kind, day), "kind": kind, "day": day,
                    "bins": bins, "expires_at": end,
                })
    return jobs


def task_points(job: dict, settings: dict) -> int:
    return max(1, min(MAX_TASK_POINTS, settings["waste_points_per_bin"] * len(job["bins"])))


_TEXT = {
    "de": {
        "out_name": "Mülltonnen rausstellen",
        "in_name": "Mülltonnen reinholen",
        "empty": "Mülleimer in der Wohnung leeren",
        "out_bin": "{t} rausstellen",
        "space": "Prüfen, ob noch Platz in den Tonnen ist",
        "in_bin": "{t} reinholen",
        "out_desc": "Morgen wird geleert: {types}",
        "in_desc": "Heute geleert: {types}",
        "say_out": "Morgen wird {types} geleert. Wer stellt die Tonnen raus? {p}.",
        "say_in": "Die Tonnen sind geleert: {types}. Wer holt sie rein? {p}.",
        "and": "und",
    },
    "en": {
        "out_name": "Put the bins out",
        "in_name": "Bring the bins in",
        "empty": "Empty the bins in the flat",
        "out_bin": "Put out: {t}",
        "space": "Check that there is still room in the bins",
        "in_bin": "Bring in: {t}",
        "out_desc": "Collection tomorrow: {types}",
        "in_desc": "Collected today: {types}",
        "say_out": "Tomorrow {types} will be collected. Who puts the bins out? {p}.",
        "say_in": "The bins have been emptied: {types}. Who brings them in? {p}.",
        "and": "and",
    },
}


def _texts(lang: str) -> dict:
    return _TEXT["de" if lang == "de" else "en"]


def join_types(types: list[str], lang: str) -> str:
    if len(types) <= 1:
        return "".join(types)
    return ", ".join(types[:-1]) + f" {_texts(lang)['and']} " + types[-1]


def build_waste_task(job: dict, settings: dict, lang: str, task_id: str, now_utc_iso: str,
                     expires_at_iso: str) -> dict:
    """The ad-hoc bonus task of a job (same structure as ``add_adhoc_bonus``)."""
    tx = _texts(lang)
    types = join_types(job["bins"], lang)
    if job["kind"] == JOB_OUT:
        subtasks = [tx["empty"]] + [tx["out_bin"].format(t=b) for b in job["bins"]] + [tx["space"]]
        name, desc, icon = tx["out_name"], tx["out_desc"].format(types=types), "mdi:trash-can-outline"
    else:
        subtasks = [tx["in_bin"].format(t=b) for b in job["bins"]]
        name, desc, icon = tx["in_name"], tx["in_desc"].format(types=types), "mdi:delete-restore"
    return {
        "id": task_id,
        "name": name,
        "description": desc,
        "area": "",
        "interval": 0,
        "assignees": [],
        "complexity": task_points(job, settings),
        "category": "bonus",
        "min_age": settings["waste_min_age"],
        "requires_approval": settings["waste_approval"],
        "requires_routine": False,
        "allow_together": True,
        "available_from": None,
        "available_until": None,
        "icon": icon,
        "due_date": now_utc_iso,
        "paused_until": None,
        "override_overdue_days": None,
        "subtasks": [{"title": s, "done": False} for s in subtasks],
        "adhoc": True,
        "expires_at": expires_at_iso,
        "waste_key": job["key"],
    }


def points_phrase(points: float, lang: str) -> str:
    """``1 Punkt`` / ``3 Punkte`` (``1 point`` / ``3 points``)."""
    value = f"{points:g}"
    if lang == "de":
        return f"{value} Punkt" if points == 1 else f"{value} Punkte"
    return f"{value} point" if points == 1 else f"{value} points"


def announcement(job: dict, settings: dict, lang: str) -> str:
    tx = _texts(lang)
    text = tx["say_out"] if job["kind"] == JOB_OUT else tx["say_in"]
    return text.format(types=join_types(job["bins"], lang), p=points_phrase(task_points(job, settings), lang))


def prune_done(done: Iterable[str], today: date) -> list[str]:
    """Job keys of the last ``KEEP_DONE_DAYS`` days and the future (older ones are dropped)."""
    limit = today - timedelta(days=KEEP_DONE_DAYS)
    result = []
    for key in done or []:
        if not isinstance(key, str):
            continue
        try:
            day = date.fromisoformat(key.rsplit(":", 1)[-1])
        except ValueError:
            continue
        if day >= limit and key not in result:
            result.append(key)
    return result
