"""FamilyMission 2.3: push safety - push targets, test push, "nobody reachable" notice, one follow-up reminder."""

from datetime import datetime, timedelta, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.core import callback
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry, async_fire_time_changed, async_mock_service,
)

from custom_components.family_mission import _async_check_approval_reminders, _async_handle_push_action
from custom_components.family_mission.const import DOMAIN

CLARA = "person.clara"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)     # Thu 11:00 local (US/Pacific, PDT)
NIGHT = datetime(2026, 10, 30, 5, 0, tzinfo=timezone.utc)     # Thu 22:00 local, night (sleep 20:30)
MORNING = datetime(2026, 10, 30, 15, 0, tzinfo=timezone.utc)  # Fri 08:00 local, awake


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
    """Anna (parent, manual target), Ben (companion app), Sam (tablet user), Clara (kid)."""
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
        "anna": await hass_ws_client(hass, env["anna"][1]),
        "ben": await hass_ws_client(hass, env["ben"][1]),
        "sam": await hass_ws_client(hass, env["sam"][1]),
    }
    freezer.move_to(NOON)
    _pin_period(hass)
    return result


def _pin_period(hass):
    from homeassistant.util import dt as dt_util
    now = dt_util.now()
    data = hass.data[DOMAIN]["data"]
    data["current_month"] = now.strftime("%Y-%m")
    data["current_period_start"] = dt_util.as_utc(now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)).isoformat()


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 700


def _data(hass):
    return hass.data[DOMAIN]["data"]


async def _setup_kid_task(admin):
    res = await _call(admin, "family_mission/set_kid_profile", participant_id=CLARA,
                      avatar="🦊", color="#ff8800", pin="1234", birth_year=2016)
    assert res["success"], res
    res = await _call(admin, "family_mission/add_task", name="Zimmer", interval=1, complexity=4,
                      icon="mdi:broom", category="basis", assignees=[CLARA], requires_approval=True)
    assert res["success"], res
    return res["result"]["task_id"]


async def _kid_done(admin, tid):
    res = (await _call(admin, "family_mission/kid_complete_task", task_id=tid, kid_id=CLARA, pin="1234"))["result"]
    assert res["success"] and res["pending"] is True, res


def _pushes(env):
    """Number of real pushes (without ``clear_notification``) to Anna and Ben."""
    return tuple(len([c for c in env["calls"][w] if c.data["message"] != "clear_notification"]) for w in ("anna", "ben"))


def _notices(hass):
    return hass.data.get("persistent_notification", {})


async def _tick(hass, freezer, to):
    """Move the clock and run the minute check directly (the timer itself is tested separately)."""
    freezer.move_to(to)
    await _async_check_approval_reminders(hass)
    await hass.async_block_till_done()


def _clears(env, who):
    return [c.data for c in env["calls"][who] if c.data["message"] == "clear_notification"]


# ---------------------------------------------------------------------------
# get_data: push_targets / push_warning
# ---------------------------------------------------------------------------

async def test_get_data_push_targets_and_no_warning(hass, clients, env):
    admin = clients["admin"]
    await _setup_kid_task(admin)
    res = (await _call(admin, "family_mission/get_data"))["result"]
    by_name = {a["name"]: a for a in res["adults"]}
    assert by_name["Anna"]["push_targets"] == ["notify.anna_push"] and by_name["Anna"]["push"] is True
    assert by_name["Ben"]["push_targets"] == ["notify.mobile_app_ben_phone"]
    assert res["push_warning"] is None


async def test_push_warning_no_targets(hass, clients, env):
    admin = clients["admin"]
    await _setup_kid_task(admin)
    await _call(admin, "family_mission/update_settings", settings={"parent_notify": {}})
    hass.services.async_remove("notify", "mobile_app_ben_phone")
    res = (await _call(admin, "family_mission/get_data"))["result"]
    assert all(a["push_targets"] == [] and a["push"] is False for a in res["adults"])
    assert res["push_warning"] == "no_targets"


async def test_push_warning_no_adults_and_not_without_kids(hass, clients, env):
    admin = clients["admin"]
    res = (await _call(admin, "family_mission/get_data"))["result"]
    assert res["push_warning"] is None                               # no kid profiles yet
    await _setup_kid_task(admin)
    hass.states.async_remove("person.anna")
    hass.states.async_remove("person.ben")
    res = (await _call(admin, "family_mission/get_data"))["result"]
    assert res["adults"] == [] and res["push_warning"] == "no_adults"


# ---------------------------------------------------------------------------
# test_push
# ---------------------------------------------------------------------------

async def test_test_push_success_default_and_admin_other(hass, clients, env):
    res = await _call(clients["anna"], "family_mission/test_push")
    assert res["result"] == {"success": True, "targets": ["notify.anna_push"], "errors": []}
    assert env["calls"]["anna"][0].data["message"] == "🔔 FamilyMission: test - push arrives"
    res = await _call(clients["admin"], "family_mission/test_push", user_id=env["ben"][0].id)
    assert res["result"]["targets"] == ["notify.mobile_app_ben_phone"] and len(env["calls"]["ben"]) == 1


async def test_test_push_no_target(hass, clients, env):
    await _call(clients["admin"], "family_mission/update_settings", settings={"parent_notify": {}})
    hass.services.async_remove("notify", "mobile_app_ben_phone")
    res = await _call(clients["anna"], "family_mission/test_push")
    assert res["result"] == {"success": False, "error": "no_target"}
    res = await _call(clients["admin"], "family_mission/test_push", user_id=env["sam"][0].id)    # not an adult
    assert res["result"] == {"success": False, "error": "no_target"}


async def test_test_push_roles(hass, clients, env):
    res = await _call(clients["sam"], "family_mission/test_push")
    assert res["success"] is False and res["error"]["code"] == "unauthorized"
    res = await _call(clients["anna"], "family_mission/test_push", user_id=env["ben"][0].id)
    assert res["success"] is False and res["error"]["code"] == "unauthorized"        # only an administrator may pick


async def test_test_push_reports_errors(hass, clients, env):
    @callback
    def _boom(call):
        raise RuntimeError("offline")

    hass.services.async_register("notify", "anna_push", _boom)
    res = (await _call(clients["anna"], "family_mission/test_push"))["result"]
    assert res["success"] is False and res["targets"] == [] and "offline" in res["errors"][0]


# ---------------------------------------------------------------------------
# "nobody reachable" notice
# ---------------------------------------------------------------------------

async def test_notice_raised_without_delivery_and_dismissed_after_success(hass, clients, env):
    admin = clients["admin"]
    tid = await _setup_kid_task(admin)
    await _call(admin, "family_mission/update_settings", settings={"parent_notify": {}})
    hass.services.async_remove("notify", "mobile_app_ben_phone")
    await _kid_done(admin, tid)
    await hass.async_block_till_done()
    assert "family_mission_no_push" in _notices(hass)
    # a target is chosen and tested -> notice goes away
    await _call(admin, "family_mission/update_settings",
                settings={"parent_notify": {env["anna"][0].id: "notify.anna_push"}})
    res = await _call(clients["anna"], "family_mission/test_push")
    assert res["result"]["success"] is True
    await hass.async_block_till_done()
    assert "family_mission_no_push" not in _notices(hass)


async def test_notice_when_all_calls_fail_and_dismissed_by_next_push(hass, clients, env):
    admin = clients["admin"]
    tid = await _setup_kid_task(admin)

    @callback
    def _boom(call):
        raise RuntimeError("offline")

    hass.services.async_register("notify", "anna_push", _boom)
    hass.services.async_register("notify", "mobile_app_ben_phone", _boom)
    await _kid_done(admin, tid)
    await hass.async_block_till_done()
    assert "family_mission_no_push" in _notices(hass)
    async_mock_service(hass, "notify", "anna_push")                  # back online
    await _call(admin, "family_mission/add_task", name="Bad", interval=1, complexity=2, icon="mdi:broom",
                category="basis", assignees=[CLARA], requires_approval=True)
    tid2 = [t for t in _data(hass)["tasks"] if t != tid][0]
    await _kid_done(admin, tid2)
    await hass.async_block_till_done()
    assert "family_mission_no_push" not in _notices(hass)


async def test_no_notice_when_delivered_or_push_off(hass, clients, env):
    admin = clients["admin"]
    tid = await _setup_kid_task(admin)
    await _kid_done(admin, tid)
    await hass.async_block_till_done()
    assert "family_mission_no_push" not in _notices(hass)


async def test_no_notice_when_approval_push_off(hass, clients, env):
    admin = clients["admin"]
    tid = await _setup_kid_task(admin)
    await _call(admin, "family_mission/update_settings",
                settings={"approval_push": False, "parent_notify": {}})
    hass.services.async_remove("notify", "mobile_app_ben_phone")
    await _kid_done(admin, tid)
    await hass.async_block_till_done()
    assert "family_mission_no_push" not in _notices(hass)


# ---------------------------------------------------------------------------
# follow-up reminder
# ---------------------------------------------------------------------------

async def test_reminder_once_after_n_hours(hass, clients, env, freezer):
    admin = clients["admin"]
    tid = await _setup_kid_task(admin)
    await _kid_done(admin, tid)
    await hass.async_block_till_done()
    pid = next(iter(_data(hass)["pending"]))
    assert _pushes(env) == (1, 1)
    await _tick(hass, freezer, NOON + timedelta(hours=1, minutes=59))
    assert _pushes(env) == (1, 1)                                    # not yet (default 2 h)
    await _tick(hass, freezer, NOON + timedelta(hours=2, minutes=1))
    assert _pushes(env) == (2, 2)
    call = env["calls"]["anna"][1].data
    assert call["title"] == "⏳ Approval still waiting" and call["message"] == "Clara: Zimmer"
    assert call["data"]["tag"] == f"family_mission_approval_{pid}"
    assert call["data"]["actions"][0]["action"] == f"FM_APPROVE_{pid}"
    assert call["data"]["actions"][1]["action"] == f"FM_NOTDONE_{pid}"
    assert _data(hass)["pending"][pid]["reminded_at"]
    await _tick(hass, freezer, NOON + timedelta(hours=5))
    assert _pushes(env) == (2, 2)                                    # exactly once


async def test_reminder_waits_for_the_morning(hass, clients, env, freezer):
    admin = clients["admin"]
    tid = await _setup_kid_task(admin)
    await _kid_done(admin, tid)
    await hass.async_block_till_done()
    await _tick(hass, freezer, NIGHT)
    assert _pushes(env) == (1, 1)                                    # night: silent
    pid = next(iter(_data(hass)["pending"]))
    assert not _data(hass)["pending"][pid].get("reminded_at")
    await _tick(hass, freezer, MORNING)
    assert _pushes(env) == (2, 2)


async def test_reminder_off_with_zero(hass, clients, env, freezer):
    admin = clients["admin"]
    await _call(admin, "family_mission/update_settings", settings={"approval_reminder_hours": 0})
    await _kid_done(admin, await _setup_kid_task(admin))
    await hass.async_block_till_done()
    await _tick(hass, freezer, NOON + timedelta(hours=6))
    assert _pushes(env) == (1, 1)


async def test_reminder_custom_hours(hass, clients, env, freezer):
    admin = clients["admin"]
    await _call(admin, "family_mission/update_settings", settings={"approval_reminder_hours": 1})
    await _kid_done(admin, await _setup_kid_task(admin))
    await hass.async_block_till_done()
    await _tick(hass, freezer, NOON + timedelta(hours=1, minutes=1))
    assert _pushes(env) == (2, 2)


async def test_no_reminder_when_approval_push_off(hass, clients, env, freezer):
    admin = clients["admin"]
    await _call(admin, "family_mission/update_settings", settings={"approval_push": False})
    await _kid_done(admin, await _setup_kid_task(admin))
    await hass.async_block_till_done()
    await _tick(hass, freezer, NOON + timedelta(hours=6))
    assert _pushes(env) == (0, 0)


async def test_no_reminder_after_approval(hass, clients, env, freezer):
    admin = clients["admin"]
    await _kid_done(admin, await _setup_kid_task(admin))
    await hass.async_block_till_done()
    pid = next(iter(_data(hass)["pending"]))
    assert (await _call(admin, "family_mission/approve", pending_id=pid))["result"]["success"]
    await _tick(hass, freezer, NOON + timedelta(hours=6))
    assert _pushes(env) == (1, 1)


# ---------------------------------------------------------------------------
# settings validation
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("value,expected", [
    (0, 0), (5, 5), (24, 24), (30, 24), (-3, 0), ("3", 3), ("x", 2), (None, 2), (True, 2), (2.7, 2),
])
async def test_reminder_hours_validation(hass, clients, env, value, expected):
    await _call(clients["admin"], "family_mission/update_settings", settings={"approval_reminder_hours": value})
    assert env["entry"].options["approval_reminder_hours"] == expected


async def test_reminder_runs_from_the_minute_timer(hass, clients, env, freezer):
    from homeassistant.util import dt as dt_util
    await _kid_done(clients["admin"], await _setup_kid_task(clients["admin"]))
    await hass.async_block_till_done()
    freezer.move_to(NOON + timedelta(hours=3))
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(minutes=2))
    await hass.async_block_till_done()
    assert _pushes(env) == (2, 2)


# ---------------------------------------------------------------------------
# handled approvals / redemptions disappear for every parent
# ---------------------------------------------------------------------------

async def test_app_approve_clears_push_for_all_parents(hass, clients, env):
    admin = clients["admin"]
    await _kid_done(admin, await _setup_kid_task(admin))
    await hass.async_block_till_done()
    pid = next(iter(_data(hass)["pending"]))
    assert (await _call(clients["anna"], "family_mission/approve", pending_id=pid))["result"]["success"]
    for who in ("anna", "ben"):
        assert _clears(env, who) == [{"message": "clear_notification", "data": {"tag": f"family_mission_approval_{pid}"}}]


async def test_app_reject_clears_push_for_all_parents(hass, clients, env):
    admin = clients["admin"]
    await _kid_done(admin, await _setup_kid_task(admin))
    pid = next(iter(_data(hass)["pending"]))
    res = await _call(clients["anna"], "family_mission/reject", pending_id=pid, mode="cheated")
    assert res["result"]["success"]
    for who in ("anna", "ben"):
        assert _clears(env, who)[0]["data"]["tag"] == f"family_mission_approval_{pid}"


async def test_push_action_clears_push_for_all_parents(hass, clients, env):
    admin = clients["admin"]
    await _kid_done(admin, await _setup_kid_task(admin))
    pid = next(iter(_data(hass)["pending"]))
    await _async_handle_push_action(hass, f"FM_NOTDONE_{pid}")
    for who in ("anna", "ben"):
        assert len(_clears(env, who)) == 1
    await _async_handle_push_action(hass, f"FM_APPROVE_{pid}")        # second tap: nothing more
    assert len(_clears(env, "anna")) == 1


async def test_clear_failure_is_only_logged(hass, clients, env):
    admin = clients["admin"]
    await _kid_done(admin, await _setup_kid_task(admin))
    pid = next(iter(_data(hass)["pending"]))

    @callback
    def _boom(call):
        raise RuntimeError("offline")

    hass.services.async_register("notify", "anna_push", _boom)
    assert (await _call(admin, "family_mission/approve", pending_id=pid))["result"]["success"]
    assert len(_clears(env, "ben")) == 1


async def test_no_reminder_after_handled(hass, clients, env, freezer):
    admin = clients["admin"]
    await _kid_done(admin, await _setup_kid_task(admin))
    pid = next(iter(_data(hass)["pending"]))
    await _async_handle_push_action(hass, f"FM_NOTDONE_{pid}")
    await _tick(hass, freezer, NOON + timedelta(hours=6))
    assert _pushes(env) == (1, 1)


async def test_redemption_resolve_clears_reward_push(hass, clients, env):
    admin = clients["admin"]
    await _setup_kid_task(admin)
    _data(hass)["wallet"] = {CLARA: 50}
    hass.config_entries.async_update_entry(env["entry"], options={
        **env["entry"].options, "rewards": [{"id": "r1", "name": "Eis", "emoji": "🍦", "cost": 5}]})
    res = (await _call(admin, "family_mission/kid_redeem", kid_id=CLARA, pin="1234", reward_id="r1"))["result"]
    assert res["success"], res
    await hass.async_block_till_done()
    rid = next(iter(_data(hass)["redemptions"]))
    assert env["calls"]["anna"][-1].data["data"]["tag"] == f"family_mission_reward_{rid}"
    assert (await _call(clients["anna"], "family_mission/redemption_resolve", redemption_id=rid, approve=True))["result"]["success"]
    for who in ("anna", "ben"):
        assert _clears(env, who)[0]["data"]["tag"] == f"family_mission_reward_{rid}"
