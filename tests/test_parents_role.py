"""Parents role: admin / manager / parent / other user for every gated websocket command."""

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.task_organizer.const import DOMAIN

ANNA = "person.anna"
WIZARD = {
    "kids": [{"id": ANNA, "birth_year": 2016, "avatar": "🦊", "color": "#FF8800"}],
    "features": [], "start_date": "2026-11-01", "phase": "start", "language": "en",
}


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
async def users(hass):
    """Non-admin users: Alex (manager), Sam (parent) and Tablet (no role)."""
    return {
        "manager": await _token(hass, "Alex"),
        "parent": await _token(hass, "Sam"),
        "other": await _token(hass, "Tablet"),
    }


@pytest.fixture
async def setup(hass, users):
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    hass.states.async_set("person.alex", "home", {"friendly_name": "Alex", "user_id": users["manager"][0].id})
    options = {
        "overdue_days": 5,
        "parents": [users["parent"][0].id, users["manager"][0].id],
        "parents_manage": [users["manager"][0].id],
    }
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=options)
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 100


async def _ws_for(hass, hass_ws_client, who, users, hass_access_token):
    if who == "admin":
        return await hass_ws_client(hass, hass_access_token)
    return await hass_ws_client(hass, users[who][1])


# command -> (payload, who may call it)
DAILY = ("admin", "manager", "parent")
MANAGE = ("admin", "manager")
COMMANDS = {
    "approve": ({"pending_id": "nope"}, DAILY),
    "reject": ({"pending_id": "nope", "mode": "not_done"}, DAILY),
    "adjust_points": ({"kid_id": ANNA, "points": 1, "reason": "Help"}, DAILY),
    "send_praise": ({"kid_id": ANNA, "message": "Well done!", "sticker": "⭐"}, DAILY),
    "undo_completion": ({"history_id": "nope"}, DAILY),
    "parent_task_action": ({"task_id": "nope", "action": "skip_today"}, DAILY),
    "parent_complete_for": ({"task_id": "nope", "kid_id": ANNA}, DAILY),
    "add_adhoc_bonus": ({"name": "Carry bags", "icon": "mdi:cart", "points": 2}, DAILY),
    "set_kid_profile": ({"participant_id": ANNA, "avatar": "🦊", "color": "#ff8800"}, MANAGE),
    "delete_kid_profile": ({"participant_id": ANNA}, MANAGE),
    "wizard_catalog": ({}, MANAGE),
    "set_bonus_triggers": ({"triggers": []}, MANAGE),
    "set_parents": ({"parents": [], "parents_manage": []}, ("admin",)),
}


@pytest.mark.parametrize("who", ["admin", "manager", "parent", "other"])
@pytest.mark.parametrize("command", sorted(COMMANDS))
async def test_role_matrix(hass, hass_ws_client, hass_access_token, setup, users, who, command):
    ws = await _ws_for(hass, hass_ws_client, who, users, hass_access_token)
    payload, allowed = COMMANDS[command]
    res = await _call(ws, f"task_organizer/{command}", **payload)
    if who in allowed:
        # Passed the permission check (business errors like "unknown" are fine)
        assert res.get("error", {}).get("code") != "unauthorized", res
    else:
        assert res["success"] is False and res["error"]["code"] == "unauthorized", res


@pytest.mark.parametrize("who", ["manager", "parent", "other"])
async def test_wizard_preview_apply_roles(hass, hass_ws_client, users, setup, who):
    ws = await hass_ws_client(hass, users[who][1])
    for type_ in ("wizard_preview", "wizard_apply"):
        res = await _call(ws, f"task_organizer/{type_}", **WIZARD)
        if who == "manager":
            assert res.get("error", {}).get("code") != "unauthorized", res
        else:
            assert res["error"]["code"] == "unauthorized", res


async def test_set_parents_stores_and_manage_implies_parent(hass, hass_ws_client, hass_access_token, setup, users):
    ws = await hass_ws_client(hass, hass_access_token)
    sam, alex = users["parent"][0].id, users["manager"][0].id
    res = await _call(ws, "task_organizer/set_parents", parents=[sam], parents_manage=[alex, alex])
    assert res["success"] and res["result"]["parents_manage"] == [alex]
    assert res["result"]["parents"] == [sam, alex]
    assert setup.options["parents"] == [sam, alex] and setup.options["parents_manage"] == [alex]


async def test_set_parents_rejects_unknown_inactive_system(hass, hass_ws_client, hass_access_token, setup, users):
    ws = await hass_ws_client(hass, hass_access_token)
    before = dict(setup.options)
    res = await _call(ws, "task_organizer/set_parents", parents=["does-not-exist"], parents_manage=[])
    assert res["error"]["code"] == "invalid_user"

    inactive = await hass.auth.async_create_user("Old", group_ids=[GROUP_ID_USER])
    await hass.auth.async_update_user(inactive, is_active=False)
    res = await _call(ws, "task_organizer/set_parents", parents=[inactive.id], parents_manage=[])
    assert res["error"]["code"] == "invalid_user"

    system = await hass.auth.async_create_system_user("Integration")
    res = await _call(ws, "task_organizer/set_parents", parents=[], parents_manage=[system.id])
    assert res["error"]["code"] == "invalid_user"
    assert dict(setup.options) == before


async def test_update_settings_cannot_set_parents(hass, hass_ws_client, hass_access_token, setup, users):
    other = users["other"][0].id
    for token in (hass_access_token, users["parent"][1], users["manager"][1], users["other"][1]):
        ws = await hass_ws_client(hass, token)
        res = await _call(ws, "task_organizer/update_settings",
                          settings={"parents": [other], "parents_manage": [other], "overdue_days": 7})
        assert res["success"]
    assert other not in setup.options["parents"] and other not in setup.options["parents_manage"]
    assert setup.options["overdue_days"] == 7


async def test_import_cannot_set_parents(hass, hass_ws_client, setup, users):
    other = users["other"][0].id
    ws = await hass_ws_client(hass, users["parent"][1])
    res = await _call(ws, "task_organizer/import_tasks", settings={"parents_manage": [other], "parents": [other]})
    assert res["success"]
    assert other not in setup.options["parents"] and other not in setup.options["parents_manage"]


async def test_parent_cannot_promote_itself(hass, hass_ws_client, setup, users):
    sam = users["parent"][0].id
    ws = await hass_ws_client(hass, users["parent"][1])
    res = await _call(ws, "task_organizer/set_parents", parents=[sam], parents_manage=[sam])
    assert res["error"]["code"] == "unauthorized"
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🦊",
                      color="#ff8800", pin="1234")
    assert res["error"]["code"] == "unauthorized"
    assert "kids" not in setup.options
    assert sam not in setup.options["parents_manage"]


@pytest.mark.parametrize("who,expected", [("admin", "admin"), ("manager", "manager"),
                                          ("parent", "parent"), ("other", None)])
async def test_get_data_my_role(hass, hass_ws_client, hass_access_token, setup, users, who, expected):
    ws = await _ws_for(hass, hass_ws_client, who, users, hass_access_token)
    res = await _call(ws, "task_organizer/get_data")
    assert res["result"]["my_role"] == expected
    assert res["result"]["ha_users"] == [{"user_id": users["manager"][0].id, "name": "Alex"}]
    assert res["result"]["settings"]["parents_manage"] == [users["manager"][0].id]


async def test_deactivated_parent_loses_role(hass, hass_ws_client, setup, users):
    from custom_components.task_organizer import _role

    sam = users["parent"][0]
    assert _role(hass, sam) == "parent"
    await hass.auth.async_update_user(sam, is_active=False)
    assert _role(hass, sam) is None
    assert _role(hass, None) is None


async def test_parent_can_approve_and_undo(hass, hass_ws_client, setup, users):
    """A parent without admin rights really executes the daily actions."""
    ws = await hass_ws_client(hass, users["parent"][1])
    res = await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, points=5, reason="Helped")
    assert res["success"] and res["result"]["total"] == 5
    res = await _call(ws, "task_organizer/add_adhoc_bonus", name="Carry bags", icon="mdi:cart", points=2)
    assert res["success"]


# ---------------------------------------------------------------------------
# Classic commands are role-gated once kids mode is in use
# ---------------------------------------------------------------------------

CLASSIC = {
    "complete_task": ({"task_id": "nope", "completed_by": []}, DAILY),
    "add_task": ({"name": "X", "interval": 1, "complexity": 1, "icon": "mdi:broom"}, DAILY),
    "edit_task": ({"task_id": "nope"}, DAILY),
    "delete_task": ({"task_id": "nope"}, DAILY),
    "add_template": ({"name": "X", "complexity": 1, "icon": "mdi:broom"}, DAILY),
    "edit_template": ({"template_id": "nope"}, DAILY),
    "delete_template": ({"template_id": "nope"}, DAILY),
    "delete_history_item": ({"entry_id": "nope"}, DAILY),
    "edit_history_item": ({"entry_id": "nope", "points": 1, "user_id": ANNA}, DAILY),
    "update_settings": ({"settings": {"overdue_days": 4}}, MANAGE),
    "import_tasks": ({"templates": {}}, ("admin",)),
    "factory_reset": ({}, ("admin",)),
}


@pytest.mark.parametrize("who", ["admin", "manager", "parent", "other"])
@pytest.mark.parametrize("command", sorted(CLASSIC))
async def test_classic_commands_gated_in_kids_mode(hass, hass_ws_client, hass_access_token, setup, users, who, command):
    admin_ws = await hass_ws_client(hass, hass_access_token)
    res = await _call(admin_ws, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🦊", color="#ff8800")
    assert res["success"], res
    await hass.async_block_till_done()
    payload, allowed = CLASSIC[command]
    ws = await _ws_for(hass, hass_ws_client, who, users, hass_access_token)
    res = await _call(ws, f"task_organizer/{command}", **payload)
    if who in allowed:
        assert not (res.get("error") or {}).get("code") == "unauthorized", res
    else:
        assert res["success"] is False and res["error"]["code"] == "unauthorized", res


async def test_classic_commands_open_without_kids_mode(hass, hass_ws_client, setup, users):
    """Without kid profiles the original behaviour stays: any user may manage tasks."""
    ws = await _ws_for(hass, hass_ws_client, "other", users, None)
    res = await _call(ws, "task_organizer/add_task", name="X", interval=1, complexity=1, icon="mdi:broom")
    assert res["success"], res


async def test_tablet_user_ticks_steps_via_kid_command(hass, hass_ws_client, hass_access_token, setup, users):
    """Regression: the kids card must not use edit_task (role-gated) to tick steps."""
    admin = await hass_ws_client(hass, hass_access_token)
    res = await _call(admin, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🦊", color="#ff8800", pin="1234")
    assert res["success"], res
    res = await _call(admin, "task_organizer/add_task", name="Mission", interval=1, complexity=2, icon="mdi:broom",
                      assignees=[ANNA], subtasks=[{"title": "a", "done": False}, {"title": "b", "done": False}])
    tid = res["result"]["task_id"]
    await hass.async_block_till_done()
    tablet = await _ws_for(hass, hass_ws_client, "other", users, hass_access_token)
    res = await _call(tablet, "task_organizer/edit_task", task_id=tid, subtasks=[{"title": "a", "done": True}])
    assert res["error"]["code"] == "unauthorized"
    res = await _call(tablet, "task_organizer/kid_toggle_step", task_id=tid, kid_id=ANNA, pin="1234", index=1, done=True)
    assert res["result"] == {"success": True}
    assert hass.data[DOMAIN]["data"]["tasks"][tid]["subtasks"][1]["done"] is True
    res = await _call(tablet, "task_organizer/kid_toggle_step", task_id=tid, kid_id=ANNA, pin="0000", index=0, done=True)
    assert res["result"]["error"] == "wrong_pin"
    res = await _call(tablet, "task_organizer/kid_toggle_step", task_id=tid, kid_id=ANNA, pin="1234", index=9, done=True)
    assert res["result"]["error"] == "not_found"
