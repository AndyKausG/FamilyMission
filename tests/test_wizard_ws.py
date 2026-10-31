"""Integration tests for the kids quick-start wizard and the bonus triggers."""

import pytest
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.task_organizer.const import DOMAIN

ANNA, BEN, CLARA, DAVID = "person.anna", "person.ben", "person.clara", "person.david"
FEATURES = ["school", "dishwasher", "dryer", "washer", "robot_vacuum", "garden", "driveway"]
KIDS = [
    {"id": ANNA, "birth_year": 2014, "avatar": "🦊", "color": "#FF7043"},
    {"id": BEN, "birth_year": 2016, "avatar": "🐼", "color": "#42A5F5"},
    {"id": CLARA, "birth_year": 2017, "avatar": "🦄", "color": "#AB47BC"},
    {"id": DAVID, "birth_year": 2020, "avatar": "🦁", "color": "#FFCA28"},
]
BASE = {"kids": KIDS, "features": FEATURES, "start_date": "2026-11-01", "phase": "start", "language": "de"}


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


@pytest.fixture
async def setup(hass):
    """Neutral example family: four kids without HA user, two parents with user."""
    for pid, name in ((ANNA, "Anna"), (BEN, "Ben"), (CLARA, "Clara"), (DAVID, "David")):
        hass.states.async_set(pid, "home", {"friendly_name": name})
    hass.states.async_set("person.alex", "home", {"friendly_name": "Alex", "user_id": "u-alex"})
    hass.states.async_set("person.sam", "home", {"friendly_name": "Sam", "user_id": "u-sam"})
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

_call.n = 1000


async def _apply(ws, **kw):
    payload = {**BASE, **kw}
    return await _call(ws, "task_organizer/wizard_apply", **payload)


def _tasks(hass):
    return hass.data[DOMAIN]["data"]["tasks"]


def _by_key(hass):
    return {t["wizard_key"]: t for t in _tasks(hass).values() if t.get("wizard_key")}


async def test_wizard_is_admin_only(hass, hass_ws_client, hass_read_only_access_token, setup):
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    for type_, extra in (
        ("wizard_catalog", {}), ("wizard_preview", BASE), ("wizard_apply", BASE),
        ("set_bonus_triggers", {"triggers": []}),
    ):
        res = await _call(ws, f"task_organizer/{type_}", **extra)
        assert res["error"]["code"] == "unauthorized", type_
    assert _tasks(hass) == {}
    assert "kids" not in setup.options


async def test_catalog_and_preview(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    res = await _call(ws, "task_organizer/wizard_catalog")
    result = res["result"]
    assert len(result["features"]) == 8 and len(result["catalog"]) >= 25
    assert result["has_wizard_tasks"] is False and result["avatars"]

    res = await _call(ws, "task_organizer/wizard_preview", **BASE)
    proposal = res["result"]
    assert [k["name"] for k in proposal["kids"]] == ["Anna", "Ben", "Clara", "David"]
    assert proposal["goals"][ANNA] == 215 and proposal["family_goal"] == 650
    assert proposal["counts"] == {"tasks": 44, "bonus": 7, "templates": 4}
    assert {w["kid_id"] for w in proposal["warnings"]} == {CLARA, DAVID}
    assert not _tasks(hass)                      # preview never saves
    # gentle default selection: bigger chores are suggested off
    assert "dishwasher_load:person.anna" in proposal["suggested_excluded"]
    assert "morning:person.david" not in proposal["suggested_excluded"]

    res = await _call(ws, "task_organizer/wizard_preview", **{**BASE, "excluded": ["table_set:person.david"],
                                                                "language": "en"})
    assert res["result"]["counts"]["tasks"] == 43
    res = await _call(ws, "task_organizer/wizard_preview", **{**BASE, "kids": [{"id": "person.ghost", "birth_year": 2015}]})
    assert res["error"]["code"] == "unknown_person"
    res = await _call(ws, "task_organizer/wizard_preview", **{**BASE, "kids": [{"id": ANNA, "birth_year": 2015, "color": "red;x"}]})
    assert res["error"]["code"] == "invalid_color"


async def test_apply_creates_everything(hass, hass_ws_client, setup):
    created_events = []
    hass.bus.async_listen("task_organizer_task_created", lambda e: created_events.append(e.data["name"]))
    ws = await hass_ws_client(hass)
    res = await _apply(ws, goals={ANNA: 200}, family_goal={"points": 640, "reward": "Pizza-Abend"})
    assert res["success"], res
    assert res["result"] == {"success": True, "created": 44, "bonus": 7, "templates": 4,
                             "deleted": 0, "updated": 0, "skipped": 0, "triggers": 0}
    await hass.async_block_till_done()
    assert len(created_events) == 51

    tasks = _by_key(hass)
    morning = tasks["morning:person.anna"]
    assert morning["name"] == "Morgen-Mission Anna" and morning["assignees"] == [ANNA]
    assert morning["complexity"] == 2 and morning["interval"] == 1 and morning["category"] == "basis"
    assert morning["min_age"] == 6 and morning["generated_by"] == "wizard"
    assert [s["title"] for s in morning["subtasks"]] == ["Anziehen", "Bett machen", "Schlafanzug weg"]
    assert "room_blitz:person.david" not in tasks and "room_blitz_small:person.david" in tasks
    deep = tasks["room_deep:person.david"]
    assert [s["title"] for s in deep["subtasks"]] == ["Boden frei", "Regal ordnen", "Müll raus"]

    # rotation: staggered due dates, interval x n
    assert tasks["table_set:person.anna"]["interval"] == 4
    assert tasks["dishwasher_load:person.clara"]["interval"] == 3
    due = lambda k: dt_util.as_local(dt_util.parse_datetime(tasks[k]["due_date"])).date().isoformat()
    assert due("table_set:person.anna") == "2026-11-01" and due("table_set:person.david") == "2026-11-04"

    # open bonus: unassigned, not yet due
    bonus = tasks["dishwasher_unload:open"]
    assert bonus["assignees"] == [] and bonus["category"] == "bonus" and bonus["interval"] == 365
    assert due("dishwasher_unload:open") == "2027-11-01"

    # templates (Auftrag) only as templates
    templates = hass.data[DOMAIN]["data"]["templates"].values()
    assert {t["name"] for t in templates} == {"Beim Kochen helfen", "Auto aussaugen", "Fenster putzen",
                                              "Waschbecken im Bad putzen"}
    assert all(t["category"] == "auftrag" for t in templates)
    assert not any(t["category"] == "auftrag" for t in _tasks(hass).values())

    # settings
    opts = setup.options
    assert opts["point_goals"][ANNA] == 200 and opts["point_goals"][DAVID] == 170
    assert opts["family_goal"] == {"points": 640, "reward": "Pizza-Abend"}
    assert opts["kids"][ANNA]["birth_year"] == 2014 and opts["kids"][ANNA]["avatar"] == "🦊"
    assert opts["wizard"]["features"] == FEATURES and opts["wizard"]["phase"] == "start"
    assert opts["overdue_days"] == 5

    # the saved data reaches the frontend settings, without secrets
    res = await _call(ws, "task_organizer/get_data")
    assert res["result"]["settings"]["wizard"]["features"] == FEATURES
    assert res["result"]["settings"]["kids"][ANNA]["has_pin"] is False


async def test_apply_selection_and_point_overrides(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    selection = ["morning:person.anna", "table_set:person.anna", "table_set:person.ben",
                 "dishwasher_unload:open", "car:template"]
    res = await _apply(ws, selection=selection, points={"morning:person.anna": 4})
    assert res["success"], res
    assert res["result"]["created"] == 3 and res["result"]["bonus"] == 1 and res["result"]["templates"] == 1
    tasks = _by_key(hass)
    assert set(tasks) == set(selection) - {"car:template"}
    assert tasks["morning:person.anna"]["complexity"] == 4
    # rotation only among the selected kids
    assert tasks["table_set:person.anna"]["interval"] == 2
    assert tasks["table_set:person.ben"]["interval"] == 2
    assert setup.options["wizard"]["points"] == {"morning:person.anna": 4}
    assert "table_set:person.david" in setup.options["wizard"]["excluded"]


async def test_apply_validates_before_changing_anything(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    bad_pin = [{**KIDS[0], "pin": "12"}] + KIDS[1:]
    res = await _apply(ws, kids=bad_pin)
    assert res["error"]["code"] == "invalid_pin"
    res = await _apply(ws, kids=[{"id": "person.ghost", "birth_year": 2015}])
    assert res["error"]["code"] == "unknown_person"
    res = await _apply(ws, device_triggers=[{"wizard_key": "morning:person.anna", "entity_id": "sensor.x", "to_state": "on"}])
    assert res["error"]["code"] == "invalid_trigger"
    assert _tasks(hass) == {} and "kids" not in setup.options and "wizard" not in setup.options


async def test_pin_is_kept_and_set(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🐯",
                      color="#112233", birth_year=2014, pin="4711")
    assert res["success"]
    pin_hash = setup.options["kids"][ANNA]["pin_hash"]
    res = await _apply(ws)
    assert res["success"]
    assert setup.options["kids"][ANNA]["pin_hash"] == pin_hash          # kept
    assert setup.options["kids"][ANNA]["avatar"] == "🦊"                # wizard values win
    res = await _apply(ws, kids=[{**KIDS[1], "pin": "1111"}], replace_existing=True)
    assert res["success"] and setup.options["kids"][BEN]["pin_hash"]
    assert "1111" not in str(setup.options["kids"][BEN])


async def test_replace_existing_only_touches_wizard_tasks(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    manual = await _call(ws, "task_organizer/add_task", name="Morgen-Mission Anna", interval=1, complexity=3,
                         icon="mdi:broom", assignees=[ANNA])
    manual_id = manual["result"]["task_id"]
    assert (await _apply(ws))["success"]
    first_ids = {t["id"] for t in _tasks(hass).values() if t.get("wizard_key")}
    assert len(first_ids) == 51

    # earn points and history: must survive
    task = _by_key(hass)["morning:person.anna"]
    res = await _call(ws, "task_organizer/complete_task", task_id=task["id"], completed_by=[ANNA])
    assert res["success"]
    points_before = dict(hass.data[DOMAIN]["data"]["points"])
    history_before = list(hass.data[DOMAIN]["data"]["history"])
    assert points_before

    # without replace: duplicates are skipped
    res = await _apply(ws)
    assert res["result"]["created"] == 0 and res["result"]["bonus"] == 0 and res["result"]["skipped"] == 51
    assert len(_tasks(hass)) == 52

    # replace with only two kids: existing tasks are updated IN PLACE (same ids), only
    # rotation tasks that are no longer part of the plan are deleted, the rotations are re-staggered
    two = [KIDS[0], KIDS[1]]
    res = await _apply(ws, kids=two, replace_existing=True)
    assert res["success"], res
    assert res["result"]["deleted"] > 0 and res["result"]["updated"] > 0
    assert manual_id in _tasks(hass)                                      # manual task untouched
    wizard = [t for t in _tasks(hass).values() if t.get("generated_by") == "wizard"]
    assert {t["id"] for t in wizard} <= first_ids                         # nothing was recreated
    kept = {t["wizard_key"] for t in wizard}
    assert "morning:person.david" in kept and "table_set:person.david" not in kept
    assert "table_set:person.clara" not in kept
    assert _by_key(hass)["table_set:person.anna"]["interval"] == 2
    assert hass.data[DOMAIN]["data"]["points"] == points_before
    assert hass.data[DOMAIN]["data"]["history"] == history_before
    # templates were not duplicated
    assert len(hass.data[DOMAIN]["data"]["templates"]) == 4


async def test_replace_keeps_other_kids_non_rotation_tasks(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    assert (await _apply(ws))["success"]
    res = await _apply(ws, kids=[KIDS[0]], replace_existing=True)
    assert res["success"]
    tasks = _by_key(hass)
    assert "morning:person.david" in tasks and "room_deep:person.david" in tasks     # other kid kept
    assert "table_set:person.david" not in tasks                                      # no longer in the rotation
    assert tasks["table_set:person.anna"]["interval"] == 1


async def test_existing_templates_are_not_duplicated(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    res = await _call(ws, "task_organizer/add_template", name="auto aussaugen", complexity=3, icon="mdi:car")
    assert res["success"]
    res = await _apply(ws)
    assert res["result"]["templates"] == 3
    assert len(hass.data[DOMAIN]["data"]["templates"]) == 4


async def test_device_trigger_opens_bonus_task_and_fires_event(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    hass.states.async_set("sensor.dishwasher_program", "running", {"options": ["running", "finished"]})
    res = await _apply(ws, device_triggers=[
        {"wizard_key": "dishwasher_unload:open", "entity_id": "sensor.dishwasher_program", "to_state": "finished"}])
    assert res["success"] and res["result"]["triggers"] == 1
    await hass.async_block_till_done()
    assert setup.options["bonus_triggers"] == [
        {"wizard_key": "dishwasher_unload:open", "entity_id": "sensor.dishwasher_program", "to_state": "finished"}]
    # the settings reach the frontend
    res = await _call(ws, "task_organizer/get_data")
    assert res["result"]["settings"]["bonus_triggers"][0]["to_state"] == "finished"

    events = []
    hass.bus.async_listen("task_organizer_bonus_opened", lambda e: events.append(dict(e.data)))
    task = _by_key(hass)["dishwasher_unload:open"]
    assert dt_util.parse_datetime(task["due_date"]) > dt_util.utcnow()

    hass.states.async_set("sensor.dishwasher_program", "running", {"extra": 1})   # attribute change only
    hass.states.async_set("sensor.dishwasher_program", "pause")                   # other state
    await hass.async_block_till_done()
    assert events == []

    hass.states.async_set("sensor.dishwasher_program", "finished")
    await hass.async_block_till_done()
    assert events == [{"task_id": task["id"], "task_name": "Spülmaschine ausräumen", "points": 4}]
    assert dt_util.parse_datetime(task["due_date"]) <= dt_util.utcnow()

    # already open: a repeated trigger does not announce again
    hass.states.async_set("sensor.dishwasher_program", "running")
    hass.states.async_set("sensor.dishwasher_program", "finished")
    await hass.async_block_till_done()
    assert len(events) == 1


async def test_trigger_ignores_unavailable_recovery_and_first_state(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    assert (await _apply(ws))["success"]
    res = await _call(ws, "task_organizer/set_bonus_triggers", triggers=[
        {"wizard_key": "trash:open", "entity_id": "binary_sensor.bin_full", "to_state": "on"}])
    assert res["success"]
    await hass.async_block_till_done()
    events = []
    hass.bus.async_listen("task_organizer_bonus_opened", lambda e: events.append(e.data["task_name"]))

    hass.states.async_set("binary_sensor.bin_full", "on")          # first state ever
    hass.states.async_set("binary_sensor.bin_full", "unavailable")
    hass.states.async_set("binary_sensor.bin_full", "on")          # recovery
    await hass.async_block_till_done()
    assert events == []

    hass.states.async_set("binary_sensor.bin_full", "off")
    hass.states.async_set("binary_sensor.bin_full", "on")
    await hass.async_block_till_done()
    assert events == ["Müll rausbringen"]


async def test_trigger_by_task_id_and_removal(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    res = await _call(ws, "task_organizer/add_task", name="Bonus", interval=365, complexity=3, icon="mdi:star",
                      category="bonus", custom_due_date="2099-01-01T00:00:00")
    task_id = res["result"]["task_id"]
    res = await _call(ws, "task_organizer/set_bonus_triggers", triggers=[
        {"task_id": task_id, "entity_id": "input_boolean.x", "to_state": "on"}])
    assert res["success"]
    await hass.async_block_till_done()
    hass.states.async_set("input_boolean.x", "off")
    hass.states.async_set("input_boolean.x", "on")
    await hass.async_block_till_done()
    assert dt_util.parse_datetime(_tasks(hass)[task_id]["due_date"]) <= dt_util.utcnow()

    # removing the trigger removes the listener
    _tasks(hass)[task_id]["due_date"] = "2099-01-01T00:00:00+00:00"
    res = await _call(ws, "task_organizer/set_bonus_triggers", triggers=[])
    assert res["success"]
    await hass.async_block_till_done()
    assert "bonus_unsub" not in hass.data[DOMAIN]
    hass.states.async_set("input_boolean.x", "off")
    hass.states.async_set("input_boolean.x", "on")
    await hass.async_block_till_done()
    assert _tasks(hass)[task_id]["due_date"].startswith("2099")

    res = await _call(ws, "task_organizer/set_bonus_triggers", triggers=[{"entity_id": "input_boolean.x", "to_state": "on"}])
    assert res["error"]["code"] == "invalid_trigger"


async def test_update_settings_cannot_overwrite_triggers(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _call(ws, "task_organizer/set_bonus_triggers", triggers=[
        {"wizard_key": "trash:open", "entity_id": "sensor.a", "to_state": "x"}])
    res = await _call(ws, "task_organizer/update_settings", settings={"bonus_triggers": [], "wizard": {"x": 1}, "overdue_days": 7})
    assert res["success"]
    assert setup.options["bonus_triggers"][0]["entity_id"] == "sensor.a"
    assert "wizard" not in setup.options and setup.options["overdue_days"] == 7


async def test_listeners_are_cleaned_up_on_unload(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    assert (await _apply(ws, device_triggers=[
        {"wizard_key": "trash:open", "entity_id": "binary_sensor.bin", "to_state": "on"}]))["success"]
    await hass.async_block_till_done()
    assert hass.data[DOMAIN]["bonus_unsub"]
    events = []
    hass.bus.async_listen("task_organizer_bonus_opened", lambda e: events.append(e.data))

    assert await hass.config_entries.async_unload(setup.entry_id)
    await hass.async_block_till_done()
    assert DOMAIN not in hass.data
    hass.states.async_set("binary_sensor.bin", "off")
    hass.states.async_set("binary_sensor.bin", "on")
    await hass.async_block_till_done()
    assert events == []

    # reload registers exactly one listener again
    assert await hass.config_entries.async_setup(setup.entry_id)
    await hass.async_block_till_done()
    assert hass.data[DOMAIN]["bonus_unsub"]


async def test_wizard_tasks_carry_allow_together_and_updates_apply_it(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    assert (await _apply(ws))["success"]
    tasks = _by_key(hass)
    assert tasks["morning:person.anna"]["allow_together"] is False
    assert tasks["room_deep:person.anna"]["allow_together"] is False
    assert tasks["table_set:person.anna"]["allow_together"] is True
    assert tasks["trash:open"]["allow_together"] is True
    assert all(t["allow_together"] for t in hass.data[DOMAIN]["data"]["templates"].values())
    # an in-place update (re-run) re-applies the catalog value
    tasks["morning:person.anna"]["allow_together"] = True
    assert (await _apply(ws, replace_existing=True))["success"]
    assert _by_key(hass)["morning:person.anna"]["allow_together"] is False
