"""FamilyMission 2.3: built-in approval push (actions, switch, handler) and the approval flag of the quick-start catalog."""

from datetime import datetime, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import _async_handle_push_action
from custom_components.family_mission.const import DOMAIN
from custom_components.family_mission.kids_catalog import CATALOG

CLARA = "person.clara"
DAVID = "person.david"
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
    hass.states.async_set(DAVID, "home", {"friendly_name": "David"})
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


_call.n = 300


def _data(hass):
    return hass.data[DOMAIN]["data"]


async def _kid(admin, pid=CLARA, pin="1234"):
    res = await _call(admin, "family_mission/set_kid_profile", participant_id=pid,
                      avatar="🦊", color="#ff8800", pin=pin, birth_year=2016)
    assert res["success"], res


async def _task(admin, **kw):
    payload = {"name": "Zimmer", "interval": 1, "complexity": 4, "icon": "mdi:broom", "category": "basis",
               "assignees": [CLARA], "requires_approval": True}
    payload.update(kw)
    res = await _call(admin, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _kid_done(admin, tid, **kw):
    res = (await _call(admin, "family_mission/kid_complete_task", task_id=tid, kid_id=CLARA, pin="1234", **kw))["result"]
    assert res["success"] and res["pending"] is True, res
    return res


def _pushes(env):
    return len(env["calls"]["anna"]), len(env["calls"]["ben"])


def _pending_id(hass):
    (pid,) = _data(hass)["pending"]
    return pid


async def test_approval_push_with_actions(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    tid = await _task(admin)
    await _kid_done(admin, tid)
    await hass.async_block_till_done()
    pid = _pending_id(hass)
    assert _pushes(env) == (1, 1)                                      # every adult
    call = env["calls"]["anna"][0].data
    assert call["title"] == "✅ Clara is done" and call["message"] == "Zimmer (4 ⭐)"
    assert call["data"]["tag"] == f"family_mission_approval_{pid}"
    assert call["data"]["actions"] == [
        {"action": f"FM_APPROVE_{pid}", "title": "Approve"},
        {"action": f"FM_NOTDONE_{pid}", "title": "Not done"},
    ]
    assert "FM_CHEAT_" not in str(call)                                # cheating stays app-only


async def test_approval_push_can_be_switched_off(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    await _call(admin, "family_mission/update_settings", settings={"approval_push": False})
    await _kid_done(admin, await _task(admin))
    await hass.async_block_till_done()
    assert _pushes(env) == (0, 0) and len(_data(hass)["pending"]) == 1


async def test_approval_push_setting_validation(hass, clients, env):
    admin = clients["admin"]
    await _call(admin, "family_mission/update_settings", settings={"approval_push": False})
    assert env["entry"].options["approval_push"] is False
    await _call(admin, "family_mission/update_settings", settings={"approval_push": "no"})
    assert env["entry"].options["approval_push"] is True


async def test_push_approve_awards_points_and_second_tap_is_ignored(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    await _kid_done(admin, await _task(admin))
    pid = _pending_id(hass)
    await _async_handle_push_action(hass, f"FM_APPROVE_{pid}")
    assert _data(hass)["points"][CLARA] == 4.0 and not _data(hass)["pending"]
    await _async_handle_push_action(hass, f"FM_APPROVE_{pid}")        # second tap
    await _async_handle_push_action(hass, f"FM_NOTDONE_{pid}")        # already handled
    assert _data(hass)["points"][CLARA] == 4.0 and len(_data(hass)["history"]) == 1


async def test_push_not_done_makes_task_due_again(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    tid = await _task(admin)
    await _kid_done(admin, tid)
    pid = _pending_id(hass)
    await _async_handle_push_action(hass, f"FM_NOTDONE_{pid}")
    from homeassistant.util import dt as dt_util
    assert _data(hass)["points"].get(CLARA, 0) == 0 and not _data(hass)["pending"]
    assert dt_util.parse_datetime(_data(hass)["tasks"][tid]["due_date"]) <= dt_util.utcnow()
    await _async_handle_push_action(hass, f"FM_APPROVE_{pid}")        # late tap: nothing happens
    assert _data(hass)["points"].get(CLARA, 0) == 0


async def test_approval_push_names_all_helpers(hass, clients, env):
    admin = clients["admin"]
    await _kid(admin)
    await _kid(admin, DAVID, "5678")
    tid = await _task(admin, allow_together=True)
    await _kid_done(admin, tid, helpers=[{"kid_id": DAVID, "pin": "5678"}])
    await hass.async_block_till_done()
    assert env["calls"]["anna"][0].data["title"] == "✅ Clara & David are done"


# ---------------------------------------------------------------------------
# quick-start catalog flag
# ---------------------------------------------------------------------------

def test_catalog_flags():
    flagged = {e["key"] for e in CATALOG if e["requires_approval"]}
    assert flagged == {"room_blitz", "room_blitz_small", "room_deep"}


async def test_wizard_sets_flag_on_creation_and_keeps_parent_choice(hass, clients, env):
    admin = clients["admin"]
    base = {"kids": [{"id": CLARA, "birth_year": 2016, "avatar": "🦊", "color": "#FF7043", "pin": "1234"}],
            "features": [], "start_date": "2026-11-01", "phase": "start", "language": "de"}
    preview = (await _call(admin, "family_mission/wizard_preview", **base))["result"]
    flags = {t["catalog_key"]: t["requires_approval"] for t in preview["kids"][0]["tasks"]}
    assert flags["room_blitz"] is True and flags["room_deep"] is True and flags["morning"] is False
    res = await _call(admin, "family_mission/wizard_apply", **base)
    assert res["success"], res
    tasks = {t["wizard_key"]: t for t in _data(hass)["tasks"].values() if t.get("wizard_key")}
    flagged = [t for t in tasks.values() if t["requires_approval"]]
    assert {t["wizard_key"].split(":")[0] for t in flagged} <= {"room_blitz", "room_blitz_small", "room_deep"}
    assert flagged and any(not t["requires_approval"] for t in tasks.values())
    # parents switch the flag off; re-applying keeps their choice
    target = flagged[0]
    assert (await _call(admin, "family_mission/edit_task", task_id=target["id"], requires_approval=False))["success"]
    assert (await _call(admin, "family_mission/wizard_apply", **base, replace_existing=True))["success"]
    assert target["requires_approval"] is False
    # an old wizard task without the key gets the catalog value on re-apply
    del target["requires_approval"]
    assert (await _call(admin, "family_mission/wizard_apply", **base, replace_existing=True))["success"]
    assert target.get("requires_approval") is True
