"""FamilyMission 2.0: parents' tasks (catalog, apply, done, undo, handover, rollover, reminders, summary)."""

from datetime import date, datetime, timedelta, timezone

import pytest
from homeassistant.core import callback
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import (
    _async_check_planning_reminders,
    _async_check_reminders,
    _async_check_weekly_summary,
    _async_expire_missed,
    _async_handle_push_action,
    _async_rollover_parent_tasks,
    _local_day_of,
    _skip_duties_for,
)
from custom_components.family_mission.const import DOMAIN

CLARA = "person.clara"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)                 # Thu 11:00 local (US/Pacific, PDT)
SUNDAY_1759 = datetime(2026, 11, 2, 1, 59, tzinfo=timezone.utc)           # Sun Nov 1, 17:59 local (PST)
SUNDAY_1800 = datetime(2026, 11, 2, 2, 0, tzinfo=timezone.utc)            # 18:00 local
SUNDAY_1905 = datetime(2026, 11, 2, 3, 5, tzinfo=timezone.utc)            # 19:05 local


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
    """Anna (parent role, push via parent_notify), Ben (adult without a role, companion app), Clara (kid), Sam (nobody)."""
    anna = await _token(hass, "Anna")
    ben = await _token(hass, "Ben")
    sam = await _token(hass, "Sam")
    david = await _token(hass, "David")                  # a kid WITH a Home Assistant user
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set("person.ben", "home", {"friendly_name": "Ben", "user_id": ben[0].id})
    hass.states.async_set("person.david", "home", {"friendly_name": "David", "user_id": david[0].id})
    hass.states.async_set(CLARA, "home", {"friendly_name": "Clara"})
    MockConfigEntry(domain="mobile_app", data={"user_id": ben[0].id, "device_name": "Ben Phone"}).add_to_hass(hass)
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "overdue_days": 5,
        "parents": [anna[0].id],
        "parent_notify": {anna[0].id: "notify.anna_push"},
        "kids": {david[0].id: {"avatar": "🐯", "color": "#42A5F5", "birth_year": 2018}},
    })
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    calls = {
        "anna": async_mock_service(hass, "notify", "anna_push"),
        "ben": async_mock_service(hass, "notify", "mobile_app_ben_phone"),
    }
    return {"anna": anna, "ben": ben, "sam": sam, "david": david, "entry": entry, "calls": calls}


@pytest.fixture
async def clients(hass, hass_ws_client, env, freezer):
    """Websocket clients of all users. They connect first (tokens are issued at the real time), then the clock moves."""
    result = {
        "admin": await hass_ws_client(hass),
        "anna": await hass_ws_client(hass, env["anna"][1]),
        "ben": await hass_ws_client(hass, env["ben"][1]),
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


def _data(hass):
    return hass.data[DOMAIN]["data"]


async def test_adult_quick_add_and_postpone(hass, env, clients, freezer):
    """A non-admin parent adds a dated to-do for herself, sees it in get_data and postpones it."""
    anna = clients["anna"]
    res = await _call(anna, "family_mission/parent_task_add", name="BAfoeG-Unterlagen", interval=0,
                      planning=False, mode="me", due_date="2026-11-28", due_time="09:15")
    assert res["success"], res
    task_id = res["result"]["task_id"]
    data = await _call(anna, "family_mission/get_data")
    task = data["result"]["tasks"][task_id]
    assert task["parent_task"] and task["assignees"] == [env["anna"][0].id]
    assert task["due_date"].startswith("2026-11-28") or task["due_date"].startswith("2026-11-27")
    assert task["dated"] and task["due_time"] == "09:15" and task["interval"] == 0
    res = await _call(anna, "family_mission/parent_task_add", name="Irgendwann", interval=0, planning=False, mode="me")
    sid = res["result"]["task_id"]
    assert _data(hass)["tasks"][sid]["someday"] and _data(hass)["tasks"][sid]["due_date"] is None
    res = await _call(anna, "family_mission/parent_task_postpone", task_id=sid)
    assert res["success"] and res["result"]["due_date"] == "2026-10-30"
    assert _data(hass)["tasks"][sid]["dated"]


async def test_adult_without_role_is_rejected(hass, env, clients):
    """An adult without a parents' role gets a clear unauthorized error (the card shows a toast)."""
    res = await _call(clients["ben"], "family_mission/parent_task_add", name="x", interval=0, planning=False, mode="me")
    assert not res["success"] and res["error"]["code"] == "unauthorized"
