"""A wizard re-run never resets what the parents customized (tracking, migration, detach, reset, undo)."""

import pytest
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission import _migrate_wizard_customized
from custom_components.family_mission.const import DOMAIN

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


@pytest.fixture
async def setup(hass):
    for pid, name in ((ANNA, "Anna"), (BEN, "Ben"), (CLARA, "Clara"), (DAVID, "David")):
        hass.states.async_set(pid, "home", {"friendly_name": name})

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

_call.n = 5000


async def _apply(ws, **kw):
    return await _call(ws, "family_mission/wizard_apply", **{**BASE, **kw})


def _tasks(hass):
    return hass.data[DOMAIN]["data"]["tasks"]


def _by_key(hass):
    return {t["wizard_key"]: t for t in _tasks(hass).values() if t.get("wizard_key")}


MORNING = "morning:person.anna"


def _data(hass):
    return hass.data[DOMAIN]["data"]


async def _fresh(hass, ws):
    assert (await _apply(ws))["success"]
    return _by_key(hass)


async def test_new_wizard_tasks_start_uncustomized(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    tasks = await _fresh(hass, ws)
    assert all(t["customized"] == [] for t in tasks.values())


async def test_edit_task_records_changed_fields_and_replace_keeps_them(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    task = (await _fresh(hass, ws))[MORNING]
    res = await _call(ws, "family_mission/edit_task", task_id=task["id"], name="Meine Mission", complexity=7,
                      subtasks=[{"title": "Eigener Schritt", "done": False}], available_until="09:00")
    assert res["success"]
    assert task["customized"] == ["available_until", "complexity", "name", "subtasks"]
    task["icon"] = "mdi:old"            # uncustomized: the wizard brings it back
    res = await _apply(ws, replace_existing=True)
    assert res["success"] and res["result"]["kept_customized"] >= 1
    task = _by_key(hass)[MORNING]
    assert task["name"] == "Meine Mission" and task["complexity"] == 7 and task["available_until"] == "09:00"
    assert [s["title"] for s in task["subtasks"]] == ["Eigener Schritt"]
    assert task["icon"] == "mdi:weather-sunny"
    assert task["available_from"] == "05:00"


async def test_edit_with_unchanged_values_does_not_mark(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    task = (await _fresh(hass, ws))[MORNING]
    res = await _call(ws, "family_mission/edit_task", task_id=task["id"], name=task["name"],
                      complexity=task["complexity"], subtasks=[dict(s) for s in task["subtasks"]],
                      assignees=[ANNA], interval=1, icon=task["icon"])
    assert res["success"] and task["customized"] == []


async def test_weekdays_scope_description_reminder_rotation_are_tracked(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    tasks = await _fresh(hass, ws)
    task = tasks[MORNING]
    res = await _call(ws, "family_mission/edit_task", task_id=task["id"], weekdays=[0, 2], description="Hinweis",
                      reminder_at="07:00", scope="home", requires_approval=True)
    assert res["success"]
    assert task["customized"] == ["description", "reminder_at", "requires_approval", "scope", "weekdays"]
    other = tasks["plants:person.anna"]
    res = await _call(ws, "family_mission/edit_task", task_id=other["id"], rotation={"members": [ANNA, BEN]})
    assert res["success"] and "rotation" in other["customized"]


async def test_service_edit_marks_customized(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    task = (await _fresh(hass, ws))[MORNING]
    await hass.services.async_call(DOMAIN, "edit_task_by_name", {"task_name": task["name"], "new_name": "Neu", "complexity": 4}, blocking=True)
    assert task["customized"] == ["complexity", "name"]


async def test_progress_completion_pause_and_due_do_not_mark(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    assert (await _apply(ws, kids=[{**KIDS[0], "pin": "1234"}] + KIDS[1:]))["success"]
    task = _by_key(hass)[MORNING]
    task["subtasks"][0]["done"] = True       # progress toggle (what kid_toggle_step writes)
    res = await _call(ws, "family_mission/parent_task_action", task_id=task["id"], action="postpone")
    assert res["success"]
    res = await _call(ws, "family_mission/edit_task", task_id=task["id"], paused_until=None,
                      custom_due_date="2026-11-20T00:00:00+00:00", subtasks=[dict(s) for s in task["subtasks"]])
    assert res["success"]
    res = await _call(ws, "family_mission/complete_task", task_id=task["id"], completed_by=[ANNA])
    assert res["success"]
    other = _by_key(hass)["plants:person.anna"]
    res = await _call(ws, "family_mission/complete_task", task_id=other["id"], completed_by=[ANNA])
    assert task["customized"] == [] and other["customized"] == []


async def test_unselected_customized_is_detached_uncustomized_deleted(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    tasks = await _fresh(hass, ws)
    mine, plain = tasks["room_blitz:person.anna"], tasks["room_blitz:person.ben"]
    assert (await _call(ws, "family_mission/edit_task", task_id=mine["id"], name="Anna räumt auf", complexity=5))["success"]
    res = await _apply(ws, replace_existing=True, excluded=["room_blitz:person.anna", "room_blitz:person.ben"])
    assert res["success"] and res["result"]["detached"] == 1
    assert plain["id"] not in _tasks(hass)
    kept = _tasks(hass)[mine["id"]]
    assert "wizard_key" not in kept and "generated_by" not in kept and "customized" not in kept
    assert kept["name"] == "Anna räumt auf" and kept["complexity"] == 5
    assert "room_blitz:person.anna" not in _by_key(hass)


async def test_reset_customized_restores_the_proposal(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    task = (await _fresh(hass, ws))[MORNING]
    keep = _by_key(hass)["evening:person.anna"]
    for t in (task, keep):
        assert (await _call(ws, "family_mission/edit_task", task_id=t["id"], name="X", complexity=9))["success"]
    res = await _apply(ws, replace_existing=True, reset_customized=[task["id"]])
    assert res["success"]
    assert task["name"] == "Morgen-Mission Anna" and task["complexity"] == 2 and task["customized"] == []
    assert keep["name"] == "X" and keep["complexity"] == 9


async def test_reset_is_ignored_without_replace(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    task = (await _fresh(hass, ws))[MORNING]
    assert (await _call(ws, "family_mission/edit_task", task_id=task["id"], name="X"))["success"]
    assert (await _apply(ws, reset_customized=[task["id"]]))["success"]
    assert task["name"] == "X" and task["customized"] == ["name"]


async def test_weekday_task_keeps_its_interval(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    task = (await _fresh(hass, ws))[MORNING]
    task["weekdays"] = [0, 1]               # direct: not customized, the interval must stay anyway
    task["interval"] = 3
    assert (await _apply(ws, replace_existing=True))["success"]
    assert task["interval"] == 3


async def test_migration_marks_differing_legacy_tasks(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    tasks = await _fresh(hass, ws)
    for t in tasks.values():
        t.pop("customized")
    tasks[MORNING]["name"] = "Anders"
    tasks["evening:person.anna"]["complexity"] = 9
    tasks["evening:person.ben"]["subtasks"] = tasks["evening:person.ben"]["subtasks"][:1]    # an unconditional step removed
    tasks["room_deep:person.anna"]["description"] = "Hinweis"
    tasks["morning:person.ben"]["available_until"] = "11:00"
    tasks["trash:open"]["interval"] = 3
    tasks["plants:person.ben"]["interval"] = 14                      # rotation length: still the wizard's own
    count = _migrate_wizard_customized(_data(hass), setup.options)
    assert count == len(tasks)
    assert tasks[MORNING]["customized"] == ["name"]
    assert tasks["evening:person.anna"]["customized"] == ["complexity"]
    assert tasks["evening:person.ben"]["customized"] == ["subtasks"]
    assert tasks["room_deep:person.anna"]["customized"] == ["description"]
    assert tasks["morning:person.ben"]["customized"] == ["available_until"]
    assert tasks["trash:open"]["customized"] == ["interval"]
    assert tasks["plants:person.ben"]["customized"] == []
    assert tasks["morning:person.clara"]["customized"] == []
    assert _migrate_wizard_customized(_data(hass), setup.options) == 0       # runs once


async def test_migration_accepts_filtered_steps_and_english_names(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    res = await _apply(ws, language="en", features=[])        # no school: "Pack school bag" is filtered out
    assert res["success"]
    for t in _by_key(hass).values():
        t.pop("customized")
    _migrate_wizard_customized(_data(hass), setup.options)
    assert all(t["customized"] == [] for t in _by_key(hass).values())


async def test_migration_respects_wizard_point_overrides(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    assert (await _apply(ws, points={MORNING: 5}))["success"]
    task = _by_key(hass)[MORNING]
    task.pop("customized")
    _migrate_wizard_customized(_data(hass), setup.options)
    assert task["customized"] == []


async def test_undo_restores_tasks_and_removes_created_ones(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    tasks = await _fresh(hass, ws)
    assert _data(hass).get("wizard_backup", {}).get("created_ids")
    mine, plain = tasks["room_blitz:person.anna"], tasks["room_blitz:person.ben"]
    assert (await _call(ws, "family_mission/edit_task", task_id=mine["id"], name="Meins"))["success"]
    snapshot_mine = dict(mine)
    plain_id, plain_name = plain["id"], plain["name"]
    morning = tasks[MORNING]
    morning["icon"] = "mdi:old"
    # second run: the pets feature creates new tasks
    res = await _apply(ws, replace_existing=True, features=FEATURES + ["pets"], excluded=["room_blitz:person.anna", "room_blitz:person.ben"])
    assert res["success"], res
    assert plain_id not in _tasks(hass) and "wizard_key" not in _tasks(hass)[mine["id"]]
    assert morning["icon"] == "mdi:weather-sunny"
    created = list(_data(hass)["wizard_backup"]["created_ids"])
    assert created and all(tid in _tasks(hass) for tid in created)
    cat = await _call(ws, "family_mission/wizard_catalog")
    assert cat["result"]["backup"]["at"]
    res = await _call(ws, "family_mission/wizard_undo")
    assert res["success"] and res["result"]["success"]
    assert all(tid not in _tasks(hass) for tid in created)
    assert _tasks(hass)[plain_id]["name"] == plain_name
    assert _tasks(hass)[mine["id"]] == snapshot_mine
    assert _tasks(hass)[morning["id"]]["icon"] == "mdi:old"
    assert "wizard_backup" not in _data(hass)
    res = await _call(ws, "family_mission/wizard_undo")
    assert res["result"] == {"success": False, "error": "no_backup"}
    assert (await _call(ws, "family_mission/wizard_catalog"))["result"]["backup"] is None


async def test_undo_expires_after_seven_days(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    await _fresh(hass, ws)
    freezer.move_to(dt_util.utcnow().replace(year=2027))
    res = await _call(ws, "family_mission/wizard_undo")
    assert res["result"]["error"] == "no_backup"


async def test_undo_is_manager_only(hass, hass_ws_client, hass_read_only_access_token, setup):
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    res = await _call(ws, "family_mission/wizard_undo")
    assert res["error"]["code"] == "unauthorized"


async def test_preview_reports_customized_tasks_and_counts(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    tasks = await _fresh(hass, ws)
    assert (await _call(ws, "family_mission/edit_task", task_id=tasks[MORNING]["id"], name="Meins"))["success"]
    assert (await _call(ws, "family_mission/edit_task", task_id=tasks["room_blitz:person.anna"]["id"], complexity=6))["success"]
    res = await _call(ws, "family_mission/wizard_preview", **BASE, excluded=["room_blitz:person.anna", "room_blitz:person.ben"])
    existing = {e["wizard_key"]: e for e in res["result"]["existing"]}
    assert existing[MORNING]["customized"] == ["name"] and existing[MORNING]["action"] == "keep"
    assert existing["evening:person.anna"]["customized"] == [] and existing["evening:person.anna"]["action"] == "update"
    assert existing["room_blitz:person.anna"]["action"] == "detach"
    assert existing["room_blitz:person.ben"]["action"] == "remove"
    counts = res["result"]["existing_counts"]
    assert counts["kept"] == 1 and counts["detached"] == 1 and counts["removed"] == 1
    assert counts["updated"] == len(existing) - 3
