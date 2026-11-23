"""FamilyMission 2.16: pictures of mission steps (catalog map in get_data, own picture per step)."""

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission import _wizard_update_task, kids_catalog
from custom_components.family_mission.const import DOMAIN


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 900


@pytest.fixture
async def ws(hass, hass_ws_client):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return await hass_ws_client(hass)


async def test_get_data_has_catalog_step_pictures(hass, ws):
    res = await _call(ws, "family_mission/get_data")
    mp = res["result"]["step_emoji"]
    assert mp["zähne putzen"] == "🪥" and mp["clear the floor"] == "🧸"


async def test_step_picture_validated_on_add_and_edit(hass, ws):
    res = await _call(ws, "family_mission/add_task", name="Mission", interval=1, complexity=3, icon="mdi:star",
                      subtasks=[{"title": "Zähne", "done": False, "emoji": "🦷"},
                                {"title": "Böse", "done": False, "emoji": "<script>"}])
    assert res["success"], res
    tid = res["result"]["task_id"]
    subs = hass.data[DOMAIN]["data"]["tasks"][tid]["subtasks"]
    assert subs[0]["emoji"] == "🦷" and "emoji" not in subs[1]
    res = await _call(ws, "family_mission/edit_task", task_id=tid,
                      subtasks=[{"title": "Zähne", "done": False, "emoji": "x" * 40}])
    assert res["success"], res
    assert "emoji" not in hass.data[DOMAIN]["data"]["tasks"][tid]["subtasks"][0]


def test_wizard_refresh_keeps_chosen_pictures():
    task = {"subtasks": [{"title": "Zähne putzen", "done": True, "emoji": "🦷"}, {"title": "Alt", "emoji": "⭐"}],
            # only the steps come from the catalog in this test
            "customized": sorted(set(kids_catalog.CUSTOM_FIELDS) - {"subtasks"})}
    item = {"subtasks": [{"title": "Zähne putzen", "done": False}, {"title": "Neu", "done": False}],
            "name": "M", "points": 3}
    _wizard_update_task(task, item)
    assert task["subtasks"][0] == {"title": "Zähne putzen", "done": True, "emoji": "🦷"}
    assert task["subtasks"][1] == {"title": "Neu", "done": False}
