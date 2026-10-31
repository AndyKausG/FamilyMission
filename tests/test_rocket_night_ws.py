"""FamilyMission 2.1: rocket start, night time (pure function + reminder muting), redemption push, settings."""

from datetime import datetime, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import (
    _async_check_monthly_reset,
    _async_check_reminders,
    _async_handle_push_action,
)
from custom_components.family_mission.const import DOMAIN
from custom_components.family_mission.kids import is_night_time, rocket_countdown_seconds

CLARA = "person.clara"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)     # Thu 11:00 local (US/Pacific, PDT)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


async def _token(hass, name):
    user = await hass.auth.async_create_user(name, group_ids=[GROUP_ID_USER])
    refresh = await hass.auth.async_create_refresh_token(user, "https://example.com")
    return user, hass.auth.async_create_access_token(refresh)


@pytest.fixture
async def env(hass, freezer):
    """Anna (parent, push via parent_notify), Ben (adult, companion app), Sam (tablet user), Clara (kid)."""
    anna = await _token(hass, "Anna")
    ben = await _token(hass, "Ben")
    sam = await _token(hass, "Sam")
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set("person.ben", "home", {"friendly_name": "Ben", "user_id": ben[0].id})
    hass.states.async_set(CLARA, "home", {"friendly_name": "Clara"})
    MockConfigEntry(domain="mobile_app", data={"user_id": ben[0].id, "device_name": "Ben Phone"}).add_to_hass(hass)
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "overdue_days": 5,
        "parents": [anna[0].id],
        "parent_notify": {anna[0].id: "notify.anna_push"},
        "family_goal": {"points": 10, "reward": "Zoo"},
    })
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    calls = {
        "anna": async_mock_service(hass, "notify", "anna_push"),
        "ben": async_mock_service(hass, "notify", "mobile_app_ben_phone"),
    }
    return {"anna": anna, "ben": ben, "sam": sam, "entry": entry, "calls": calls}


@pytest.fixture
async def clients(hass, hass_ws_client, env, freezer):
    result = {
        "admin": await hass_ws_client(hass),
        "sam": await hass_ws_client(hass, env["sam"][1]),
    }
    freezer.move_to(NOON)
    return result


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 100


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _collect(hass, event):
    seen = []
    hass.bus.async_listen(event, lambda e: seen.append(e.data))
    return seen


async def _kid(admin):
    res = await _call(admin, "family_mission/set_kid_profile", participant_id=CLARA,
                      avatar="🦊", color="#ff8800", pin="1234", birth_year=2016)
    assert res["success"], res


async def _task(admin, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 6, "icon": "mdi:broom", "category": "basis",
               "assignees": [CLARA]}
    payload.update(kw)
    res = await _call(admin, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _kid_done(admin, tid):
    res = (await _call(admin, "family_mission/kid_complete_task", task_id=tid, kid_id=CLARA, pin="1234"))["result"]
    assert res["success"], res
    return res


async def _rocket(admin):
    return (await _call(admin, "family_mission/get_data"))["result"]["rocket"]


def _pushes(env):
    return len(env["calls"]["anna"]), len(env["calls"]["ben"])


# ---------------------------------------------------------------------------
# rocket: reached
# ---------------------------------------------------------------------------

async def test_rocket_reached_by_direct_completion(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    ready = _collect(hass, "family_mission_rocket_ready")
    assert await _rocket(admin) is None
    await _kid_done(admin, await _task(admin, complexity=6))
    await hass.async_block_till_done()
    assert await _rocket(admin) is None and ready == []              # 6 < 10
    await _kid_done(admin, await _task(admin, name="Second", complexity=4))
    await hass.async_block_till_done()
    rocket = await _rocket(admin)
    assert rocket["period"] == "2026-10" and rocket["reached_at"] and rocket["launched_at"] is None
    assert ready == [{"reward": "Zoo", "points": 10.0, "period": "2026-10"}]
    assert _pushes(env) == (1, 1)                                     # every adult, own target resolution
    msg = env["calls"]["anna"][0].data["message"]
    assert "Zoo" in msg and "🚀" in env["calls"]["anna"][0].data["title"]


async def test_rocket_reached_by_approval_only_once_per_period(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    ready = _collect(hass, "family_mission_rocket_ready")
    tid = await _task(admin, complexity=10, requires_approval=True)
    await _kid_done(admin, tid)
    await hass.async_block_till_done()
    assert await _rocket(admin) is None                               # pending: no points yet
    (pid,) = _data(hass)["pending"]
    assert (await _call(admin, "family_mission/approve", pending_id=pid))["result"]["success"]
    await hass.async_block_till_done()
    assert (await _rocket(admin))["period"] == "2026-10"
    assert len(ready) == 1 and _pushes(env) == (1, 1)
    # more points in the same period: nothing again
    await _kid_done(admin, await _task(admin, name="More", complexity=5))
    await hass.async_block_till_done()
    assert len(ready) == 1 and _pushes(env) == (1, 1)


async def test_rocket_undo_does_not_reset_and_new_period_again(hass, clients, env, freezer):
    admin = clients["admin"]
    await _kid(admin)
    ready = _collect(hass, "family_mission_rocket_ready")
    await _kid_done(admin, await _task(admin, complexity=10))
    await hass.async_block_till_done()
    entry = next(h for h in _data(hass)["history"] if h["type"] == "task")
    assert (await _call(admin, "family_mission/undo_completion", history_id=entry["id"]))["result"]["removed"]
    got = (await _call(admin, "family_mission/get_data"))["result"]
    assert got["family_points"] == 0 and got["rocket"]["period"] == "2026-10"   # reached stays reached
    await _kid_done(admin, await _task(admin, name="Again", complexity=10))     # back above the goal
    await hass.async_block_till_done()
    assert len(ready) == 1
    # a new period: the old record no longer counts and the goal can be reached again
    freezer.move_to(datetime(2026, 11, 2, 18, 0, tzinfo=timezone.utc))
    await _async_check_monthly_reset(hass)
    assert await _rocket(admin) is None
    await _kid_done(admin, await _task(admin, name="November", complexity=10))
    await hass.async_block_till_done()
    assert (await _rocket(admin))["period"] == "2026-11"
    assert [r["period"] for r in ready] == ["2026-10", "2026-11"] and _pushes(env) == (2, 2)


async def test_rocket_no_goal_no_rocket(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    hass.config_entries.async_update_entry(env["entry"], options={**env["entry"].options, "family_goal": {"points": 0, "reward": "x"}})
    await _kid_done(admin, await _task(admin, complexity=10))
    await hass.async_block_till_done()
    assert await _rocket(admin) is None and _pushes(env) == (0, 0)


# ---------------------------------------------------------------------------
# rocket: websocket
# ---------------------------------------------------------------------------

async def test_rocket_countdown_and_launched_idempotent_for_any_user(hass, clients, env):
    admin, sam = clients["admin"], clients["sam"]
    await _kid(admin)
    counting = _collect(hass, "family_mission_rocket_countdown")
    launched = _collect(hass, "family_mission_rocket_launched")
    # no rocket yet
    assert (await _call(sam, "family_mission/rocket_countdown"))["result"]["success"] is False
    assert (await _call(sam, "family_mission/rocket_launched"))["result"]["success"] is False
    await _kid_done(admin, await _task(admin, complexity=10))
    await hass.async_block_till_done()
    # Sam is neither parent nor kid: still allowed
    assert (await _call(sam, "family_mission/rocket_countdown"))["result"] == {"success": True}
    first = (await _rocket(admin))["countdown_started_at"]
    assert first
    assert (await _call(sam, "family_mission/rocket_countdown"))["success"]
    assert (await _rocket(admin))["countdown_started_at"] == first        # marked once
    assert counting == [{"seconds": 60, "reward": "Zoo"}] * 2             # event on every call (speakers)
    assert (await _call(sam, "family_mission/rocket_launched"))["result"] == {"success": True}
    stamp = (await _rocket(admin))["launched_at"]
    assert stamp
    assert (await _call(admin, "family_mission/rocket_launched"))["result"] == {"success": True}
    assert (await _rocket(admin))["launched_at"] == stamp
    await hass.async_block_till_done()
    assert launched == [{"reward": "Zoo", "period": "2026-10"}]           # fired once


async def test_rocket_countdown_event_uses_setting(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    await _call(admin, "family_mission/update_settings", settings={"rocket_countdown": 90})
    await _kid_done(admin, await _task(admin, complexity=10))
    counting = _collect(hass, "family_mission_rocket_countdown")
    await _call(admin, "family_mission/rocket_countdown")
    await hass.async_block_till_done()
    assert counting == [{"seconds": 90, "reward": "Zoo"}]


# ---------------------------------------------------------------------------
# night time
# ---------------------------------------------------------------------------

def _t(day, hh, mm=0):
    return datetime(2026, 11, day, hh, mm)       # 2026-11-02 is a Monday


@pytest.mark.parametrize("now, night", [
    (_t(3, 12), False),             # Tue noon
    (_t(3, 20, 29), False),
    (_t(3, 20, 30), True),          # sleep time reached
    (_t(3, 23, 59), True),
    (_t(4, 0, 0), True),            # across midnight
    (_t(4, 5, 59), True),
    (_t(4, 6, 0), False),           # Wed: weekday wake
    (_t(6, 21, 0), True),           # Fri evening
    (_t(7, 6, 30), True),           # Fri -> Sat: sleeps until 08:00
    (_t(7, 7, 59), True),
    (_t(7, 8, 0), False),
    (_t(7, 20, 45), True),          # Sat evening
    (_t(8, 7, 0), True),            # Sat -> Sun: weekend wake
    (_t(8, 8, 0), False),
    (_t(8, 21, 0), True),           # Sun evening
    (_t(9, 5, 59), True),           # Sun -> Mon: weekday wake 06:00
    (_t(9, 6, 0), False),
])
def test_is_night_time_defaults(now, night):
    assert is_night_time(now) is night


def test_is_night_time_custom_and_invalid():
    assert is_night_time(_t(3, 22, 0), "21:00", "05:30", "09:00") is True
    assert is_night_time(_t(3, 5, 29), "21:00", "05:30", "09:00") is True
    assert is_night_time(_t(3, 5, 30), "21:00", "05:30", "09:00") is False
    assert is_night_time(_t(7, 8, 59), "21:00", "05:30", "09:00") is True     # Saturday morning uses weekend time
    assert is_night_time(_t(7, 9, 0), "21:00", "05:30", "09:00") is False
    assert is_night_time(_t(3, 20, 45), "garbage", None, 5) is True           # defaults for unusable values


def test_rocket_countdown_seconds():
    assert [rocket_countdown_seconds(v) for v in (60, 5, 999, "90", None, True, "x", 44.6)] == [60, 15, 180, 90, 60, 60, 60, 45]


# ---------------------------------------------------------------------------
# reminders in the night
# ---------------------------------------------------------------------------

async def test_reminders_muted_at_night(hass, clients, env, freezer):
    admin = clients["admin"]
    notified = async_mock_service(hass, "notify", "kid_tablet")
    events = _collect(hass, "family_mission_task_reminder")
    night = await _task(admin, name="Night", reminder_at="21:00", reminder_target="notify.kid_tablet")
    day = await _task(admin, name="Day", reminder_at="09:00", reminder_target="notify.kid_tablet")
    freezer.move_to(datetime(2026, 10, 30, 5, 0, tzinfo=timezone.utc))        # Thu 22:00 local: night
    assert await _async_check_reminders(hass) == 0
    await hass.async_block_till_done()
    assert notified == [] and events == []
    assert _data(hass)["tasks"][night]["reminded_on"] == "2026-10-29"        # muted, not postponed
    assert _data(hass)["tasks"][day]["reminded_on"] == "2026-10-29"           # also muted (its time had passed)
    freezer.move_to(datetime(2026, 10, 30, 17, 0, tzinfo=timezone.utc))       # Fri 10:00 local: awake, new day
    assert await _async_check_reminders(hass) == 1                            # only Day (09:00) is due, Night is 21:00
    await hass.async_block_till_done()
    assert [e["task_id"] for e in events] == [day] and len(notified) == 1


async def test_reminders_not_muted_with_night_mode_off(hass, clients, env, freezer):
    admin = clients["admin"]
    await _call(admin, "family_mission/update_settings", settings={"night_mode": False})
    await _task(admin, reminder_at="21:00")
    freezer.move_to(datetime(2026, 10, 30, 5, 0, tzinfo=timezone.utc))
    assert await _async_check_reminders(hass) == 1


# ---------------------------------------------------------------------------
# redemption push
# ---------------------------------------------------------------------------

async def _redeem_setup(hass, admin):
    await _kid(admin)
    await _call(admin, "family_mission/set_rewards", rewards=[
        {"id": "r1", "name": "Medienzeit", "emoji": "📺", "cost": 5, "min_age": 0, "active": True}])
    await _kid_done(admin, await _task(admin, complexity=6))
    await hass.async_block_till_done()


async def _redeem(admin):
    return (await _call(admin, "family_mission/kid_redeem", kid_id=CLARA, pin="1234", reward_id="r1"))["result"]


async def test_redemption_push_with_actions_and_handler(hass, clients, env):
    admin = clients["admin"]
    await _redeem_setup(hass, admin)
    base = _pushes(env)
    res = await _redeem(admin)
    assert res["success"]
    await hass.async_block_till_done()
    assert _pushes(env) == (base[0] + 1, base[1] + 1)
    call = env["calls"]["anna"][-1].data
    assert call["title"] == "🎁 Clara wants to redeem" and call["message"] == "Medienzeit (5 ⭐)"
    rid = res["redemption_id"]
    assert [a["action"] for a in call["data"]["actions"]] == [f"FM_RAPPROVE_{rid}", f"FM_RREJECT_{rid}"]
    # tapping the action resolves it; nothing is sent afterwards
    await _async_handle_push_action(hass, f"FM_RAPPROVE_{rid}")
    await hass.async_block_till_done()
    assert _data(hass)["redemptions"][rid]["status"] == "done"
    assert _pushes(env) == (base[0] + 1, base[1] + 1)
    await _async_handle_push_action(hass, f"FM_RREJECT_{rid}")                # already handled: ignored
    assert _data(hass)["redemptions"][rid]["status"] == "done"


async def test_redemption_push_reject_action_refunds(hass, clients, env):
    admin = clients["admin"]
    await _redeem_setup(hass, admin)
    rid = (await _redeem(admin))["redemption_id"]
    await hass.async_block_till_done()
    assert _data(hass)["wallet"][CLARA] == 1
    await _async_handle_push_action(hass, f"FM_RREJECT_{rid}")
    assert _data(hass)["redemptions"][rid]["status"] == "rejected" and _data(hass)["wallet"][CLARA] == 6


async def test_redemption_push_can_be_switched_off(hass, clients, env):
    admin = clients["admin"]
    await _redeem_setup(hass, admin)
    base = _pushes(env)
    events = _collect(hass, "family_mission_reward_requested")
    await _call(admin, "family_mission/update_settings", settings={"reward_push": False})
    assert (await _redeem(admin))["success"]
    await hass.async_block_till_done()
    assert _pushes(env) == base and len(events) == 1                          # event still fires


# ---------------------------------------------------------------------------
# settings validation
# ---------------------------------------------------------------------------

async def test_tablet_settings_validation(hass, clients, env):
    admin = clients["admin"]
    good = {"night_mode": False, "night_sleep": "21:15", "night_wake_weekday": "05:45",
            "night_wake_weekend": "09:00", "rocket_countdown": 120, "reward_push": False}
    assert (await _call(admin, "family_mission/update_settings", settings=good))["success"]
    options = env["entry"].options
    assert all(options[k] == v for k, v in good.items())
    bad = {"night_mode": "yes", "night_sleep": "25:00", "night_wake_weekday": "6", "night_wake_weekend": None,
           "rocket_countdown": 5000, "reward_push": 1}
    assert (await _call(admin, "family_mission/update_settings", settings=bad))["success"]
    options = env["entry"].options
    assert options["night_mode"] is True and options["reward_push"] is True
    assert (options["night_sleep"], options["night_wake_weekday"], options["night_wake_weekend"]) == ("20:30", "06:00", "08:00")
    assert options["rocket_countdown"] == 180
    await _call(admin, "family_mission/update_settings", settings={"rocket_countdown": 3})
    assert env["entry"].options["rocket_countdown"] == 15
    await _call(admin, "family_mission/update_settings", settings={"rocket_countdown": "abc"})
    assert env["entry"].options["rocket_countdown"] == 60
