"""FamilyMission 2.6: family goal in percent (snapshot, ratchet, monthly reset, rocket, validation)."""

from datetime import datetime, timedelta, timezone

import pytest
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission import _async_check_monthly_reset, _rocket_check
from custom_components.family_mission.const import DOMAIN

ANNA, CLARA = "person.anna", "person.clara"
PIN = "1234"
THU = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)      # Thu 11:00 local, 3 days left in October
NOV1 = datetime(2026, 11, 1, 18, 0, tzinfo=timezone.utc)      # Sun 10:00 local (PST)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


@pytest.fixture
async def setup(hass):
    for pid, name in ((ANNA, "Anna"), (CLARA, "Clara")):
        hass.states.async_set(pid, "home", {"friendly_name": name})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"overdue_days": 5})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 800


@pytest.fixture
async def ws(hass, hass_ws_client, setup, freezer):
    client = await hass_ws_client(hass)
    freezer.move_to(THU)
    data = hass.data[DOMAIN]["data"]
    data["current_month"] = dt_util.now().strftime("%Y-%m")
    data["current_period_start"] = dt_util.as_utc(dt_util.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)).isoformat()
    res = await _call(client, "family_mission/set_kid_profile", participant_id=ANNA, avatar="🦊", color="#ff8800", pin=PIN, birth_year=2014)
    assert res["success"], res
    return client


async def _add(ws, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 10, "icon": "mdi:broom", "category": "basis", "assignees": [ANNA]}
    payload.update(kw)
    res = await _call(ws, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _goal(ws, **kw):
    res = await _call(ws, "family_mission/update_settings", settings={"family_goal": {"points": 0, "reward": "Zoo", **kw}})
    assert res["success"], res
    return res


async def _info(ws):
    return (await _call(ws, "family_mission/get_data"))["result"]["family_goal_info"]


def _data(hass):
    return hass.data[DOMAIN]["data"]


async def test_points_mode_is_unchanged(hass, ws):
    await _goal(ws, points=40)
    info = await _info(ws)
    assert info["mode"] == "points" and info["target"] == 40 and info["snapshot"] is None
    assert "goal_snapshot" not in _data(hass)


async def test_snapshot_is_created_pro_rata_when_percent_mode_is_switched_on(hass, ws):
    await _add(ws)
    await _add(ws)
    await _goal(ws, mode="percent", percent=50)
    snap = _data(hass)["goal_snapshot"]
    assert snap["period"] == "2026-10" and snap["possible"] == 60.0       # 2 tasks x 10 x Oct 29-31
    assert snap["percent"] == 50 and snap["target"] == 30
    info = await _info(ws)
    assert info["mode"] == "percent" and info["target"] == 30 and info["snapshot"]["possible"] == 60.0
    assert info["next"]["period"] == "2026-11" and info["next"]["possible"] == 600.0 and info["next"]["target"] == 300


async def test_adding_tasks_and_raising_the_percent_never_raise_the_target(hass, ws):
    await _add(ws)
    await _add(ws)
    await _goal(ws, mode="percent", percent=50)
    assert _data(hass)["goal_snapshot"]["target"] == 30
    await _add(ws)
    assert (await _info(ws))["target"] == 30
    await _goal(ws, mode="percent", percent=100)
    info = await _info(ws)
    assert info["target"] == 30 and info["snapshot"]["percent"] == 50
    assert info["next"]["percent"] == 100 and info["next"]["target"] == 900     # applies next period


async def test_removing_a_task_lowers_the_target(hass, ws):
    a = await _add(ws)
    b = await _add(ws)
    await _goal(ws, mode="percent", percent=50)
    assert (await _info(ws))["target"] == 30
    assert (await _call(ws, "family_mission/delete_task", task_id=b))["success"]
    info = await _info(ws)
    assert info["target"] == 15 and info["snapshot"]["possible"] == 30.0
    await _add(ws)                                                              # adding again: stays 15
    assert (await _info(ws))["target"] == 15
    assert a in _data(hass)["tasks"]


async def test_lowering_the_percent_applies_immediately(hass, ws):
    await _add(ws)
    await _add(ws)
    await _goal(ws, mode="percent", percent=50)
    await _goal(ws, mode="percent", percent=25)
    info = await _info(ws)
    assert info["target"] == 15 and info["snapshot"]["percent"] == 25
    await _goal(ws, mode="percent", percent=75)                                 # back up: this period stays at 25 %
    assert (await _info(ws))["target"] == 15


async def test_switching_back_to_points_drops_the_snapshot(hass, ws):
    await _add(ws)
    await _goal(ws, mode="percent", percent=50)
    assert "goal_snapshot" in _data(hass)
    await _goal(ws, points=25)
    assert "goal_snapshot" not in _data(hass) and (await _info(ws))["target"] == 25


async def test_monthly_reset_creates_a_new_snapshot_with_the_current_percent(hass, ws, freezer):
    await _add(ws)
    await _add(ws)
    await _goal(ws, mode="percent", percent=50)
    await _goal(ws, mode="percent", percent=25)                                 # lowered in October
    await _goal(ws, mode="percent", percent=60)                                 # wanted 60 % from November on
    freezer.move_to(NOV1)
    await _async_check_monthly_reset(hass)
    snap = _data(hass)["goal_snapshot"]
    assert snap["period"] == "2026-11" and snap["from"] == "2026-11-01"
    assert snap["possible"] == 600.0 and snap["percent"] == 60 and snap["target"] == 360


async def test_rocket_uses_the_effective_target(hass, ws):
    a = await _add(ws)
    b = await _add(ws)
    await _goal(ws, mode="percent", percent=30)                                 # 30 % of 60 = 18 -> 20
    assert _data(hass)["goal_snapshot"]["target"] == 20
    kid = lambda tid: _call(ws, "family_mission/kid_complete_task", task_id=tid, kid_id=ANNA, pin=PIN)
    assert (await kid(a))["success"]
    assert _data(hass).get("rocket") is None
    # the target drops to 10 (one task removed): the 10 points earned so far are enough
    assert (await _call(ws, "family_mission/delete_task", task_id=b))["success"]
    assert _rocket_check(hass, _data(hass)) is not None
    rocket = _data(hass)["rocket"]
    assert rocket["period"] == "2026-10"
    await _add(ws)                                                              # reached once: never taken back
    assert (await _info(ws))["target"] == 10 and _data(hass)["rocket"] is rocket


async def test_rocket_needs_the_target_in_percent_mode(hass, ws):
    a = await _add(ws)
    b = await _add(ws)
    await _goal(ws, mode="percent", percent=30)
    for tid in (a, b):
        assert (await _call(ws, "family_mission/kid_complete_task", task_id=tid, kid_id=ANNA, pin=PIN))["success"]
        if tid == a:
            assert _data(hass).get("rocket") is None
    assert _data(hass)["rocket"]["period"] == "2026-10"


async def test_validation(hass, ws):
    cases = [
        (dict(mode="bogus", percent=5, points="x"), ("points", 75, 0)),
        (dict(mode="percent", percent=200), ("percent", 75, 0)),
        (dict(mode="percent", percent=10), ("percent", 10, 0)),
        (dict(mode="percent", percent=150, points=12), ("percent", 150, 12)),
        (dict(mode="percent", percent="abc"), ("percent", 75, 0)),
    ]
    for kw, (mode, percent, points) in cases:
        await _goal(ws, **kw)
        stored = hass.config_entries.async_entries(DOMAIN)[0].options["family_goal"]
        assert (stored["mode"], stored["percent"], stored["points"]) == (mode, percent, points), kw
    res = await _call(ws, "family_mission/update_settings", settings={"family_goal": "nonsense"})
    assert res["success"]
    stored = hass.config_entries.async_entries(DOMAIN)[0].options["family_goal"]
    assert stored["mode"] == "points" and stored["percent"] == 75


async def test_skipped_day_lowers_the_target(hass, ws):
    a = await _add(ws)
    await _add(ws)
    await _goal(ws, mode="percent", percent=100)                                # P = 60 -> 60
    assert (await _info(ws))["target"] == 60
    res = await _call(ws, "family_mission/parent_task_action", task_id=a, action="skip_today")
    assert res["success"], res
    info = await _info(ws)
    assert info["target"] == 50 and info["snapshot"]["possible"] == 50.0
