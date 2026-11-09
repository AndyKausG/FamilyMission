"""FamilyMission 2.11: built-in info push when a kid finished a task without approval (setting ``completion_push``)."""

from datetime import datetime, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission.const import DOMAIN

CLARA = "person.clara"
DAVID = "person.david"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)     # Thu 11:00 local (US/Pacific, PDT)
NIGHT = datetime(2026, 10, 30, 5, 0, tzinfo=timezone.utc)     # Thu 22:00 local: night mode


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
async def env(hass):
    anna = await hass.auth.async_create_user("Anna", group_ids=[GROUP_ID_USER])
    ben = await hass.auth.async_create_user("Ben", group_ids=[GROUP_ID_USER])
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna.id})
    hass.states.async_set("person.ben", "home", {"friendly_name": "Ben", "user_id": ben.id})
    hass.states.async_set(CLARA, "home", {"friendly_name": "Clara"})
    hass.states.async_set(DAVID, "home", {"friendly_name": "David"})
    MockConfigEntry(domain="mobile_app", data={"user_id": ben.id, "device_name": "Ben Phone"}).add_to_hass(hass)

    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "overdue_days": 5,
        "parents": [anna.id],
        "parent_notify": {anna.id: "notify.anna_push"},
    })
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return {
        "entry": entry,
        "anna": async_mock_service(hass, "notify", "anna_push"),
        "ben": async_mock_service(hass, "notify", "mobile_app_ben_phone"),
    }


@pytest.fixture
async def admin(hass, hass_ws_client, env, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    return ws


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 500


async def _setup(admin, approval=False, together=False, push=True):
    for pid in (CLARA, DAVID):
        res = await _call(admin, "family_mission/set_kid_profile", participant_id=pid,
                          avatar="🦊", color="#ff8800", pin="1234", birth_year=2016)
        assert res["success"], res
    if push:
        res = await _call(admin, "family_mission/update_settings", settings={"completion_push": True})
        assert res["success"], res
    payload = {"name": "Tisch decken", "interval": 1, "complexity": 3, "icon": "mdi:table", "category": "basis",
               "assignees": [CLARA, DAVID], "requires_approval": approval}
    if together:
        payload["allow_together"] = True
    res = await _call(admin, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _done(hass, admin, tid, **kw):
    res = (await _call(admin, "family_mission/kid_complete_task", task_id=tid, kid_id=CLARA, pin="1234", **kw))["result"]
    assert res["success"], res
    await hass.async_block_till_done()
    return res


async def test_completion_push_to_every_adult(hass, admin, env):
    tid = await _setup(admin)
    await _done(hass, admin, tid)
    assert len(env["anna"]) == 1 and len(env["ben"]) == 1
    call = env["anna"][0].data
    assert call["title"] == "✔️ Clara finished"
    assert call["message"] == "Tisch decken (+3 ⭐)"
    assert "actions" not in str(call)


async def test_completion_push_off_by_default(hass, admin, env):
    tid = await _setup(admin, push=False)
    await _done(hass, admin, tid)
    assert env["anna"] == [] and env["ben"] == []


async def test_no_completion_push_for_approval_tasks(hass, admin, env):
    tid = await _setup(admin, approval=True)
    res = await _done(hass, admin, tid)
    assert res["pending"] is True
    # only the approval push, no extra info push
    assert len(env["anna"]) == 1 and env["anna"][0].data["title"].startswith("✅")


async def test_no_completion_push_at_night(hass, admin, env, freezer):
    tid = await _setup(admin)
    freezer.move_to(NIGHT)
    await _call(admin, "family_mission/parent_complete_for", task_id=tid, kid_id=CLARA)   # parent completion: never pushed
    assert env["anna"] == []
    from custom_components.family_mission import _async_push_completion
    assert await _async_push_completion(hass, [CLARA], "Tisch decken", 3) is False
    assert env["anna"] == [] and env["ben"] == []


async def test_completion_push_setting_validation(hass, admin, env):
    await _call(admin, "family_mission/update_settings", settings={"completion_push": True})
    assert env["entry"].options["completion_push"] is True
    await _call(admin, "family_mission/update_settings", settings={"completion_push": "yes"})
    assert env["entry"].options["completion_push"] is False
