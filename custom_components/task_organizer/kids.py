"""Pure helper functions for the TaskOrganizer kids mode.

This module intentionally has NO dependency on Home Assistant so that it can be
unit-tested standalone. Everything that needs the current time, the settings
or the person states receives them as arguments.
"""

from __future__ import annotations

import copy
import hashlib
import hmac
import math
import re
import random
import secrets
from datetime import date, datetime, timedelta
from typing import Any, Callable, Iterable

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CATEGORIES = ("basis", "bonus", "auftrag")
DEFAULT_CATEGORY = "basis"
MIN_AGE_MAX = 18

DEFAULT_OVERDUE_DAYS = 5
DEFAULT_CLAIM_MINUTES = 10
PIN_LENGTH = 4
MAX_PIN_ATTEMPTS = 5
PIN_LOCK_SECONDS = 60

# Defaults of the step-2 kids settings (parent approval, penalties, birthday)
DEFAULT_CHEAT_PENALTY_FACTOR = 1.0
DEFAULT_CHEAT_STRICT_DAYS = 7
DEFAULT_BIRTHDAY_BONUS_POINTS = 10
DEFAULT_TEAM_BONUS = 1
MAX_HELPERS = 10
MAX_ADJUST_POINTS = 50
MAX_REASON_LENGTH = 80

# History entry types
TYPE_TASK = "task"
TYPE_BONUS = "bonus"
TYPE_PENALTY = "penalty"
TYPE_BIRTHDAY = "birthday"
TYPE_MISSED = "missed"
TYPE_SKIPPED = "skipped"
TYPE_REDEEM = "redeem"
TYPE_REFUND = "refund"
TYPE_PRAISE = "praise"
HISTORY_TYPES = (
    TYPE_TASK, TYPE_BONUS, TYPE_PENALTY, TYPE_BIRTHDAY, TYPE_MISSED, TYPE_SKIPPED, TYPE_REDEEM, TYPE_REFUND,
    TYPE_PRAISE,
)
# Reward shop entries only move the wallet, never the monthly points / goals
WALLET_ONLY_TYPES = (TYPE_REDEEM, TYPE_REFUND)

# Praise (social recognition, no points)
PRAISE_STICKERS = ("❤️", "⭐", "🌟", "👏", "🏆", "💪", "🦸", "🎉", "😊", "🙌")
MAX_PRAISE_MESSAGE = 120
MAX_PRAISE_PER_KID = 50

# Reward shop limits
MAX_REWARDS = 30
MAX_REWARD_COST = 1000
MAX_REWARD_NAME = 40

# Grace period (days after the due day) before a missed duty expires
WEEKLY_GRACE_DAYS = 2

DEFAULT_KID_AVATAR = "🙂"
DEFAULT_KID_COLOR = "#4CAF50"

# Error codes returned to the kids card
ERR_WRONG_PIN = "wrong_pin"
ERR_LOCKED = "locked"
ERR_NOT_ELIGIBLE = "not_eligible"
ERR_TOO_YOUNG = "too_young"
ERR_CLAIMED = "claimed"
ERR_BASIS_OPEN = "basis_open"
ERR_UNKNOWN_KID = "unknown_kid"
ERR_NOT_FOUND = "not_found"
ERR_NOT_YET = "not_yet"
ERR_TOO_LATE = "too_late"
ERR_STEPS_OPEN = "steps_open"
ERR_TOGETHER_NOT_ALLOWED = "together_not_allowed"
ERR_DUPLICATE_HELPER = "duplicate_helper"
ERR_UNKNOWN_REWARD = "unknown_reward"
ERR_REWARD_INACTIVE = "reward_inactive"
ERR_NOT_ENOUGH = "not_enough_points"

# Window states of a task (see window_state)
WINDOW_OPEN = "open"
WINDOW_NOT_YET = "not_yet"
WINDOW_TOO_LATE = "too_late"

_COLOR_RE = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
_PIN_RE = re.compile(r"^\d{4}$")

# Keys of a kid profile that may be shown to clients / written by admins
KID_PUBLIC_KEYS = ("avatar", "color", "birth_year", "birthday", "approval_sample_rate", "strict_until")
KID_SECRET_KEYS = ("pin_hash", "pin_salt")


# ---------------------------------------------------------------------------
# Participants (persons with or without a Home Assistant user)
# ---------------------------------------------------------------------------

def participant_id(entity_id: str, attributes: dict | None) -> str:
    """Return the participant ID of a person entity.

    The ID is the ``user_id`` attribute when the person is linked to a Home
    Assistant user, otherwise the entity_id (``person.xyz``).
    """
    user_id = (attributes or {}).get("user_id")
    return user_id if user_id else entity_id


def resolve_participant_name(person_states: Iterable[Any], uid: str) -> str:
    """Resolve a friendly name for a participant ID.

    :param person_states: iterable of HA states of the ``person`` domain.
    :param uid: user_id or person entity_id as stored in points/history.
    :return: the friendly name, or ``uid`` when no person matches.
    """
    fallback = None
    for state in person_states:
        attrs = state.attributes or {}
        if participant_id(state.entity_id, attrs) == uid:
            return attrs.get("friendly_name", uid)
        if state.entity_id == uid and fallback is None:
            # Legacy data: entity_id stored although the person has a user now
            fallback = attrs.get("friendly_name", uid)
    return fallback if fallback is not None else uid


# ---------------------------------------------------------------------------
# Task fields
# ---------------------------------------------------------------------------

def normalize_category(value: Any) -> str:
    """Return a valid category. Unknown / legacy values ("General") -> basis."""
    if isinstance(value, str) and value.strip().lower() in CATEGORIES:
        return value.strip().lower()
    return DEFAULT_CATEGORY


def normalize_min_age(value: Any) -> int:
    """Return the minimum age as int clamped to 0..18 (invalid -> 0)."""
    try:
        age = int(value)
    except (TypeError, ValueError):
        return 0
    return max(0, min(MIN_AGE_MAX, age))


def default_allow_together(category: Any) -> bool:
    """Doing a task together is allowed by default for bonus / auftrag, not for basis duties."""
    return normalize_category(category) != "basis"


def allow_together(task: dict) -> bool:
    """Whether a task may be done together with helpers (missing field -> default by category)."""
    value = task.get("allow_together")
    if value is None:
        return default_allow_together(task.get("category"))
    return bool(value)


def migrate_task_like(item: dict) -> None:
    """Additively add ``category`` / ``min_age`` defaults to a task/template."""
    item["category"] = normalize_category(item.get("category"))
    item["min_age"] = normalize_min_age(item.get("min_age", 0))
    item["requires_approval"] = bool(item.get("requires_approval", False))
    item["requires_routine"] = bool(item.get("requires_routine", False))
    item["allow_together"] = allow_together(item)
    item["available_from"] = normalize_time(item.get("available_from"))
    item["available_until"] = normalize_time(item.get("available_until"))
    item["reminder_at"] = normalize_time(item.get("reminder_at"))
    item["reminder_target"] = normalize_reminder_target(item.get("reminder_target"))


_NOTIFY_RE = re.compile(r"^(?:notify\.)?([a-z0-9_]{1,64})$")


def normalize_reminder_target(value: Any) -> str:
    """``notify.<service>`` for a valid notify service name, else ``""`` (only the event)."""
    match = _NOTIFY_RE.match(value.strip()) if isinstance(value, str) else None
    return f"notify.{match.group(1)}" if match else ""


# ---------------------------------------------------------------------------
# Time windows ("available_from" / "available_until", local HA time)
# ---------------------------------------------------------------------------

_TIME_RE = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")


def normalize_time(value: Any) -> str | None:
    """Return ``"HH:MM"`` for a valid time string, otherwise ``None`` (empty = no limit)."""
    if isinstance(value, str):
        value = value.strip()
        if _TIME_RE.match(value):
            return value
    return None


def _minutes_of_day(value: str) -> int:
    return int(value[:2]) * 60 + int(value[3:5])


def window_state(task: dict, now: datetime) -> str:
    """Whether ``now`` (local time) is inside the task's time window.

    Returns ``open`` | ``not_yet`` | ``too_late``.

    * only ``available_from``: open from that time until midnight.
    * only ``available_until``: open from midnight until that time (exclusive).
    * both with ``from < until``: open in ``[from, until)``.
    * both with ``from > until`` (window crosses midnight, e.g. 22:00-02:00):
      open from ``from`` until midnight and from midnight until ``until``;
      the gap in between counts as ``not_yet``.
    * ``from == until`` or no valid time at all: no restriction.
    * an ``until`` of ``00:00`` means "end of the day".
    """
    start = normalize_time((task or {}).get("available_from"))
    end = normalize_time((task or {}).get("available_until"))
    if start == "00:00":
        start = None
    if end == "00:00" and start is None:
        end = None
    if start is None and end is None:
        return WINDOW_OPEN
    t = now.hour * 60 + now.minute
    s = _minutes_of_day(start) if start else None
    e = _minutes_of_day(end) if end else None
    if s is not None and e is not None:
        if s == e:
            return WINDOW_OPEN
        if s < e:
            if t < s:
                return WINDOW_NOT_YET
            return WINDOW_OPEN if t < e else WINDOW_TOO_LATE
        return WINDOW_OPEN if (t >= s or t < e) else WINDOW_NOT_YET
    if s is not None:
        return WINDOW_OPEN if t >= s else WINDOW_NOT_YET
    return WINDOW_OPEN if t < e else WINDOW_TOO_LATE


def in_window(task: dict, now: datetime) -> bool:
    """True when the task may be done right now (inside its time window or none set)."""
    return window_state(task, now) == WINDOW_OPEN


def is_expired(task: dict, now: datetime) -> bool:
    """True for an ad-hoc task whose ``expires_at`` has passed."""
    expires = parse_dt((task or {}).get("expires_at"))
    if expires is None:
        return False
    if expires.tzinfo is None and now.tzinfo is not None:
        expires = expires.replace(tzinfo=now.tzinfo)
    elif expires.tzinfo is not None and now.tzinfo is None:
        expires = expires.replace(tzinfo=None)
    return expires <= now


# ---------------------------------------------------------------------------
# Birthday / exact age (single source of truth for all age checks)
# ---------------------------------------------------------------------------

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
BIRTH_YEAR_MIN = 1900
BIRTH_YEAR_MAX = 2100


def parse_birthday(value: Any) -> date | None:
    """Parse ``YYYY-MM-DD`` to a date. Anything else (or a silly year) -> None."""
    if isinstance(value, datetime):
        value = value.date()
    if isinstance(value, date):
        parsed = value
    elif isinstance(value, str) and _DATE_RE.match(value):
        try:
            parsed = date.fromisoformat(value)
        except ValueError:
            return None
    else:
        return None
    if not BIRTH_YEAR_MIN <= parsed.year <= BIRTH_YEAR_MAX:
        return None
    return parsed


def birthday_in_year(birthday: date, year: int) -> date:
    """The day the birthday is celebrated in ``year``.

    A leap-day birthday (Feb 29) is celebrated on Feb 28 in common years, so
    the kid never has to wait until March.
    """
    try:
        return birthday.replace(year=year)
    except ValueError:  # Feb 29 in a common year
        return date(year, 2, 28)


def age_on(birthday: date, today: date) -> int:
    """Exact age in years on ``today`` (changes on the birthday, not on Jan 1)."""
    years = today.year - birthday.year
    if today < birthday_in_year(birthday, today.year):
        years -= 1
    return years


def kid_age(profile: dict | None, today: date) -> int | None:
    """Age of a kid on ``today``.

    Uses the exact birthday when known, otherwise falls back to the birth
    year (``today.year - birth_year``). ``None`` when neither is known.
    """
    profile = profile or {}
    birthday = parse_birthday(profile.get("birthday"))
    if birthday is not None:
        return age_on(birthday, today)
    return calc_age(profile.get("birth_year"), today.year)


def is_birthday(profile: dict | None, today: date) -> bool:
    """True when ``today`` is the kid's birthday (not the day of birth itself)."""
    birthday = parse_birthday((profile or {}).get("birthday"))
    if birthday is None or today.year <= birthday.year:
        return False
    return birthday_in_year(birthday, today.year) == today


def birthday_kids(kids: dict | None, today: date) -> list[str]:
    """IDs of the kids that have their birthday on ``today``."""
    return [kid_id for kid_id, p in (kids or {}).items() if isinstance(p, dict) and is_birthday(p, today)]


def unlocked_by_age(items: Iterable[dict], old_age: int | None, new_age: int) -> list[dict]:
    """Tasks/templates whose ``min_age`` is reached by the new age (and was not before)."""
    result = []
    for item in items:
        min_age = normalize_min_age(item.get("min_age", 0))
        if min_age > 0 and (old_age is None or min_age > old_age) and min_age <= new_age:
            result.append(item)
    return result


# ---------------------------------------------------------------------------
# Step-2 settings (parent approval, penalties, birthday)
# ---------------------------------------------------------------------------

def _number_setting(settings: dict | None, key: str, default: float, low: float, high: float) -> float:
    value = (settings or {}).get(key, default)
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value != value:
        return default
    return max(low, min(high, value))


def cheat_penalty_factor(settings: dict | None) -> float:
    return float(_number_setting(settings, "cheat_penalty_factor", DEFAULT_CHEAT_PENALTY_FACTOR, 0, 2))


def cheat_strict_days(settings: dict | None) -> int:
    return int(_number_setting(settings, "cheat_strict_days", DEFAULT_CHEAT_STRICT_DAYS, 0, 30))


def birthday_bonus_points(settings: dict | None) -> int:
    return int(_number_setting(settings, "birthday_bonus_points", DEFAULT_BIRTHDAY_BONUS_POINTS, 0, 50))


def team_bonus_points(settings: dict | None) -> int:
    """Extra points per participant for doing a task together (0-3, default 1)."""
    return int(_number_setting(settings, "team_bonus", DEFAULT_TEAM_BONUS, 0, 3))


def birthday_duty_free(settings: dict | None) -> bool:
    value = (settings or {}).get("birthday_duty_free", True)
    return value is not False


def normalize_sample_rate(value: Any) -> int:
    """Spot-check rate in percent, clamped to 0..100 (invalid -> 0)."""
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value != value:
        return 0
    return int(max(0, min(100, round(value))))


def strict_active(profile: dict | None, today: date) -> bool:
    """True while the kid is in strict mode (``today`` is before ``strict_until``)."""
    until = parse_birthday((profile or {}).get("strict_until"))
    return until is not None and today < until


def needs_approval(
    task: dict,
    profile: dict | None,
    today: date,
    rng: Callable[[], float] | None = None,
) -> bool:
    """Whether a completion needs a parent's approval (flag, strict mode or spot check)."""
    if task.get("requires_approval"):
        return True
    if strict_active(profile, today):
        return True
    rate = normalize_sample_rate((profile or {}).get("approval_sample_rate"))
    if rate <= 0:
        return False
    # looked up at call time so the generator can be patched in tests
    return (rng or random.random)() * 100 < rate


def clamp_adjustment(current: float, points: float) -> float:
    """The amount that can actually be applied: a penalty never drives points below 0."""
    if points < 0:
        return -min(abs(points), max(0.0, float(current)))
    return points


def cheat_penalty(task_points: float, settings: dict | None) -> int:
    """Penalty for cheating: ``round(points * factor)`` (half up, never negative)."""
    return int(math.floor(float(task_points) * cheat_penalty_factor(settings) + 0.5))


def period_task_points(history: Iterable[dict], period_start: datetime | None, user_ids: Iterable[str]) -> float:
    """Approved task points of ``user_ids`` since ``period_start``.

    Only history entries of type ``task`` (the default for legacy entries)
    count: birthday bonus, manual bonus and penalties do not.
    """
    wanted = set(user_ids)
    total = 0.0
    for entry in history:
        if not isinstance(entry, dict) or entry.get("type", TYPE_TASK) != TYPE_TASK:
            continue
        if entry.get("user_id") not in wanted:
            continue
        if period_start is not None:
            ts = parse_dt(entry.get("timestamp"))
            if ts is None:
                continue
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=period_start.tzinfo)
            if period_start.tzinfo is None and ts.tzinfo is not None:
                ts = ts.replace(tzinfo=None)
            if ts < period_start:
                continue
        try:
            total += float(entry.get("points", 0))
        except (TypeError, ValueError):
            continue
    return round(total, 1)


# ---------------------------------------------------------------------------
# Due computation (single source of truth for the kids backend)
# ---------------------------------------------------------------------------

def parse_dt(value: Any) -> datetime | None:
    """Parse an ISO date/datetime string (also date-only) to a datetime."""
    if not value or not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _local_date(dt: datetime, now: datetime) -> date:
    """Date of ``dt`` in the timezone of ``now``. Naive values are local."""
    if dt.tzinfo is not None and now.tzinfo is not None:
        dt = dt.astimezone(now.tzinfo)
    return dt.date()


def task_status(task: dict, now: datetime, default_overdue_days: int = DEFAULT_OVERDUE_DAYS) -> str:
    """Return ``paused`` | ``done`` | ``due`` | ``overdue`` for a task.

    Mirrors the sensors / main card: paused while today <= paused_until,
    due when due_date <= today, overdue when due_date <= today - threshold.
    ``done`` means "due in the future".
    """
    today = now.date()
    paused_dt = parse_dt(task.get("paused_until"))
    if paused_dt is not None and today <= _local_date(paused_dt, now):
        return "paused"

    due_dt = parse_dt(task.get("due_date"))
    if due_dt is None:
        return "done"
    due = _local_date(due_dt, now)
    if due > today:
        return "done"

    threshold = task.get("override_overdue_days")
    if threshold is None:
        threshold = default_overdue_days
    if due <= today - timedelta(days=threshold):
        return "overdue"
    return "due"


def is_open(task: dict, now: datetime, default_overdue_days: int = DEFAULT_OVERDUE_DAYS) -> bool:
    """True when the task is due or overdue (and not paused)."""
    return task_status(task, now, default_overdue_days) in ("due", "overdue")


# ---------------------------------------------------------------------------
# PIN handling
# ---------------------------------------------------------------------------

def is_valid_pin(pin: Any) -> bool:
    """A PIN is exactly four digits."""
    return isinstance(pin, str) and bool(_PIN_RE.match(pin))


def hash_pin(pin: str, salt: str | None = None) -> tuple[str, str]:
    """Return ``(pin_hash, pin_salt)`` using salted SHA-256."""
    salt = salt or secrets.token_hex(16)
    digest = hashlib.sha256((salt + pin).encode("utf-8")).hexdigest()
    return digest, salt


def check_pin(pin: Any, pin_hash: str, pin_salt: str) -> bool:
    """Constant-time comparison of a PIN against the stored hash."""
    if not isinstance(pin, str):
        return False
    candidate, _ = hash_pin(pin, pin_salt)
    return hmac.compare_digest(candidate, pin_hash)


class PinLimiter:
    """In-memory brute-force protection: N failures -> locked for M seconds."""

    def __init__(
        self,
        clock: Callable[[], float],
        max_attempts: int = MAX_PIN_ATTEMPTS,
        lock_seconds: int = PIN_LOCK_SECONDS,
    ) -> None:
        self._clock = clock
        self.max_attempts = max_attempts
        self.lock_seconds = lock_seconds
        self._state: dict[str, dict[str, float]] = {}

    def locked_for(self, kid_id: str) -> int:
        """Remaining lock time in whole seconds (0 = not locked)."""
        entry = self._state.get(kid_id)
        if not entry:
            return 0
        remaining = entry.get("locked_until", 0) - self._clock()
        if remaining > 0:
            return math.ceil(remaining)
        if entry.get("locked_until"):
            # Lock expired: start over with a clean slate
            self._state.pop(kid_id, None)
        return 0

    def register_failure(self, kid_id: str) -> int:
        """Count a wrong attempt. Returns remaining lock seconds (0 = none)."""
        entry = self._state.setdefault(kid_id, {"fails": 0, "locked_until": 0})
        entry["fails"] += 1
        if entry["fails"] >= self.max_attempts:
            entry["locked_until"] = self._clock() + self.lock_seconds
            entry["fails"] = 0
            return self.lock_seconds
        return 0

    def attempts_left(self, kid_id: str) -> int:
        entry = self._state.get(kid_id)
        fails = int(entry["fails"]) if entry else 0
        return max(0, self.max_attempts - fails)

    def reset(self, kid_id: str) -> None:
        self._state.pop(kid_id, None)


def verify_kid_pin(
    kids: dict, limiter: PinLimiter, kid_id: str, pin: Any
) -> dict:
    """Verify a kid's PIN, applying the lockout.

    :return: ``{"success": True}`` or ``{"success": False, "error": code, ...}``
    """
    profile = (kids or {}).get(kid_id)
    if not isinstance(profile, dict):
        return {"success": False, "error": ERR_UNKNOWN_KID}

    # A kid without PIN is accepted with any (or no) pin.
    if not profile.get("pin_hash") or not profile.get("pin_salt"):
        return {"success": True}

    remaining = limiter.locked_for(kid_id)
    if remaining > 0:
        return {"success": False, "error": ERR_LOCKED, "locked_seconds": remaining}

    if check_pin(pin, profile["pin_hash"], profile["pin_salt"]):
        limiter.reset(kid_id)
        return {"success": True}

    lock = limiter.register_failure(kid_id)
    if lock > 0:
        return {"success": False, "error": ERR_LOCKED, "locked_seconds": lock}
    return {
        "success": False,
        "error": ERR_WRONG_PIN,
        "attempts_left": limiter.attempts_left(kid_id),
    }


# ---------------------------------------------------------------------------
# Kid profiles / settings sanitising
# ---------------------------------------------------------------------------

def is_valid_color(value: Any) -> bool:
    """Only plain hex colors are accepted (prevents CSS injection)."""
    return isinstance(value, str) and bool(_COLOR_RE.match(value))


def public_kids(kids: dict | None) -> dict:
    """Return kid profiles without secrets, plus ``has_pin``."""
    result = {}
    for kid_id, profile in (kids or {}).items():
        if not isinstance(profile, dict):
            continue
        entry = {
            "avatar": profile.get("avatar") or DEFAULT_KID_AVATAR,
            "color": profile.get("color") or DEFAULT_KID_COLOR,
            "birth_year": profile.get("birth_year"),
            "birthday": profile.get("birthday"),
            "approval_sample_rate": normalize_sample_rate(profile.get("approval_sample_rate")),
            "strict_until": profile.get("strict_until"),
            "goal_reward": profile.get("goal_reward"),
            "has_pin": bool(profile.get("pin_hash") and profile.get("pin_salt")),
        }
        result[kid_id] = entry
    return result


def sanitize_settings(settings: dict | None) -> dict:
    """Copy of the settings that never contains ``pin_hash`` / ``pin_salt``."""
    result = dict(settings or {})
    if "kids" in result:
        result["kids"] = public_kids(result.get("kids"))
    return result


def merge_imported_kids(existing: dict | None, incoming: Any) -> dict:
    """Merge kid profiles from an import without touching/accepting secrets.

    Existing PIN hashes are preserved, only whitelisted public keys of the
    incoming profiles are taken over.
    """
    merged = copy.deepcopy(existing or {})
    if not isinstance(incoming, dict):
        return merged
    for kid_id, profile in incoming.items():
        if not isinstance(profile, dict) or not isinstance(kid_id, str):
            continue
        target = merged.setdefault(kid_id, {})
        avatar = profile.get("avatar")
        if isinstance(avatar, str) and 0 < len(avatar) <= 16:
            target["avatar"] = avatar
        if is_valid_color(profile.get("color")):
            target["color"] = profile["color"]
        by = profile.get("birth_year")
        if isinstance(by, int) and not isinstance(by, bool) and 1900 <= by <= 2100:
            target["birth_year"] = by
        birthday = parse_birthday(profile.get("birthday"))
        if birthday is not None:
            target["birthday"] = birthday.isoformat()
            target["birth_year"] = birthday.year
        elif "birthday" in profile and profile.get("birthday") is None:
            target.pop("birthday", None)
        if "approval_sample_rate" in profile:
            target["approval_sample_rate"] = normalize_sample_rate(profile.get("approval_sample_rate"))
        strict = parse_birthday(profile.get("strict_until"))
        if strict is not None:
            target["strict_until"] = strict.isoformat()
        target.setdefault("avatar", DEFAULT_KID_AVATAR)
        target.setdefault("color", DEFAULT_KID_COLOR)
        target.setdefault("birth_year", None)
    return merged


_UNSET: Any = object()


def build_kid_profile(
    existing: dict | None,
    avatar: str,
    color: str,
    birth_year: int | None,
    pin: str | None = None,
    clear_pin: bool = False,
    birthday: Any = _UNSET,
    approval_sample_rate: Any = _UNSET,
) -> dict:
    """Return the new stored profile. An empty ``pin`` keeps the old one.

    ``birthday`` (``YYYY-MM-DD`` or ``None``) is optional; when valid it
    determines ``birth_year``. Without a ``birthday`` argument an existing
    birthday is kept as long as it matches ``birth_year``. Other keys of the
    old profile (``strict_until`` ...) are kept.
    """
    profile = dict(existing or {})
    profile["avatar"] = avatar
    profile["color"] = color

    if birthday is not _UNSET:
        parsed = parse_birthday(birthday)
        if parsed is not None:
            profile["birthday"] = parsed.isoformat()
            birth_year = parsed.year
        else:
            profile.pop("birthday", None)
    else:
        old = parse_birthday(profile.get("birthday"))
        if old is not None and old.year != birth_year:
            profile.pop("birthday", None)
    profile["birth_year"] = birth_year

    if approval_sample_rate is not _UNSET:
        profile["approval_sample_rate"] = normalize_sample_rate(approval_sample_rate)
    if clear_pin:
        profile.pop("pin_hash", None)
        profile.pop("pin_salt", None)
    if pin:
        profile["pin_hash"], profile["pin_salt"] = hash_pin(pin)
    return profile


# ---------------------------------------------------------------------------
# Eligibility
# ---------------------------------------------------------------------------

def calc_age(birth_year: Any, current_year: int) -> int | None:
    """Age in years by birth year (None when unknown)."""
    if isinstance(birth_year, bool) or not isinstance(birth_year, int):
        return None
    return current_year - birth_year


def claim_active(task: dict, now: datetime) -> bool:
    """True if the task is claimed and the claim has not expired yet."""
    if not task.get("claimed_by"):
        return False
    until = parse_dt(task.get("claimed_until"))
    if until is None:
        return False
    if until.tzinfo is None and now.tzinfo is not None:
        until = until.replace(tzinfo=now.tzinfo)
    return until > now


def _assignee_list(task: dict) -> list:
    assignees = task.get("assignees") or []
    if isinstance(assignees, str):
        assignees = [assignees]
    return list(assignees)


def open_basis_tasks_for(
    tasks: dict,
    kid_id: str,
    now: datetime,
    default_overdue_days: int,
    age: int | None = None,
) -> list[dict]:
    """Due/overdue ``basis`` tasks assigned to the kid that the kid can do.

    Tasks the kid is too young for are ignored: they can never be completed by
    this kid and must not block the bonus tasks forever. Tasks outside their
    time window (not yet available / window over) are not "open" either.
    """
    return [
        t
        for t in tasks.values()
        if normalize_category(t.get("category")) == "basis"
        and kid_id in _assignee_list(t)
        and is_open(t, now, default_overdue_days)
        and in_window(t, now)
        and not _too_young(t, age)
        and not is_replaced(t, tasks, now, default_overdue_days)
    ]


def _replaces(replaced: dict, replacing: dict) -> bool:
    """True when ``replacing`` is the task that ``replaced`` yields to (same kid, wizard key prefix)."""
    key = replaced.get("replaced_by_key")
    if not key or not isinstance(key, str) or replacing is replaced:
        return False
    if not str(replacing.get("wizard_key") or "").startswith(f"{key}:"):
        return False
    return bool(set(_assignee_list(replaced)) & set(_assignee_list(replacing)))


def is_replaced(
    task: dict,
    tasks: dict,
    now: datetime,
    default_overdue_days: int = DEFAULT_OVERDUE_DAYS,
) -> bool:
    """True when a duty is replaced today by a bigger duty of the same kid.

    A task with ``replaced_by_key`` (wizard key prefix, e.g. ``room_deep``) is
    skipped as long as the kid's task with that prefix is due / open: the
    thorough room clean replaces the daily room blitz. The replaced task is not
    shown as a duty, does not count as open and cannot be completed. Tasks
    without ``replaced_by_key`` are never replaced.
    """
    if not task.get("replaced_by_key"):
        return False
    return any(
        _replaces(task, other) and is_open(other, now, default_overdue_days)
        for other in tasks.values()
    )


def skipped_by_completion(
    completed: dict,
    tasks: dict,
    now: datetime,
    default_overdue_days: int = DEFAULT_OVERDUE_DAYS,
) -> list[str]:
    """IDs of open tasks that are skipped for today because ``completed`` is done.

    Call BEFORE the completed task advances. Only a completion of an open task
    replaces anything (e.g. room_deep done -> today's room blitz is skipped).
    """
    if not is_open(completed, now, default_overdue_days):
        return []
    return [
        task_id
        for task_id, task in tasks.items()
        if _replaces(task, completed) and is_open(task, now, default_overdue_days)
    ]


def _too_young(task: dict, age: int | None) -> bool:
    """True when the kid's age is known and below the task's minimum age."""
    min_age = normalize_min_age(task.get("min_age", 0))
    return min_age > 0 and age is not None and age < min_age


def bonus_needs_routine(task: dict) -> bool:
    """True when a bonus task is only available after the kid's due duties.

    Opt-in per task (``requires_routine``, default off); spontaneous (ad-hoc)
    bonus tasks are never locked. Only duties that are due *and* inside their
    time window count (see ``open_basis_tasks_for``).
    """
    return (
        normalize_category(task.get("category")) == "bonus"
        and bool(task.get("requires_routine", False))
        and not task.get("adhoc")
    )


def open_required_steps(task: dict) -> list[dict]:
    """Subtasks that still have to be ticked before a kid may finish the task.

    Subtasks marked ``optional`` (e.g. a medication reminder) never block.
    """
    return [
        st for st in (task.get("subtasks") or [])
        if isinstance(st, dict) and not st.get("done") and not st.get("optional")
    ]


def check_eligibility(
    task: dict,
    kid_id: str,
    kid_profile: dict,
    tasks: dict,
    settings: dict,
    now: datetime,
) -> str | None:
    """Return ``None`` when the kid may work on the task, else an error code."""
    overdue_days = settings.get("overdue_days", DEFAULT_OVERDUE_DAYS)

    if not is_open(task, now, overdue_days) or is_expired(task, now):
        return ERR_NOT_ELIGIBLE
    if is_replaced(task, tasks, now, overdue_days):
        return ERR_NOT_ELIGIBLE

    assignees = _assignee_list(task)
    if assignees and kid_id not in assignees:
        return ERR_NOT_ELIGIBLE

    # Unknown birth year: the parents did not restrict this kid -> allowed
    age = kid_age(kid_profile, now.date())
    if _too_young(task, age):
        return ERR_TOO_YOUNG

    window = window_state(task, now)
    if window == WINDOW_NOT_YET:
        return ERR_NOT_YET
    if window == WINDOW_TOO_LATE:
        return ERR_TOO_LATE

    if claim_active(task, now) and task.get("claimed_by") != kid_id:
        return ERR_CLAIMED

    if bonus_needs_routine(task) and open_basis_tasks_for(tasks, kid_id, now, overdue_days, age):
        return ERR_BASIS_OPEN

    return None


# ---------------------------------------------------------------------------
# Prorated monthly goals (quick-start wizard in the middle of a month)
# ---------------------------------------------------------------------------

def restore_full_goals(options: dict | None, current_month: str) -> dict | None:
    """Replace prorated goals by the full goals once their month is over.

    The wizard prorates the monthly goals of the start month and remembers the
    unprorated ones in ``point_goals_full`` and the month in
    ``point_goals_prorated_month`` (``YYYY-MM``). As soon as ``current_month``
    is later than that month, ``point_goals`` gets the full goals and the
    marker is cleared.

    :return: the new options dict, or ``None`` when nothing has to change.
    """
    options = options or {}
    marker = options.get("point_goals_prorated_month")
    if not marker:
        return None
    if not (isinstance(marker, str) and isinstance(current_month, str) and marker < current_month):
        return None
    new_options = dict(options)
    full = options.get("point_goals_full")
    if isinstance(full, dict) and full:
        goals = dict(options.get("point_goals") or {})
        for kid_id, value in full.items():
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                continue
            if value > 0:
                goals[kid_id] = value
            else:
                goals.pop(kid_id, None)
        new_options["point_goals"] = goals
    new_options.pop("point_goals_prorated_month", None)
    return new_options


# ---------------------------------------------------------------------------
# Expiry of missed duties
# ---------------------------------------------------------------------------

def missed_grace_days(base_interval: Any) -> int | None:
    """Days a duty may stay open after its due day before it expires.

    Daily duties (interval 1) expire at the next midnight (0), weekly and
    longer ones (>= 7) get ``WEEKLY_GRACE_DAYS``; anything else never expires.
    """
    if isinstance(base_interval, bool) or not isinstance(base_interval, int):
        return None
    if base_interval == 1:
        return 0
    if base_interval >= 7:
        return WEEKLY_GRACE_DAYS
    return None


def is_missed(task: dict, now: datetime, base_interval: Any, default_overdue_days: int = DEFAULT_OVERDUE_DAYS) -> bool:
    """True when the duty is still open from a previous day beyond its grace period."""
    grace = missed_grace_days(base_interval)
    if grace is None or not is_open(task, now, default_overdue_days):
        return False
    due_dt = parse_dt(task.get("due_date"))
    if due_dt is None:
        return False
    return (now.date() - _local_date(due_dt, now)).days > grace


def next_due_day(due: date, interval: int, today: date) -> date:
    """Next occurrence of a missed duty: ``due + n * interval``, never before ``today``.

    A daily duty that was due yesterday is due again today; a rotation turn
    moves on by one full rotation.
    """
    if interval <= 0:
        return today
    nxt = due + timedelta(days=interval)
    if nxt < today:
        nxt += timedelta(days=interval * math.ceil((today - nxt).days / interval))
    return nxt


# ---------------------------------------------------------------------------
# Reward shop (wallet, rewards)
# ---------------------------------------------------------------------------

def wallet_add(wallet: dict, uid: str, delta: float) -> float:
    """Add ``delta`` to the wallet of ``uid`` (never below 0) and return the new balance."""
    try:
        current = float(wallet.get(uid, 0) or 0)
    except (TypeError, ValueError):
        current = 0.0
    wallet[uid] = round(max(0.0, current + float(delta)), 1)
    return wallet[uid]


def _int_in(value: Any, low: int, high: int) -> int | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value != value or value != int(value):
        return None
    value = int(value)
    return value if low <= value <= high else None


def normalize_rewards(raw: Any) -> list[dict] | None:
    """Validate the reward list; ``None`` when anything is invalid.

    Every reward is ``{id, name, emoji, cost 1-1000, min_age 0-18, active}``;
    a missing id is generated.
    """
    if not isinstance(raw, list) or len(raw) > MAX_REWARDS:
        return None
    result: list[dict] = []
    seen: set[str] = set()
    for item in raw:
        if not isinstance(item, dict):
            return None
        name = item.get("name")
        if not isinstance(name, str) or not 0 < len(name.strip()) <= MAX_REWARD_NAME:
            return None
        emoji = item.get("emoji")
        if emoji is None or emoji == "":
            emoji = "🎁"
        if not isinstance(emoji, str) or len(emoji.strip()) > 16:
            return None
        cost = _int_in(item.get("cost"), 1, MAX_REWARD_COST)
        min_age = _int_in(item.get("min_age", 0), 0, MIN_AGE_MAX)
        if cost is None or min_age is None:
            return None
        rid = item.get("id") or secrets.token_hex(4)
        if not isinstance(rid, str) or len(rid) > 40 or rid in seen:
            return None
        seen.add(rid)
        result.append({
            "id": rid, "name": name.strip(), "emoji": emoji.strip() or "🎁", "cost": cost,
            "min_age": min_age, "active": item.get("active", True) is not False,
        })
    return result


def find_reward(rewards: Any, reward_id: Any) -> dict | None:
    for reward in rewards or []:
        if isinstance(reward, dict) and reward.get("id") == reward_id:
            return reward
    return None
