"""FamilyMission 2.6: backend parts of the "new task" flow - kids_catalog websocket, catalog_key, care step on hand-made missions."""

from datetime import datetime, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission.const import DOMAIN

MORNING = datetime(2026, 10, 29, 15, 0, tzinfo=timezone.utc)    # Thu 08:00 local (US/Pacific)
LENA = "person.lena"
PIN = "1234"


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


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 100


@pytest.fixture
async def env(hass, hass_ws_client, freezer):
    anna = await _token(hass, "Anna")      # parent (daily role, no management); the admin client manages
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set(LENA, "home", {"friendly_name": "Lena"})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"parents": [anna[0].id]})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    admin = await hass_ws_client(hass)
    anna_ws = await hass_ws_client(hass, anna[1])
    res = await _call(admin, "family_mission/set_kid_profile", participant_id=LENA, avatar="🦊",
                      color="#ff8800", birth_year=2016, pin=PIN)
    assert res["success"], res
    freezer.move_to(MORNING)
    return {"entry": entry, "admin": admin, "anna": anna_ws}


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _add(**kw):
    return {"name": "Morgen", "interval": 1, "complexity": 2, "icon": "mdi:weather-sunny", "assignees": [LENA], **kw}


async def _complete(env, task_id):
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=task_id, kid_id=LENA, pin=PIN)
    return res["result"]


# -- kids_catalog websocket ---------------------------------------------------

async def test_kids_catalog_is_localized_with_defaults(hass, env):
    res = await _call(env["admin"], "family_mission/kids_catalog")
    assert res["success"], res
    result = res["result"]
    entries = {e["key"]: e for e in result["entries"]}
    assert result["language"] in ("de", "en")
    morning = entries["morning"]
    assert morning["points"] == 2 and morning["interval"] == 1 and morning["category"] == "basis"
    assert morning["scope"] == "personal" and entries["trash"]["scope"] == "home"
    assert morning["available_from"] == "05:00" and morning["available_until"] == "10:00"
    assert morning["frequent"] is True and entries["windows"]["frequent"] is False
    assert all(set(s) == {"title"} and s["title"] for s in morning["subtasks"])
    # the household features hide entries that need one
    assert entries["dishwasher_load"]["available"] is True        # no wizard run: nothing is hidden


async def test_kids_catalog_needs_a_manager(hass, env):
    res = await _call(env["anna"], "family_mission/kids_catalog")
    assert res["error"]["code"] == "unauthorized"


# -- catalog_key ---------------------------------------------------------------

async def test_add_task_accepts_and_validates_catalog_key(hass, env):
    ok = await _call(env["admin"], "family_mission/add_task", **_add(catalog_key="morning"))
    task = _data(hass)["tasks"][ok["result"]["task_id"]]
    assert task["catalog_key"] == "morning"
    assert task["scope"] == "personal"            # derived from the catalog key

    bad = await _call(env["admin"], "family_mission/add_task", **_add(catalog_key="no_such_key"))
    assert bad["success"]
    assert "catalog_key" not in _data(hass)["tasks"][bad["result"]["task_id"]]
    assert _data(hass)["tasks"][bad["result"]["task_id"]]["scope"] == "home"

    chore = await _call(env["admin"], "family_mission/add_task", **_add(catalog_key="trash", scope="personal"))
    assert _data(hass)["tasks"][chore["result"]["task_id"]]["scope"] == "personal"    # an explicit scope wins


async def test_edit_task_keeps_and_changes_catalog_key(hass, env):
    created = await _call(env["admin"], "family_mission/add_task", **_add(catalog_key="evening"))
    tid = created["result"]["task_id"]
    await _call(env["admin"], "family_mission/edit_task", task_id=tid, name="Abend")
    assert _data(hass)["tasks"][tid]["catalog_key"] == "evening"
    await _call(env["admin"], "family_mission/edit_task", task_id=tid, catalog_key="morning")
    assert _data(hass)["tasks"][tid]["catalog_key"] == "morning"
    await _call(env["admin"], "family_mission/edit_task", task_id=tid, catalog_key=None)
    assert "catalog_key" not in _data(hass)["tasks"][tid]


async def test_template_takes_catalog_key(hass, env):
    res = await _call(env["admin"], "family_mission/add_template", name="Morgens", complexity=2,
                      icon="mdi:weather-sunny", catalog_key="morning")
    assert _data(hass)["templates"][res["result"]["template_id"]]["catalog_key"] == "morning"


# -- care step on hand-made missions --------------------------------------------

async def _set_care(env, entries):
    res = await _call(env["admin"], "family_mission/set_kid_profile", participant_id=LENA, avatar="🦊",
                      color="#ff8800", birth_year=2016, care=entries)
    assert res["success"], res


async def test_care_step_attaches_to_a_handmade_morning_task(hass, env):
    created = await _call(env["admin"], "family_mission/add_task", **_add(catalog_key="morning"))
    tid = created["result"]["task_id"]
    await _set_care(env, [{"id": "pill", "label": "Tablette", "emoji": "💊", "anchor": "morning"}])
    items = (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"][LENA]
    assert items[0]["mission_task_id"] == tid
    assert await _complete(env, tid) == {"success": False, "error": "steps_open"}
    res = await _call(env["admin"], "family_mission/kid_care_answer", kid_id=LENA, pin=PIN, care_id="pill", status="taken")
    assert res["result"]["success"]
    assert (await _complete(env, tid))["success"]


async def test_care_step_ignores_tasks_without_the_catalog_key(hass, env):
    created = await _call(env["admin"], "family_mission/add_task", **_add())          # hand-made, no key
    await _set_care(env, [{"id": "pill", "anchor": "morning"}])
    items = (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"][LENA]
    assert items[0]["mission_task_id"] is None
    # an evening task does not carry a morning entry
    await _call(env["admin"], "family_mission/add_task", **_add(catalog_key="evening", name="Abend"))
    items = (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"][LENA]
    assert items[0]["mission_task_id"] is None
    assert created["success"]


async def test_wizard_morning_task_still_carries_the_care_step(hass, env):
    start = _data(hass)["tasks"]
    start["wiz"] = {
        "id": "wiz", "name": "Morgen-Mission", "description": "", "area": "", "interval": 1, "assignees": [LENA],
        "complexity": 2, "category": "basis", "min_age": 0, "icon": "mdi:weather-sunny",
        "due_date": "2026-10-29T07:00:00+00:00", "paused_until": None, "override_overdue_days": None, "subtasks": [],
        "wizard_key": f"morning:{LENA}", "generated_by": "wizard",
    }
    await _set_care(env, [{"id": "pill", "anchor": "morning"}])
    items = (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"][LENA]
    assert items[0]["mission_task_id"] == "wiz"
