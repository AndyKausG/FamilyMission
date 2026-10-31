"""Parents' task catalog and pure helpers for FamilyMission 2.0.

Like ``kids_catalog`` this module has NO dependency on Home Assistant so that
it can be unit-tested standalone. It contains

* the catalog of household / mental-load tasks for adults (German + English),
* the staggering of the start dates, the resolution of the "me / you /
  alternate" mode, the daily rollover, the hours sum of the weekly summary
  and all push texts (de / en).

Parents' tasks never carry points: nothing in here touches points, wallet or
goals, and nothing is rated or compared.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, tzinfo
from typing import Any, Iterable

GENERATED_BY = "parents"

GROUP_DAILY = "daily"
GROUP_WEEKLY = "weekly"
GROUP_MONTHLY = "monthly"
GROUP_KIDS = "kids"
GROUPS = (GROUP_DAILY, GROUP_WEEKLY, GROUP_MONTHLY, GROUP_KIDS)

MODE_ME = "me"
MODE_YOU = "you"
MODE_ALTERNATE = "alternate"
MODES = (MODE_ME, MODE_YOU, MODE_ALTERNATE)

# fixed: stays with the assigned adult; alternate: changes to the other one after every completion
PARENT_MODE_FIXED = "fixed"
PARENT_MODE_ALTERNATE = "alternate"

HANDOVER_ASKED = "asked"
HANDOVER_ACCEPTED = "accepted"

DEFAULT_PLANNING_REMINDER_TIME = "18:00"
DEFAULT_WEEKLY_SUMMARY_TIME = "19:00"
SUNDAY = 6

MIN_MINUTES = 1
MAX_MINUTES = 600
DEFAULT_MINUTES = 15
MAX_INTERVAL = 365
DEFAULT_INTERVAL = 7


def _e(key, de, en, group, interval, minutes, planning=False, weekday=None, preselected=False) -> dict:
    return {
        "key": key, "name_de": de, "name_en": en, "group": group, "interval": interval,
        "minutes": minutes, "planning": planning, "weekday": weekday, "preselected": preselected,
    }


# (key, name_de, name_en, group, interval days, minutes, planning, weekday, preselected)
CATALOG: tuple[dict, ...] = (
    # --- daily ---------------------------------------------------------------
    _e("breakfast", "Frühstück/Schulbrote", "Breakfast / school lunches", GROUP_DAILY, 1, 20),
    _e("dinner", "Abendessen", "Dinner", GROUP_DAILY, 1, 45, preselected=True),
    _e("kitchen", "Küche aufräumen", "Tidy the kitchen", GROUP_DAILY, 1, 20, preselected=True),
    _e("bedtime", "Bettgeh-Routine", "Bedtime routine", GROUP_DAILY, 1, 30, preselected=True),
    _e("laundry", "Wäsche", "Laundry", GROUP_DAILY, 2, 15),
    # --- weekly --------------------------------------------------------------
    _e("meal_plan", "Essensplan", "Meal plan", GROUP_WEEKLY, 7, 20, planning=True, preselected=True),
    _e("shopping_list", "Einkaufsliste", "Shopping list", GROUP_WEEKLY, 7, 20, planning=True, preselected=True),
    _e("shopping", "Einkauf", "Grocery shopping", GROUP_WEEKLY, 7, 60, preselected=True),
    _e("calendar", "Termine abgleichen", "Compare calendars", GROUP_WEEKLY, 7, 15,
       planning=True, weekday=6, preselected=True),
    _e("bathrooms", "Bäder putzen", "Clean the bathrooms", GROUP_WEEKLY, 7, 40),
    _e("vacuum", "Staubsaugen/Wischen", "Vacuum / mop", GROUP_WEEKLY, 7, 60),
    _e("bed_linen", "Bettwäsche wechseln", "Change the bed linen", GROUP_WEEKLY, 14, 30),
    _e("bins", "Mülltonnen rausstellen", "Put the bins out", GROUP_WEEKLY, 7, 10, preselected=True),
    _e("couple_checkin", "Paar-Check-in", "Couple check-in", GROUP_WEEKLY, 7, 15, planning=True, weekday=6),
    # --- monthly and longer ----------------------------------------------------
    _e("finances", "Finanzen/Rechnungen", "Finances / bills", GROUP_MONTHLY, 30, 45, planning=True),
    _e("fridge", "Kühlschrank/Vorräte", "Fridge / supplies", GROUP_MONTHLY, 30, 30),
    _e("oven", "Backofen reinigen", "Clean the oven", GROUP_MONTHLY, 30, 30),
    _e("kids_clothes", "Kinderkleidung-Größen prüfen", "Check the kids' clothing sizes",
       GROUP_MONTHLY, 91, 45, planning=True),
    _e("windows", "Fenster putzen", "Clean the windows", GROUP_MONTHLY, 91, 90),
    _e("car", "Reifen/TÜV", "Tyres / car inspection", GROUP_MONTHLY, 182, 60, planning=True),
    _e("smoke_alarms", "Rauchmelder testen", "Test the smoke alarms", GROUP_MONTHLY, 365, 15),
    _e("garden", "Garten", "Garden", GROUP_MONTHLY, 91, 120),
    # --- kids' organisation ------------------------------------------------------
    _e("checkups", "Vorsorge/Zahnarzt", "Check-ups / dentist", GROUP_KIDS, 182, 20, planning=True),
    _e("school", "Schule (Post, Hefte, Termine)", "School (mail, notebooks, dates)",
       GROUP_KIDS, 7, 20, planning=True),
    _e("birthdays", "Geburtstage/Geschenke", "Birthdays / presents", GROUP_KIDS, 30, 60, planning=True),
    _e("holiday_care", "Ferienbetreuung", "Holiday childcare", GROUP_KIDS, 91, 60, planning=True),
    _e("clubs", "Vereine/Kurse", "Clubs / classes", GROUP_KIDS, 182, 30, planning=True),
    _e("prescriptions", "Rezepte", "Prescriptions", GROUP_KIDS, 30, 15, planning=True),
)

CATALOG_BY_KEY: dict[str, dict] = {item["key"]: item for item in CATALOG}
PRESELECTED_KEYS: tuple[str, ...] = tuple(item["key"] for item in CATALOG if item["preselected"])


def catalog_items() -> list[dict]:
    """Copy of the catalog for the client (``parents_catalog`` answer)."""
    return [dict(item) for item in CATALOG]


# ---------------------------------------------------------------------------
# Start dates (staggered so that not everything is due on the same day)
# ---------------------------------------------------------------------------

def next_weekday(today: date, weekday: int) -> date:
    """First day from ``today`` on (today counts) that is the given weekday (0 = Monday)."""
    return today + timedelta(days=(int(weekday) - today.weekday()) % 7)


def stagger_start_dates(items: Iterable[dict], today: date) -> dict[str, date]:
    """First due day per catalog entry.

    * every day / every 2nd day: today
    * a fixed weekday: the next such weekday (today counts)
    * other weekly entries: spread over Monday to Saturday by their index
    * 14 days and more: offset ``(index * 7) % interval`` days from today
    """
    result: dict[str, date] = {}
    weekly_index = 0
    long_index = 0
    for item in items:
        interval = int(item.get("interval") or 0)
        weekday = item.get("weekday")
        if weekday is not None:
            result[item["key"]] = next_weekday(today, weekday)
        elif interval <= 2:
            result[item["key"]] = today
        elif interval >= 14:
            result[item["key"]] = today + timedelta(days=(long_index * 7) % interval)
            long_index += 1
        elif interval == 7:
            result[item["key"]] = next_weekday(today, weekly_index % 6)
            weekly_index += 1
        else:
            result[item["key"]] = today
    return result


# ---------------------------------------------------------------------------
# Mode: me / you / alternate
# ---------------------------------------------------------------------------

def resolve_mode(mode: str, me: str | None, partner: str | None) -> dict:
    """Assignment fields for a mode.

    Without a partner ``you`` and ``alternate`` become ``me``. Returns
    ``assignees``, ``parent_mode`` ("fixed" | "alternate") and ``parent_pair``
    (only for alternate: ``[me, partner]``, the first turn is ``me``).
    """
    if mode not in MODES:
        mode = MODE_ME
    if not partner or partner == me or not me:
        mode = MODE_ME
    if mode == MODE_YOU:
        return {"assignees": [partner], "parent_mode": PARENT_MODE_FIXED, "parent_pair": None}
    if mode == MODE_ALTERNATE:
        return {"assignees": [me], "parent_mode": PARENT_MODE_ALTERNATE, "parent_pair": [me, partner]}
    return {"assignees": [me] if me else [], "parent_mode": PARENT_MODE_FIXED, "parent_pair": None}


def mode_of(task: dict, me: str | None) -> str:
    """Mode of an existing task seen from ``me``: ``me`` | ``you`` | ``alternate``."""
    if task.get("parent_mode") == PARENT_MODE_ALTERNATE:
        return MODE_ALTERNATE
    assignees = task.get("assignees") or []
    if isinstance(assignees, str):
        assignees = [assignees]
    if me and assignees and me not in assignees:
        return MODE_YOU
    return MODE_ME


def other_of_pair(pair: Any, current: str | None) -> str | None:
    """The other adult of ``parent_pair`` (relative to the one currently responsible)."""
    if not isinstance(pair, (list, tuple)) or len(pair) != 2 or current not in pair:
        return None
    return pair[1] if pair[0] == current else pair[0]


def partner_of(adult_ids: list[str], me: str | None) -> str | None:
    """The only other adult, otherwise ``None`` (more than two adults need an explicit partner)."""
    others = [a for a in adult_ids if a != me]
    return others[0] if len(others) == 1 else None


# ---------------------------------------------------------------------------
# Rollover (midnight, silent)
# ---------------------------------------------------------------------------

def rollover(due_day: date | None, carried_since: str | None, today: date) -> tuple[str, date] | None:
    """Carry an unfinished task over to today.

    :return: ``(carried_since, new_due_day)`` or ``None`` when the task is not
        due before ``today``. ``carried_since`` keeps an earlier value, otherwise
        it is the first missed day.
    """
    if due_day is None or due_day >= today:
        return None
    return (carried_since or due_day.isoformat(), today)


# ---------------------------------------------------------------------------
# Weekly summary
# ---------------------------------------------------------------------------

def last_seven_days(today: date) -> tuple[date, date]:
    """First and last local day of the summary window (the last 7 days including today)."""
    return today - timedelta(days=6), today


def _local_day(value: Any, tz: tzinfo | None) -> date | None:
    if not value or not isinstance(value, str):
        return None
    try:
        stamp = datetime.fromisoformat(value)
    except ValueError:
        return None
    if stamp.tzinfo is not None and tz is not None:
        stamp = stamp.astimezone(tz)
    return stamp.date()


def minutes_by_user(history: Iterable[dict], first: date, last: date, tz: tzinfo | None) -> dict[str, int]:
    """Sum of ``minutes`` of the ``parent`` history entries per user in ``first..last`` (local days)."""
    result: dict[str, int] = {}
    for entry in history:
        if not isinstance(entry, dict) or entry.get("type") != "parent":
            continue
        day = _local_day(entry.get("timestamp"), tz)
        if day is None or not first <= day <= last:
            continue
        try:
            minutes = int(entry.get("minutes") or 0)
        except (TypeError, ValueError):
            continue
        uid = entry.get("user_id")
        if uid and minutes > 0:
            result[uid] = result.get(uid, 0) + minutes
    return result


def hours_of(minutes: int | float) -> float:
    """Minutes as hours with one decimal."""
    return round(float(minutes) / 60.0, 1)


def format_hours(minutes: int | float, lang: str = "de") -> str:
    """``6,5 Std.`` / ``4 Std.`` (de) or ``6.5 h`` / ``4 h`` (en)."""
    hours = hours_of(minutes)
    text = str(int(hours)) if hours == int(hours) else f"{hours:.1f}"
    if lang == "de":
        return f"{text.replace('.', ',')} Std."
    return f"{text} h"


def summary_texts(rows: list[dict], carried: list[str], lang: str = "de") -> tuple[str, str]:
    """``(title, message)`` of the weekly summary. Neutral, no rating.

    ``rows``: ``[{"name", "minutes"}]``; ``carried``: names of the tasks left over.
    """
    de = lang == "de"
    parts = " · ".join(f"{r['name']} {format_hours(r['minutes'], lang)}" for r in rows)
    if carried:
        left = ", ".join(carried)
        tail = f"Liegengeblieben: {left}." if de else f"Left over: {left}."
    else:
        tail = "Nichts liegengeblieben." if de else "Nothing left over."
    head = "Diese Woche" if de else "This week"
    title = "Wochenrückblick" if de else "Weekly summary"
    return title, (f"{head}: {parts} {tail}" if parts else f"{head}: {tail}")


# ---------------------------------------------------------------------------
# Clock helpers for the minute checks
# ---------------------------------------------------------------------------

def valid_clock(value: Any, default: str) -> str:
    """``"HH:MM"`` of a setting, the default for anything else."""
    if isinstance(value, str) and len(value) == 5 and value[2] == ":":
        try:
            if 0 <= int(value[:2]) <= 23 and 0 <= int(value[3:]) <= 59:
                return value
        except ValueError:
            pass
    return default


def clock_reached(now_clock: str, at: str) -> bool:
    """True once the local clock (``"HH:MM"``) has reached ``at`` (zero padded strings compare correctly)."""
    return now_clock >= at


# ---------------------------------------------------------------------------
# Push texts
# ---------------------------------------------------------------------------

def planning_reminder_texts(task_name: str, minutes: int, lang: str = "de") -> tuple[str, str]:
    """``(title, message)`` of the planning reminder: "Morgen dran: Essensplan (ca. 20 Min.)"."""
    if lang == "de":
        return "Morgen dran", f"Morgen dran: {task_name} (ca. {minutes} Min.)"
    return "Due tomorrow", f"Due tomorrow: {task_name} (approx. {minutes} min.)"


def handover_ask_texts(from_name: str, task_name: str, lang: str = "de") -> tuple[str, str, str, str]:
    """``(title, message, take_label, decline_label)`` of the handover request."""
    if lang == "de":
        return ("Übernehmen?", f"{from_name} fragt: Kannst du \"{task_name}\" übernehmen?",
                "Mach ich", "Geht nicht")
    return ("Take over?", f"{from_name} asks: can you take over \"{task_name}\"?", "I'll do it", "Can't right now")


def handover_decline_texts(name: str, task_name: str, lang: str = "de") -> tuple[str, str]:
    """``(title, message)`` for the asker after a decline."""
    if lang == "de":
        return "Übernahme", f"{name} kann gerade nicht: {task_name}"
    return "Handover", f"{name} can't right now: {task_name}"
