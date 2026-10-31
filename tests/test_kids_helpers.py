"""Standalone tests for the pure kids helpers (no Home Assistant needed)."""

import importlib.util
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest

_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "task_organizer" / "kids.py"
_spec = importlib.util.spec_from_file_location("task_organizer_kids", _PATH)
kids = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kids)

TZ = timezone(timedelta(hours=2))
NOW = datetime(2026, 10, 29, 15, 0, tzinfo=TZ)


def _task(**kw):
    base = {
        "name": "T",
        "due_date": NOW.astimezone(timezone.utc).isoformat(),
        "paused_until": None,
        "assignees": [],
        "category": "basis",
        "min_age": 0,
        "complexity": 3,
    }
    base.update(kw)
    return base


def _kid(birth_year=2016, pin=None):
    profile = {"avatar": "🦊", "color": "#ff0000", "birth_year": birth_year}
    if pin:
        profile["pin_hash"], profile["pin_salt"] = kids.hash_pin(pin)
    return profile


# -- participants -----------------------------------------------------------

def test_participant_id_prefers_user_id():
    assert kids.participant_id("person.anna", {"user_id": "abc"}) == "abc"
    assert kids.participant_id("person.anna", {"user_id": None}) == "person.anna"
    assert kids.participant_id("person.anna", {}) == "person.anna"


def test_resolve_name_with_and_without_user():
    states = [
        SimpleNamespace(entity_id="person.anna", attributes={"friendly_name": "Anna"}),
        SimpleNamespace(entity_id="person.ben", attributes={"friendly_name": "Ben", "user_id": "u-ben"}),
    ]
    assert kids.resolve_participant_name(states, "person.anna") == "Anna"
    assert kids.resolve_participant_name(states, "u-ben") == "Ben"
    # legacy: entity_id stored although the person has a user
    assert kids.resolve_participant_name(states, "person.ben") == "Ben"
    assert kids.resolve_participant_name(states, "nobody") == "nobody"


# -- task fields ------------------------------------------------------------

@pytest.mark.parametrize(
    "value,expected",
    [("basis", "basis"), ("BONUS", "bonus"), ("auftrag", "auftrag"),
     ("General", "basis"), ("Allgemein", "basis"), (None, "basis"), (5, "basis")],
)
def test_normalize_category(value, expected):
    assert kids.normalize_category(value) == expected


@pytest.mark.parametrize("value,expected", [(0, 0), (8, 8), (99, 18), (-3, 0), ("x", 0), (None, 0), (7.0, 7)])
def test_normalize_min_age(value, expected):
    assert kids.normalize_min_age(value) == expected


# -- due computation --------------------------------------------------------

def test_task_status_due_overdue_done_paused():
    assert kids.task_status(_task(), NOW) == "due"
    yesterday = (NOW - timedelta(days=1)).isoformat()
    assert kids.task_status(_task(due_date=yesterday), NOW) == "due"
    old = (NOW - timedelta(days=5)).isoformat()
    assert kids.task_status(_task(due_date=old), NOW, 5) == "overdue"
    assert kids.task_status(_task(due_date=old, override_overdue_days=10), NOW, 5) == "due"
    future = (NOW + timedelta(days=1)).isoformat()
    assert kids.task_status(_task(due_date=future), NOW) == "done"
    assert kids.task_status(_task(paused_until="2026-10-29"), NOW) == "paused"
    assert kids.task_status(_task(paused_until="2026-10-28"), NOW) == "due"
    assert kids.task_status(_task(paused_until=NOW.isoformat()), NOW) == "paused"


def test_due_uses_local_date():
    # 23:30 UTC on the 28th is already the 29th at UTC+2 -> due today
    task = _task(due_date="2026-10-28T23:30:00+00:00")
    assert kids.task_status(task, NOW) == "due"
    # 22:30 UTC on the 29th is the 30th at UTC+2 -> not due yet
    task = _task(due_date="2026-10-29T22:30:00+00:00")
    assert kids.task_status(task, NOW) == "done"


def test_naive_and_missing_due_dates():
    assert kids.task_status(_task(due_date="2026-10-29T00:00:00"), NOW) == "due"
    assert kids.task_status(_task(due_date=None), NOW) == "done"
    assert kids.task_status(_task(due_date="garbage"), NOW) == "done"


# -- PIN --------------------------------------------------------------------

def test_hash_and_check_pin():
    digest, salt = kids.hash_pin("1234")
    assert len(digest) == 64 and len(salt) == 32
    assert kids.check_pin("1234", digest, salt)
    assert not kids.check_pin("1235", digest, salt)
    assert not kids.check_pin(None, digest, salt)
    # salted: same PIN, different hash
    assert kids.hash_pin("1234")[0] != digest


def test_valid_pin_format():
    assert kids.is_valid_pin("0000")
    for bad in ("123", "12345", "abcd", "12 4", "", None, 1234):
        assert not kids.is_valid_pin(bad)


class Clock:
    def __init__(self):
        self.t = 1000.0

    def __call__(self):
        return self.t


def test_pin_lockout_after_five_failures_and_expiry():
    clock = Clock()
    limiter = kids.PinLimiter(clock)
    store = {"kid": _kid(pin="4711")}
    for i in range(4):
        res = kids.verify_kid_pin(store, limiter, "kid", "0000")
        assert res["error"] == "wrong_pin"
        assert res["attempts_left"] == 4 - i
    res = kids.verify_kid_pin(store, limiter, "kid", "0000")
    assert res["error"] == "locked" and res["locked_seconds"] == 60
    # correct PIN during the lock is still refused
    clock.t += 30
    res = kids.verify_kid_pin(store, limiter, "kid", "4711")
    assert res["error"] == "locked" and res["locked_seconds"] == 30
    # lock expires
    clock.t += 31
    assert kids.verify_kid_pin(store, limiter, "kid", "4711") == {"success": True}
    # counter was reset by success
    assert kids.verify_kid_pin(store, limiter, "kid", "0000")["attempts_left"] == 4


def test_lockout_is_per_kid():
    limiter = kids.PinLimiter(Clock())
    store = {"a": _kid(pin="1111"), "b": _kid(pin="2222")}
    for _ in range(5):
        kids.verify_kid_pin(store, limiter, "a", "9999")
    assert kids.verify_kid_pin(store, limiter, "a", "1111")["error"] == "locked"
    assert kids.verify_kid_pin(store, limiter, "b", "2222")["success"]


def test_kid_without_pin_and_unknown_kid():
    limiter = kids.PinLimiter(Clock())
    store = {"kid": _kid()}
    assert kids.verify_kid_pin(store, limiter, "kid", None)["success"]
    assert kids.verify_kid_pin(store, limiter, "kid", "whatever")["success"]
    assert kids.verify_kid_pin(store, limiter, "ghost", "1234")["error"] == "unknown_kid"


# -- profiles / sanitising --------------------------------------------------

def test_sanitize_settings_strips_secrets():
    settings = {"overdue_days": 3, "kids": {"k": _kid(pin="1234"), "n": _kid()}}
    clean = kids.sanitize_settings(settings)
    assert clean["kids"]["k"]["has_pin"] is True
    assert clean["kids"]["n"]["has_pin"] is False
    assert "pin_hash" not in str(clean) and "pin_salt" not in str(clean)
    # original untouched
    assert "pin_hash" in settings["kids"]["k"]
    assert kids.sanitize_settings({"a": 1}) == {"a": 1}
    assert kids.sanitize_settings(None) == {}


def test_build_profile_keeps_pin_when_empty():
    first = kids.build_kid_profile(None, "🦊", "#ff0000", 2015, pin="1234")
    again = kids.build_kid_profile(first, "🐼", "#00ff00", 2014, pin=None)
    assert again["pin_hash"] == first["pin_hash"] and again["avatar"] == "🐼"
    cleared = kids.build_kid_profile(first, "🐼", "#00ff00", 2014, clear_pin=True)
    assert "pin_hash" not in cleared
    changed = kids.build_kid_profile(first, "🐼", "#00ff00", 2014, pin="9999")
    assert changed["pin_hash"] != first["pin_hash"]


def test_merge_imported_kids_keeps_hashes_and_ignores_secrets():
    existing = {"k": _kid(pin="1234")}
    incoming = {
        "k": {"avatar": "🐼", "color": "#00ff00", "birth_year": 2013, "pin_hash": "evil", "pin_salt": "evil", "has_pin": True},
        "new": {"avatar": "x", "color": "red;background:url(x)", "birth_year": "2010"},
    }
    merged = kids.merge_imported_kids(existing, incoming)
    assert merged["k"]["pin_hash"] == existing["k"]["pin_hash"]
    assert merged["k"]["avatar"] == "🐼" and merged["k"]["birth_year"] == 2013
    assert merged["new"]["color"] == kids.DEFAULT_KID_COLOR  # invalid color rejected
    assert merged["new"]["birth_year"] is None
    assert "pin_hash" not in merged["new"]


def test_color_validation():
    assert kids.is_valid_color("#fff") and kids.is_valid_color("#A1b2C3")
    for bad in ("red", "#12", "#12345g", "#fff;x", "", None):
        assert not kids.is_valid_color(bad)


# -- age / eligibility ------------------------------------------------------

def test_calc_age():
    assert kids.calc_age(2016, 2026) == 10
    assert kids.calc_age(None, 2026) is None
    assert kids.calc_age(True, 2026) is None


def _elig(task, kid="k", profile=None, tasks=None, settings=None):
    profile = profile if profile is not None else _kid()
    tasks = tasks if tasks is not None else {"x": task}
    return kids.check_eligibility(task, kid, profile, tasks, settings or {}, NOW)


def test_eligibility_basics():
    assert _elig(_task()) is None
    future = (NOW + timedelta(days=2)).isoformat()
    assert _elig(_task(due_date=future)) == "not_eligible"
    assert _elig(_task(paused_until="2026-11-01")) == "not_eligible"
    assert _elig(_task(assignees=["other"])) == "not_eligible"
    assert _elig(_task(assignees=["other", "k"])) is None
    assert _elig(_task(assignees="k")) is None


def test_eligibility_age():
    task = _task(min_age=10)
    assert _elig(task, profile=_kid(2016)) is None  # 2026-2016 = 10
    assert _elig(task, profile=_kid(2017)) == "too_young"
    # unknown birth year: no restriction
    assert _elig(task, profile=_kid(None)) is None


def test_eligibility_claims():
    future = (NOW + timedelta(minutes=5)).isoformat()
    past = (NOW - timedelta(minutes=5)).isoformat()
    assert _elig(_task(claimed_by="o", claimed_until=future)) == "claimed"
    assert _elig(_task(claimed_by="k", claimed_until=future)) is None
    assert _elig(_task(claimed_by="o", claimed_until=past)) is None
    assert _elig(_task(claimed_by="o")) is None  # no expiry info -> not active


def test_eligibility_premack():
    basis = _task(category="basis", assignees=["k"])
    bonus = _task(category="bonus", requires_routine=True)
    tasks = {"a": basis, "b": bonus}
    assert _elig(bonus, tasks=tasks) == "basis_open"
    # default: a bonus is always free
    free = _task(category="bonus")
    assert _elig(free, tasks={"a": basis, "b": free}) is None
    # spontaneous (ad-hoc) bonus tasks are never locked, even when flagged
    adhoc = _task(category="bonus", requires_routine=True, adhoc=True)
    assert _elig(adhoc, tasks={"a": basis, "b": adhoc}) is None
    # basis of another kid does not block
    other = _task(category="basis", assignees=["o"])
    assert _elig(bonus, tasks={"a": other, "b": bonus}) is None
    # done / not yet due basis does not block
    done = _task(category="basis", assignees=["k"], due_date=(NOW + timedelta(days=1)).isoformat())
    assert _elig(bonus, tasks={"a": done, "b": bonus}) is None
    # legacy "General" counts as basis
    legacy = _task(category="General", assignees=["k"])
    assert _elig(bonus, tasks={"a": legacy, "b": bonus}) == "basis_open"
    # basis itself is never blocked by the Premack rule
    assert _elig(basis, tasks=tasks) is None


def test_premack_ignores_basis_tasks_kid_is_too_young_for():
    impossible = _task(category="basis", assignees=["k"], min_age=12)
    bonus = _task(category="bonus", requires_routine=True)
    tasks = {"a": impossible, "b": bonus}
    # 10 year old kid cannot do the basis task -> it must not block the bonus
    assert _elig(bonus, profile=_kid(2016), tasks=tasks) is None
    # 13 year old kid can -> bonus stays locked
    assert _elig(bonus, profile=_kid(2013), tasks=tasks) == "basis_open"


# -- step 2: exact age / birthday ----------------------------------------------

from datetime import date


def test_age_on_day_before_on_and_after_birthday():
    b = date(2016, 10, 29)
    assert kids.age_on(b, date(2026, 10, 28)) == 9
    assert kids.age_on(b, date(2026, 10, 29)) == 10
    assert kids.age_on(b, date(2026, 10, 30)) == 10
    assert kids.age_on(b, date(2026, 1, 1)) == 9          # does NOT change on Jan 1
    assert kids.age_on(b, date(2026, 12, 31)) == 10


def test_leap_day_birthday():
    b = date(2016, 2, 29)
    assert kids.birthday_in_year(b, 2028) == date(2028, 2, 29)
    assert kids.birthday_in_year(b, 2027) == date(2027, 2, 28)     # celebrated on Feb 28 in common years
    assert kids.age_on(b, date(2027, 2, 27)) == 10
    assert kids.age_on(b, date(2027, 2, 28)) == 11
    assert kids.age_on(b, date(2028, 2, 28)) == 11
    assert kids.age_on(b, date(2028, 2, 29)) == 12
    assert kids.is_birthday({"birthday": "2016-02-29"}, date(2027, 2, 28))
    assert not kids.is_birthday({"birthday": "2016-02-29"}, date(2027, 3, 1))
    assert kids.is_birthday({"birthday": "2016-02-29"}, date(2028, 2, 29))


def test_kid_age_prefers_birthday_and_falls_back_to_year():
    today = date(2026, 10, 29)
    assert kids.kid_age({"birthday": "2016-10-30", "birth_year": 2016}, today) == 9
    assert kids.kid_age({"birth_year": 2016}, today) == 10
    assert kids.kid_age({"birthday": "garbage", "birth_year": 2016}, today) == 10
    assert kids.kid_age({}, today) is None
    assert kids.kid_age(None, today) is None
    assert kids.kid_age({"birth_year": True}, today) is None


def test_is_birthday_not_on_birth_date_and_lists_kids():
    assert not kids.is_birthday({"birthday": "2026-10-29"}, date(2026, 10, 29))   # born today: age 0
    assert not kids.is_birthday({"birth_year": 2016}, date(2026, 10, 29))
    profiles = {"a": {"birthday": "2016-10-29"}, "b": {"birthday": "2014-10-30"}, "c": "bogus"}
    assert kids.birthday_kids(profiles, date(2026, 10, 29)) == ["a"]


@pytest.mark.parametrize("value,ok", [
    ("2016-10-29", True), ("2016-02-30", False), ("20161029", False), ("2016-1-1", False),
    ("1800-01-01", False), ("", False), (None, False), (20161029, False),
])
def test_parse_birthday(value, ok):
    assert (kids.parse_birthday(value) is not None) is ok


def test_build_kid_profile_birthday_rules():
    p = kids.build_kid_profile(None, "🦊", "#fff", 2000, birthday="2016-10-29")
    assert p["birthday"] == "2016-10-29" and p["birth_year"] == 2016
    # without a birthday argument a matching birthday is kept, a different year drops it
    assert kids.build_kid_profile(p, "🦊", "#fff", 2016)["birthday"] == "2016-10-29"
    assert "birthday" not in kids.build_kid_profile(p, "🦊", "#fff", 2015)
    assert "birthday" not in kids.build_kid_profile(p, "🦊", "#fff", 2016, birthday=None)
    assert kids.build_kid_profile(p, "🦊", "#fff", 2016, approval_sample_rate=250)["approval_sample_rate"] == 100
    # strict_until survives profile edits
    p["strict_until"] = "2026-11-05"
    assert kids.build_kid_profile(p, "🦊", "#fff", 2016)["strict_until"] == "2026-11-05"


def test_eligibility_uses_exact_age():
    task = _task(min_age=10)
    profile = {"avatar": "x", "color": "#fff", "birth_year": 2016, "birthday": "2016-10-30"}
    # NOW is 2026-10-29: the kid is still 9 although 2026 - 2016 = 10
    assert kids.check_eligibility(task, "k", profile, {"t": task}, {}, NOW) == kids.ERR_TOO_YOUNG
    profile["birthday"] = "2016-10-29"
    assert kids.check_eligibility(task, "k", profile, {"t": task}, {}, NOW) is None


def test_unlocked_by_age():
    items = [{"name": "a", "min_age": 10}, {"name": "b", "min_age": 9}, {"name": "c", "min_age": 11},
             {"name": "d"}, {"name": "e", "min_age": 0}]
    assert [i["name"] for i in kids.unlocked_by_age(items, 9, 10)] == ["a"]
    assert [i["name"] for i in kids.unlocked_by_age(items, 8, 10)] == ["a", "b"]
    assert kids.unlocked_by_age(items, 10, 10) == []


# -- step 2: approval / penalty helpers ------------------------------------------

def test_needs_approval_paths():
    today = date(2026, 10, 29)
    task = _task()
    kid = _kid()
    assert kids.needs_approval(task, kid, today, rng=lambda: 0.0) is False          # rate 0 never triggers
    assert kids.needs_approval(_task(requires_approval=True), kid, today) is True
    assert kids.needs_approval(task, {**kid, "approval_sample_rate": 100}, today, rng=lambda: 0.999) is True
    assert kids.needs_approval(task, {**kid, "approval_sample_rate": 30}, today, rng=lambda: 0.29) is True
    assert kids.needs_approval(task, {**kid, "approval_sample_rate": 30}, today, rng=lambda: 0.30) is False
    strict = {**kid, "strict_until": "2026-10-30"}
    assert kids.needs_approval(task, strict, today) is True
    assert kids.needs_approval(task, strict, date(2026, 10, 30)) is False           # "until" is exclusive
    assert kids.strict_active({"strict_until": "bogus"}, today) is False


def test_penalty_helpers_and_settings_defaults():
    assert kids.clamp_adjustment(10, -4) == -4
    assert kids.clamp_adjustment(2, -4) == -2
    assert kids.clamp_adjustment(0, -4) == 0
    assert kids.clamp_adjustment(0, 4) == 4
    assert kids.cheat_penalty(4, {}) == 4
    assert kids.cheat_penalty(5, {"cheat_penalty_factor": 0.5}) == 3
    assert kids.cheat_penalty(5, {"cheat_penalty_factor": 0}) == 0
    assert kids.cheat_penalty(5, {"cheat_penalty_factor": 99}) == 10               # clamped to 2.0
    assert kids.cheat_strict_days({}) == 7 and kids.cheat_strict_days({"cheat_strict_days": 99}) == 30
    assert kids.cheat_strict_days({"cheat_strict_days": "x"}) == 7
    assert kids.birthday_bonus_points({}) == 10 and kids.birthday_bonus_points({"birthday_bonus_points": 0}) == 0
    assert kids.birthday_duty_free({}) is True and kids.birthday_duty_free({"birthday_duty_free": False}) is False
    assert kids.normalize_sample_rate("x") == 0 and kids.normalize_sample_rate(-5) == 0


def test_period_task_points_ignores_non_task_entries_and_old_periods():
    start = datetime(2026, 10, 1, tzinfo=timezone.utc)
    h = lambda **kw: {"user_id": "a", "points": 3, "timestamp": "2026-10-10T10:00:00+00:00", **kw}
    history = [h(), h(type="task"), h(type="bonus"), h(type="penalty", points=-2), h(type="birthday", points=10),
               h(user_id="parent"), h(timestamp="2026-09-30T23:59:00+00:00"), h(timestamp="garbage"), "junk"]
    assert kids.period_task_points(history, start, ["a"]) == 6.0
    assert kids.period_task_points(history, None, ["a"]) == 12.0


def test_migrate_task_like_adds_requires_approval():
    item = {"name": "x"}
    kids.migrate_task_like(item)
    assert item["requires_approval"] is False
    item = {"requires_approval": 1}
    kids.migrate_task_like(item)
    assert item["requires_approval"] is True


# -- time windows ---------------------------------------------------------------
def _at(hour, minute=0):
    return datetime(2026, 10, 29, hour, minute, tzinfo=TZ)


def _win(frm=None, until=None):
    return {"available_from": frm, "available_until": until}


@pytest.mark.parametrize("task, hour, minute, expected", [
    (_win(), 3, 0, "open"),
    (_win("17:00", "21:00"), 16, 59, "not_yet"),
    (_win("17:00", "21:00"), 17, 0, "open"),
    (_win("17:00", "21:00"), 20, 59, "open"),
    (_win("17:00", "21:00"), 21, 0, "too_late"),          # "until" is exclusive
    (_win("17:00", None), 23, 59, "open"),
    (_win("17:00", None), 0, 0, "not_yet"),
    (_win(None, "10:00"), 0, 0, "open"),
    (_win(None, "10:00"), 10, 0, "too_late"),
    (_win("05:00", "10:00"), 4, 59, "not_yet"),
    # midnight edge cases
    (_win("00:00", None), 0, 0, "open"),                    # from midnight = no restriction
    (_win(None, "00:00"), 23, 59, "open"),                  # until midnight = end of day
    (_win("17:00", "00:00"), 23, 59, "open"),               # window ends at midnight
    (_win("17:00", "00:00"), 0, 0, "not_yet"),              # midnight itself is already the next day
    (_win("17:00", "00:00"), 16, 59, "not_yet"),
    (_win("22:00", "02:00"), 23, 30, "open"),               # crosses midnight
    (_win("22:00", "02:00"), 1, 59, "open"),
    (_win("22:00", "02:00"), 2, 0, "not_yet"),
    (_win("22:00", "02:00"), 12, 0, "not_yet"),
    (_win("08:00", "08:00"), 3, 0, "open"),                 # empty window = no restriction
    (_win("garbage", "99:99"), 3, 0, "open"),               # invalid values are ignored
])
def test_window_state(task, hour, minute, expected):
    assert kids.window_state(task, _at(hour, minute)) == expected
    assert kids.in_window(task, _at(hour, minute)) == (expected == "open")


def test_normalize_time():
    assert kids.normalize_time("07:05") == "07:05" and kids.normalize_time(" 23:59 ") == "23:59"
    for bad in ("", None, "7:05", "24:00", "12:60", 5, "12:00:00"):
        assert kids.normalize_time(bad) is None


def test_migrate_adds_window_keys():
    item = {"name": "x", "available_from": "5:00", "available_until": "10:00"}
    kids.migrate_task_like(item)
    assert item["available_from"] is None and item["available_until"] == "10:00"


def test_window_aware_eligibility_and_premack():
    evening = _task(assignees=["k"], available_from="17:00", available_until="21:00")
    tasks = {"e": evening}
    now = _at(10)
    assert kids.check_eligibility(evening, "k", _kid(), tasks, {}, now) == "not_yet"
    assert kids.check_eligibility(evening, "k", _kid(), tasks, {}, _at(22)) == "too_late"
    assert kids.check_eligibility(evening, "k", _kid(), tasks, {}, _at(18)) is None
    # outside the window the task does not count as open: the bonus is not blocked
    bonus = _task(category="bonus", requires_routine=True)
    assert kids.check_eligibility(bonus, "k", _kid(), {**tasks, "b": bonus}, {}, now) is None
    assert kids.check_eligibility(bonus, "k", _kid(), {**tasks, "b": bonus}, {}, _at(18)) == "basis_open"
    assert kids.check_eligibility(bonus, "k", _kid(), {**tasks, "b": bonus}, {}, _at(22)) is None


def test_is_expired():
    assert kids.is_expired({"expires_at": _at(12).isoformat()}, _at(12))
    assert kids.is_expired({"expires_at": _at(12).isoformat()}, _at(13))
    assert not kids.is_expired({"expires_at": _at(12).isoformat()}, _at(11, 59))
    assert not kids.is_expired({}, _at(11)) and not kids.is_expired({"expires_at": "x"}, _at(11))
    expired = _task(expires_at=_at(12).isoformat(), assignees=["k"])
    assert kids.check_eligibility(expired, "k", _kid(), {}, {}, _at(13)) == "not_eligible"


# -- prorated goals -------------------------------------------------------------
def test_restore_full_goals():
    opts = {"point_goals": {"a": 40, "b": 30}, "point_goals_full": {"a": 100, "b": 0, "c": 50},
            "point_goals_prorated_month": "2026-10", "other": 1}
    assert kids.restore_full_goals(opts, "2026-10") is None            # same month
    assert kids.restore_full_goals(opts, "2026-09") is None            # never backwards
    assert kids.restore_full_goals({"point_goals": {"a": 1}}, "2026-11") is None
    new = kids.restore_full_goals(opts, "2026-11")
    assert new["point_goals"] == {"a": 100, "c": 50} and "point_goals_prorated_month" not in new
    assert new["other"] == 1 and opts["point_goals"] == {"a": 40, "b": 30}   # input untouched
    assert kids.restore_full_goals(new, "2026-12") is None            # idempotent
    assert kids.restore_full_goals(opts, "2027-01")["point_goals"]["a"] == 100   # year change


# -- missed duties ----------------------------------------------------------------
def test_missed_grace_days():
    assert kids.missed_grace_days(1) == 0 and kids.missed_grace_days(7) == 2 and kids.missed_grace_days(28) == 2
    for none in (0, 2, 6, None, True, "1"):
        assert kids.missed_grace_days(none) is None


def test_is_missed_daily_and_weekly():
    day = timedelta(days=1)
    today = _task(due_date=_at(0, 5).isoformat())
    yesterday = _task(due_date=(_at(23, 59) - day).isoformat())
    assert not kids.is_missed(today, _at(23, 0), 1)
    assert kids.is_missed(yesterday, _at(0, 1), 1)
    weekly = lambda ago: _task(due_date=(_at(12) - ago * day).isoformat())
    assert not kids.is_missed(weekly(2), _at(12), 7) and kids.is_missed(weekly(3), _at(12), 7)
    assert not kids.is_missed(weekly(5), _at(12), 3)                   # other intervals never expire
    assert not kids.is_missed(_task(due_date=(_at(12) - 3 * day).isoformat(), paused_until=_at(12).isoformat()), _at(12), 1)


def test_next_due_day():
    from datetime import date
    today = date(2026, 10, 29)
    assert kids.next_due_day(date(2026, 10, 28), 1, today) == today
    assert kids.next_due_day(date(2026, 10, 20), 1, today) == today
    assert kids.next_due_day(date(2026, 10, 28), 3, today) == date(2026, 10, 31)
    assert kids.next_due_day(date(2026, 10, 1), 7, today) == today
    assert kids.next_due_day(date(2026, 10, 28), 0, today) == today


# ---------------------------------------------------------------------------
# replaced duties (room blitz yields to the thorough room clean)
# ---------------------------------------------------------------------------

def _pair(deep_due=NOW, deep_kid="person.anna", **blitz_kw):
    blitz = _task(assignees=["person.anna"], wizard_key="room_blitz:person.anna",
                  replaced_by_key="room_deep", **blitz_kw)
    deep = _task(assignees=[deep_kid], wizard_key=f"room_deep:{deep_kid}",
                 due_date=deep_due.astimezone(timezone.utc).isoformat())
    return blitz, deep, {"b": blitz, "d": deep}


def test_is_replaced_when_the_deep_clean_is_open():
    blitz, deep, tasks = _pair()
    assert kids.is_replaced(blitz, tasks, NOW)
    assert not kids.is_replaced(deep, tasks, NOW)
    # deep clean not due yet (or paused) -> blitz counts again
    _b, _d, later = _pair(deep_due=NOW + timedelta(days=2))
    assert not kids.is_replaced(later["b"], later, NOW)
    deep["paused_until"] = (NOW + timedelta(days=1)).isoformat()
    assert not kids.is_replaced(blitz, tasks, NOW)


def test_is_replaced_only_for_the_same_kid_and_with_the_relation():
    blitz, _deep, tasks = _pair(deep_kid="person.ben")
    assert not kids.is_replaced(blitz, tasks, NOW)                      # other kid's room
    plain = _task(assignees=["person.anna"], wizard_key="room_blitz:person.anna")
    own_deep = _task(assignees=["person.anna"], wizard_key="room_deep:person.anna")
    assert not kids.is_replaced(plain, {"a": plain, "b": own_deep}, NOW)    # no replaced_by_key
    manual = _task(assignees=["person.anna"], replaced_by_key="room_deep")
    manual_deep = _task(assignees=["person.anna"])                          # no wizard key
    assert not kids.is_replaced(manual, {"a": manual, "b": manual_deep}, NOW)


def test_replaced_task_is_not_an_open_duty_and_not_eligible():
    blitz, deep, tasks = _pair()
    assert kids.open_basis_tasks_for(tasks, "person.anna", NOW, 5) == [deep]
    err = kids.check_eligibility(blitz, "person.anna", {}, tasks, {}, NOW)
    assert err == kids.ERR_NOT_ELIGIBLE
    assert kids.check_eligibility(deep, "person.anna", {}, tasks, {}, NOW) is None
    del tasks["d"]
    assert kids.check_eligibility(blitz, "person.anna", {}, tasks, {}, NOW) is None


def test_skipped_by_completion():
    blitz, deep, tasks = _pair()
    assert kids.skipped_by_completion(deep, tasks, NOW) == ["b"]
    assert kids.skipped_by_completion(blitz, tasks, NOW) == []
    deep["due_date"] = (NOW + timedelta(days=3)).isoformat()                # not open: replaces nothing
    assert kids.skipped_by_completion(deep, tasks, NOW) == []
    blitz["due_date"] = (NOW + timedelta(days=1)).isoformat()               # already done today
    deep["due_date"] = NOW.isoformat()
    assert kids.skipped_by_completion(deep, tasks, NOW) == []


def test_open_required_steps():
    t = {"subtasks": [{"title": "a", "done": True}, {"title": "b", "done": False},
                      {"title": "pill", "done": False, "optional": True}]}
    assert [s["title"] for s in kids.open_required_steps(t)] == ["b"]
    t["subtasks"][1]["done"] = True
    assert kids.open_required_steps(t) == []
    assert kids.open_required_steps({}) == []
