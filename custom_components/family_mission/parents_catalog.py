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
DEFAULT_PARENT_DIGEST_TIME = "07:00"
SUNDAY = 6

MIN_MINUTES = 1
MAX_MINUTES = 600
DEFAULT_MINUTES = 15
MAX_INTERVAL = 365
DEFAULT_INTERVAL = 7


def _e(
    key, de, en, group, interval, minutes, planning=False, weekday=None, preselected=False,
    steps=None, per_kid=False, requires=None, kid_de=None, kid_en=None,
) -> dict:
    """One catalog entry.

    ``steps``: ``(German list, English list)`` of checklist steps (non-blocking, 2.6).
    ``per_kid``: one task per kid profile, named with ``kid_de`` / ``kid_en`` (``{kid}`` = the name).
    ``requires``: household feature (``pets``) the entry only makes sense for.
    """
    return {
        "key": key, "name_de": de, "name_en": en, "group": group, "interval": interval,
        "minutes": minutes, "planning": planning, "weekday": weekday, "preselected": preselected,
        "steps_de": list(steps[0]) if steps else [], "steps_en": list(steps[1]) if steps else [],
        "per_kid": bool(per_kid), "requires": requires,
        "name_kid_de": kid_de or "", "name_kid_en": kid_en or "",
    }


# Checklist steps (de, en) of the catalog entries
_STEPS: dict[str, tuple[tuple[str, ...], tuple[str, ...]]] = {
    "bathrooms": (
        ("WC", "Waschbecken & Spiegel", "Dusche/Wanne", "Boden", "Handtücher tauschen"),
        ("Toilet", "Sink & mirror", "Shower / bath", "Floor", "Change the towels"),
    ),
    "meal_plan": (
        ("Termine der Woche ansehen", "Gerichte festlegen", "Einkaufsliste daraus"),
        ("Check the week's dates", "Decide the meals", "Make the shopping list from it"),
    ),
    "calendar": (
        ("Schule/Kita", "Vereine", "Arzt", "Wochenende", "Fahrdienste verteilen"),
        ("School / nursery", "Clubs", "Doctor", "Weekend", "Share the driving"),
    ),
    "finances": (
        ("Kontoauszüge prüfen", "Rechnungen zahlen", "Belege ablegen", "Taschengeld ausgezahlt?"),
        ("Check the statements", "Pay the bills", "File the receipts", "Pocket money paid out?"),
    ),
    "fridge": (
        ("Abgelaufenes raus", "Abwischen", "Fehlendes auf die Einkaufsliste"),
        ("Throw out what expired", "Wipe down", "Put what is missing on the shopping list"),
    ),
    "vacuum": (
        ("Saugen", "Wischen", "Teppiche ausschütteln"),
        ("Vacuum", "Mop", "Shake out the rugs"),
    ),
    "kids_clothes": (
        ("Zu klein aussortieren", "Saisonkleidung tauschen", "Fehlendes notieren"),
        ("Sort out what is too small", "Swap the seasonal clothes", "Note what is missing"),
    ),
    "checkups": (
        ("U-Heft/Impfpass prüfen", "Zahnarzt-Termine", "Augen/Ohren nach Bedarf"),
        ("Check the health booklet / vaccination card", "Dentist appointments", "Eyes / ears if needed"),
    ),
    "holiday_care": (
        ("Ferientermine eintragen", "Urlaub abstimmen", "Betreuung buchen"),
        ("Enter the holiday dates", "Agree on the leave", "Book the childcare"),
    ),
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
    _e("family_council", "Familienrat/Wochenrückblick", "Family meeting / weekly review", GROUP_WEEKLY, 7, 30,
       planning=True, weekday=6),
    _e("me_time", "Eigene Auszeit planen", "Plan some time for myself", GROUP_WEEKLY, 7, 60, planning=True),
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
    _e("medicine_cabinet", "Hausapotheke prüfen", "Check the medicine cabinet", GROUP_MONTHLY, 182, 20),
    _e("vet", "Tierarzt/Impfung", "Vet / vaccination", GROUP_MONTHLY, 365, 30, planning=True, requires="pets"),
    _e("season_check", "Heizung/Filter/Saisoncheck", "Heating / filters / seasonal check", GROUP_MONTHLY, 182, 45),
    # --- kids' organisation ------------------------------------------------------
    _e("checkups", "Vorsorge/Zahnarzt", "Check-ups / dentist", GROUP_KIDS, 182, 20, planning=True),
    _e("school", "Schule (Post, Hefte, Termine)", "School (mail, notebooks, dates)",
       GROUP_KIDS, 7, 20, planning=True),
    _e("birthdays", "Geburtstage/Geschenke", "Birthdays / presents", GROUP_KIDS, 30, 60, planning=True),
    _e("holiday_care", "Ferienbetreuung", "Holiday childcare", GROUP_KIDS, 91, 60, planning=True),
    _e("clubs", "Vereine/Kurse", "Clubs / classes", GROUP_KIDS, 182, 30, planning=True),
    _e("prescriptions", "Rezepte", "Prescriptions", GROUP_KIDS, 30, 15, planning=True),
    _e("exclusive_time", "Exklusivzeit mit jedem Kind", "One-on-one time with each kid", GROUP_KIDS, 7, 30,
       preselected=True, per_kid=True, kid_de="Exklusivzeit mit {kid}", kid_en="One-on-one time with {kid}"),
)

# attach the checklist steps (2.6)
CATALOG = tuple(
    {**item, "steps_de": list(_STEPS[item["key"]][0]), "steps_en": list(_STEPS[item["key"]][1])}
    if item["key"] in _STEPS else item
    for item in CATALOG
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
# Task list: due dates, groups, digest (2.6)
# ---------------------------------------------------------------------------

STATE_OVERDUE = "overdue"
STATE_TODAY = "today"
STATE_UPCOMING = "upcoming"
STATE_SOMEDAY = "someday"
STATE_HIDDEN = "hidden"


def valid_date(value: Any) -> date | None:
    """A strict ``YYYY-MM-DD`` string as a date, ``None`` for anything else."""
    if isinstance(value, str) and len(value) == 10:
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
    return None


def valid_due_time(value: Any) -> str | None:
    """``"HH:MM"`` of a due time, ``None`` for anything else (no default: no time means no time)."""
    if isinstance(value, str) and value and valid_clock(value, "") == value:
        return value
    return None


def list_state(
    due_day: date | None, interval: int, someday: bool, today: date, paused_until: date | None = None,
) -> str:
    """Where a parents' task shows up in the list.

    ``overdue`` | ``today`` | ``upcoming`` (future, one-time) | ``someday`` | ``hidden``.
    Recurring tasks in the future are not listed (they are not due yet); one-time
    tasks with a date are listed in the future as well. A paused task is hidden.
    """
    if paused_until is not None and paused_until >= today:
        return STATE_HIDDEN
    if someday or due_day is None:
        return STATE_SOMEDAY if interval == 0 else STATE_HIDDEN
    if due_day < today:
        return STATE_OVERDUE
    if due_day == today:
        return STATE_TODAY
    return STATE_UPCOMING if interval == 0 else STATE_HIDDEN


def digest_counts(states: Iterable[str]) -> tuple[int, int]:
    """``(today, overdue)`` of a list of ``list_state`` values."""
    states = list(states)
    return states.count(STATE_TODAY), states.count(STATE_OVERDUE)


def digest_texts(today_count: int, overdue_count: int, lang: str = "de") -> tuple[str, str]:
    """``(title, message)`` of the morning digest: "Heute: 3 Aufgaben, 1 überfällig"."""
    if lang == "de":
        noun = "Aufgabe" if today_count == 1 else "Aufgaben"
        text = f"Heute: {today_count} {noun}"
        if overdue_count:
            text += f", {overdue_count} überfällig"
        return "Deine Aufgaben heute", text
    noun = "task" if today_count == 1 else "tasks"
    text = f"Today: {today_count} {noun}"
    if overdue_count:
        text += f", {overdue_count} overdue"
    return "Your tasks today", text


def due_time_texts(task_name: str, due_time: str, lang: str = "de") -> tuple[str, str]:
    """``(title, message)`` of the push at the due time of a task."""
    if lang == "de":
        return "Jetzt dran", f"{task_name} (um {due_time} Uhr)"
    return "Due now", f"{task_name} (at {due_time})"


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


# ---------------------------------------------------------------------------
# 2.6: checklists, weekdays, per-kid names
# ---------------------------------------------------------------------------

MAX_STEPS = 12
MAX_STEP_LENGTH = 60


def normalize_steps(value: Any) -> list[str]:
    """Checklist step titles: trimmed, no empty ones, at most 12 steps of 60 characters; anything else -> ``[]``."""
    if not isinstance(value, (list, tuple)):
        return []
    result: list[str] = []
    for item in value:
        title = item.get("title") if isinstance(item, dict) else item
        if not isinstance(title, str):
            continue
        title = title.strip()[:MAX_STEP_LENGTH]
        if title and len(result) < MAX_STEPS:
            result.append(title)
    return result


def build_subtasks(titles: Iterable[str], previous: Any = None) -> list[dict]:
    """``[{"title", "done"}]`` for ``titles``; the progress of steps with an unchanged title is kept."""
    progress = {
        st.get("title"): bool(st.get("done")) for st in (previous or []) if isinstance(st, dict)
    }
    return [{"title": t, "done": progress.get(t, False)} for t in normalize_steps(list(titles))]


def subtask_titles(subtasks: Any) -> list[str]:
    """Titles of a task's checklist."""
    return [st.get("title") for st in (subtasks or []) if isinstance(st, dict) and st.get("title")]


def steps_progress(subtasks: Any) -> tuple[int, int]:
    """``(done, total)`` of a checklist."""
    steps = [st for st in (subtasks or []) if isinstance(st, dict)]
    return sum(1 for st in steps if st.get("done")), len(steps)


def catalog_name(entry: dict, lang: str, kid_name: str | None = None) -> str:
    """Task name of a catalog entry (``per_kid`` entries use the kid's name)."""
    de = lang == "de"
    template = (entry.get("name_kid_de") if de else entry.get("name_kid_en")) or ""
    if kid_name and entry.get("per_kid") and template:
        return template.replace("{kid}", kid_name)
    return entry["name_de"] if de else entry["name_en"]


def catalog_steps(entry: dict, lang: str) -> list[str]:
    """Checklist steps of a catalog entry in the given language."""
    return list(entry.get("steps_de" if lang == "de" else "steps_en") or [])


def normalize_weekdays(value: Any) -> list[int]:
    """Sorted unique weekdays (Mon = 0 ... Sun = 6); anything invalid -> ``[]`` (= use the interval)."""
    if isinstance(value, (str, bytes)) or not isinstance(value, (list, tuple, set, frozenset)):
        return []
    days = set()
    for item in value:
        if isinstance(item, bool) or not isinstance(item, int) or not 0 <= item <= 6:
            return []
        days.add(item)
    return sorted(days)


def valid_weekdays(value: Any) -> bool:
    """True for ``None`` / ``[]`` (no schedule) or a list of ints 0-6."""
    if value is None or value == []:
        return True
    return bool(normalize_weekdays(value))


def next_weekday_on_or_after(weekdays: Iterable[int], day: date) -> date:
    """First day ``>= day`` whose weekday is listed (``day`` itself without a valid schedule)."""
    days = normalize_weekdays(list(weekdays or []))
    for offset in range(7 if days else 0):
        if (day + timedelta(days=offset)).weekday() in days:
            return day + timedelta(days=offset)
    return day


def next_due(today: date, interval: int, weekdays: Any = None) -> date:
    """Next due day after a completion today: the next listed weekday (strictly after today) or ``interval`` days on."""
    days = normalize_weekdays(weekdays)
    if days:
        return next_weekday_on_or_after(days, today + timedelta(days=1))
    return today + timedelta(days=max(0, int(interval)))


# ---------------------------------------------------------------------------
# 2.6: bins on the evening before a collection
# ---------------------------------------------------------------------------

DEFAULT_BINS_CHECK_TIME = "19:30"
BINS_KEY = "bins"
BED_LINEN_KEY = "bed_linen"
BEDDING_KID_KEY = "bedding"


def bins_target(collection_days: Iterable[date], today: date) -> date | None:
    """The next collection day (today counts, the morning of the collection can still be used) or ``None``."""
    upcoming = sorted(d for d in collection_days if d >= today)
    return upcoming[0] if upcoming else None


def bins_texts(lang: str = "de") -> tuple[str, str]:
    """``(title, message)`` of the push when the kids have not put the bins out in time."""
    if lang == "de":
        return "Mülltonnen", "Tonnen stehen noch nicht draußen"
    return "Bins", "The bins are not out yet"


# ---------------------------------------------------------------------------
# 2.6: batteries
# ---------------------------------------------------------------------------

DEFAULT_BATTERY_THRESHOLD = 20
MIN_BATTERY_THRESHOLD = 5
MAX_BATTERY_THRESHOLD = 50
BATTERY_HYSTERESIS = 5
BATTERY_CHECK_MINUTES = 30


def battery_threshold(value: Any) -> int:
    """Threshold in percent (5-50), default 20 for anything else."""
    if isinstance(value, bool):
        return DEFAULT_BATTERY_THRESHOLD
    try:
        number = int(float(value))
    except (TypeError, ValueError, OverflowError):
        return DEFAULT_BATTERY_THRESHOLD
    return max(MIN_BATTERY_THRESHOLD, min(MAX_BATTERY_THRESHOLD, number))


def battery_level(state: Any) -> float | None:
    """The battery level (0-100) of a state string, ``None`` for unknown / unavailable / out of range."""
    try:
        level = float(state)
    except (TypeError, ValueError):
        return None
    if level != level or not 0 <= level <= 100:
        return None
    return level


def battery_changes(levels: dict[str, float], low: Iterable[str], threshold: int) -> tuple[list[str], list[str]]:
    """``(newly_low, recovered)`` entity ids.

    ``newly_low``: below the threshold and not yet reported. ``recovered``: reported before and
    now above ``threshold + 5`` (the hysteresis keeps a value that hovers around the threshold quiet).
    An entity without a level (unavailable) changes nothing.
    """
    known = set(low)
    newly = sorted(e for e, v in levels.items() if v < threshold and e not in known)
    recovered = sorted(e for e in known if e in levels and levels[e] > threshold + BATTERY_HYSTERESIS)
    return newly, recovered


def battery_task_name(friendly_name: str, lang: str = "de") -> str:
    """Name of the battery task: "🔋 Batterie Rauchmelder Flur"."""
    head = "🔋 Batterie" if lang == "de" else "🔋 Battery"
    return f"{head} {friendly_name}".strip()


def battery_push_texts(friendly_name: str, level: float, lang: str = "de") -> tuple[str, str]:
    """``(title, message)`` of the push for a low battery."""
    value = f"{level:g}"
    if lang == "de":
        return "🔋 Batterie wechseln", f"{friendly_name}: {value} %"
    return "🔋 Replace the battery", f"{friendly_name}: {value} %"


# ---------------------------------------------------------------------------
# 2.6: medication stock follow-up task
# ---------------------------------------------------------------------------

def stock_task_name(label: str, kid_name: str, lang: str = "de") -> str:
    """Name of the follow-up task: "💊 Rezept/Nachkauf Tablette Lena"."""
    head = "💊 Rezept/Nachkauf" if lang == "de" else "💊 Prescription / refill"
    return " ".join(p for p in (head, label, kid_name) if p)
