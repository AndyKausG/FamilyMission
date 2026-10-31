"""Integration tests for the kids mode websocket API (needs the HA test harness)."""

from datetime import timedelta
from unittest.mock import patch

import pytest
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.task_organizer.const import DOMAIN
from custom_components.task_organizer.kids import PinLimiter

ANNA = "person.anna"          # no HA user
BEN = "person.ben"            # has HA user "user-ben"
BEN_ID = "user-ben"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable loading of custom_components in every test."""
    yield


def _fake_http(hass):
    """The integration registers static paths; the test config has no http server."""
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


@pytest.fixture
async def setup(hass):
    """Set up the integration with two persons (one without HA user)."""
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    hass.states.async_set(BEN, "home", {"friendly_name": "Ben", "user_id": BEN_ID})
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

_call.n = 1


async def _make_kid(ws, pid, pin="1234", birth_year=2016, **kw):
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id=pid, avatar="🦊",
                      color="#ff8800", birth_year=birth_year, pin=pin, **kw)
    assert res["success"], res
    return res


async def _add_task(ws, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 4, "icon": "mdi:broom", "category": "basis"}
    payload.update(kw)
    res = await _call(ws, "task_organizer/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def test_get_data_never_leaks_hashes(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234")
    await hass.async_block_till_done()
    res = await _call(ws, "task_organizer/get_data")
    kids = res["result"]["settings"]["kids"]
    assert kids[ANNA]["has_pin"] is True
    assert "pin_hash" not in str(res["result"]) and "pin_salt" not in str(res["result"])
    # ... but it is stored (hashed, never in clear text)
    stored = setup.options["kids"][ANNA]
    assert stored["pin_hash"] and stored["pin_salt"] and "1234" not in str(stored)
    # settings sensor attributes do not leak either
    ent_id = er.async_get(hass).async_get_entity_id("sensor", DOMAIN, "task_organizer_settings")
    state = hass.states.get(ent_id)
    assert state is not None
    assert "pin_hash" not in str(state.attributes) and "pin_salt" not in str(state.attributes)
    assert state.attributes["kids"][ANNA]["has_pin"] is True


async def test_set_kid_profile_requires_admin_and_validates(hass, hass_ws_client, hass_read_only_access_token, setup):
    user_ws = await hass_ws_client(hass, hass_read_only_access_token)
    res = await _call(user_ws, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🦊",
                      color="#ff0000", birth_year=2016)
    assert res["error"]["code"] == "unauthorized"
    res = await _call(user_ws, "task_organizer/delete_kid_profile", participant_id=ANNA)
    assert res["error"]["code"] == "unauthorized"
    assert "kids" not in setup.options

    ws = await hass_ws_client(hass)
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🦊",
                      color="red;x", birth_year=2016)
    assert res["error"]["code"] == "invalid_color"
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🦊",
                      color="#ff0000", birth_year=2016, pin="12a4")
    assert res["error"]["code"] == "invalid_pin"
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id="person.nobody", avatar="🦊",
                      color="#ff0000", birth_year=2016)
    assert res["error"]["code"] == "unknown_person"


async def test_pin_kept_when_empty_and_cleared(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234")
    first = setup.options["kids"][ANNA]["pin_hash"]
    await _make_kid(ws, ANNA, pin="", birth_year=2015)          # empty pin keeps the old one
    assert setup.options["kids"][ANNA]["pin_hash"] == first
    assert setup.options["kids"][ANNA]["birth_year"] == 2015
    await _make_kid(ws, ANNA, pin=None, clear_pin=True)
    assert "pin_hash" not in setup.options["kids"][ANNA]
    res = await _call(ws, "task_organizer/delete_kid_profile", participant_id=ANNA)
    assert res["success"] and ANNA not in setup.options["kids"]


async def test_update_settings_cannot_overwrite_kids(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234")
    h = setup.options["kids"][ANNA]["pin_hash"]
    res = await _call(ws, "task_organizer/update_settings",
                      settings={"overdue_days": 9, "kids": {ANNA: {"pin_hash": "x", "avatar": "x"}}})
    assert res["success"]
    assert setup.options["overdue_days"] == 9
    assert setup.options["kids"][ANNA]["pin_hash"] == h


async def test_import_kids_admin_only_and_keeps_hash(hass, hass_ws_client, hass_read_only_access_token, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234")
    h = setup.options["kids"][ANNA]["pin_hash"]
    incoming = {"kids": {ANNA: {"avatar": "🐼", "color": "#00ff00", "birth_year": 2014, "has_pin": True,
                                "pin_hash": "evil"}}}
    user_ws = await hass_ws_client(hass, hass_read_only_access_token)
    await _call(user_ws, "task_organizer/import_tasks", settings=incoming)
    assert setup.options["kids"][ANNA]["avatar"] == "🦊"
    await _call(ws, "task_organizer/import_tasks", settings=incoming)
    assert setup.options["kids"][ANNA]["avatar"] == "🐼"
    assert setup.options["kids"][ANNA]["pin_hash"] == h


async def test_verify_pin_and_lockout(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234")
    clock = {"t": 1000.0}
    hass.data[DOMAIN]["pin_limiter"] = PinLimiter(lambda: clock["t"])

    assert (await _call(ws, "task_organizer/kid_verify_pin", kid_id=ANNA, pin="1234"))["result"] == {"success": True}
    for _ in range(4):
        res = (await _call(ws, "task_organizer/kid_verify_pin", kid_id=ANNA, pin="0000"))["result"]
        assert res["error"] == "wrong_pin"
    res = (await _call(ws, "task_organizer/kid_verify_pin", kid_id=ANNA, pin="0000"))["result"]
    assert res["error"] == "locked"
    # even the right PIN is refused while locked ...
    res = (await _call(ws, "task_organizer/kid_verify_pin", kid_id=ANNA, pin="1234"))["result"]
    assert res["error"] == "locked"
    # ... and also for the other kid commands
    task_id = await _add_task(ws, assignees=[ANNA])
    res = (await _call(ws, "task_organizer/kid_complete_task", task_id=task_id, kid_id=ANNA, pin="1234"))["result"]
    assert res["error"] == "locked"
    clock["t"] += 61
    assert (await _call(ws, "task_organizer/kid_verify_pin", kid_id=ANNA, pin="1234"))["result"]["success"]
    # unknown kid
    res = (await _call(ws, "task_organizer/kid_verify_pin", kid_id=BEN, pin="1234"))["result"]
    assert res["error"] == "unknown_kid"


async def test_complete_task_for_person_without_user(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234")
    task_id = await _add_task(ws, assignees=[ANNA], complexity=4)

    res = (await _call(ws, "task_organizer/kid_complete_task", task_id=task_id, kid_id=ANNA, pin="0000"))["result"]
    assert res == {"success": False, "error": "wrong_pin", "attempts_left": 4}

    res = (await _call(ws, "task_organizer/kid_complete_task", task_id=task_id, kid_id=ANNA, pin="1234"))["result"]
    assert res["success"] and res["points"] == 4.0
    data = hass.data[DOMAIN]["data"]
    assert data["points"][ANNA] == 4.0
    assert data["history"][0]["user_id"] == ANNA
    # recurring: not due anymore -> a second tap is rejected
    res = (await _call(ws, "task_organizer/kid_complete_task", task_id=task_id, kid_id=ANNA, pin="1234"))["result"]
    assert res["error"] == "not_eligible"
    # name resolution for the person without user (leaderboard sensor)
    ent = er.async_get(hass).async_get_entity_id("sensor", DOMAIN, "task_organizer_leaderboard")
    await hass.async_block_till_done()
    assert hass.states.get(ent).state == "Anna"


async def test_complete_by_name_service_with_person_entity(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _add_task(ws, name="Müll", assignees=[], complexity=2)
    await hass.services.async_call(DOMAIN, "complete_task_by_name",
                                   {"task_name": "Müll", "user_id": ANNA}, blocking=True)
    await hass.services.async_call(DOMAIN, "add_task", {"name": "Spülen", "assignees": f"{ANNA},{BEN}"}, blocking=True)
    data = hass.data[DOMAIN]["data"]
    assert data["points"][ANNA] == 2.0
    spuelen = next(t for t in data["tasks"].values() if t["name"] == "Spülen")
    assert spuelen["assignees"] == [ANNA, BEN_ID]   # entity -> user_id when available


async def test_eligibility_errors(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234", birth_year=2018)       # 8 years old
    await _make_kid(ws, BEN_ID, pin="", birth_year=2012)         # no PIN, 14 years old
    data = hass.data[DOMAIN]["data"]

    async def complete(task_id, kid=ANNA, pin="1234"):
        return (await _call(ws, "task_organizer/kid_complete_task", task_id=task_id, kid_id=kid, pin=pin))["result"]

    # not assigned to this kid
    t = await _add_task(ws, assignees=[BEN_ID])
    assert (await complete(t))["error"] == "not_eligible"
    # kid without PIN accepted with any/no pin
    assert (await complete(t, kid=BEN_ID, pin=None))["success"]

    # too young
    t = await _add_task(ws, category="auftrag", min_age=10, assignees=[ANNA])
    assert (await complete(t))["error"] == "too_young"

    # not due (future) / paused
    t = await _add_task(ws, assignees=[ANNA], custom_due_date=(dt_util.now() + timedelta(days=3)).isoformat())
    assert (await complete(t))["error"] == "not_eligible"
    t2 = await _add_task(ws, assignees=[ANNA], paused_until=(dt_util.now() + timedelta(days=3)).date().isoformat())
    assert (await complete(t2))["error"] == "not_eligible"

    # unknown task
    assert (await complete("nope"))["error"] == "not_found"

    # Opt-in per bonus task: an open basis task blocks a "requires_routine" bonus
    basis = await _add_task(ws, name="Basis", assignees=[ANNA], category="basis")
    bonus = await _add_task(ws, name="Bonus", category="bonus", interval=365, requires_routine=True)
    assert (await complete(bonus))["error"] == "basis_open"
    assert (await _call(ws, "task_organizer/kid_claim_task", task_id=bonus, kid_id=ANNA, pin="1234"))["result"]["error"] == "basis_open"
    # ... a bonus without the opt-in is free and its points are booked at once
    free = await _add_task(ws, name="Free bonus", category="bonus", interval=365)
    before = data["points"].get(ANNA, 0)
    res = await complete(free)
    assert res["success"] and data["points"][ANNA] > before
    # completing the basis task unlocks bonus
    assert (await complete(basis))["success"]
    await hass.services.async_call(DOMAIN, "set_task_due_by_name", {"task_name": "Bonus"}, blocking=True)
    assert (await complete(bonus))["success"]
    assert data["points"][ANNA] > 0


async def test_claim_flow(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234", birth_year=2016)
    await _make_kid(ws, BEN_ID, pin="4321", birth_year=2014)
    await _call(ws, "task_organizer/update_settings", settings={"claim_minutes": 3})
    await hass.async_block_till_done()
    bonus = await _add_task(ws, name="Bonus", category="bonus", interval=365, min_age=6)

    res = (await _call(ws, "task_organizer/kid_claim_task", task_id=bonus, kid_id=ANNA, pin="1234"))["result"]
    assert res["success"]
    task = (await _call(ws, "task_organizer/get_data"))["result"]["tasks"][bonus]
    assert task["claimed_by"] == ANNA
    until = dt_util.parse_datetime(task["claimed_until"])
    assert timedelta(minutes=2) < until - dt_util.utcnow() <= timedelta(minutes=3)

    # the other kid is blocked while the claim is active
    res = (await _call(ws, "task_organizer/kid_complete_task", task_id=bonus, kid_id=BEN_ID, pin="4321"))["result"]
    assert res["error"] == "claimed"
    res = (await _call(ws, "task_organizer/kid_claim_task", task_id=bonus, kid_id=BEN_ID, pin="4321"))["result"]
    assert res["error"] == "claimed"

    # expired claim -> free again
    hass.data[DOMAIN]["data"]["tasks"][bonus]["claimed_until"] = (dt_util.utcnow() - timedelta(minutes=1)).isoformat()
    res = (await _call(ws, "task_organizer/kid_claim_task", task_id=bonus, kid_id=BEN_ID, pin="4321"))["result"]
    assert res["success"]

    # completing clears the claim
    res = (await _call(ws, "task_organizer/kid_complete_task", task_id=bonus, kid_id=BEN_ID, pin="4321"))["result"]
    assert res["success"]
    task = hass.data[DOMAIN]["data"]["tasks"][bonus]
    assert "claimed_by" not in task and "claimed_until" not in task


async def test_task_category_and_min_age_fields(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    t = await _add_task(ws, category="bonus", min_age=8)
    data = hass.data[DOMAIN]["data"]
    assert data["tasks"][t]["category"] == "bonus" and data["tasks"][t]["min_age"] == 8
    # legacy value from an old card is normalised
    t2 = await _add_task(ws, category="Allgemein")
    assert data["tasks"][t2]["category"] == "basis" and data["tasks"][t2]["min_age"] == 0
    assert (await _call(ws, "task_organizer/edit_task", task_id=t, min_age=19))["success"] is False   # schema range
    assert (await _call(ws, "task_organizer/edit_task", task_id=t, category="auftrag", min_age=12))["success"]
    assert data["tasks"][t]["category"] == "auftrag" and data["tasks"][t]["min_age"] == 12

    # templates + task from template
    res = await _call(ws, "task_organizer/add_template", name="Tpl", complexity=3, icon="mdi:broom",
                      category="bonus", min_age=9)
    assert res["success"]
    await hass.services.async_call(DOMAIN, "add_task", {"template": "Tpl"}, blocking=True)
    created = next(t for t in data["tasks"].values() if t["name"] == "Tpl")
    assert created["category"] == "bonus" and created["min_age"] == 9
    await hass.services.async_call(DOMAIN, "add_task", {"template": "Tpl", "name": "Over", "category": "auftrag", "min_age": 11}, blocking=True)
    over = next(t for t in data["tasks"].values() if t["name"] == "Over")
    assert over["category"] == "auftrag" and over["min_age"] == 11

    await hass.services.async_call(DOMAIN, "edit_task_by_name", {"task_name": "Over", "category": "bonus", "min_age": 7}, blocking=True)
    assert over["category"] == "bonus" and over["min_age"] == 7
    await hass.services.async_call(DOMAIN, "add_template", {"name": "Tpl2", "category": "auftrag", "min_age": 10}, blocking=True)
    await hass.services.async_call(DOMAIN, "edit_template_by_name", {"template_name": "Tpl2", "min_age": 12}, blocking=True)
    tpl2 = next(t for t in data["templates"].values() if t["name"] == "Tpl2")
    assert tpl2["category"] == "auftrag" and tpl2["min_age"] == 12
    res = await _call(ws, "task_organizer/edit_template", template_id=tpl2["id"], category="bonus")
    assert res["success"] and tpl2["category"] == "bonus"


async def test_startup_migration_is_additive(hass):
    """Old storage without category/min_age keeps working and gets defaults."""
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    old = {
        "tasks": {"t1": {"id": "t1", "name": "Old", "interval": 1, "complexity": 2, "category": "General",
                         "icon": "mdi:broom", "assignees": ["legacy-user"], "due_date": dt_util.utcnow().isoformat(),
                         "subtasks": []}},
        "points": {"legacy-user": 7.0}, "history": [], "settings": {}, "monthly_history": {},
        "current_month": dt_util.now().strftime("%Y-%m"), "templates": {"x": {"id": "x", "name": "Tmpl"}},
    }
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)

    _fake_http(hass)
    with patch("homeassistant.helpers.storage.Store.async_load", return_value=old):
        assert await hass.config_entries.async_setup(entry.entry_id)
    data = hass.data[DOMAIN]["data"]
    assert data["tasks"]["t1"]["category"] == "basis" and data["tasks"]["t1"]["min_age"] == 0
    assert data["templates"]["x"]["category"] == "basis"
    assert data["points"]["legacy-user"] == 7.0 and data["tasks"]["t1"]["assignees"] == ["legacy-user"]


async def test_monthly_reset_resolves_names_without_user(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    task_id = await _add_task(ws, assignees=[ANNA], complexity=3)
    await _make_kid(ws, ANNA, pin="")
    events = []
    hass.bus.async_listen("task_organizer_reset", lambda e: events.append(e))
    await _call(ws, "task_organizer/complete_task", task_id=task_id, completed_by=[ANNA])
    await hass.services.async_call(DOMAIN, "reset_monthly_points", {}, blocking=True)
    await hass.async_block_till_done()
    assert events and events[0].data["winner_name"] == "Anna"


async def test_kid_cannot_finish_with_open_steps(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, ANNA, pin="1234")
    t = await _add_task(ws, assignees=[ANNA], subtasks=[
        {"title": "a", "done": False}, {"title": "pill", "done": False, "optional": True}])
    res = (await _call(ws, "task_organizer/kid_complete_task", task_id=t, kid_id=ANNA, pin="1234"))["result"]
    assert res == {"success": False, "error": "steps_open"}
    data = hass.data[DOMAIN]["data"]
    data["tasks"][t]["subtasks"][0]["done"] = True       # optional step stays open
    res = (await _call(ws, "task_organizer/kid_complete_task", task_id=t, kid_id=ANNA, pin="1234"))["result"]
    assert res["success"] is True
