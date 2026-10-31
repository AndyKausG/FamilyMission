"""Task catalog and proposal engine for the TaskOrganizer kids quick-start wizard.

This module intentionally has NO dependency on Home Assistant so that it can be
unit-tested standalone. It contains

* the catalog of age-appropriate household tasks (German + English),
* the pure functions that turn "kids + household + start date" into a
  complete proposal (tasks, rotation plan, load warnings, goals).
"""

from __future__ import annotations

import calendar
import math
from datetime import date, timedelta
from typing import Any, Iterable

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MODE_EACH = "each"
MODE_ROTATION = "rotation"
MODE_OPEN = "open"

GENERATED_BY = "wizard"
OPEN_SUFFIX = "open"
TEMPLATE_SUFFIX = "template"
OPEN_INTERVAL = 365

PHASE_START = "start"
PHASE_NORMAL = "normal"
PHASE_FACTORS = {PHASE_START: 0.6, PHASE_NORMAL: 0.75}
FAMILY_GOAL_FACTOR = 0.8

# Suggested default selection (ramp-up): 1 = core routine, always proposed;
# 2 = small daily duties; 3 = bigger chores; 4 = extras. The start phase
# proposes only the core routines, the normal phase up to priority 3 -
# capped by the recommended daily load of the kid's age.
TASK_PRIORITY = {
    "morning": 1, "evening": 1, "table_set": 1,
    "room_blitz": 2, "room_blitz_small": 2, "table_clear": 2, "plants": 2, "pet_feed": 2,
    "dishwasher_load": 3, "room_deep": 3, "own_laundry": 3,
    "garden": 4, "driveway": 4, "bedding": 4, "pet_clean": 4,
}
PHASE_MAX_PRIORITY = {PHASE_START: 1, PHASE_NORMAL: 3}
# Kids: the number of cards matters as much as the minutes. Cap the average
# number of tasks per day (sum of 1/interval) - small routines are bundled
# into the morning/evening missions as subtasks.
PHASE_MAX_TASKS_PER_DAY = {PHASE_START: 3.0, PHASE_NORMAL: 4.5}

AVATARS = ("🦊", "🐼", "🦄", "🦁", "🐯", "🐸", "🐙", "🦖", "🐧")
COLORS = (
    "#FF7043",  # orange
    "#42A5F5",  # blue
    "#AB47BC",  # purple
    "#FFCA28",  # amber
    "#66BB6A",  # green
    "#EC407A",  # pink
    "#26C6DA",  # cyan
    "#8D6E63",  # brown
)

# Household features: key, icon, German + English label
FEATURES = (
    {"key": "school", "icon": "mdi:school", "name_de": "Schule", "name_en": "School"},
    {"key": "dishwasher", "icon": "mdi:dishwasher", "name_de": "Spülmaschine", "name_en": "Dishwasher"},
    {"key": "dryer", "icon": "mdi:tumble-dryer", "name_de": "Trockner", "name_en": "Tumble dryer"},
    {"key": "washer", "icon": "mdi:washing-machine", "name_de": "Waschmaschine", "name_en": "Washing machine"},
    {"key": "robot_vacuum", "icon": "mdi:robot-vacuum", "name_de": "Saugroboter", "name_en": "Robot vacuum"},
    {"key": "garden", "icon": "mdi:flower", "name_de": "Garten", "name_en": "Garden"},
    {"key": "driveway", "icon": "mdi:broom", "name_de": "Hofeinfahrt", "name_en": "Driveway"},
    {"key": "pets", "icon": "mdi:paw", "name_de": "Haustiere", "name_en": "Pets"},
)
FEATURE_KEYS = tuple(f["key"] for f in FEATURES)


def _st(de: str, en: str, min_age: int = 0, requires: str | None = None) -> dict:
    return {"title_de": de, "title_en": en, "min_age": min_age, "requires": requires}


def _entry(
    key: str, name_de: str, name_en: str, icon: str, points: int, minutes: int,
    min_age: int, interval: int, category: str, mode: str,
    max_age: int | None = None, requires: str | None = None,
    subtasks: list | None = None, trigger_hint_de: str | None = None,
    trigger_hint_en: str | None = None,
    available_from: str | None = None, available_until: str | None = None,
    replaced_by: str | None = None, day_offset: int = 0,
    allow_together: bool | None = None,
) -> dict:
    # Shareable chores (and everything that is not a personal basis duty) may be done together
    if allow_together is None:
        allow_together = category != "basis"
    return {
        "key": key, "name_de": name_de, "name_en": name_en, "icon": icon,
        "points": points, "minutes": minutes, "min_age": min_age,
        "max_age": max_age, "interval": interval, "category": category,
        "mode": mode, "requires": requires, "subtasks": subtasks or [],
        "trigger_hint_de": trigger_hint_de, "trigger_hint_en": trigger_hint_en,
        "available_from": available_from, "available_until": available_until,
        "replaced_by": replaced_by, "day_offset": day_offset,
        "allow_together": allow_together,
    }


CATALOG: tuple[dict, ...] = (
    # --- daily basis, one task per kid ---------------------------------
    _entry("morning", "Morgen-Mission", "Morning mission", "mdi:weather-sunny", 2, 5, 6, 1,
           "basis", MODE_EACH,
           subtasks=[_st("Anziehen", "Get dressed"), _st("Bett machen", "Make the bed"),
                     _st("Schlafanzug weg", "Put pajamas away")],
           available_from="05:00", available_until="10:00"),
    _entry("evening", "Abend-Mission", "Evening mission", "mdi:weather-night", 3, 7, 6, 1,
           "basis", MODE_EACH,
           subtasks=[_st("Schulranzen packen", "Pack school bag", requires="school"),
                     _st("Schuhe & Jacke an ihren Platz", "Shoes & jacket in their place"),
                     _st("Schmutzwäsche in den Korb", "Dirty laundry into the basket")],
           available_from="17:00", available_until="21:00"),
    _entry("room_blitz", "Zimmer-Blitz (10 Minuten)", "Room blitz (10 minutes)", "mdi:timer-outline",
           3, 10, 8, 1, "basis", MODE_EACH,
           subtasks=[_st("Boden frei", "Clear the floor"),
                     _st("Spielzeug/Sachen in die Kisten", "Toys/things into the boxes"),
                     _st("Schreibtisch frei", "Clear the desk")], available_from="14:00", available_until="19:30", replaced_by="room_deep"),
    _entry("room_blitz_small", "Zimmer-Blitz (5 Minuten)", "Room blitz (5 minutes)", "mdi:timer-sand",
           2, 5, 6, 1, "basis", MODE_EACH, max_age=7,
           subtasks=[_st("Boden frei", "Clear the floor"),
                     _st("Spielzeug in die Kisten", "Toys into the boxes")], available_from="14:00", available_until="19:30", replaced_by="room_deep"),
    # --- rotation basis, shared duties ---------------------------------
    _entry("table_set", "Tisch decken", "Set the table", "mdi:silverware-fork-knife", 2, 5, 6, 1,
           "basis", MODE_ROTATION,
           subtasks=[_st("Teller", "Plates"), _st("Besteck", "Cutlery"), _st("Gläser", "Glasses")], available_from="17:00", available_until="19:30", allow_together=True),
    _entry("table_clear", "Tisch abräumen", "Clear the table", "mdi:table-chair", 2, 5, 6, 1,
           "basis", MODE_ROTATION, available_from="18:00", available_until="20:30", allow_together=True),
    _entry("dishwasher_load", "Spülmaschine einräumen", "Load the dishwasher", "mdi:dishwasher-alert",
           3, 10, 8, 1, "basis", MODE_ROTATION, requires="dishwasher", available_from="18:00", available_until="21:00", allow_together=True),
    _entry("plants", "Pflanzen gießen", "Water the plants", "mdi:watering-can", 2, 5, 6, 7,
           "basis", MODE_ROTATION, available_from="14:00", available_until="19:00", allow_together=True),
    _entry("garden", "Mini-Garten: gießen & Unkraut (15 Min)", "Mini garden: water & weed (15 min)",
           "mdi:flower", 4, 15, 8, 7, "basis", MODE_ROTATION, requires="garden", available_from="10:00", available_until="18:00", allow_together=True),
    _entry("driveway", "Hofeinfahrt kehren", "Sweep the driveway", "mdi:broom", 4, 15, 8, 7,
           "basis", MODE_ROTATION, requires="driveway", available_from="10:00", available_until="18:00", allow_together=True),
    _entry("pet_feed", "Tiere füttern", "Feed the pets", "mdi:paw", 2, 5, 6, 1,
           "basis", MODE_ROTATION, requires="pets", available_from="07:00", available_until="19:00", allow_together=True),
    _entry("pet_clean", "Käfig/Katzenklo sauber machen", "Clean cage/litter box", "mdi:paw-outline",
           4, 15, 9, 7, "basis", MODE_ROTATION, requires="pets", available_from="10:00", available_until="18:00", allow_together=True),
    # --- weekly basis, one task per kid --------------------------------
    _entry("room_deep", "Zimmer gründlich", "Thorough room clean", "mdi:bed-king", 6, 30, 6, 7,
           "basis", MODE_EACH,
           subtasks=[_st("Boden frei", "Clear the floor"), _st("Regal ordnen", "Tidy the shelf"),
                     _st("Müll raus", "Take out the trash"), _st("Staubsaugen", "Vacuum", 8)], available_from="09:00", available_until="18:00"),
    _entry("own_laundry", "Eigene Wäsche einräumen", "Put away own laundry", "mdi:wardrobe", 3, 10, 6, 7,
           "basis", MODE_EACH, requires="washer", available_from="14:00", available_until="19:30", day_offset=-1),
    _entry("bedding", "Bettwäsche abziehen", "Strip the bedding", "mdi:bed-empty", 3, 10, 8, 14,
           "basis", MODE_EACH, available_from="09:00", available_until="18:00", day_offset=1),
    # --- bonus, one open (unassigned) task -----------------------------
    _entry("dishwasher_unload", "Spülmaschine ausräumen", "Unload the dishwasher", "mdi:dishwasher",
           4, 10, 6, OPEN_INTERVAL, "bonus", MODE_OPEN, requires="dishwasher",
           subtasks=[_st("Besteck", "Cutlery"), _st("Unterkorb", "Lower rack"), _st("Oberkorb", "Upper rack")],
           trigger_hint_de="Spülprogramm fertig", trigger_hint_en="dishwasher program finished"),
    _entry("dryer_empty", "Wäsche aus dem Trockner + falten", "Empty the dryer + fold", "mdi:tumble-dryer",
           4, 10, 8, OPEN_INTERVAL, "bonus", MODE_OPEN, requires="dryer",
           trigger_hint_de="Trockner fertig", trigger_hint_en="dryer finished"),
    _entry("washer_hang", "Wäsche aufhängen", "Hang up the laundry", "mdi:hanger",
           4, 10, 9, OPEN_INTERVAL, "bonus", MODE_OPEN, requires="washer",
           trigger_hint_de="Waschmaschine fertig", trigger_hint_en="washing machine finished"),
    _entry("vacuum_prep", "Weg frei für den Saugroboter", "Clear the way for the robot vacuum",
           "mdi:robot-vacuum", 2, 5, 6, OPEN_INTERVAL, "bonus", MODE_OPEN, requires="robot_vacuum",
           trigger_hint_de="Saugroboter startet", trigger_hint_en="robot vacuum starts"),
    _entry("trash", "Müll rausbringen", "Take out the trash", "mdi:trash-can", 2, 5, 8, OPEN_INTERVAL,
           "bonus", MODE_OPEN),
    _entry("groceries", "Einkäufe auspacken", "Unpack the groceries", "mdi:cart", 2, 5, 6, OPEN_INTERVAL,
           "bonus", MODE_OPEN),
    _entry("bottles", "Leergut wegbringen", "Return the empty bottles", "mdi:bottle-soda-classic",
           3, 10, 10, OPEN_INTERVAL, "bonus", MODE_OPEN),
    # --- Auftrag: templates only ----------------------------------------
    _entry("cooking", "Beim Kochen helfen", "Help with cooking", "mdi:chef-hat", 5, 30, 8, 0,
           "auftrag", MODE_OPEN),
    _entry("car", "Auto aussaugen", "Vacuum the car", "mdi:car-side", 6, 30, 8, 0, "auftrag", MODE_OPEN),
    _entry("windows", "Fenster putzen", "Clean the windows", "mdi:window-closed-variant", 6, 45, 10, 0,
           "auftrag", MODE_OPEN),
    _entry("sink", "Waschbecken im Bad putzen", "Clean the bathroom sink", "mdi:faucet", 4, 15, 10, 0,
           "auftrag", MODE_OPEN),
)

CATALOG_BY_KEY = {e["key"]: e for e in CATALOG}
ROTATION_KEYS = tuple(e["key"] for e in CATALOG if e["mode"] == MODE_ROTATION)
OPEN_BONUS_KEYS = tuple(
    e["key"] for e in CATALOG if e["mode"] == MODE_OPEN and e["category"] == "bonus"
)


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------

def make_key(catalog_key: str, suffix: str) -> str:
    """``wizard_key`` of a generated task: ``<catalog_key>:<kid_id>`` / ``:open``."""
    return f"{catalog_key}:{suffix}"


def split_key(wizard_key: str) -> tuple[str, str]:
    """Inverse of :func:`make_key`. The kid id may contain colons -> split once."""
    catalog_key, _, suffix = str(wizard_key).partition(":")
    return catalog_key, suffix


def _name(entry: dict, lang: str) -> str:
    return entry["name_de"] if lang == "de" else entry["name_en"]


def round_to(value: float, step: int) -> int:
    """Round half up to the nearest multiple of ``step`` (no banker's rounding)."""
    return int(math.floor(value / step + 0.5) * step)


def recommended_minutes(age: int | None) -> int:
    """Recommended maximum of household minutes per day for an age."""
    if age is None or age < 8:
        return 20
    if age < 10:
        return 30
    return 40


def interval_label(interval: int, lang: str = "de", rotation: bool = False) -> str:
    """Human readable interval, e.g. "täglich", "alle 4 Tage (Rotation)"."""
    if interval == 1:
        text = "täglich" if lang == "de" else "daily"
    elif interval == 7:
        text = "wöchentlich" if lang == "de" else "weekly"
    elif interval == 14:
        text = "alle 2 Wochen" if lang == "de" else "every 2 weeks"
    elif interval % 7 == 0 and interval > 14:
        weeks = interval // 7
        text = f"alle {weeks} Wochen" if lang == "de" else f"every {weeks} weeks"
    else:
        text = f"alle {interval} Tage" if lang == "de" else f"every {interval} days"
    if rotation and interval != 1:
        text += " (Rotation)" if lang == "de" else " (rotation)"
    return text


def parse_date(value: Any, default: date) -> date:
    """Parse ``YYYY-MM-DD`` (or an ISO datetime) to a date, falling back."""
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return default


def suggest_profiles(
    kid_ids: Iterable[str],
    taken_avatars: Iterable[str] = (),
    taken_colors: Iterable[str] = (),
) -> dict[str, dict]:
    """Distinct avatar + color suggestions for kids without a profile."""
    avatars = [a for a in AVATARS if a not in set(taken_avatars)] or list(AVATARS)
    colors = [c for c in COLORS if c.lower() not in {x.lower() for x in taken_colors}] or list(COLORS)
    result = {}
    for index, kid_id in enumerate(kid_ids):
        result[kid_id] = {
            "avatar": avatars[index % len(avatars)],
            "color": colors[index % len(colors)],
        }
    return result


# ---------------------------------------------------------------------------
# Catalog for the client
# ---------------------------------------------------------------------------

def catalog_for_client() -> dict:
    """Catalog + household features (both languages) for the wizard UI."""
    entries = []
    for e in CATALOG:
        item = {k: v for k, v in e.items() if k != "subtasks"}
        item["subtasks"] = [dict(s) for s in e["subtasks"]]
        item["has_trigger"] = e["mode"] == MODE_OPEN and e["category"] == "bonus"
        entries.append(item)
    return {
        "features": [dict(f) for f in FEATURES],
        "catalog": entries,
        "avatars": list(AVATARS),
        "colors": list(COLORS),
        "recommended_minutes": {"6": recommended_minutes(6), "8": recommended_minutes(8),
                                "10": recommended_minutes(10)},
    }


# ---------------------------------------------------------------------------
# Proposal engine
# ---------------------------------------------------------------------------

def _subtasks_for(entry: dict, age: int | None, lang: str, features: set[str] | None = None) -> list[dict]:
    result = []
    for st in entry["subtasks"]:
        if age is not None and st["min_age"] > age:
            continue
        if st.get("requires") and features is not None and st["requires"] not in features:
            continue
        result.append({"title": st["title_de"] if lang == "de" else st["title_en"], "done": False})
    return result


def _eligible(entry: dict, age: int | None) -> bool:
    if age is None:
        return False
    if age < entry["min_age"]:
        return False
    if entry["max_age"] is not None and age > entry["max_age"]:
        return False
    return True


def _available(entry: dict, features: set[str]) -> bool:
    return entry["requires"] is None or entry["requires"] in features


def monthly_max_points(tasks: Iterable[dict]) -> float:
    """Σ points × 30 / interval over the selected recurring basis tasks."""
    total = 0.0
    for t in tasks:
        if t.get("selected", True) and t["category"] == "basis" and t["interval"] > 0:
            total += t["points"] * 30 / t["interval"]
    return total


def minutes_per_day(tasks: Iterable[dict]) -> float:
    """Σ minutes / interval over the selected recurring tasks of a kid."""
    total = 0.0
    for t in tasks:
        if t.get("selected", True) and t["interval"] > 0:
            total += t["minutes"] / t["interval"]
    return total


def prorate_factor(start: date) -> float:
    """Share of the start month that is left (1.0 when starting on the 1st)."""
    days = calendar.monthrange(start.year, start.month)[1]
    return (days - start.day + 1) / days


DEFAULT_HOUSEHOLD_DAY = 5  # Saturday (Monday = 0)


def next_weekday(start: date, weekday: int) -> date:
    """First day on or after ``start`` that falls on ``weekday`` (Monday = 0)."""
    return start + timedelta(days=(weekday - start.weekday()) % 7)


def next_month_start(day: date) -> date:
    """First day of the month after ``day``."""
    return date(day.year + (day.month == 12), day.month % 12 + 1, 1)


def calc_goal(max_points: float, phase: str, start: date) -> int:
    """Monthly goal of a kid: max × phase factor × prorate, rounded to 5."""
    factor = PHASE_FACTORS.get(phase, PHASE_FACTORS[PHASE_NORMAL])
    raw = max_points * factor * prorate_factor(start)
    if raw <= 0:
        return 0
    return max(5, round_to(raw, 5))


def calc_family_goal(kid_goals: Iterable[int]) -> int:
    """Family goal: 80 % of the kid goals, rounded to 10."""
    total = sum(kid_goals)
    if total <= 0:
        return 0
    return max(10, round_to(total * FAMILY_GOAL_FACTOR, 10))


def build_proposal(
    kids: list[dict],
    features: Iterable[str],
    start: date,
    phase: str = PHASE_START,
    current_year: int | None = None,
    lang: str = "de",
    excluded: Iterable[str] = (),
    points: dict | None = None,
    household_day: int = DEFAULT_HOUSEHOLD_DAY,
) -> dict:
    """Build the complete wizard proposal.

    :param kids: ``[{id, name, birth_year, age?}]``; ``age`` (exact, from the
        birthday) takes precedence over ``current_year - birth_year``
    :param features: enabled household features (``school``, ``dishwasher``, ...)
    :param start: first day of the plan (rotation start / prorating)
    :param phase: ``start`` or ``normal`` (goal factor)
    :param current_year: year the age is derived from (default: ``start.year``)
    :param excluded: wizard keys the parent switched off
    :param points: ``{wizard_key: points}`` overrides (1..10)
    :param household_day: weekday (Monday = 0) of the first weekly / bi-weekly
        duties instead of the start date. Weekly duties of one kid are spread
        around it by the catalog ``day_offset`` (thorough room clean on the
        household day, own laundry the day before, bedding the day after).
    """
    if isinstance(household_day, bool) or not isinstance(household_day, int) or not 0 <= household_day <= 6:
        household_day = DEFAULT_HOUSEHOLD_DAY
    household = next_weekday(start, household_day)
    lang = "de" if lang == "de" else "en"
    year = current_year if current_year is not None else start.year
    feats = {f for f in features if f in FEATURE_KEYS}
    excluded = set(excluded)
    overrides = points or {}
    warnings: list[dict] = []

    kid_entries = []
    for kid in kids:
        by = kid.get("birth_year")
        if isinstance(kid.get("age"), int) and not isinstance(kid.get("age"), bool):
            # exact age (birthday known) computed by the caller with kids.kid_age
            age = kid["age"]
        else:
            age = None if isinstance(by, bool) or not isinstance(by, int) else year - by
        kid_entries.append({
            "id": kid["id"], "name": kid.get("name") or kid["id"], "age": age,
            "birth_year": by, "birthday": kid.get("birthday"), "avatar": kid.get("avatar"), "color": kid.get("color"),
            "tasks": [],
        })
        if age is None:
            warnings.append({"type": "no_birth_year", "kid_id": kid["id"], "name": kid.get("name") or kid["id"]})

    def pts(entry: dict, key: str) -> int:
        value = overrides.get(key, entry["points"])
        try:
            return max(1, min(10, int(value)))
        except (TypeError, ValueError):
            return entry["points"]

    def base_task(entry: dict, key: str, name: str, kid: dict | None, interval: int) -> dict:
        age = kid["age"] if kid else None
        return {
            "wizard_key": key,
            "catalog_key": entry["key"],
            "mode": entry["mode"],
            "name": name,
            "name_de": entry["name_de"],
            "name_en": entry["name_en"],
            "icon": entry["icon"],
            "points": pts(entry, key),
            "default_points": entry["points"],
            "minutes": entry["minutes"],
            "min_age": entry["min_age"],
            "interval": interval,
            "base_interval": entry["interval"],
            "interval_label": interval_label(interval, lang, entry["mode"] == MODE_ROTATION),
            "category": entry["category"],
            "allow_together": entry["allow_together"],
            "available_from": entry["available_from"],
            "available_until": entry["available_until"],
            "replaced_by_key": entry["replaced_by"],
            "kid_id": kid["id"] if kid else None,
            "subtasks": _subtasks_for(entry, age, lang, feats) if kid else
            [{"title": s["title_de"] if lang == "de" else s["title_en"], "done": False}
             for s in entry["subtasks"]],
            "selected": key not in excluded,
            "due_date": None,
            "rotation_index": None,
            "rotation_size": None,
        }

    rotation_plan = []
    for entry in CATALOG:
        if entry["category"] == "auftrag" or not _available(entry, feats):
            continue
        if entry["mode"] == MODE_EACH:
            for kid_index, kid in enumerate(kid_entries):
                if not _eligible(entry, kid["age"]):
                    continue
                key = make_key(entry["key"], kid["id"])
                task = base_task(entry, key, f"{_name(entry, lang)} {kid['name']}", kid, entry["interval"])
                if entry["interval"] >= 7:
                    # weekly / bi-weekly: spread over the days around the household day
                    # (day_offset), bi-weekly alternating by kid
                    day = household + timedelta(days=entry["day_offset"])
                    if day < start:
                        day += timedelta(days=7)
                    if entry["interval"] >= 14 and kid_index % 2:
                        day += timedelta(days=7)
                    task["due_date"] = day.isoformat()
                else:
                    task["due_date"] = start.isoformat()
                kid["tasks"].append(task)
        elif entry["mode"] == MODE_ROTATION:
            eligible = sorted(
                (k for k in kid_entries if _eligible(entry, k["age"])),
                key=lambda k: (-k["age"], k["name"].lower(), k["id"]),
            )
            if not eligible:
                continue
            members = [k for k in eligible if make_key(entry["key"], k["id"]) not in excluded]
            n = len(members)
            interval = entry["interval"] * max(n, 1)
            order = []
            for kid in eligible:
                key = make_key(entry["key"], kid["id"])
                task = base_task(entry, key, f"{_name(entry, lang)} {kid['name']}", kid, interval)
                if kid in members:
                    index = members.index(kid)
                    first = household if entry["interval"] >= 7 else start
                    due = first + timedelta(days=entry["interval"] * index)
                    task["due_date"] = due.isoformat()
                    task["rotation_index"] = index
                    task["rotation_size"] = n
                    order.append({"kid_id": kid["id"], "name": kid["name"], "due_date": due.isoformat()})
                kid["tasks"].append(task)
            if members:
                rotation_plan.append({
                    "catalog_key": entry["key"], "name": _name(entry, lang), "icon": entry["icon"],
                    "interval": interval, "interval_label": interval_label(interval, lang, True),
                    "order": order,
                })

    open_tasks = []
    for entry in CATALOG:
        if entry["mode"] != MODE_OPEN or entry["category"] != "bonus" or not _available(entry, feats):
            continue
        # At least one kid must be old enough
        if not any(k["age"] is not None and k["age"] >= entry["min_age"] for k in kid_entries):
            continue
        key = make_key(entry["key"], OPEN_SUFFIX)
        task = base_task(entry, key, _name(entry, lang), None, OPEN_INTERVAL)
        task["due_date"] = (start + timedelta(days=OPEN_INTERVAL)).isoformat()
        task["trigger_hint"] = entry["trigger_hint_de"] if lang == "de" else entry["trigger_hint_en"]
        open_tasks.append(task)

    templates = []
    for entry in CATALOG:
        if entry["category"] != "auftrag":
            continue
        key = make_key(entry["key"], TEMPLATE_SUFFIX)
        templates.append({
            "wizard_key": key, "catalog_key": entry["key"], "name": _name(entry, lang),
            "name_de": entry["name_de"], "name_en": entry["name_en"], "icon": entry["icon"],
            "points": pts(entry, key), "default_points": entry["points"], "min_age": entry["min_age"],
            "minutes": entry["minutes"], "category": "auftrag", "interval": 0,
            "allow_together": entry["allow_together"],
            "selected": key not in excluded,
        })

    kid_goals = {}
    for kid in kid_entries:
        kid["minutes_per_day"] = round(minutes_per_day(kid["tasks"]), 1)
        kid["recommended_minutes"] = recommended_minutes(kid["age"])
        kid["max_points"] = round(monthly_max_points(kid["tasks"]), 1)
        kid["goal"] = calc_goal(kid["max_points"], phase, start)
        # unprorated goal that applies from the next month on
        kid["goal_full"] = calc_goal(kid["max_points"], phase, start.replace(day=1))
        kid_goals[kid["id"]] = kid["goal"]
        if kid["age"] is not None and kid["minutes_per_day"] > kid["recommended_minutes"]:
            warnings.append({
                "type": "load", "kid_id": kid["id"], "name": kid["name"], "age": kid["age"],
                "minutes": kid["minutes_per_day"], "recommended": kid["recommended_minutes"],
            })

    selected_count = sum(1 for k in kid_entries for t in k["tasks"] if t["selected"])
    return {
        "year": year,
        "start_date": start.isoformat(),
        "household_day": household_day,
        "household_date": household.isoformat(),
        "phase": phase if phase in PHASE_FACTORS else PHASE_NORMAL,
        "factor": PHASE_FACTORS.get(phase, PHASE_FACTORS[PHASE_NORMAL]),
        "prorate": round(prorate_factor(start), 3),
        "kids": kid_entries,
        "rotation": rotation_plan,
        "open_tasks": open_tasks,
        "templates": templates,
        "warnings": warnings,
        "goals": kid_goals,
        "goals_full": {k["id"]: k["goal_full"] for k in kid_entries},
        "prorated": prorate_factor(start) < 1,
        "prorated_month": start.strftime("%Y-%m"),
        "full_goals_from": next_month_start(start).isoformat(),
        "family_goal": calc_family_goal(kid_goals.values()),
        "counts": {
            "tasks": selected_count,
            "bonus": sum(1 for t in open_tasks if t["selected"]),
            "templates": sum(1 for t in templates if t["selected"]),
        },
    }


def suggest_excluded(proposal: dict, phase: str) -> list[str]:
    """Wizard keys to switch off by default for a gentle, age-appropriate start.

    Expects a proposal built without exclusions. Per kid, tasks are taken in
    priority order (cheapest load first) up to the phase's priority limit
    while the daily load (minutes) and the average number of tasks per day
    stay within their limits; core routines (priority 1) are always kept.
    """
    max_prio = PHASE_MAX_PRIORITY.get(phase, PHASE_MAX_PRIORITY[PHASE_NORMAL])
    max_count = PHASE_MAX_TASKS_PER_DAY.get(phase, PHASE_MAX_TASKS_PER_DAY[PHASE_NORMAL])
    excluded = []
    for kid in proposal["kids"]:
        budget = kid.get("recommended_minutes") or 0
        load = 0.0
        count = 0.0
        tasks = sorted(
            kid["tasks"],
            key=lambda t: (TASK_PRIORITY.get(t["catalog_key"], 4), t["minutes"] / max(t["interval"], 1)),
        )
        for t in tasks:
            prio = TASK_PRIORITY.get(t["catalog_key"], 4)
            cost = t["minutes"] / max(t["interval"], 1)
            per_day = 1 / max(t["interval"], 1)
            if prio == 1 or (prio <= max_prio and load + cost <= budget and count + per_day <= max_count):
                load += cost
                count += per_day
            else:
                excluded.append(t["wizard_key"])
    return excluded


def newly_unlocked(
    old_age: int | None,
    new_age: int,
    features: Iterable[str] | None = None,
    lang: str = "de",
) -> list[dict]:
    """Catalog entries that a kid can do at ``new_age`` but could not at ``old_age``.

    That covers reaching ``min_age`` as well as the replacement of an entry
    that was outgrown (5-minute blitz -> 10-minute blitz). Entries that need a
    household feature are only listed when the feature is known to be enabled.
    """
    feats = None if features is None else {f for f in features if f in FEATURE_KEYS}
    result = []
    for entry in CATALOG:
        if feats is None:
            if entry["requires"] is not None:
                continue
        elif not _available(entry, feats):
            continue
        if _eligible(entry, new_age) and not (old_age is not None and _eligible(entry, old_age)):
            result.append({"key": entry["key"], "name": _name(entry, lang), "icon": entry["icon"],
                           "category": entry["category"]})
    return result


def all_candidate_keys(proposal: dict) -> set[str]:
    """Every wizard key of a proposal (selected or not)."""
    keys = {t["wizard_key"] for k in proposal["kids"] for t in k["tasks"]}
    keys |= {t["wizard_key"] for t in proposal["open_tasks"]}
    keys |= {t["wizard_key"] for t in proposal["templates"]}
    return keys
