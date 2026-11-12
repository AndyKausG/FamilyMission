"""FamilyMission 2.12: follow-up action (``on_done``) of a bonus trigger when its task is completed."""

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import _async_handle_push_action
from custom_components.family_mission.const import DOMAIN

CLARA = "person.clara"
KIDS = [{"id": CLARA, "birth_year": 2016, "avatar": "🦄", "color": "#AB47BC"}]
WIZARD = {"kids": KIDS, "features": ["dishwasher"], "start_date": "2026-11-01", "phase": "start", "language": "de"}
OPEN_KEY = "dishwasher_unload:open"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
async def entry(hass):
    hass.states.async_set(CLARA, "home", {"friendly_name": "Clara"})

    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"overdue_days": 5})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()

_call.n = 3000


def _data(hass):
    return hass.data[DOMAIN]["data"]


async def _bonus(ws, **kw):
    payload = {"name": "Spülmaschine ausräumen", "interval": 365, "complexity": 3, "icon": "mdi:star",
               "category": "bonus", "custom_due_date": "2099-01-01T00:00:00"}
    payload.update(kw)
    res = await _call(ws, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _set(ws, hass, *triggers):
    res = await _call(ws, "family_mission/set_bonus_triggers", triggers=list(triggers))
    await hass.async_block_till_done()
    return res


async def _complete(ws, hass, task_id):
    res = await _call(ws, "family_mission/complete_task", task_id=task_id, completed_by=[CLARA])
    assert res["success"], res
    await hass.async_block_till_done()


async def test_done_action_starts_script_once(hass, hass_ws_client, entry):
    ws = await hass_ws_client(hass)
    script = async_mock_service(hass, "script", "turn_on")
    tid = await _bonus(ws)
    other = await _bonus(ws, name="Anderer Bonus")
    # two triggers of the same task with the same action: started once
    res = await _set(
        ws, hass,
        {"task_id": tid, "entity_id": "sensor.dishwasher", "to_state": "finished", "on_done": "script.light_off"},
        {"task_id": tid, "entity_id": "input_boolean.x", "to_state": "on", "on_done": "script.light_off"},
        {"task_id": other, "entity_id": "input_boolean.y", "to_state": "on"},
    )
    assert res["success"]
    assert entry.options["bonus_triggers"][0]["on_done"] == "script.light_off"
    assert "on_done" not in entry.options["bonus_triggers"][2]

    await _complete(ws, hass, other)          # a task without follow-up action
    assert script == []
    await _complete(ws, hass, tid)
    assert len(script) == 1 and script[0].data == {"entity_id": "script.light_off"}
    assert _data(hass)["points"][CLARA] == 6.0


@pytest.mark.parametrize("entity_id, domain, service", [
    ("automation.vacuum", "automation", "trigger"),
    ("scene.kitchen", "scene", "turn_on"),
    ("button.reset", "button", "press"),
    ("input_button.reset", "input_button", "press"),
])
async def test_done_action_domains(hass, hass_ws_client, entry, entity_id, domain, service):
    ws = await hass_ws_client(hass)
    calls = async_mock_service(hass, domain, service)
    tid = await _bonus(ws)
    assert (await _set(ws, hass, {"task_id": tid, "entity_id": "input_boolean.x", "to_state": "on",
                                  "on_done": entity_id}))["success"]
    await _complete(ws, hass, tid)
    assert [c.data for c in calls] == [{"entity_id": entity_id}]


async def test_done_action_validation(hass, hass_ws_client, entry):
    ws = await hass_ws_client(hass)
    tid = await _bonus(ws)
    base = {"task_id": tid, "entity_id": "input_boolean.x", "to_state": "on"}
    for bad in ("switch.plug", "light.kitchen", "not an entity", "script."):
        res = await _set(ws, hass, {**base, "on_done": bad})
        assert res["error"]["code"] == "invalid_done_action", bad
    assert "bonus_triggers" not in entry.options
    # empty / null: no action, nothing stored
    assert (await _set(ws, hass, {**base, "on_done": ""}, {**base, "on_done": None}))["success"]
    assert entry.options["bonus_triggers"] == [base, base]


async def test_missing_service_or_failing_action_does_not_break_completion(hass, hass_ws_client, entry):
    ws = await hass_ws_client(hass)
    tid = await _bonus(ws)
    assert (await _set(ws, hass, {**{"task_id": tid, "entity_id": "input_boolean.x", "to_state": "on"},
                                  "on_done": "script.gone"}))["success"]
    await _complete(ws, hass, tid)            # no script integration at all
    assert _data(hass)["points"][CLARA] == 3.0

    async def _boom(call):
        raise RuntimeError("boom")

    hass.services.async_register("script", "turn_on", _boom)
    _data(hass)["tasks"][tid]["due_date"] = "2020-01-01T00:00:00+00:00"
    await _complete(ws, hass, tid)
    assert _data(hass)["points"][CLARA] == 6.0


async def test_with_approval_the_action_runs_on_approval(hass, hass_ws_client, entry):
    ws = await hass_ws_client(hass)
    script = async_mock_service(hass, "script", "turn_on")
    res = await _call(ws, "family_mission/set_kid_profile", participant_id=CLARA,
                      avatar="🦊", color="#ff8800", pin="1234", birth_year=2016)
    assert res["success"], res
    tid = await _bonus(ws, requires_approval=True, custom_due_date="2020-01-01T00:00:00")
    assert (await _set(ws, hass, {"task_id": tid, "entity_id": "input_boolean.x", "to_state": "on",
                                  "on_done": "script.light_off"}))["success"]
    res = (await _call(ws, "family_mission/kid_complete_task", task_id=tid, kid_id=CLARA, pin="1234"))["result"]
    assert res["success"] and res["pending"] is True, res
    await hass.async_block_till_done()
    assert script == []
    (pid,) = _data(hass)["pending"]
    await _async_handle_push_action(hass, f"FM_APPROVE_{pid}")
    await hass.async_block_till_done()
    assert len(script) == 1


async def test_wizard_task_and_rerun_keep_the_action(hass, hass_ws_client, entry):
    ws = await hass_ws_client(hass)
    script = async_mock_service(hass, "script", "turn_on")
    trig = {"wizard_key": OPEN_KEY, "entity_id": "sensor.dishwasher_program", "to_state": "finished"}
    assert (await _call(ws, "family_mission/wizard_apply", **WIZARD, device_triggers=[trig]))["success"]
    assert (await _set(ws, hass, {**trig, "on_done": "script.light_off"}))["success"]

    # the wizard does not know on_done: running it again keeps the action
    assert (await _call(ws, "family_mission/wizard_apply", **WIZARD, device_triggers=[trig]))["success"]
    await hass.async_block_till_done()
    assert entry.options["bonus_triggers"] == [{**trig, "on_done": "script.light_off"}]
    # another entity is a new trigger: the action is not carried over
    moved = {**trig, "entity_id": "sensor.other"}
    assert (await _call(ws, "family_mission/wizard_apply", **WIZARD, device_triggers=[moved]))["success"]
    await hass.async_block_till_done()
    assert entry.options["bonus_triggers"] == [moved]

    assert (await _set(ws, hass, {**trig, "on_done": "script.light_off"}))["success"]
    (task,) = [t for t in _data(hass)["tasks"].values() if t.get("wizard_key") == OPEN_KEY]
    await _complete(ws, hass, task["id"])
    assert len(script) == 1
